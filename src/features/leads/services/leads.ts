import { getSupabaseClient } from "@/lib/supabase/client";
import type { LeadCard, LeadStage } from "../types";

const fallbackLeads: LeadCard[] = [
  {
    id: "lead-mock-1",
    company: "Nova Industries",
    industry: "Fintech",
    stage: "negotiating",
    score: 0.78,
    owner: "CRM-Agent",
    nextStep: "Demo CS + outline",
  },
  {
    id: "lead-mock-2",
    company: "Helix Labs",
    industry: "AI Infra",
    stage: "contacted",
    score: 0.62,
    owner: "Growth-Agent",
    nextStep: "Enviar secuencia outbound",
  },
  {
    id: "lead-mock-3",
    company: "Atlas Retail",
    industry: "Retail Tech",
    stage: "discovered",
    score: 0.33,
    owner: "Lead-Scout",
    nextStep: "Investigar stack",
  },
];

const fallbackHistory = [
  {
    id: "event-mock-1",
    lead_id: "lead-mock-1",
    event_type: "state_changed",
    from_state: "contacted",
    to_state: "negotiating",
    metadata: { note: "Esperando demo" },
    created_at: new Date().toISOString(),
  },
];

export type CreateLeadInput = {
  opportunityId?: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  source?: string;
  contact?: {
    name?: string;
    role?: string;
    email?: string;
    linkedin?: string;
  };
};

export async function listLeads() {
  const client = getSupabaseClient();
  if (!client) {
    return { data: fallbackLeads, source: "mock" as const };
  }

  const { data, error } = await client
    .from("leads")
    .select(
      `id, opportunity_id, pipeline_state, company_name, industry, company_size, source, score,
       opportunity:opportunities(id, type, company_name, industry, opportunity_score, status, has_website, website_url, source)`
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase listLeads error", error);
    return { data: fallbackLeads, source: "mock" as const, error };
  }

  type LeadRow = {
    id: string;
    opportunity_id?: string | null;
    pipeline_state?: LeadStage;
    company_name?: string | null;
    industry?: string | null;
    source?: string | null;
    score?: number | null;
    opportunity?: {
      id: string;
      type?: string;
      company_name?: string | null;
      industry?: string | null;
      opportunity_score?: number | null;
      status?: string | null;
      has_website?: boolean | null;
      website_url?: string | null;
      source?: string | null;
    } | null;
  };

  return {
    data: data.map<LeadCard>((lead: LeadRow) => ({
      id: lead.id,
      opportunityId: lead.opportunity_id ?? undefined,
      company: lead.opportunity?.company_name ?? lead.company_name ?? "",
      industry: lead.opportunity?.industry ?? lead.industry ?? "",
      stage: lead.pipeline_state ?? "discovered",
      score: Number(lead.opportunity?.opportunity_score ?? lead.score ?? 0),
      owner: lead.source ?? lead.opportunity?.source ?? "",
      nextStep: "",
      opportunityType: lead.opportunity?.type,
      hasWebsite: lead.opportunity?.has_website ?? undefined,
    })),
    source: "supabase" as const,
  };
}

export async function createLead(input: CreateLeadInput) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client not configured");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("leads") as any)
    .insert({
      opportunity_id: input.opportunityId ?? null,
      company_name: input.companyName,
      industry: input.industry,
      company_size: input.companySize,
      website: input.website,
      source: input.source,
      pipeline_state: "discovered",
    })
    .select()
    .single();

  if (error) throw error;

  if (input.contact && data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.from("lead_contacts") as any).insert({
      lead_id: data.id,
      name: input.contact.name,
      role: input.contact.role,
      email: input.contact.email,
      linkedin: input.contact.linkedin,
    });
  }

  await logLeadEvent({
    leadId: data.id,
    opportunityId: data.opportunity_id,
    eventType: "state_changed",
    toState: "discovered",
    metadata: { reason: "created" },
  });

  return data;
}

export async function updateLeadStatus(params: {
  leadId: string;
  nextState: LeadStage;
  fromState?: LeadStage;
  agentId?: string;
}) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client not configured");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leadRow, error: fetchError } = await (client.from("leads") as any)
    .select("opportunity_id")
    .eq("id", params.leadId)
    .single();

  if (fetchError) throw fetchError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from("leads") as any)
    .update({ pipeline_state: params.nextState })
    .eq("id", params.leadId);

  if (error) throw error;

  await logLeadEvent({
    leadId: params.leadId,
    opportunityId: leadRow?.opportunity_id,
    eventType: "state_changed",
    fromState: params.fromState,
    toState: params.nextState,
    agentId: params.agentId,
  });
}

export async function logLeadEvent(params: {
  leadId: string;
  opportunityId?: string | null;
  eventType: string;
  fromState?: LeadStage;
  toState?: LeadStage;
  agentId?: string;
  metadata?: Record<string, unknown>;
}) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn("Supabase client missing: event stored only in memory");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from("lead_events") as any).insert({
    lead_id: params.leadId,
    event_type: params.eventType,
    from_state: params.fromState,
    to_state: params.toState,
    agent_id: params.agentId,
    metadata: params.metadata ?? {},
  });

  if (error) throw error;

  if (params.opportunityId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.from("opportunity_events") as any).insert({
      opportunity_id: params.opportunityId,
      event_type: params.eventType,
      metadata: {
        ...params.metadata,
        lead_id: params.leadId,
        from_state: params.fromState,
        to_state: params.toState,
      },
    });
  }
}

export async function getLeadHistory(leadId: string) {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackHistory;
  }

  const { data, error } = await client
    .from("lead_events")
    .select("id, event_type, from_state, to_state, metadata, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase getLeadHistory error", error);
    return fallbackHistory;
  }

  return data;
}
