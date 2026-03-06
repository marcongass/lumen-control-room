"use client";

import { useMemo, useState } from "react";
import type { LeadCard, LeadStage } from "../types";

export type LeadPipelineState = {
  leads: LeadCard[];
  stages: LeadStage[];
  source: "supabase" | "mock";
};

export function useLeadPipeline(initial: LeadPipelineState) {
  const [leads] = useState(initial.leads);
  const grouped = useMemo(() => {
    return initial.stages.reduce<Record<string, LeadCard[]>>((acc, stage) => {
      acc[stage] = leads.filter((lead) => lead.stage === stage);
      return acc;
    }, {});
  }, [initial.stages, leads]);

  return {
    grouped,
    source: initial.source,
    stages: initial.stages,
  };
}
