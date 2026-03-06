"use client";

import { useMemo } from "react";
import type { LeadCard, LeadStage } from "../types";

const mockLeads: LeadCard[] = [
  {
    id: "lead-1",
    company: "Nova Industries",
    industry: "Fintech",
    stage: "negotiating",
    score: 0.78,
    owner: "CRM-Agent",
    nextStep: "Demo CS + outline",
  },
  {
    id: "lead-2",
    company: "Helix Labs",
    industry: "AI Infra",
    stage: "contacted",
    score: 0.62,
    owner: "Growth-Agent",
    nextStep: "Enviar secuencia outbound",
  },
  {
    id: "lead-3",
    company: "Atlas Retail",
    industry: "Retail Tech",
    stage: "discovered",
    score: 0.33,
    owner: "Lead-Scout",
    nextStep: "Investigar stack",
  },
];

export const leadStages: LeadStage[] = [
  "discovered",
  "analyzed",
  "qualified",
  "contacted",
  "negotiating",
  "converted",
];

export const useLeadPipeline = () => {
  return useMemo(() => ({
    leads: mockLeads,
    stages: leadStages,
  }), []);
};
