import { getSupabaseClient } from "@/lib/supabase/client";

export type AgentTaskType =
  | "lead_discovery"
  | "lead_research"
  | "lead_scoring"
  | "outreach_generation"
  | "followup_check";

export type AgentSummary = {
  id: string;
  name: string;
  role: string;
  status: string;
  queue: number;
  running: number;
  completed24h: number;
  successRate: number;
};

const fallbackAgents: AgentSummary[] = [
  {
    id: "agent-mock-1",
    name: "Lumen·LeadScout",
    role: "lead-scout",
    status: "active",
    queue: 1,
    running: 0,
    completed24h: 4,
    successRate: 0.9,
  },
  {
    id: "agent-mock-2",
    name: "Lumen·Research",
    role: "research",
    status: "active",
    queue: 0,
    running: 1,
    completed24h: 2,
    successRate: 0.8,
  },
];

const fallbackTasks = [
  {
    id: "task-mock-1",
    agent_id: "agent-mock-1",
    task_type: "lead_discovery" as AgentTaskType,
    status: "queued",
    priority: 5,
    scheduled_for: new Date().toISOString(),
    payload: { query: "Fintech Costa Rica" },
  },
];

export async function listAgentsWithStats() {
  const client = getSupabaseClient();
  if (!client) {
    return { agents: fallbackAgents, source: "mock" as const };
  }

  type AgentRow = { id: string; name: string; role: string; status: string };
  const { data: agents, error } = await client.from("agents").select("id, name, role, status");
  if (error || !agents) {
    console.error("Supabase listAgentsWithStats error", error);
    return { agents: fallbackAgents, source: "mock" as const, error };
  }

  const { data: taskStatuses } = await client
    .from("agent_tasks")
    .select("agent_id, status")
    .in("status", ["queued", "running"]);

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await client
    .from("agent_tasks")
    .select("agent_id, status")
    .gte("finished_at", cutoff);

  type QueueRow = { agent_id: string | null; status: string };
  const queueMap = new Map<string, { queue: number; running: number }>();
  (taskStatuses as QueueRow[] | undefined)?.forEach((row) => {
    if (!row.agent_id) return;
    const current = queueMap.get(row.agent_id) ?? { queue: 0, running: 0 };
    if (row.status === "queued") current.queue += 1;
    if (row.status === "running") current.running += 1;
    queueMap.set(row.agent_id, current);
  });

  type RecentRow = { agent_id: string | null; status: string };
  const performanceMap = new Map<string, { completed: number; failed: number }>();
  (recent as RecentRow[] | undefined)?.forEach((row) => {
    if (!row.agent_id) return;
    const current = performanceMap.get(row.agent_id) ?? { completed: 0, failed: 0 };
    if (row.status === "completed") current.completed += 1;
    if (row.status === "failed") current.failed += 1;
    performanceMap.set(row.agent_id, current);
  });

  const summaries: AgentSummary[] = (agents as AgentRow[]).map((agent) => {
    const queueStats = queueMap.get(agent.id) ?? { queue: 0, running: 0 };
    const perf = performanceMap.get(agent.id) ?? { completed: 0, failed: 0 };
    const total = perf.completed + perf.failed;
    const successRate = total === 0 ? 1 : perf.completed / total;

    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status,
      queue: queueStats.queue,
      running: queueStats.running,
      completed24h: perf.completed,
      successRate,
    };
  });

  return { agents: summaries, source: "supabase" as const };
}

export async function listAgentTasks(filter?: { status?: string }) {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackTasks;
  }

  let query = client
    .from("agent_tasks")
    .select("id, agent_id, task_type, status, priority, scheduled_for, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Supabase listAgentTasks error", error);
    return fallbackTasks;
  }

  return data as Array<{
    id: string;
    agent_id: string | null;
    task_type: string;
    status: string;
    priority: number;
    scheduled_for: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>;
}

export async function enqueueAgentTask(params: {
  agentId?: string;
  taskType: AgentTaskType;
  payload?: Record<string, unknown>;
  priority?: number;
  scheduledFor?: Date;
  pipelineId?: string;
  parentTaskId?: string;
  maxAttempts?: number;
}) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not configured");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentTasksTable = client.from("agent_tasks") as any;
  const insertPayload = {
    agent_id: params.agentId ?? null,
    task_type: params.taskType,
    payload: params.payload ?? {},
    priority: params.priority ?? 0,
    scheduled_for: (params.scheduledFor ?? new Date()).toISOString(),
    pipeline_id: params.pipelineId ?? params.payload?.opportunity_id ?? null,
    parent_task_id: params.parentTaskId ?? null,
    max_attempts: params.maxAttempts ?? 1,
  };

  const { data, error } = await agentTasksTable
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  await logAgentEvent({
    agentId: params.agentId,
    taskId: data.id,
    eventType: "task_queued",
    metadata: params.payload,
  });
  return data;
}

export async function updateAgentTaskStatus(params: {
  taskId: string;
  status: "running" | "completed" | "failed";
  result?: Record<string, unknown>;
}) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client not configured");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentTasksTable = client.from("agent_tasks") as any;
  const timestamps: Record<string, string> = {};
  if (params.status === "running") timestamps.started_at = new Date().toISOString();
  if (params.status === "completed" || params.status === "failed") {
    timestamps.finished_at = new Date().toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await agentTasksTable
    .update({ status: params.status, result: params.result, ...timestamps })
    .eq("id", params.taskId);

  if (error) throw error;
}

export async function logAgentEvent(params: {
  agentId?: string;
  taskId?: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn("Supabase client missing: agent event skipped");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from("agent_events") as any).insert({
    agent_id: params.agentId,
    task_id: params.taskId,
    event_type: params.eventType,
    metadata: params.metadata ?? {},
  });

  if (error) throw error;
}
