-- Additional policies for admin functionality

-- Allow anyone to view availability (already done, but ensuring it's correct)
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);

-- Allow authenticated users to insert availability (for admin dashboard)
CREATE POLICY "Authenticated users can insert availability" ON public.availability
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update availability (for blocking times)
CREATE POLICY "Authenticated users can update availability" ON public.availability
FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete availability
CREATE POLICY "Authenticated users can delete availability" ON public.availability
FOR DELETE TO authenticated USING (true);

-- Allow anyone to view lookbook (for non-authenticated browsing)
DROP POLICY IF EXISTS "Everyone can view lookbook" ON public.lookbook;
CREATE POLICY "Anyone can view lookbook" ON public.lookbook FOR SELECT USING (true);

-- Allow authenticated users to insert lookbook items
CREATE POLICY "Authenticated users can insert lookbook" ON public.lookbook
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow viewing all appointments for admin dashboard
CREATE POLICY "Admin can view all appointments" ON public.appointments
FOR SELECT TO authenticated USING (true);

-- Allow viewing all conversations for admin dashboard
CREATE POLICY "Admin can view all conversations" ON public.conversations
FOR SELECT TO authenticated USING (true);

-- Allow viewing all messages for admin dashboard
CREATE POLICY "Admin can view all messages" ON public.messages
FOR SELECT TO authenticated USING (true);

-- Allow admin to send messages in any conversation
CREATE POLICY "Admin can send messages" ON public.messages
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow viewing all profiles for admin dashboard
CREATE POLICY "Admin can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);
