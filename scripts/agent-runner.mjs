#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.error("[agent-runner] Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const POLL_MS = Number(process.env.AGENT_WORKER_POLL ?? 5000);
const TASK_TYPES = new Set([
  "lead_discovery",
  "lead_research",
  "lead_scoring",
  "outreach_generation",
  "followup_check",
]);

async function fetchQueuedTasks() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("id, agent_id, task_type, payload, priority")
    .eq("status", "queued")
    .lte("scheduled_for", now)
    .order("priority", { ascending: false })
    .limit(5);
  if (error) {
    console.error("[agent-runner] fetch error", error);
    return [];
  }
  return data ?? [];
}

async function logEvent(taskId, agentId, eventType, metadata = {}) {
  await supabase.from("agent_events").insert({
    task_id: taskId,
    agent_id: agentId,
    event_type: eventType,
    metadata,
  });
}

async function claimTask(taskId) {
  const { data, error } = await supabase
    .from("agent_tasks")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("status", "queued")
    .select("id, agent_id, task_type, payload")
    .single();

  if (error) {
    console.error(`[agent-runner] failed to claim ${taskId}`, error.message);
    return null;
  }
  return data;
}

async function completeTask(taskId, status, result) {
  await supabase
    .from("agent_tasks")
    .update({
      status,
      finished_at: new Date().toISOString(),
      result,
    })
    .eq("id", taskId);
}

async function processTask(task) {
  if (!TASK_TYPES.has(task.task_type)) {
    await logEvent(task.id, task.agent_id, "task_failed", {
      reason: "unsupported_task_type",
      task_type: task.task_type,
    });
    await completeTask(task.id, "failed", { reason: "unsupported_task_type" });
    return;
  }

  await logEvent(task.id, task.agent_id, "task_started");

  // Simulación simple: aquí es donde irá la llamada real al agente/modelo.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  await logEvent(task.id, task.agent_id, "task_completed", {
    summary: "Simulación de ejecución",
  });
  await completeTask(task.id, "completed", { summary: "Simulación" });
}

async function loop() {
  console.log("[agent-runner] Scheduler iniciado. Poll cada", POLL_MS, "ms");
  while (true) {
    const tasks = await fetchQueuedTasks();
    for (const task of tasks) {
      const claimed = await claimTask(task.id);
      if (claimed) {
        processTask(claimed).catch((err) => {
          console.error("[agent-runner] error procesando task", err);
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

loop().catch((err) => {
  console.error("[agent-runner] loop error", err);
  process.exit(1);
});
