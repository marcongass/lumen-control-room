import { listDiscoveryTaskRuns, listOpportunities } from "../services/opportunities";
import { createDiscoveryTaskAction } from "../actions";

export async function OpportunityConsole() {
  const opportunities = await listOpportunities();
  const taskRuns = await listDiscoveryTaskRuns();

  const statusClasses: Record<string, string> = {
    queued: "border-amber-300/40 bg-amber-300/10 text-amber-200",
    running: "border-sky-300/40 bg-sky-300/10 text-sky-200",
    completed: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
    failed: "border-rose-300/40 bg-rose-300/10 text-rose-200",
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opportunity Console</p>
          <h2 className="text-xl font-semibold text-white">Descubre negocios sin presencia digital</h2>
        </div>
        <span className="text-xs text-emerald-300">Motor: Google Places</span>
      </div>

      <form action={createDiscoveryTaskAction} className="mt-4 grid gap-3 md:grid-cols-5">
        <input
          name="query"
          placeholder="Ej. restaurantes"
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <input
          name="city"
          placeholder="Ciudad / Región"
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <input
          name="category"
          placeholder="Categoría opcional"
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <div className="flex gap-2">
          <input
            name="radius"
            type="number"
            min={100}
            max={5000}
            defaultValue={2000}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
          <input
            name="maxResults"
            type="number"
            min={1}
            max={8}
            defaultValue={5}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
          <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300">
            Descubrir
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado de scripts</p>
          <span className="text-[11px] text-slate-400">`business_discovery` + `company_research`</span>
        </div>
        <div className="mt-3 space-y-2">
          {taskRuns.map((task) => {
            const payload = task.payload ?? {};
            const query = typeof payload.query === "string" ? payload.query : "N/A";
            const city = typeof payload.city === "string" ? payload.city : "N/A";
            const done = task.finished_at ? new Date(task.finished_at).toLocaleString("es-CR") : "-";

            return (
              <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{task.task_type}</p>
                  <span
                    className={`rounded-full border px-2 py-0.5 uppercase tracking-wide ${statusClasses[task.status] ?? "border-white/20 bg-white/10 text-slate-200"}`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-300">{query} · {city}</p>
                <p className="mt-1 text-slate-500">Finalizado: {done}</p>
                {task.last_error ? (
                  <p className="mt-1 text-rose-300">Error: {task.last_error}</p>
                ) : null}
              </div>
            );
          })}
          {taskRuns.length === 0 ? (
            <p className="text-xs text-slate-400">Sin ejecuciones recientes. Si alguna tarea queda en queued, revisa que el runner este activo.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {opportunities.map((opp) => (
          <article key={opp.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{opp.company_name ?? opp.title ?? "Sin nombre"}</p>
                <p className="text-xs text-slate-400">{opp.type}</p>
              </div>
              <span className="text-xs text-emerald-300">Score {opp.opportunity_score ?? 0}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Fuente: {opp.source ?? "N/A"}</p>
            <p className="text-xs text-slate-500">Estado: {opp.status}</p>
          </article>
        ))}
        {opportunities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
            Aún no hay oportunidades registradas.
          </div>
        )}
      </div>
    </section>
  );
}
