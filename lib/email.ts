import { Resend } from 'resend'

const FROM_EMAIL = 'The Rand V Experience <noreply@randvexperience.com>'

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendConfirmationEmail(
  to: string,
  clientName: string,
  service: string,
  date: string,
  time: string
): Promise<string | null> {
  const resend = getResendClient()
  if (!resend) {
    console.log('Resend not configured, skipping email')
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Seat is Secured | The Rand V Experience',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1A1A1A; color: #F5F5F0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { color: #D4AF37; font-size: 28px; font-weight: bold; letter-spacing: 2px; }
            .title { font-size: 32px; margin: 20px 0 10px; }
            .subtitle { color: rgba(245, 245, 240, 0.7); font-size: 16px; }
            .details { background: #2A2A2A; border-radius: 12px; padding: 24px; margin: 30px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #3A3A3A; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: rgba(245, 245, 240, 0.6); }
            .detail-value { color: #F5F5F0; font-weight: 500; }
            .gold { color: #D4AF37; }
            .footer { text-align: center; margin-top: 40px; color: rgba(245, 245, 240, 0.5); font-size: 14px; }
            .note { background: rgba(212, 175, 55, 0.1); border-left: 3px solid #D4AF37; padding: 16px; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✂ RAND V</div>
              <h1 class="title">Your Seat is Secured</h1>
              <p class="subtitle">The experience awaits, ${clientName}</p>
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${service}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value gold">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value gold">${time}</span>
              </div>
            </div>

            <div class="note">
              <strong>Arrive 5 minutes early.</strong> Bring your vision, and we'll bring the craft.
            </div>

            <div class="footer">
              <p>Rand V operates by appointment only.</p>
              <p style="color: #D4AF37;">The Rand V Experience</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Email send error:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('Email error:', error)
    return null
  }
}

export async function sendReminderEmail(
  to: string,
  clientName: string,
  service: string,
  date: string,
  time: string,
  reminderType: '24h' | '1h'
): Promise<string | null> {
  const resend = getResendClient()
  if (!resend) {
    console.log('Resend not configured, skipping email')
    return null
  }

  const urgency = reminderType === '1h'
    ? 'Your appointment is in 1 hour'
    : 'Your appointment is tomorrow'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${urgency} | The Rand V Experience`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1A1A1A; color: #F5F5F0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { color: #D4AF37; font-size: 28px; font-weight: bold; letter-spacing: 2px; }
            .title { font-size: 28px; margin: 20px 0 10px; }
            .subtitle { color: rgba(245, 245, 240, 0.7); font-size: 16px; }
            .details { background: #2A2A2A; border-radius: 12px; padding: 24px; margin: 30px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #3A3A3A; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: rgba(245, 245, 240, 0.6); }
            .detail-value { color: #F5F5F0; font-weight: 500; }
            .gold { color: #D4AF37; }
            .footer { text-align: center; margin-top: 40px; color: rgba(245, 245, 240, 0.5); font-size: 14px; }
            .urgent { background: rgba(212, 175, 55, 0.2); border: 1px solid #D4AF37; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✂ RAND V</div>
            </div>

            <div class="urgent">
              <span class="gold" style="font-size: 18px; font-weight: bold;">${urgency}</span>
            </div>

            <p style="text-align: center; margin-bottom: 30px;">
              ${clientName}, your session is coming up.
            </p>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${service}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value gold">${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value gold">${time}</span>
              </div>
            </div>

            <div class="footer">
              <p>See you soon.</p>
              <p style="color: #D4AF37;">- Rand V</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Email send error:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('Email error:', error)
    return null
  }
}
