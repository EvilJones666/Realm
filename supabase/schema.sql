-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ROOMS
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  is_public boolean default false,
  campaign_preset text not null,
  status text default 'lobby',
  turn_duration_hours int default 24,
  current_turn_player_id uuid,
  turn_expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- PLAYERS
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id),
  name text not null,
  archetype text not null,
  description text not null,
  portrait_url text,
  turn_order int,
  status text default 'alive',
  xp int default 0,
  level int default 1,
  unlocked_skills text[] default '{}',
  created_at timestamptz default now()
);

-- MESSAGES
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  player_id uuid references players(id),
  type text not null,
  content text not null,
  image_url text,
  created_at timestamptz default now()
);

-- INVENTORY
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  name text not null,
  description text not null,
  icon_url text,
  acquired_at timestamptz default now()
);

-- XP EVENTS
create table xp_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  amount int not null,
  reason text not null,
  awarded_at timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  room_id uuid references rooms(id),
  type text not null,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- PUSH SUBSCRIPTIONS
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table rooms enable row level security;
alter table players enable row level security;
alter table messages enable row level security;
alter table inventory_items enable row level security;
alter table xp_events enable row level security;
alter table notifications enable row level security;
alter table push_subscriptions enable row level security;

-- POLICIES (permissive for MVP)
create policy "Public rooms readable" on rooms for select using (true);
create policy "Auth users insert rooms" on rooms for insert with check (auth.uid() = created_by);
create policy "Room owner update" on rooms for update using (auth.uid() = created_by);

create policy "Players readable" on players for select using (true);
create policy "Auth users insert players" on players for insert with check (auth.uid() = user_id);
create policy "Player self update" on players for update using (auth.uid() = user_id);

create policy "Messages readable" on messages for select using (true);
create policy "Auth users insert messages" on messages for insert with check (auth.uid() is not null);

create policy "Inventory readable by owner" on inventory_items for select
  using (player_id in (select id from players where user_id = auth.uid()));
create policy "Insert inventory" on inventory_items for insert with check (auth.uid() is not null);

create policy "XP readable by owner" on xp_events for select
  using (player_id in (select id from players where user_id = auth.uid()));

create policy "Notifications own" on notifications for all using (auth.uid() = user_id);
create policy "Push subs own" on push_subscriptions for all using (auth.uid() = user_id);

-- REALTIME
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table notifications;
