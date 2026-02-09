-- The Rand V Experience - Initial Database Schema

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  tier text default 'standard' check (tier in ('standard', 'foundational')),
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New User'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. AVAILABILITY (The Master's Grid)
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  is_blocked boolean default false,
  block_reason text,
  created_at timestamptz default now(),
  unique(date, start_time)
);

-- Enable RLS on availability
alter table public.availability enable row level security;

-- Availability policies (everyone can view, only admin can modify)
create policy "Everyone can view availability"
  on public.availability for select
  to authenticated
  using (true);


-- 3. APPOINTMENTS
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  availability_id uuid references public.availability not null,
  service_type text not null,
  notes text,
  liked_styles uuid[],
  status text default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled')),
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on appointments
alter table public.appointments enable row level security;

-- Appointments policies
create policy "Users can view their own appointments"
  on public.appointments for select
  using (auth.uid() = user_id);

create policy "Users can create their own appointments"
  on public.appointments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own appointments"
  on public.appointments for update
  using (auth.uid() = user_id);


-- 4. LOOKBOOK (Portfolio)
create table if not exists public.lookbook (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  category text,
  created_at timestamptz default now()
);

-- Enable RLS on lookbook
alter table public.lookbook enable row level security;

-- Lookbook policies (everyone can view)
create policy "Everyone can view lookbook"
  on public.lookbook for select
  to authenticated
  using (true);


-- 5. LOOKBOOK LIKES
create table if not exists public.lookbook_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  lookbook_id uuid references public.lookbook not null,
  created_at timestamptz default now(),
  unique(user_id, lookbook_id)
);

-- Enable RLS on lookbook_likes
alter table public.lookbook_likes enable row level security;

-- Lookbook likes policies
create policy "Users can view their own likes"
  on public.lookbook_likes for select
  using (auth.uid() = user_id);

create policy "Users can create their own likes"
  on public.lookbook_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.lookbook_likes for delete
  using (auth.uid() = user_id);


-- 6. CONVERSATIONS (The Bridge)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  created_at timestamptz default now()
);

-- Enable RLS on conversations
alter table public.conversations enable row level security;

-- Conversations policies
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);


-- 7. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations not null,
  sender_id uuid references public.profiles not null,
  content text,
  attachment_url text,
  is_quick_reply boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Messages policies
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = conversation_id
      and (conversations.user_id = auth.uid() or sender_id = auth.uid())
    )
  );


-- 8. QUICK REPLIES (Automated responses)
create table if not exists public.quick_replies (
  id uuid primary key default gen_random_uuid(),
  trigger_keyword text not null,
  response_text text not null
);

-- Enable RLS on quick_replies
alter table public.quick_replies enable row level security;

-- Quick replies policies (everyone can view)
create policy "Everyone can view quick replies"
  on public.quick_replies for select
  to authenticated
  using (true);


-- Insert some default quick replies
insert into public.quick_replies (trigger_keyword, response_text) values
  ('hours', 'The Rand V Experience operates Tuesday through Saturday, 9 AM to 7 PM. Appointments only.'),
  ('location', 'We are located in the heart of Los Angeles. Exact address provided upon booking confirmation.'),
  ('prices', 'Pricing varies by service. The Signature Cut starts at $75. The Full Experience is $150. Contact for custom consultations.'),
  ('availability', 'Check our booking page for real-time availability. Slots fill quickly - we recommend booking at least 48 hours in advance.')
on conflict do nothing;


-- Create indexes for better query performance
create index if not exists idx_availability_date on public.availability(date);
create index if not exists idx_appointments_user on public.appointments(user_id);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_lookbook_likes_user on public.lookbook_likes(user_id);


-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.appointments;
