"use server";

import { revalidatePath } from "next/cache";
import { enqueueAgentTask, AgentTaskType } from "@/features/agents/services/agents";

export async function createDiscoveryTaskAction(formData: FormData) {
  const query = formData.get("query")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const radius = Number(formData.get("radius")) || 2000;

  if (!query || !city) {
    throw new Error("Debes indicar búsqueda y ciudad");
  }

  await enqueueAgentTask({
    taskType: "business_discovery" as AgentTaskType,
    payload: {
      query,
      city,
      category,
      radius,
    },
    priority: 5,
    scheduledFor: new Date(),
  });

  revalidatePath("/");
}
