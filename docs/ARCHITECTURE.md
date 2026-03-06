# ARCHITECTURE.md

## 1. Visión
"Lumen Control Room" evoluciona hacia un **Agent Operating System** personal que coordina desarrollo, marketing, prospección y automatización 24/7. El sistema debe ser desacoplado, orientado a eventos y listo para escalar agentes especializados que trabajan en paralelo mientras aprenden de los datos.

## 2. Principios Clave
1. **Feature-first**: cada módulo (kanban, prospecting, leads, analytics, automations, ML) vive aislado bajo `src/features/*` y se comunica vía contratos claros.
2. **Event-driven**: toda acción genera eventos persistidos (lead_events, agent_events, outreach_events, conversion_events, xp_events). Esto alimenta analytics y ML sin acoplar la capa de UI.
3. **Agents-as-services**: agentes se tratan como workers especializados con colas, políticas de escalado y registro detallado.
4. **Data-centric**: Postgres/Supabase es la fuente de verdad; los workers leen/escriben a través de APIs o funciones seguras.
5. **Observabilidad & Feedback**: cada módulo expone métricas (tiempo, éxito, costo) para optimizar la operación.

## 3. Capas
| Capa | Descripción | Tecnologías |
| --- | --- | --- |
| **Experience** | UI (Next.js App Router) con arquitectura por features, componentes reutilizables y gamificación. | Next.js 14, Tailwind, shadcn/ui |
| **Application / Orchestrator** | Hooks, servicios y server actions que coordinan agentes, pipeline y tareas. | Next Server Actions, tRPC opcional |
| **Agent Engine** | Colas de `agent_tasks`, planificación, escalado (workers + Edge Functions). | Supabase Edge Functions, Inngest/Trigger.dev |
| **Data Layer** | Postgres + views/materialized views + pgvector (a futuro). | Supabase Postgres |
| **Analytics Layer** | Eventos estructurados + dashboards y exports para ML. | Supabase, Tinybird/Metabase opcional |
| **ML/Automation** | Scripts Python/notebooks, modelos (logistic regression/GBM), inferencia en workers. | Python, scikit-learn, Supabase exports |

## 4. Flujo de Alto Nivel
1. Marco ingresa objetivo en el **Command Console** → se crea `agent_task` con skill requerida.
2. El **Agent Engine** enruta la tarea al agente adecuado (lead-scout, research, etc.).
3. El agente ejecuta acciones (scraping, análisis, scoring) usando workers/background jobs.
4. Cada acción emite eventos (`agent_events`, `lead_events`, `outreach_events`).
5. El **Leads Pipeline** y el **Kanban** se actualizan en tiempo real (Supabase Realtime opcional).
6. La **Analytics Layer** consume los eventos para dashboards y ML datasets.
7. La **ML Layer** entrena modelos (lead scoring, outreach optimization) y expone inferencias a los agentes.

## 5. Componentes Principales
- **Feature modules** (`src/features/*`): UI + lógica específica.
- **Shared design system** (`src/components/ui`): tarjetas, chips, tablas, etc.
- **Shared data/services** (`src/lib/*`): contratos de datos, acceso Supabase, utils.
- **Agent orchestrator** (`src/features/agents/orchestrator`): colas, planificación, métricas.
- **Prospecting Engine** (`src/features/prospecting`): scraping, discovery, scoring, outreach.
- **Leads Pipeline** (`src/features/leads`): vista pipeline + entidad `leads` separada del kanban.
- **Analytics** (`src/features/analytics`): dashboards, heatmaps, insights.
- **Automations** (`src/features/automations`): jobs recurrentes, workers, cron.
- **ML Workspace** (`ml/`): datasets, notebooks, pipelines.

## 6. Despliegue
- **Frontend**: Vercel (Next.js) con preview deploys por branch.
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions). Posible uso de Fly.io/Render para workers Python.
- **Workers**: Inngest/Trigger.dev o Supabase Edge Functions + cron para scraping/reportes.
- **Observabilidad**: Supabase logs + consola custom (feature analytics) + GitHub Actions para CI.

## 7. Seguridad & Costos
- Principio de menor privilegio (keys por entorno, RLS en tablas sensibles).
- Registros de consumo por agente y por job para decidir escalado (multi-modelo, low-cost por defecto, upscaling bajo demanda).

Este documento guía cómo deben interactuar los módulos sin bloquear el despliegue gradual por fases.
