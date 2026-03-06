const chatMessages = [
  {
    id: 1,
    author: "Lumen",
    role: "agent",
    content:
      "Propongo enfoque del día: cerrar handoff de cliente Nova, avanzar investigación ML-lite y preparar growth sprint.",
    ts: "15:58",
  },
  {
    id: 2,
    author: "Marco",
    role: "human",
    content: "Me gusta. Prioriza customer success de Nova y lanza scraping de leads B2B.",
    ts: "16:01",
  },
  {
    id: 3,
    author: "Lumen",
    role: "agent",
    content:
      "Perfecto. Ya levanté briefs y asigné agentes Código y Growth. Te aviso cuando entreguen.",
    ts: "16:02",
  },
];

const agentPods = [
  {
    name: "Código",
    focus: "Wireframes interactivos + esquema Supabase",
    status: "En curso",
    eta: "7 min",
    model: "Model: 4.1-mini",
  },
  {
    name: "Growth",
    focus: "Prospección leads LATAM + copy inicial",
    status: "Esperando insumos",
    eta: "Bloqueado",
    model: "Model: 4o-mini",
  },
  {
    name: "Research",
    focus: "Mapping herramientas multi-agente low-cost",
    status: "Planificado",
    eta: "17:30",
    model: "Model: Sonnet-lite",
  },
];

const pipeline = [
  {
    client: "Nova Industries",
    value: "$18k",
    stage: "Review",
    next: "Demo + plan de CS",
    risk: "Sin contacto hace 3 días",
  },
  {
    client: "Helix Labs",
    value: "$9k",
    stage: "Discovery",
    next: "Probar scraping productos",
    risk: "N/A",
  },
];

const focusBlocks = [
  {
    label: "Impacto",
    value: "Alto",
    detail: "Customer Success + Revenue",
  },
  {
    label: "Energía",
    value: "75%",
    detail: "Recomendado 2 bloques deep work",
  },
  {
    label: "Tiempo libre",
    value: "3h 40m",
    detail: "Antes de cierre del día",
  },
];

const researchQueue = [
  {
    title: "Scraping leads B2B (Costa Rica)",
    status: "Corriendo",
    owner: "Agent Growth",
  },
  {
    title: "Mapa herramientas multi-agente",
    status: "En cola",
    owner: "Agent Research",
  },
];

const metrics = [
  { label: "Execution Velocity", value: "12/15", trend: "+2" },
  { label: "Strategic Focus", value: "40% CS", trend: "Balance" },
  { label: "Pipeline Salud", value: "$42k", trend: "2 riesgos" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Lumen Control Room · Build 0.1
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-white lg:text-4xl">
              Operaciones Marco ↔ Lumen
            </h1>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Always-on
            </span>
          </div>
          <p className="max-w-3xl text-base text-slate-300">
            Chat central + panel táctico para gestionar tareas, clientes, investigaciones y agentes paralelos.
            Esta vista es el boceto funcional del MVP.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="flex min-h-[600px] flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Chat & Contexto
                </p>
                <h2 className="text-lg font-semibold text-white">Lienzo operativo</h2>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                  Historial vivo
                </span>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                  Insights automáticos
                </span>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/5 bg-slate-900/50 p-4">
              {chatMessages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-2xl border border-white/5 bg-white/5 p-4 ${
                    message.role === "agent" ? "text-slate-100" : "text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest">
                      {message.author}
                    </span>
                    <span>{message.ts}</span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-slate-100">
                    {message.content}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Composer
              </label>
              <div className="mt-3 flex flex-col gap-3 lg:flex-row">
                <input
                  className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Describe la decisión o pide un resultado…"
                />
                <div className="flex gap-2 text-sm">
                  <button className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200 transition hover:border-emerald-400/60 hover:text-white">
                    Añadir agente
                  </button>
                  <button className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-emerald-300">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Atención inmediata
              </p>
              <div className="grid grid-cols-3 gap-3">
                {focusBlocks.map((block) => (
                  <div key={block.label} className="rounded-2xl border border-white/5 bg-black/30 p-3">
                    <p className="text-xs text-slate-400">{block.label}</p>
                    <p className="text-xl font-semibold text-white">{block.value}</p>
                    <p className="text-xs text-slate-400">{block.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Métricas del día</h3>
                <span className="text-xs text-slate-400">Actualizado 16:20</span>
              </div>
              <div className="mt-3 grid gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <div>
                      <p className="text-xs text-slate-400">{metric.label}</p>
                      <p className="text-base font-semibold text-white">{metric.value}</p>
                    </div>
                    <span className="text-xs text-emerald-300">{metric.trend}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Customer Success</h3>
                <button className="text-xs text-emerald-300">Ver agenda</button>
              </div>
              <div className="mt-3 space-y-3">
                {pipeline.map((item) => (
                  <div key={item.client} className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold">{item.client}</p>
                      <span className="text-slate-400">{item.value}</span>
                    </div>
                    <p className="text-xs text-slate-400">Etapa: {item.stage}</p>
                    <p className="text-xs text-emerald-200">Próximo: {item.next}</p>
                    <p className="text-xs text-amber-300/80">Riesgo: {item.risk}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Agentes en paralelo</h3>
                <button className="text-xs text-emerald-300">Ver historial</button>
              </div>
              <div className="mt-3 space-y-3">
                {agentPods.map((agent) => (
                  <div key={agent.name} className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold">{agent.name}</p>
                      <span className="text-xs text-slate-400">{agent.status}</span>
                    </div>
                    <p className="text-xs text-slate-300">{agent.focus}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{agent.model}</span>
                      <span>{agent.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-white/20 p-3 text-sm text-slate-400">
                Diseñado para disparar agentes específicos (Código, Growth, Research, CS). Próximo paso: formulario real + colas.
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Investigaciones / Scraping</h3>
                <button className="text-xs text-slate-400">Configurar</button>
              </div>
              <div className="mt-3 space-y-3">
                {researchQueue.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.status}</p>
                    <p className="text-xs text-slate-500">Owner: {item.owner}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
