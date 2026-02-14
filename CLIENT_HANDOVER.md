# The Rand V Experience - Client Handover Guide

## Site Overview

**Live URL:** https://randvexperience.vercel.app

### Features
- Online appointment booking with email/SMS confirmations
- Lookbook gallery for showcasing haircut styles
- Client messaging system
- Admin dashboard for managing appointments and availability
- Automated appointment reminders (24 hours before, via daily cron)
- Mobile-responsive design

---

## Admin Access

### Dashboard URL
https://randvexperience.vercel.app/dashboard

### Setting Up Admin Account
1. Sign up at https://randvexperience.vercel.app/auth/signup
2. Run this SQL in Supabase to grant admin access:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'BARBER_EMAIL_HERE');
```

### Dashboard Features
- **Overview:** Today's appointments, total bookings, remaining slots
- **Calendar:** Manage availability, block time slots
- **Messages:** View and respond to client messages

---

## Service Accounts

### Supabase (Database)
- **URL:** https://supabase.com/dashboard/project/feonfimdjzbpkmagkxwj
- **Project:** feonfimdjzbpkmagkxwj
- Transfer ownership via: Settings → General → Transfer Project

### Vercel (Hosting)
- **URL:** https://vercel.com
- **Project:** randvexperience
- Transfer via: Settings → General → Transfer Project

### Resend (Email)
- **URL:** https://resend.com
- **Current:** Free tier (3,000 emails/month)
- For custom domain emails, add domain in Resend dashboard

### Twilio (SMS)
- **URL:** https://twilio.com/console
- **Phone:** +18334061715
- **Current:** Trial account (limited credits)
- Upgrade for production use

### GitHub (Code)
- **Repo:** https://github.com/timjeromeadams1109/rand-v-experience
- Transfer via: Settings → Danger Zone → Transfer Ownership

---

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key |
| `RESEND_API_KEY` | Email service API key |
| `TWILIO_ACCOUNT_SID` | SMS account ID |
| `TWILIO_AUTH_TOKEN` | SMS auth token |
| `TWILIO_PHONE_NUMBER` | SMS sending number |

---

## Custom Domain Setup

1. In Vercel: Settings → Domains → Add Domain
2. Add DNS records:
   - `A` record: `76.76.21.21`
   - `CNAME` for www: `cname.vercel-dns.com`
3. SSL certificate is automatic

---

## Updating Content

### Lookbook Images
Run in Supabase SQL Editor:
```sql
INSERT INTO public.lookbook (title, description, image_url, category)
VALUES ('Style Name', 'Description', 'https://image-url.com', 'fade');
```

### Services/Pricing
Edit: `components/booking/BookingFlow.tsx` → `SERVICES` array

### Availability Slots
Use the admin dashboard Calendar page, or run SQL:
```sql
INSERT INTO public.availability (date, start_time, end_time)
VALUES ('2026-03-01', '09:00:00', '10:00:00');
```

---

## Support Contacts

- **Developer:** [Your contact info]
- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support

---

## Checklist Before Handover

- [ ] Transfer GitHub repo ownership
- [ ] Transfer Vercel project
- [ ] Transfer Supabase project
- [ ] Create client's Resend account (or transfer)
- [ ] Create client's Twilio account (or transfer)
- [ ] Update admin email in database
- [ ] Remove test data
- [ ] Set up custom domain (if applicable)
- [ ] Update Instagram link to real account
- [ ] Add real business address/phone to site
