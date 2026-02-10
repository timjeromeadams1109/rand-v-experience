-- Complete Setup Migration for The Rand V Experience
-- This migration ensures all tables, policies, and sample data are properly configured

-- ============================================
-- 1. ENSURE ALL TABLES EXIST WITH PROPER STRUCTURE
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  tier text DEFAULT 'standard' CHECK (tier IN ('standard', 'foundational')),
  created_at timestamptz DEFAULT now()
);

-- Availability table (The Master's Grid)
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, start_time)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles NOT NULL,
  availability_id uuid REFERENCES public.availability NOT NULL,
  service_type text NOT NULL,
  notes text,
  liked_styles uuid[],
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Lookbook table (Portfolio)
CREATE TABLE IF NOT EXISTS public.lookbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Lookbook Likes table
CREATE TABLE IF NOT EXISTS public.lookbook_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles NOT NULL,
  lookbook_id uuid REFERENCES public.lookbook NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lookbook_id)
);

-- Conversations table (The Bridge)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations NOT NULL,
  sender_id uuid REFERENCES public.profiles NOT NULL,
  content text,
  attachment_url text,
  is_quick_reply boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Quick Replies table
CREATE TABLE IF NOT EXISTS public.quick_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_keyword text NOT NULL,
  response_text text NOT NULL
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Availability policies
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Authenticated users can insert availability" ON public.availability;
DROP POLICY IF EXISTS "Authenticated users can update availability" ON public.availability;
DROP POLICY IF EXISTS "Authenticated users can delete availability" ON public.availability;

CREATE POLICY "Anyone can view availability" ON public.availability
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert availability" ON public.availability
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update availability" ON public.availability
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete availability" ON public.availability
  FOR DELETE TO authenticated USING (true);

-- Appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can view all appointments" ON public.appointments;

CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);

-- Lookbook policies
DROP POLICY IF EXISTS "Anyone can view lookbook" ON public.lookbook;
DROP POLICY IF EXISTS "Authenticated users can insert lookbook" ON public.lookbook;

CREATE POLICY "Anyone can view lookbook" ON public.lookbook
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert lookbook" ON public.lookbook
  FOR INSERT TO authenticated WITH CHECK (true);

-- Lookbook likes policies
DROP POLICY IF EXISTS "Users can view their own likes" ON public.lookbook_likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.lookbook_likes;

CREATE POLICY "Users can view their own likes" ON public.lookbook_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own likes" ON public.lookbook_likes
  FOR ALL USING (auth.uid() = user_id);

-- Conversations policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admin can view all conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all conversations" ON public.conversations
  FOR SELECT TO authenticated USING (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can send messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admin can view all messages" ON public.messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (true);

-- Quick replies policies
DROP POLICY IF EXISTS "Anyone can view quick replies" ON public.quick_replies;

CREATE POLICY "Anyone can view quick replies" ON public.quick_replies
  FOR SELECT USING (true);

-- ============================================
-- 4. CREATE TRIGGER FOR AUTO-CREATING PROFILES
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_date_blocked ON public.availability(date, is_blocked);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_availability ON public.appointments(availability_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_lookbook_likes_user ON public.lookbook_likes(user_id);

-- ============================================
-- 6. INSERT SAMPLE AVAILABILITY DATA
-- ============================================

-- Clear existing sample data
DELETE FROM public.availability WHERE date >= CURRENT_DATE;

-- Insert availability for the next 30 days
INSERT INTO public.availability (date, start_time, end_time, is_blocked)
SELECT
  CURRENT_DATE + (day_offset || ' days')::interval AS date,
  time_slot::time AS start_time,
  (time_slot::time + '1 hour'::interval)::time AS end_time,
  false AS is_blocked
FROM
  generate_series(0, 30) AS day_offset,
  unnest(ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']) AS time_slot
WHERE
  EXTRACT(DOW FROM CURRENT_DATE + (day_offset || ' days')::interval) NOT IN (0) -- Exclude Sundays
ON CONFLICT (date, start_time) DO NOTHING;

-- ============================================
-- 7. INSERT SAMPLE LOOKBOOK DATA
-- ============================================

-- Only insert if lookbook is empty
INSERT INTO public.lookbook (title, description, image_url, category)
SELECT * FROM (VALUES
  ('The Classic Fade', 'A timeless mid-fade with clean lines and precise blending.', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80', 'fade'),
  ('The Executive', 'Sharp, professional cut with a modern twist. Perfect for the boardroom.', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80', 'taper'),
  ('The Textured Crop', 'Modern textured top with a skin fade. Low maintenance, high impact.', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80', 'crop'),
  ('The Beard Sculpt', 'Precision beard shaping with clean edges and perfect symmetry.', 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80', 'beard'),
  ('The Low Taper', 'Subtle and sophisticated. A low taper that works with any style.', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', 'taper')
) AS t(title, description, image_url, category)
WHERE NOT EXISTS (SELECT 1 FROM public.lookbook LIMIT 1);

-- ============================================
-- 8. INSERT QUICK REPLIES
-- ============================================

INSERT INTO public.quick_replies (trigger_keyword, response_text)
SELECT * FROM (VALUES
  ('pricing', 'Our signature cut starts at $50. The Full Experience (cut + beard + hot towel) is $85. Message for details!'),
  ('hours', 'We operate Tuesday-Saturday, 9AM-6PM. Sundays by special appointment only.'),
  ('location', 'Located in the heart of LA. Exact address provided upon booking confirmation.'),
  ('availability', 'Check our booking page for real-time availability. Slots fill up fast!'),
  ('products', 'We use and sell premium products. Ask your barber for personalized recommendations.')
) AS t(trigger_keyword, response_text)
WHERE NOT EXISTS (SELECT 1 FROM public.quick_replies LIMIT 1);

-- ============================================
-- 9. ENABLE REALTIME FOR RELEVANT TABLES
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
