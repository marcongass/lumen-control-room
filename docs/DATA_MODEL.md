# DATA_MODEL.md

## 1. Resumen
El modelo de datos debe soportar:
- Gestión de proyectos/tareas (kanban).
- Pipeline independiente de leads/clientes.
- Orquestación de agentes y automatizaciones.
- Registro completo de eventos para analytics y ML.

## 2. Tablas Núcleo (Supabase / Postgres)
### 2.1 Operaciones
| Tabla | Campos clave | Descripción |
| --- | --- | --- |
| `projects` | id, name, owner, priority, status, impact_score | Iniciativas macro. |
| `tasks` | id, project_id, title, description, status, column, impact, effort, agent_skill, assigned_agent_id | Kanban del trabajo interno. |
| `automations` | id, name, type, schedule, status, last_run_at, result_summary | Jobs recurrentes (scraping, reportes, ML). |

### 2.2 Leads & Prospecting
| Tabla | Campos | Notas |
| --- | --- | --- |
| `leads` | id, company_name, industry, size, location, website, source, current_state, score, owner_agent_id | Entidad central del pipeline. |
| `lead_states` | lead_id, state (ENUM: discovered, analyzed, qualified, contacted, negotiating, converted, archived), changed_at, agent_id | Historial de estados. |
| `lead_attributes` | lead_id, key, value | Datos adicionales flexibles (stack, funding, signals). |
| `lead_contacts` | lead_id, name, role, email, linkedin | Destinatarios para outreach. |

### 2.3 Agentes
| Tabla | Campos | Notas |
| --- | --- | --- |
| `agents` | id, name, role, default_model, cost_tier, status | lead-scout, research, scoring, outreach, crm, código, etc. |
| `agent_skills` | agent_id, skill, proficiency | Skills declarados. |
| `agent_tasks` | id, agent_id, skill_required, payload (JSONB), priority, status, started_at, finished_at, cost | Cola principal. |
| `agent_events` | id, agent_id, task_id, event_type, details, created_at | Log de actividad por agente. |

### 2.4 Outreach & CRM
| Tabla | Campos | Notas |
| --- | --- | --- |
| `outreach_sequences` | id, name, channel, template, status | Definición de secuencias. |
| `outreach_events` | id, lead_id, sequence_id, step, channel, status, sent_at, response_at, metadata | Seguimiento de comunicación. |
| `crm_reminders` | id, lead_id, action, due_at, status | Recordatorios del CRM-agent. |

### 2.5 Analytics & Gamificación
| Tabla | Campos | Notas |
| --- | --- | --- |
| `xp_events` | id, source, entity_id, xp_value, reason, created_at | Suma puntos por tareas completadas, combos, etc. |
| `conversion_events` | id, lead_id, amount, probability, decision_at, notes | Base para revenue y tasas.
| `agent_metrics_daily` (view) | date, agent_id, tasks_completed, avg_cost, success_rate | View materializada.
| `lead_scores` | lead_id, model_version, score, factors | Output de modelos ML.

## 3. Supabase Schema Inicial (SQL)
```sql
create type lead_state as enum (
  'discovered','analyzed','qualified','contacted','negotiating','converted','archived'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner text,
  priority text,
  status text,
  impact_score int,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  description text,
  column text,
  status text,
  impact int,
  effort int,
  agent_skill text,
  assigned_agent_id uuid references agents(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  default_model text,
  cost_tier text,
  status text,
  created_at timestamptz default now()
);

create table agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id),
  skill_required text,
  payload jsonb not null,
  priority int default 0,
  status text default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  cost numeric,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  industry text,
  size text,
  location text,
  website text,
  source text,
  current_state lead_state default 'discovered',
  score numeric,
  owner_agent_id uuid references agents(id),
  created_at timestamptz default now()
);

create table lead_states (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  state lead_state not null,
  agent_id uuid references agents(id),
  notes text,
  created_at timestamptz default now()
);

create table lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  event_type text not null,
  payload jsonb,
  agent_id uuid references agents(id),
  created_at timestamptz default now()
);

create table outreach_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  channel text,
  template text,
  status text,
  metadata jsonb,
  sent_at timestamptz,
  response_at timestamptz
);

create table agent_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id),
  task_id uuid references agent_tasks(id),
  event_type text,
  details jsonb,
  created_at timestamptz default now()
);

create table conversion_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  amount numeric,
  probability numeric,
  decision_at timestamptz,
  notes text
);

create table xp_events (
  id uuid primary key default gen_random_uuid(),
  source text,
  entity_id uuid,
  xp_value int,
  reason text,
  created_at timestamptz default now()
);
```

## 4. Definición de Eventos para Analytics
| Evento | Fuente | Payload mínimo | Uso |
| --- | --- | --- | --- |
| `lead_event` | Prospecting Engine / CRM | lead_id, event_type (created, enriched, scored, outreach_sent, response, state_change), metadata | Historial completo del lead. |
| `agent_event` | Agent Engine | agent_id, task_id, event_type (started, progress, escalated, completed, failed), cost, duration | Evaluar desempeño/costo de agentes. |
| `outreach_event` | Outreach Agent | lead_id, channel, status, template_version, response | Analizar efectividad de mensajes/canales. |
| `conversion_event` | CRM Agent | lead_id, amount, probability, close_won/lost | Métricas de revenue. |
| `xp_event` | Gamification Engine | source (task, combo, streak), xp_value | Retroalimentar UI/engagement. |

Todos los eventos comparten estructura mínima: `id`, `entity_id`, `event_type`, `payload jsonb`, `created_at`. Esto facilita trabajadores genéricos, analytics y ML.

## 5. Estados Clave
- **Leads**: discovered → analyzed → qualified → contacted → negotiating → converted/archived.
- **Agent Tasks**: queued → assigned → running → needs_input → completed → failed → escalated.
- **Automations**: scheduled → running → succeeded → failed → paused.

Este documento sirve como contrato inicial para implementar Supabase, pipelines de eventos y futuras extensiones ML.
