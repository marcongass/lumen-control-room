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
    .select("id, company_name, industry, company_size, source, status, score")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase listLeads error", error);
    return { data: fallbackLeads, source: "mock" as const, error };
  }

  return {
    data: data.map<LeadCard>((lead) => ({
      id: lead.id,
      company: lead.company_name,
      industry: lead.industry ?? "",
      stage: (lead.status as LeadStage) ?? "discovered",
      score: Number(lead.score ?? 0),
      owner: lead.source ?? "",
      nextStep: "",
    })),
    source: "supabase" as const,
  };
}

export async function createLead(input: CreateLeadInput) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client not configured");
  }

  const { data, error } = await client
    .from("leads")
    .insert({
      company_name: input.companyName,
      industry: input.industry,
      company_size: input.companySize,
      website: input.website,
      source: input.source,
    })
    .select()
    .single();

  if (error) throw error;

  if (input.contact && data) {
    await client.from("lead_contacts").insert({
      lead_id: data.id,
      name: input.contact.name,
      role: input.contact.role,
      email: input.contact.email,
      linkedin: input.contact.linkedin,
    });
  }

  await logLeadEvent({
    leadId: data.id,
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

  const { error } = await client
    .from("leads")
    .update({ status: params.nextState })
    .eq("id", params.leadId);

  if (error) throw error;

  await logLeadEvent({
    leadId: params.leadId,
    eventType: "state_changed",
    fromState: params.fromState,
    toState: params.nextState,
    agentId: params.agentId,
  });
}

export async function logLeadEvent(params: {
  leadId: string;
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

  const { error } = await client.from("lead_events").insert({
    lead_id: params.leadId,
    event_type: params.eventType,
    from_state: params.fromState,
    to_state: params.toState,
    agent_id: params.agentId,
    metadata: params.metadata ?? {},
  });

  if (error) throw error;
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
