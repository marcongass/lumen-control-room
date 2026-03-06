-- Leads pipeline + analytics foundation

create type lead_state as enum (
  'discovered',
  'analyzed',
  'qualified',
  'contacted',
  'negotiating',
  'converted',
  'lost'
);

create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  industry text,
  company_size text,
  website text,
  source text,
  status lead_state not null default 'discovered',
  score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_contacts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  name text,
  role text,
  email text,
  linkedin text,
  created_at timestamptz not null default now()
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  event_type text not null,
  from_state lead_state,
  to_state lead_state,
  agent_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_events_lead_id on lead_events(lead_id);
create index if not exists idx_leads_status on leads(status);

create or replace view ml_lead_dataset as
select
  l.id as lead_id,
  l.industry,
  l.company_size,
  l.source,
  coalesce(count(*) filter (where e.event_type = 'outreach_sent'), 0) as outreach_count,
  coalesce(
    count(*) filter (where e.event_type = 'outreach_replied')::numeric /
    nullif(count(*) filter (where e.event_type = 'outreach_sent'), 0),
    0
  ) as response_rate,
  case
    when bool_or(e.event_type = 'converted') then 1
    when bool_or(e.event_type = 'lost') then 0
    else null
  end as conversion_label
from leads l
left join lead_events e on e.lead_id = l.id
group by l.id, l.industry, l.company_size, l.source;

create trigger leads_updated_at
before update on leads
for each row execute procedure trigger_set_timestamp();
