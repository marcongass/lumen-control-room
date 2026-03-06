# Lumen Control Room — Product Requirements Document (PRD)

## 1. Resumen
Aplicación interna (single-user: Marco) que combina chat contextual con gestión integral de proyectos, clientes, investigaciones y automatizaciones. Lumen actúa como Chief of Staff digital: prioriza, coordina, investiga y reporta para maximizar productividad, eficiencia y revenue con clientes y soluciones tecnológicas.

## 2. Objetivos y criterios de éxito
- **Productividad personal**: Reducir fricción diaria centralizando tareas, contexto y decisiones en un solo flujo de chat + panel.
- **Organización viva**: Mantener backlog, clientes e investigaciones siempre actualizados mediante proactividad y automatización.
- **Customer Success**: Asegurar que cada cliente/projecto tenga próxima acción clara, riesgo detectado y métricas de salud visibles.
- **Aprendizaje continuo**: Capturar insights y decisiones para re-usarlos y anticipar oportunidades o problemas.

## 3. Principios operativos
1. **Proactividad inteligente**: sugerir mejora/opción sólo cuando haya impacto, sin generar ruido.
2. **Memoria persistente**: registro estructurado de clientes, proyectos, decisiones, aprendizajes.
3. **Pensamiento estratégico**: cada recomendación incluye impacto, urgencia y costo estimado.
4. **Organización automática**: limpieza de backlog, deduplicación y agrupación por objetivos.
5. **Optimización continua**: detectar cuellos de botella y proponer ajustes de proceso.
6. **Customer Success primero**: visibilidad inmediata del estado de cada cliente (salud, riesgos, próximos pasos, valor).
7. **Orquestación multi-agente**: capacidad de lanzar agentes especializados en paralelo y coordinar sus entregables.
8. **Upscaling eficiente**: escalar a agentes/modelos más potentes sólo cuando el problema lo requiera, manteniendo costos bajo control.

## 4. Alcance
### 4.1 En alcance (MVP)
- Chat contextual con historial persistente y tags por proyecto/cliente.
- Gestión de proyectos y tareas (CRUD, prioridades, estados, dependencias ligeras).
- CRM básico + customer success health: contactos, deals, etapa pipeline, próxima acción, riesgos.
- Registro de investigaciones, hallazgos e insights generados por IA.
- Dashboard con KPIs: execution velocity, strategic focus mix, client revenue health.
- Memoria básica (decisiones, aprendizajes, plantillas reutilizables).
- Hooks para automatizaciones (scraping, reportes programados) aunque inicialmente manuales.
- **Fundamentos de orquestación multi-agente**: capacidad de definir tareas para agentes secundarios y registrar sus resultados (fase 1 = manual, fase 2 = automatizada).
- **Inicialización limpia**: no se importarán datos históricos; toda la información nacerá dentro de la app y se irá alimentando automáticamente.

### 4.2 Fuera de alcance (MVP inmediato)
- Multiusuario / colaboración en tiempo real.
- Integraciones externas complejas (email bidireccional, Slack, etc.).
- Motor de workflows visuales.
- Facturación o pagos integrados.
- Auto-escalado completo entre proveedores/LLMs sin intervención (planificado para fase 2+).

## 5. Personas y casos de uso
- **Marco (Systems Engineer / Founder Operator)**
  - Siempre conectado, necesita una vista unificada para priorizar.
  - Cambia rápidamente entre investigación, desarrollo, clientes y marketing.
  - Quiere acumular riqueza para hacer el bien → foco en revenue.

### Journeys clave
1. **Morning Command Sweep**: abrir app, revisar KPIs → chat genera resumen proactivo + plan del día.
2. **Customer Success Pulse**: seleccionar cliente, ver salud (valor pipeline, última interacción, riesgos) → Lumen sugiere próxima acción y borrador de mensaje.
3. **Research → Implementation**: registrar idea, lanzar investigación/scraping, recibir insights y convertirlos en tareas/proyectos.
4. **End-of-day/Week Review**: Lumen genera reporte con progreso, bloqueos, wins, próximos pasos.

## 6. Requerimientos funcionales
1. **Chat + Contexto**
   - Historial completo con búsqueda semántica.
   - Mensajes etiquetables (proyecto, cliente, tema).
   - Respuestas de Lumen con formato estructurado (bullets, tablas livianas, resúmenes, acciones sugeridas).
2. **Gestión de Proyectos/Tareas**
   - CRUD completo, estados: Backlog, En Progreso, Bloqueado, Hecho.
   - Campos: impacto, esfuerzo, tipo (Investigación/Dev/Cliente/Marketing/Otro).
   - Vistas: lista priorizada, tablero kanban, foco diario.
3. **CRM + Customer Success**
   - Contactos (personas/empresas), deals/pipelines.
   - Campos de salud: último contacto, próxima acción, valor estimado, probabilidad, riesgo.
   - Alertas automáticas cuando un cliente queda sin toque X días o riesgo > umbral.
4. **Investigaciones & Automatizaciones**
   - Registrar briefs, hipótesis, fuentes.
   - Guardar resultados (resúmenes, citas, links).
   - Programar jobs (placeholder) con estado y último resultado.
   - Fuente inicial: sin orígenes predefinidos; el sistema debe permitir agregar nuevas fuentes modularmente cuando definamos prioridades.
5. **Memoria / Base de conocimiento**
   - Notas estructuradas: decisiones, aprendizajes, plantillas.
   - Etiquetas cruzadas con proyectos y clientes.
6. **Dashboards & Reporting**
   - KPIs clave (ver sección 8).
   - Vistas rápidas: proyectos activos, tareas críticas, clientes en riesgo, investigaciones en curso.
   - Exportables rápidos (markdown/pdf simple) para archivado + respaldo offline.
   - Reporte automático diario (resumen ejecutivo + próximos pasos) entregado en el chat y disponible como archivo descargable.
7. **Orquestación multi-agente & upscaling**
   - Definir “agent tasks” con objetivo, contexto y deadline.
   - Lanzar múltiples agentes (threads) en paralelo y consolidar outputs en el chat/dashboard.
   - Sistema de “escalado” basado en complejidad/coste: usar modelos ligeros por defecto y escalar manual/automáticamente a modelos premium bajo condiciones (p.ej. tareas estratégicas críticas, análisis complejos, fallos repetidos) manteniendo el costo mensual lo más bajo posible sin sacrificar calidad mínima acordada.
   - Registro de consumo por agente para control de costos.
   - Etiquetas de especialidad (Código, Growth, Marketing, Investigación, Customer Success) con prioridad inicial en Código y Growth.

## 7. Requerimientos no funcionales
- **Uso interno**: sólo Marco; preparar base para futuros usuarios pero sin multi-tenancy aún.
- **Disponibilidad**: 24/7 con latencia baja (<200 ms desde Costa Rica/Vercel).
- **Seguridad**: Auth simple (email magic link) + almacenamiento cifrado en repositorio privado.
- **Escalabilidad ligera**: datos limitados pero diseño listo para crecer (supabase + pgvector).
- **Observabilidad**: logging central (Supabase logs + Vercel), métricas básicas.
- **Respaldo/offline**: generación automática de snapshots (Markdown/PDF/CSV) exportables y descargables para auditorías o consulta sin conexión.

## 8. KPIs & métricas
1. **Execution Velocity**
   - Tareas completadas vs planificadas por día/semana.
   - Tiempo promedio de ciclo por tipo de tarea.
2. **Strategic Focus Mix**
   - Distribución de tiempo/tareas por categoría (Investigación, Dev, Clientes, Marketing, Automatizaciones).
   - Alertas si alguna categoría cae por debajo de umbral objetivo.
3. **Client Revenue Health**
   - Valor total del pipeline (Σ valor * probabilidad).
   - Clientes en riesgo (sin contacto X días o tareas bloqueadas).
   - Próximas acciones pendientes por cliente.
4. **Customer Success Score (extra)**
   - Score compuesto por satisfacción estimada (manual o heurística), puntualidad de entregables y valor futuro.

## 9. Modelo de datos (borrador)
- `users` — perfil Marco, preferencias.
- `projects` — estado, prioridad, deadline, KPI asociado.
- `tasks` — project_id, tipo, impacto, esfuerzo, asignado_a, fechas.
- `clients` — nombre, tipo, valor esperado, probabilidad, última_interacción, riesgo.
- `interactions` — notas/eventos vinculados a clientes/proyectos.
- `insights` — texto, categoría, origen (chat, investigación), score.
- `research_briefs` / `research_results` — definiciones y hallazgos.
- `automations` — job definido, estado, última ejecución, output.
- `metrics_snapshots` — agregados para dashboard.

## 10. Arquitectura propuesta
- **Frontend**: Next.js 14 (App Router), Typescript, shadcn/ui, Zustand/React Query para estado, tiptap/markdown para notas.
- **Backend**: Supabase (Postgres, pgvector, Auth). Next server actions/tRPC para APIs.
- **IA/LLM**: OpenAI GPT-4.1/4o-mini para chat, análisis y generación de insights; posibilidad de enrutar tareas a modelos alternos según política de costos/impacto.
- **Automatizaciones**: Supabase Edge Functions / Inngest para jobs programados (scraping, reportes).
- **Orquestador multi-agente**: módulo que gestiona colas de tareas, asigna agentes (threads/modelos) y consolida resultados; logs de costo/tiempo por agente.
- **Analytics**: Materialized views + Tremor/Recharts en dashboard.

## 11. Roadmap
1. **Discovery + diseño funcional (Ahora)**
   - Validar journeys, KPIs, modelo de datos.
   - Wireframes de chat + panel + dashboard.
2. **Implementación MVP (Sprint 1-2)**
   - Auth, chat con memoria básica.
   - CRUD proyectos/tareas/clients + vistas.
   - Dashboard inicial con KPIs.
3. **Customer Success, Automatizaciones & Multi-agente (Sprint 3)**
   - Alertas proactivas, scoring de salud.
   - Jobs (scraping/reportes) + notificaciones.
   - Versión 1 del orquestador multi-agente (creación manual de agent tasks + tracking de outputs).
4. **Optimización continua & Upscaling inteligente (Sprint 4+)**
   - Insights mejorados, plantillas, reportes automáticos.
   - Integraciones externas prioritarias.
   - Reglas automáticas para escalar a modelos/agentes premium según complejidad y presupuesto ultra low-cost.
   - Sistema de backups/snapshots offline automatizados.

## 12. Dependencias y riesgos
- **Dependencia**: claves API OpenAI, acceso a fuentes para scraping.
- **Riesgos**: sobrecarga de features antes de validar flujo base; exceso de ruido en proactividad; mantenimiento de jobs.
- **Mitigaciones**: MVP enfocado, thresholds configurables, logging claro.

## 13. Decisiones recientes (06 Mar 2026)
- **Datos históricos**: arrancamos desde cero; la app será la única fuente y se autoalimentará.
- **Reportes automáticos**: diarios, entregados en chat + archivo descargable.
- **Offline/export**: requerido; snapshots y respaldos periódicos.
- **Fuentes de scraping**: ninguna definida; arquitectura modular para agregarlas cuando se prioricen.
- **Presupuesto IA/agentes**: “lo más barato posible” manteniendo calidad → modelos ligeros por defecto y escalado selectivo.
- **Agentes prioritarios**: Código y Growth inicialmente, sin descartar Marketing, Investigación y Customer Success.

## 14. Preguntas abiertas
_(Ninguna por ahora)_

---
