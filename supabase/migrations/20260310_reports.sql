-- create: reports table for storing generated lead reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  generated_by_task_id uuid references agent_tasks(id),
  data jsonb not null
);
