"use client";

import { useMemo } from "react";
import { useLeadPipeline } from "../hooks/useLeadPipeline";
import type { LeadCard } from "../types";

const stageLabels: Record<string, string> = {
  discovered: "Discovered",
  analyzed: "Analyzed",
  qualified: "Qualified",
  contacted: "Contacted",
  negotiating: "Negotiating",
  converted: "Converted",
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
              <span className="text-slate-400">{lead.owner}</span>
            </div>
            <p className="mt-1 text-[0.7rem] text-slate-400">Next: {lead.nextStep}</p>
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

export function LeadsPipelinePreview() {
  const { leads, stages } = useLeadPipeline();

  const grouped = useMemo(() => {
    return stages.reduce<Record<string, LeadCard[]>>((acc, stage) => {
      acc[stage] = leads.filter((lead) => lead.stage === stage);
      return acc;
    }, {});
  }, [leads, stages]);

  return (
    <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Leads Pipeline (preview)
          </p>
          <h3 className="text-lg font-semibold text-white">Base del Prospecting Engine</h3>
        </div>
        <span className="text-xs text-emerald-300">Modo mock</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => (
          <StageColumn key={stage} label={stageLabels[stage]} leads={grouped[stage] ?? []} />
        ))}
      </div>
    </section>
  );
}
