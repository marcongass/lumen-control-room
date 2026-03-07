-- Opportunities & opportunity events

create type opportunity_type as enum (
  'lead',
  'software_project',
  'website_opportunity',
  'real_estate',
  'marketing_client',
  'automation_project',
  'saas_product'
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  type opportunity_type not null default 'lead',
  title text,
  company_name text,
  industry text,
  description text,
  source text,
  source_ref text unique,
  location jsonb,
  has_website boolean,
  website_url text,
  digital_presence text,
  opportunity_score numeric,
  status text default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function trigger_opportunity_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger opportunity_updated_at
before update on opportunities
for each row execute procedure trigger_opportunity_updated_at();

create table if not exists opportunity_events (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_opportunity_events_opportunity_id on opportunity_events(opportunity_id);

create table if not exists opportunity_contacts (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  name text,
  role text,
  email text,
  phone text,
  linkedin text,
  created_at timestamptz not null default now()
);

alter table leads
  add column if not exists opportunity_id uuid references opportunities(id) on delete cascade,
  add column if not exists pipeline_state lead_state default 'discovered';

create unique index if not exists leads_opportunity_unique on leads(opportunity_id);
