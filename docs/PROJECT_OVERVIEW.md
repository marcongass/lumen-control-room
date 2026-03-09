# Project Overview – MoltBot / Autonomous AI Agency

## 1. Vision
- Construir una **AI Operations Console** para una agencia autónoma enfocada inicialmente en soluciones digitales (web/software) pero extensible a otros verticales (marketing, real estate, automatización, SaaS).
- El dashboard funciona como **Command & Dialogue Hub**; el backend (Supabase + workers) actúa como **Task Orchestrator** con `agent_tasks`, pipelines y eventos.
- Prioridad actual: pipeline discovery → research → scoring para detectar negocios con pobre presencia digital y preparar oportunidades de revenue.

## 2. Arquitectura actual
- **Frontend**: Next.js 16 (App Router, Tailwind). Secciones clave:
  - Opportunity Console (lanzar descubrimientos, ver oportunidades).
  - Leads Pipeline (estado de leads por etapas).
  - Agent Control Room (estado de agentes/colas).
- **Backend / Supabase**:
  - Tablas: `opportunities`, `opportunity_events`, `leads`, `lead_events`, `agents`, `agent_tasks`, `agent_events`.
  - Workers (Node scripts) para agentes (`business_discovery`, `company_research`).
- **Workers**: `scripts/agent-runner.mjs` + handlers en `scripts/handlers/*`.
- **Guardian AI**: auditor automático cada 3 h. Reportes en `docs/rguardian-ai/*`. Se deben revisar y atender en cada iteración.

## 3. Estado actual
- **Disponible en main**:
  - Opportunity Engine con Google Places → crea oportunidades/leads.
  - Company Research stub (marca la oportunidad como researching).
  - UI básica con Opportunity Console, Kanban y Agent Control Room.
  - Worker modular y cola `agent_tasks` operando.
- **En progreso (milestone inmediato)**:
  1. Agent Registry extendido (capabilities, execution endpoint, credentials_tag, status) + panel.
  2. Agent Docs versionados + snapshot en `agent_tasks` (para contexto operativo y auditoría).
  3. Command input / chat → genera `agent_tasks` y muestra respuestas.
  4. Scoring Agent para cerrar discovery → research → scoring.
- **Pendiente a corto plazo**:
  - Deploy automático en Vercel (se activará apenas haya commits recientes; env vars ya configuradas).
  - Build estable (`npm run build` debe pasar antes de cada commit; estamos corrigiendo los inserts tipados).

## 4. Environment & tooling
- Node 22, npm.
- Env vars requeridas (local y Vercel):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (o `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_PLACES_API_KEY`
- Server local: `npm run dev -- --hostname 0.0.0.0 --port 3000` (no accesible desde LAN → usar deploy en Vercel para pruebas).

## 5. Pipeline & procesos
1. Trabajar en bloques pequeños.
2. Cada bloque debe terminar con:
   - `npm run lint` + `npm run build` exitosos.
   - Commit en `main`.
   - Entrada en `docs/PROGRESS.md`.
   - Deploy en Vercel (automático) + verificación.
3. Revisar el último informe de Guardian AI antes/después de cada bloque.
4. Mantener comunicación continua y registrar cambios visibles.

## 6. Cost & model policy
- Para agentes y asistente se deben usar modelos baratos (GPT‑4o mini / 3.5 / Claude Haiku / Groq) por defecto.
- Escalar a modelos caros sólo con aprobación explícita.
- Registrar en `agent_events` qué modelo se usó.

## 7. Próximos pasos
1. **Resolver build actual** (`agents.ts`, `leads.ts` inserts tipados) y pushear Agent Registry.
2. Implementar Agent Docs versionados + snapshot.
3. Agent Command input + log en UI.
4. Scoring agent + pipeline completo.
5. Integrar cost policies/selection logic en Agent Registry.

> Esta documentación sirve para el próximo modelo/asistente, de modo que conozca el contexto completo y pueda continuar las tareas sin perder información.
