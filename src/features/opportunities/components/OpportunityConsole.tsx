import { listOpportunities } from "../services/opportunities";
import { createDiscoveryTaskAction } from "../actions";

export async function OpportunityConsole() {
  const opportunities = await listOpportunities();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Opportunity Console</p>
          <h2 className="text-xl font-semibold text-white">Descubre negocios sin presencia digital</h2>
        </div>
        <span className="text-xs text-emerald-300">Motor: Google Places</span>
      </div>

      <form action={createDiscoveryTaskAction} className="mt-4 grid gap-3 md:grid-cols-4">
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
          <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300">
            Descubrir
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {opportunities.map((opp) => (
          <article key={opp.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{opp.company_name ?? opp.title ?? "Sin nombre"}</p>
                <p className="text-xs text-slate-400">{opp.industry ?? opp.type}</p>
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
