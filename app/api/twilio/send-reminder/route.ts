import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAppointmentReminder } from '@/lib/twilio'
import { formatDate, formatTime } from '@/lib/utils'

interface AppointmentWithRelations {
  id: string
  reminder_sent: boolean
  availability: {
    date: string
    start_time: string
  }
  profile: {
    phone: string
    full_name: string
  }
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Fetch appointment with user and availability details
    const { data, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        availability:availability_id(*),
        profile:user_id(*)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !data) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const appointment = data as AppointmentWithRelations

    if (appointment.reminder_sent) {
      return NextResponse.json(
        { error: 'Reminder already sent' },
        { status: 400 }
      )
    }

    if (!appointment.profile?.phone) {
      return NextResponse.json(
        { error: 'Client has no phone number' },
        { status: 400 }
      )
    }

    // Send the reminder
    const messageSid = await sendAppointmentReminder(
      appointment.profile.phone,
      appointment.profile.full_name,
      formatDate(appointment.availability.date),
      formatTime(appointment.availability.start_time)
    )

    // Mark reminder as sent
    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', appointmentId)

    return NextResponse.json({
      success: true,
      messageSid
    })
  } catch (error) {
    console.error('Send reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}

// Cron endpoint to send reminders for upcoming appointments
export async function GET() {
  try {
    const supabase = getAdminClient()

    // Find appointments in the next 2 hours that haven't had reminders sent
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        availability:availability_id(*),
        profile:user_id(*)
      `)
      .eq('status', 'confirmed')
      .eq('reminder_sent', false)

    if (error) {
      throw error
    }

    const appointments = (data || []) as AppointmentWithRelations[]

    const remindersToSend = appointments.filter((apt) => {
      const appointmentDateTime = new Date(`${apt.availability.date}T${apt.availability.start_time}`)
      return appointmentDateTime >= now && appointmentDateTime <= twoHoursFromNow
    })

    const results = await Promise.allSettled(
      remindersToSend.map(async (apt) => {
        if (!apt.profile?.phone) return null

        const messageSid = await sendAppointmentReminder(
          apt.profile.phone,
          apt.profile.full_name,
          formatDate(apt.availability.date),
          formatTime(apt.availability.start_time)
        )

        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', apt.id)

        return messageSid
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      sent: successful,
      failed
    })
  } catch (error) {
    console.error('Cron reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}
