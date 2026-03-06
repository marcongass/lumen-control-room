"use client";

import { useLeadPipeline } from "../hooks/useLeadPipeline";
import type { LeadCard, LeadStage } from "../types";

const stageLabels: Record<LeadStage, string> = {
  discovered: "Discovered",
  analyzed: "Analyzed",
  qualified: "Qualified",
  contacted: "Contacted",
  negotiating: "Negotiating",
  converted: "Converted",
  lost: "Lost",
};

function StageColumn({ label, leads }: { label: string; leads: LeadCard[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{leads.length}</span>
      </div>
      <div className="mt-3 space-y-3">
        {leads.map((lead) => (
          <article key={lead.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">{lead.company}</p>
            <p className="text-xs text-slate-400">{lead.industry}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-300">Score {Math.round(lead.score * 100)}%</span>
              <span className="text-slate-400">{lead.source ?? ""}</span>
            </div>
            <p className="mt-1 text-[0.7rem] text-slate-400">Next: {lead.nextStep || "―"}</p>
            <button className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 py-2 text-xs text-slate-200 transition hover:border-emerald-300">
              Cambiar estado
            </button>
          </article>
        ))}
        {leads.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-slate-500">
            Sin leads aún
          </div>
        )}
      </div>
    </div>
  );
}

export function LeadsPipelineBoard({
  leads,
  stages,
  source,
}: {
  leads: LeadCard[];
  stages: LeadStage[];
  source: "supabase" | "mock";
}) {
  const { grouped } = useLeadPipeline({ leads, stages, source });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Leads Pipeline</p>
          <h3 className="text-lg font-semibold text-white">Base del Prospecting Engine</h3>
        </div>
        <span className="text-xs text-emerald-300">Fuente: {source}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => (
          <StageColumn key={stage} label={stageLabels[stage]} leads={grouped[stage] ?? []} />
        ))}
      </div>
    </section>
  );
}
