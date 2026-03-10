create extension if not exists "uuid-ossp";

create table if not exists accounts (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  auth_user_id uuid unique,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists program_settings (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  company_name text,
  admin_name text,
  budget_mode text not null default 'total',
  total_budget numeric not null default 0,
  per_employee_budget numeric not null default 0,
  employee_count int not null default 0,
  goals text[] not null default '{}',
  cadence text not null default 'Monthly',
  preferred_schedule text[] not null default '{}',
  days_selected text[] not null default '{}',
  times_selected text[] not null default '{}',
  local_city text,
  survey_answers jsonb not null default '{}'::jsonb,
  setup_completed boolean not null default false,
  setup_events_generated boolean not null default false,
  current_setup_step int not null default 1,
  completed_setup_steps int[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists employee_survey_responses (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  respondent_label text,
  responses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists events_master (
  id text primary key,
  account_id text,
  event_name text not null,
  short_description text not null,
  vendor_url text not null,
  cost_per_person numeric not null default 0,
  goals text[] not null default '{}',
  schedules text[] not null default '{}',
  event_type text not null default 'paid',
  facilitation_kit jsonb,
  is_global boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists events_recommended (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  recommendation_cycle_id text not null,
  event_master_id text not null references events_master(id),
  rank int not null,
  score numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists events_selected (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  recommendation_cycle_id text not null,
  event_master_id text not null references events_master(id),
  selected_rank int not null,
  created_at timestamptz not null default now()
);

create table if not exists events_booked (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  event_master_id text,
  event_name text not null,
  vendor_url text,
  event_date date,
  event_time text,
  total_cost numeric not null default 0,
  rsvps int not null default 0,
  notes text,
  status text not null default 'upcoming',
  attendance int not null default 0,
  workflow_state jsonb not null default '{"currentStep":1,"completed":[]}'::jsonb,
  feedback jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists event_feedback (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  booked_event_id text not null references events_booked(id) on delete cascade,
  star_rating int,
  satisfaction_level text,
  what_worked text,
  what_improve text,
  created_at timestamptz not null default now()
);

create table if not exists budget_transactions (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  event_id text,
  amount numeric not null,
  description text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_program_settings_account on program_settings(account_id);
create index if not exists idx_events_booked_account on events_booked(account_id);
create index if not exists idx_budget_transactions_account on budget_transactions(account_id);
