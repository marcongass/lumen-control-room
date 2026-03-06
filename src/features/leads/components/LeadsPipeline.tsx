import { listLeads } from "../services/leads";
import { LeadsPipelineBoard } from "./LeadsPipelineBoard";
import type { LeadStage } from "../types";

const stages: LeadStage[] = [
  "discovered",
  "analyzed",
  "qualified",
  "contacted",
  "negotiating",
  "converted",
  "lost",
];

export async function LeadsPipeline() {
  const { data, source } = await listLeads();

  return <LeadsPipelineBoard leads={data} stages={stages} source={source} />;
}
