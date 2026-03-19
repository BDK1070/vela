-- ============================================================
-- SKILLBOOK — Supabase Schema
-- Run this in your Supabase SQL Editor (one time setup)
-- ============================================================

-- Drop tables if re-running
drop table if exists bookings;
drop table if exists providers;

-- ── PROVIDERS TABLE ──────────────────────────────────────────
create table providers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  bio             text,
  category        text not null,   -- hair | photography | catering | bartending | makeup | dj | cleaning | events
  location        text,
  price_per_hour  numeric not null,
  contact_email   text not null,
  avatar_seed     text,
  created_at      timestamptz default now()
);

-- ── BOOKINGS TABLE ───────────────────────────────────────────
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  provider_id     uuid references providers(id) on delete cascade,
  client_name     text not null,
  client_email    text not null,
  date            date not null,
  hours           integer not null default 1,
  message         text,
  total           numeric not null,
  status          text default 'pending',   -- pending | confirmed | cancelled
  created_at      timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
-- For the demo: allow all reads, allow inserts
alter table providers enable row level security;
alter table bookings enable row level security;

create policy "Anyone can read providers"
  on providers for select using (true);

create policy "Anyone can create a provider"
  on providers for insert with check (true);

create policy "Anyone can create a booking"
  on bookings for insert with check (true);

create policy "Anyone can read their provider bookings"
  on bookings for select using (true);

-- ── SEED DATA (optional — run separately if you want demo listings) ──────
insert into providers (name, bio, category, location, price_per_hour, contact_email, avatar_seed) values
  ('Naledi Dube', 'Award-winning natural hair specialist with 8 years experience. Specialising in locs, braids, and protective styles.', 'hair', 'Sandton, Johannesburg', 350, 'naledi@example.com', 'naledi-hair'),
  ('Sipho Mkhize', 'Lifestyle and event photographer. I capture the moments that matter most.', 'photography', 'Cape Town, CBD', 800, 'sipho@example.com', 'sipho-photo'),
  ('Mama Thembi Catering', 'Traditional and contemporary South African cuisine for your events. From 20 to 500 guests.', 'catering', 'Soweto, Johannesburg', 1200, 'thembi@example.com', 'thembi-food'),
  ('DJ Lungelo', 'Professional DJ for weddings, corporate events, and private parties. 10 years on the decks.', 'dj', 'Durban North', 600, 'lungelo@example.com', 'lungelo-dj'),
  ('Aisha Bartending', 'Certified mixologist. Craft cocktail bars for weddings and events. All equipment supplied.', 'bartending', 'Rosebank, Johannesburg', 450, 'aisha@example.com', 'aisha-bar'),
  ('Glam by Precious', 'Bridal and special occasion makeup. Airbrush certified. Trials available.', 'makeup', 'Pretoria East', 500, 'precious@example.com', 'precious-glam');
