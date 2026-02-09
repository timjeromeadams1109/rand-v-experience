import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

let client: twilio.Twilio | null = null

function getClient(): twilio.Twilio {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }
    client = twilio(accountSid, authToken)
  }
  return client
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const twilioClient = getClient()

  if (!twilioPhone) {
    throw new Error('Twilio phone number not configured')
  }

  const message = await twilioClient.messages.create({
    body,
    from: twilioPhone,
    to
  })

  return message.sid
}

export async function sendAppointmentReminder(
  phone: string,
  clientName: string,
  date: string,
  time: string
): Promise<string> {
  const message = `
The Rand V Experience awaits, ${clientName}.

Your session is confirmed for ${date} at ${time}.

Arrive 5 minutes early. Bring your vision.

- Rand V
`.trim()

  return sendSMS(phone, message)
}

export async function sendBookingConfirmation(
  phone: string,
  clientName: string,
  date: string,
  time: string,
  service: string
): Promise<string> {
  const message = `
${clientName}, your seat has been secured.

Service: ${service}
Date: ${date}
Time: ${time}

Rand V operates by appointment only. We look forward to crafting your experience.

- The Rand V Experience
`.trim()

  return sendSMS(phone, message)
}
