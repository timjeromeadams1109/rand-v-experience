import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReminderEmail } from '@/lib/email'
import { sendAppointmentReminder } from '@/lib/twilio'
import { formatDate, formatTime } from '@/lib/utils'

const SERVICES: Record<string, string> = {
  'signature-cut': 'The Signature Cut',
  'full-experience': 'The Full Experience',
  'beard-sculpt': 'Beard Sculpt'
}

interface AppointmentWithDetails {
  id: string
  service_type: string
  contact_email: string | null
  contact_phone: string | null
  reminder_24h_sent: boolean
  reminder_1h_sent: boolean
  availability: {
    date: string
    start_time: string
  }
  profile: {
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
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth in development
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = getAdminClient()
    const now = new Date()

    // Fetch all confirmed appointments that need reminders
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        service_type,
        contact_email,
        contact_phone,
        reminder_24h_sent,
        reminder_1h_sent,
        availability:availability_id(date, start_time),
        profile:user_id(full_name)
      `)
      .eq('status', 'confirmed')

    if (error) throw error

    const results = {
      checked: appointments?.length || 0,
      reminders_24h: { sent: 0, failed: 0 },
      reminders_1h: { sent: 0, failed: 0 }
    }

    for (const rawApt of (appointments || [])) {
      // Handle Supabase join returning single objects
      const apt = rawApt as unknown as AppointmentWithDetails
      if (!apt.availability?.date || !apt.availability?.start_time) continue

      const appointmentDate = new Date(`${apt.availability.date}T${apt.availability.start_time}`)
      const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      const clientName = apt.profile?.full_name || 'Valued Client'
      const service = SERVICES[apt.service_type] || apt.service_type
      const date = formatDate(apt.availability.date)
      const time = formatTime(apt.availability.start_time)

      // 24-hour reminder (send between 23-25 hours before)
      if (!apt.reminder_24h_sent && hoursUntil > 23 && hoursUntil <= 25) {
        try {
          if (apt.contact_email) {
            await sendReminderEmail(apt.contact_email, clientName, service, date, time, '24h')
          }
          if (apt.contact_phone) {
            await sendAppointmentReminder(apt.contact_phone, clientName, date, time)
          }

          await supabase
            .from('appointments')
            .update({ reminder_24h_sent: true })
            .eq('id', apt.id)

          results.reminders_24h.sent++
        } catch (e) {
          console.error('24h reminder error:', e)
          results.reminders_24h.failed++
        }
      }

      // 1-hour reminder (send between 55 minutes and 65 minutes before)
      if (!apt.reminder_1h_sent && hoursUntil > 0.9 && hoursUntil <= 1.1) {
        try {
          if (apt.contact_email) {
            await sendReminderEmail(apt.contact_email, clientName, service, date, time, '1h')
          }
          if (apt.contact_phone) {
            const urgentMessage = `${clientName}, your Rand V appointment is in 1 hour! ${time} today. See you soon. - Rand V`
            const { sendSMS } = await import('@/lib/twilio')
            await sendSMS(apt.contact_phone, urgentMessage)
          }

          await supabase
            .from('appointments')
            .update({ reminder_1h_sent: true })
            .eq('id', apt.id)

          results.reminders_1h.sent++
        } catch (e) {
          console.error('1h reminder error:', e)
          results.reminders_1h.failed++
        }
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error('Cron reminder error:', error)
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
  }
}
