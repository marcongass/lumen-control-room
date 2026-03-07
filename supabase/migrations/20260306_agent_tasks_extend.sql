alter table agent_tasks
  add column if not exists pipeline_id uuid references opportunities(id) on delete set null,
  add column if not exists parent_task_id uuid references agent_tasks(id) on delete set null,
  add column if not exists attempts int not null default 0,
  add column if not exists max_attempts int not null default 1,
  add column if not exists last_error text;

create index if not exists idx_agent_tasks_pipeline on agent_tasks(pipeline_id);
