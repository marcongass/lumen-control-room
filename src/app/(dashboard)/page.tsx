import { KanbanBoard } from "@/features/kanban";
import { AgentControlRoom } from "@/features/agents";
import { LeadsPipeline } from "@/features/leads";
import { MetricCards } from "@/features/analytics";
import { AutomationList } from "@/features/automations";

const gamification = {
  level: "Lvl 03",
  xp: "1450 / 2000 XP",
  streak: "7 días foco",
  badges: ["CS Hero", "Builder", "Scraping Pro"],
};

export default function DashboardPage() {
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
                Vista central para coordinar tareas, agentes, leads y automatizaciones en paralelo.
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
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tablero Kanban</p>
                  <h2 className="text-xl font-semibold text-white">Descubrir · Construir · Escalar</h2>
                </div>
                <div className="flex gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 px-3 py-1">1 foco = 25 XP</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Combo CS activo</span>
                </div>
              </div>
              <KanbanBoard />
              <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-black/30 p-4">
                <p className="text-sm font-semibold">Command Console</p>
                <p className="text-xs text-slate-400">Describe objetivo + skill y lanza agentes.</p>
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

            {/* Leads Pipeline (server component fetching Supabase) */}
            {/* When Supabase env vars are missing the feature falls back to mock data, but the services already call Supabase. */}
            <LeadsPipeline />
          </div>

          <div className="flex flex-col gap-4">
            <MetricCards />
            <AgentControlRoom />
            <AutomationList />
            <div className="rounded-3xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
              Roadmap inmediato: conectar Leads Pipeline → agentes → prospecting automático → analytics.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
