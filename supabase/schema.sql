-- KasPlanner NL - Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies table
create table companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  naam text not null,
  kvk text,
  email text,
  moneybird_admin_id text,
  moneybird_access_token text,
  moneybird_refresh_token text,
  eboekhouden_username text,
  eboekhouden_security_code text,
  cashflow_drempel decimal(12,2) default 10000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cashflow entries
create table cashflow_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  type text not null check (type in ('inkomst', 'uitgave')),
  bron text check (bron in ('moneybird', 'eboekhouden', 'handmatig')),
  omschrijving text,
  bedrag decimal(12,2) not null,
  verwacht_op date not null,
  status text default 'verwacht' check (status in ('verwacht', 'ontvangen', 'betaald')),
  factuur_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scenarios
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  naam text not null,
  aanpassingen jsonb default '[]',
  created_at timestamptz default now()
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  plan text default 'gratis' check (plan in ('gratis', 'starter', 'pro', 'business')),
  stripe_subscription_id text,
  stripe_customer_id text,
  geldig_tot timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Alert logs
create table alert_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  type text not null check (type in ('email', 'whatsapp')),
  bericht text,
  cashflow_bedrag decimal(12,2),
  verzonden_op timestamptz default now()
);

-- RLS Policies
alter table companies enable row level security;
alter table cashflow_entries enable row level security;
alter table scenarios enable row level security;
alter table subscriptions enable row level security;
alter table alert_logs enable row level security;

-- Companies: users can only access their own company
create policy "Users can view own company"
  on companies for select
  using (auth.uid() = user_id);

create policy "Users can insert own company"
  on companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own company"
  on companies for update
  using (auth.uid() = user_id);

-- Cashflow entries: via company ownership
create policy "Users can view own cashflow entries"
  on cashflow_entries for select
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

create policy "Users can insert own cashflow entries"
  on cashflow_entries for insert
  with check (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

create policy "Users can update own cashflow entries"
  on cashflow_entries for update
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

create policy "Users can delete own cashflow entries"
  on cashflow_entries for delete
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- Scenarios: via company ownership
create policy "Users can manage own scenarios"
  on scenarios for all
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- Subscriptions: via company ownership
create policy "Users can view own subscriptions"
  on subscriptions for select
  using (
    company_id in (
      select id from companies where user_id = auth.uid()
    )
  );

-- Service role bypasses RLS for sync operations
-- (used by API routes with service role key)

-- Indexes for performance
create index idx_cashflow_entries_company_id on cashflow_entries(company_id);
create index idx_cashflow_entries_verwacht_op on cashflow_entries(verwacht_op);
create index idx_cashflow_entries_status on cashflow_entries(status);
create index idx_scenarios_company_id on scenarios(company_id);
create index idx_subscriptions_company_id on subscriptions(company_id);

-- Updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_companies_updated_at
  before update on companies
  for each row execute function update_updated_at_column();

create trigger update_cashflow_entries_updated_at
  before update on cashflow_entries
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at_column();
