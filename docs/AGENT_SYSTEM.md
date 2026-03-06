# AGENT_SYSTEM.md

## 1. Objetivo
Definir cómo operan los agentes autónomos dentro del Agent Operating System: roles, skills, lifecycle, enrutamiento y monitoreo. El sistema debe soportar múltiples agentes en paralelo, priorizar costo/calidad y registrar cada acción como evento.

## 2. Roles Base
| Rol | Responsabilidad | Entradas | Salidas |
| --- | --- | --- | --- |
| **lead-scout-agent** | Descubrir leads vía scraping/APIs | Fuentes, filtros, palabras clave | Nuevos `leads` en estado `discovered` + `lead_events` de descubrimiento |
| **research-agent** | Enriquecer datos (stack, funding, señales) | lead_id, URLs, prompts | `lead_attributes`, `lead_events: enriched` |
| **scoring-agent** | Calcular score/probabilidad | lead features, modelo activo | Actualiza `leads.score`, crea `lead_events: scored` |
| **outreach-agent** | Generar y enviar mensajes personalizados | lead info, secuencias, plantillas | `outreach_events`, borradores de mensajes |
| **crm-agent** | Seguimiento, recordatorios, pipeline | `lead_states`, tareas, agendas | `crm_reminders`, `lead_events: follow_up` |
| **codigo-agent** | Desarrollo UI/backend | especificaciones, tasks | PRs, deployments |
| **growth-agent** | Copywriting, campañas, mensajes | briefs, results | campañas y experimentos |

Roles adicionales se pueden agregar sin modificar la infraestructura.

## 3. Skills & Matching
- Cada agente declara skills (`agent_skills`), nivel y costo.
- Cada `agent_task` incluye `skill_required`, prioridad, payload y presupuesto.
- Matching se realiza con heurísticas iniciales (skill match + disponibilidad + costo). Futuro: aprendizaje basado en métricas de éxito.

## 4. Lifecycle de una Tarea
1. **Create Task**: `agent_task` se crea desde UI, automation o pipeline.
2. **Queue**: se encola con prioridad (0-100). Workers escuchan según skill/rol.
3. **Assign**: un agente disponible toma la tarea → `agent_event: assigned`.
4. **Run**: agente ejecuta (puede consumir APIs, scraping, LLM). Progreso opcional (`agent_event: progress`).
5. **Finish**: `agent_event: completed` o `failed`. Si requiere intervención humana, `needs_input`.
6. **Emit Events**: resultados se convierten en `lead_events`, `outreach_events`, `xp_events`, etc.
7. **Learning**: métricas alimentan Analytics/ML para mejorar matching y scoring.

## 5. Escalado & Costos
- **Default Tier**: modelos low-cost (4o-mini, gpt-4.1-mini, local LLMs).
- **Upscaling Rules**: si una tarea es crítica (impacto alto, cliente clave) o fracasa X veces, se escala a modelos premium (GPT-4.1, Claude Opus, etc.).
- **Budget Tracking**: cada `agent_task` registra `cost` (tokens/tiempo) para evaluar ROI y ajustar políticas.

## 6. Orquestador
Componentes:
- **Task Router**: agrupa tareas por skill/rol y asigna agentes disponibles.
- **Availability Service**: conoce carga actual (`agent_metrics_daily`).
- **Policy Engine**: reglas de prioridad (CS first, revenue first, SLA, combos gamificados).
- **Event Bus**: centraliza eventos y los reenvía a Analytics/ML.

## 7. Monitorización
- Tablas `agent_events`, `agent_metrics_daily` y dashboards en `src/features/analytics`.
- Alertas cuando: agente falla > N veces, costo supera umbral, backlog > SLA.
- Panel UI "Agent Control Room" muestra estado, skills y energía.

## 8. Interfaz con UI
- `src/features/agents` expone hooks: `useAgentRoster`, `useAgentTasks`, `useAgentMetrics`.
- Los formularios crean `agent_tasks` via server actions/tRPC.
- El Kanban puede asignar tareas directamente a agentes, manteniendo historial.

## 9. Paralelismo 24/7
- Workers siempre activos (Edge Functions, containers o lambdas) con colas por skill.
- Cronjobs (Inngest) ejecutan tareas recurrentes (ej. scraping matutino, reportes nocturnos).
- El CRM-agent vigila deadlines y dispara nuevas tareas automáticamente.

Este documento asegura que cualquier nuevo agente siga las mismas reglas y que el sistema se mantenga coherente mientras escalamos.
