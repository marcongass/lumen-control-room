-- Agent execution infrastructure

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  description text,
  model_provider text,
  model_name text,
  cost_profile text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete set null,
  task_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  priority int not null default 0,
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_tasks_status on agent_tasks(status);
create index if not exists idx_agent_tasks_scheduled_for on agent_tasks(scheduled_for);

create table if not exists agent_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete set null,
  task_id uuid references agent_tasks(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_events_agent_id on agent_events(agent_id);
create index if not exists idx_agent_events_task_id on agent_events(task_id);
