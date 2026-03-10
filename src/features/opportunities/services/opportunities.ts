import { getSupabaseClient } from "@/lib/supabase/client";
import type { Opportunity, OpportunityType } from "../types";

export type OpportunityInput = {
  type?: OpportunityType;
  title?: string;
  companyName?: string;
  description?: string;
  industry?: string;
  source?: string;
  sourceRef?: string;
  location?: Record<string, unknown>;
  hasWebsite?: boolean;
  websiteUrl?: string | null;
  digitalPresence?: string | null;
  metadata?: Record<string, unknown>;
};

export type OpportunityScoreSignals = {
  hasWebsite?: boolean;
  industry?: string;
  reviews?: number;
  rating?: number;
  multiLocation?: boolean;
  digitalPresenceQuality?: "poor" | "average" | "good";
};

export function scoreOpportunity(signals: OpportunityScoreSignals) {
  let score = 0;
  if (signals.hasWebsite === false) score += 40;
  if (signals.digitalPresenceQuality === "poor") score += 15;
  if (signals.multiLocation) score += 10;
  if ((signals.reviews ?? 0) > 10) score += 20;
  if (signals.rating && signals.rating >= 4.2) score += 5;
  if (signals.industry && ["restaurant", "retail", "hotel", "education"].includes(signals.industry)) {
    score += 25;
  }
  if (signals.hasWebsite && signals.digitalPresenceQuality === "average") score += 5;
  return score;
}

export async function createOrUpdateOpportunity(input: OpportunityInput & { scoreSignals?: OpportunityScoreSignals }) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not configured");

  const opportunityScore = scoreOpportunity(input.scoreSignals ?? {});
  const payload = {
    type: input.type ?? "lead",
    title: input.title,
    company_name: input.companyName,
    industry: input.industry,
    description: input.description,
    source: input.source,
    source_ref: input.sourceRef,
    location: input.location ?? {},
    has_website: input.hasWebsite,
    website_url: input.websiteUrl,
    digital_presence: input.digitalPresence,
    metadata: input.metadata ?? {},
    opportunity_score: opportunityScore,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("opportunities") as any)
    .upsert(payload, { onConflict: "source_ref" })
    .select()
    .single();

  if (error) throw error;

  await logOpportunityEvent(data.id, "discovered", { source: input.source });

  return data as Opportunity;
}

export async function listOpportunities(limit = 20) {
  const client = getSupabaseClient();
  if (!client) {
    return [] as Opportunity[];
  }

  const { data, error } = await client
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("listOpportunities error", error);
    return [];
  }

  return data as Opportunity[];
}

export type DiscoveryTaskRun = {
  id: string;
  task_type: string;
  status: string;
  priority: number;
  scheduled_for: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  last_error?: string | null;
};

export async function listDiscoveryTaskRuns(limit = 8) {
  const client = getSupabaseClient();
  if (!client) return [] as DiscoveryTaskRun[];

  const { data, error } = await client
    .from("agent_tasks")
    .select(
      "id, task_type, status, priority, scheduled_for, started_at, finished_at, created_at, payload, result, last_error"
    )
    .in("task_type", ["business_discovery", "company_research"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("listDiscoveryTaskRuns error", error);
    return [];
  }

  return data as DiscoveryTaskRun[];
}

export async function logOpportunityEvent(opportunityId: string, eventType: string, metadata?: Record<string, unknown>) {
  const client = getSupabaseClient();
  if (!client) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (client.from("opportunity_events") as any).insert({
    opportunity_id: opportunityId,
    event_type: eventType,
    metadata: metadata ?? {},
  });
}
