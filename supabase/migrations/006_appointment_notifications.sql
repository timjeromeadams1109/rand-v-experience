-- Add contact fields and reminder tracking to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false;

-- Index for reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminders
ON public.appointments(status, reminder_24h_sent, reminder_1h_sent)
WHERE status = 'confirmed';
