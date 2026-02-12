-- Add admin role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Update RLS policies to be more restrictive (only admins can see all data)

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Admin can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can send messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Recreate policies with proper admin checks

-- Appointments: users see their own, admins see all
CREATE POLICY "Users view own appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Conversations: users see their own, admins see all
CREATE POLICY "Users view own conversations" ON public.conversations
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Messages: users see messages in their conversations, admins see all
CREATE POLICY "Users view own messages" ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Messages: users can send in their conversations, admins can send anywhere
CREATE POLICY "Users send own messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
);

-- Profiles: users see their own, admins see all
CREATE POLICY "Users view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow admins to update appointments (mark complete, cancel, etc.)
CREATE POLICY "Admins update appointments" ON public.appointments
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
