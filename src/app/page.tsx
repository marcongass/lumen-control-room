const kanbanColumns = [
  {
    id: "discover",
    title: "Discover ↔ Research",
    vibe: "Identificar oportunidades, scraping y briefs",
    accent: "from-emerald-500/30 to-emerald-500/5",
    tasks: [
      {
        title: "Scraping leads B2B Costa Rica",
        summary: "Generar 40 contactos priorizados para growth sprint",
        agent: "Growth",
        skills: ["Growth", "Scraping", "Automation"],
        status: "En curso",
        score: "+120 XP",
      },
      {
        title: "Mapa herramientas multi-agente low-cost",
        summary: "Benchmark de 6 opciones con costo mensual < $50",
        agent: "Research",
        skills: ["Research", "Strategy"],
        status: "Planificado",
        score: "+80 XP",
      },
    ],
  },
  {
    id: "build",
    title: "Build ↔ Code",
    vibe: "Implementación de producto, sistemas y pruebas",
    accent: "from-sky-500/40 to-sky-500/5",
    tasks: [
      {
        title: "Wireframes control room",
        summary: "Layout de chat, kanban y consola de agentes",
        agent: "Código",
        skills: ["Next.js", "UI", "Systems"],
        status: "En curso",
        score: "+200 XP",
      },
      {
        title: "Esquema Supabase",
        summary: "Definir tablas projects, clients, agent_tasks",
        agent: "Código",
        skills: ["Data", "Supabase"],
        status: "Backlog",
        score: "+150 XP",
      },
    ],
  },
  {
    id: "scale",
    title: "Scale ↔ Customer Success",
    vibe: "Acciones con clientes, revenue y health",
    accent: "from-amber-500/40 to-amber-500/5",
    tasks: [
      {
        title: "Plan CS Nova Industries",
        summary: "Storyboard + métricas de adopción",
        agent: "CS",
        skills: ["Customer Success", "Playbooks"],
        status: "Necesita feedback",
        score: "+90 XP",
      },
      {
        title: "Growth kit Helix Labs",
        summary: "Copys iniciales y secuencia outbound",
        agent: "Growth",
        skills: ["Growth", "Copy"],
        status: "Bloqueado",
        score: "Requiere contexto",
      },
    ],
  },
];

const gamification = {
  level: "Lvl 03",
  xp: "1450 / 2000 XP",
  streak: "7 días foco",
  badges: ["CS Hero", "Builder", "Scraping Pro"],
};

const agentRoster = [
  {
    name: "Lumen·Código",
    status: "En misión",
    load: "72%",
    skills: ["Next.js", "Supabase", "Automations"],
    energy: 0.8,
  },
  {
    name: "Lumen·Growth",
    status: "En cola",
    load: "41%",
    skills: ["Copy", "Outbound", "Scraping"],
    energy: 0.6,
  },
  {
    name: "Lumen·CS",
    status: "Listo",
    load: "0%",
    skills: ["Playbooks", "Insights"],
    energy: 1,
  },
];

const skillMatrix = [
  { skill: "Código", owner: "Lumen·Código", queue: 2, status: "En curso" },
  { skill: "Growth", owner: "Lumen·Growth", queue: 1, status: "Esperando input" },
  { skill: "Customer Success", owner: "Lumen·CS", queue: 0, status: "Libre" },
  { skill: "Research", owner: "Lumen·Research", queue: 1, status: "Planificado" },
];

const automationQueue = [
  {
    title: "Scraping LATAM",
    owner: "Growth",
    status: "Corriendo",
    eta: "18m",
  },
  {
    title: "Reporte diario",
    owner: "Core",
    status: "Programado 21:00",
    eta: "Auto",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-black/60 p-6 shadow-xl shadow-black/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Control Room · Kanban View
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white lg:text-4xl">
                Marco ↔ Lumen · Orquestación Total ⚡
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Visual de tablero + consola de agentes para ver tareas, skills y decisiones en un solo golpe de vista.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">
              <p className="text-slate-200">Modo siempre activo</p>
              <p className="text-xs text-emerald-200">Agentes listos para paralelizar tareas críticas.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nivel</p>
              <p className="text-3xl font-semibold">{gamification.level}</p>
              <p className="text-xs text-emerald-300">{gamification.xp}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Streak</p>
              <p className="text-3xl font-semibold">{gamification.streak}</p>
              <p className="text-xs text-slate-400">Prioridad: mantener momentum</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Badges</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {gamification.badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Tablero Kanban
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Vista de juego: Descubrir · Construir · Escalar
                </h2>
              </div>
              <div className="flex gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 px-3 py-1">1 foco = 25 XP</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Combo CS activo</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {kanbanColumns.map((column) => (
                <div
                  key={column.id}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-b ${column.accent} p-4 backdrop-blur`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{column.title}</p>
                      <p className="text-xs text-slate-200">{column.vibe}</p>
                    </div>
                    <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
                      {column.tasks.length} tareas
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {column.tasks.map((task) => (
                      <article key={task.title} className="rounded-2xl border border-white/20 bg-black/25 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">{task.title}</p>
                          <span className="text-xs text-emerald-300">{task.score}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{task.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-slate-300">
                          <span className="rounded-full border border-white/10 px-2 py-1 uppercase tracking-widest">
                            Agent · {task.agent}
                          </span>
                          {task.skills.map((skill) => (
                            <span key={skill} className="rounded-full border border-white/10 px-2 py-1">
                              {skill}
                            </span>
                          ))}
                          <span className="rounded-full border border-amber-400/40 px-2 py-1 text-amber-200">
                            {task.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-black/30 p-4">
              <p className="text-sm font-semibold">Command Console</p>
              <p className="text-xs text-slate-400">Describe el objetivo y asigna agente/skill en el mismo flujo.</p>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder="Ej. Lanza agente Growth para preparar email + tabla de leads"
                />
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300">
                  Orquestar
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Agentes
                </h3>
                <span className="text-xs text-emerald-300">3 activos</span>
              </div>
              <div className="mt-3 space-y-3">
                {agentRoster.map((agent) => (
                  <div key={agent.name} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{agent.name}</p>
                      <span className="text-xs text-slate-400">{agent.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-slate-300">
                      {agent.skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-white/10 px-2 py-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
                        style={{ width: `${agent.energy * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Carga: {agent.load}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-white">Skill Matrix</h3>
              <div className="mt-3 space-y-3 text-xs">
                {skillMatrix.map((row) => (
                  <div key={row.skill} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold">{row.skill}</p>
                      <p className="text-slate-400">{row.owner}</p>
                    </div>
                    <div className="text-right text-slate-300">
                      <p>Queue: {row.queue}</p>
                      <p className="text-emerald-200">{row.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Automations</h3>
                <button className="text-xs text-emerald-300">+ Nuevo job</button>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                {automationQueue.map((automation) => (
                  <div key={automation.title} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{automation.title}</p>
                      <span className="text-xs text-slate-400">{automation.owner}</span>
                    </div>
                    <p className="text-xs text-slate-300">Estado: {automation.status}</p>
                    <p className="text-xs text-emerald-200">ETA: {automation.eta}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
              Gamificación ligera: combos por completar columnas, XP por foco cumplido y streaks para mantener disciplina.
              Próximo paso → conectar estos contadores con datos reales y notificaciones.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
