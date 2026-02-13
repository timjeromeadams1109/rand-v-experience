import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendConfirmationEmail } from '@/lib/email'
import { sendBookingConfirmation } from '@/lib/twilio'
import { formatDate, formatTime } from '@/lib/utils'

const SERVICES: Record<string, string> = {
  'signature-cut': 'The Signature Cut',
  'full-experience': 'The Full Experience',
  'beard-sculpt': 'Beard Sculpt'
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        availability:availability_id(*),
        profile:user_id(*)
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const clientName = appointment.profile?.full_name || 'Valued Client'
    const service = SERVICES[appointment.service_type] || appointment.service_type
    const date = formatDate(appointment.availability.date)
    const time = formatTime(appointment.availability.start_time)

    const results = { email: null as string | null, sms: null as string | null }

    // Send email confirmation
    if (appointment.contact_email) {
      results.email = await sendConfirmationEmail(
        appointment.contact_email,
        clientName,
        service,
        date,
        time
      )
    }

    // Send SMS confirmation
    if (appointment.contact_phone) {
      try {
        results.sms = await sendBookingConfirmation(
          appointment.contact_phone,
          clientName,
          date,
          time,
          service
        )
      } catch (e) {
        console.error('SMS error:', e)
      }
    }

    // Mark confirmation as sent
    await supabase
      .from('appointments')
      .update({ confirmation_sent: true })
      .eq('id', appointmentId)

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 })
  }
}
