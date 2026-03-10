// Simple agent runner for Node.js
// Polls for pending tasks and executes them

import { getHandler } from "./handlers/index.mjs";
import { getSupabaseClient } from '@/lib/supabase/client'";

async function main() {
  console.log("🔄 Starting worker...");
  
  const client = getSupabaseClient();
  if (!client) {
    console.error("Supabase client not available");
    return;
  }

  while (true) {
    try {
      console.log("🔄 Checking for tasks...");
      
      const { data: tasks, error } = await client
        .from("agent_tasks")
        .select("*")
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .limit(10);

      if (error) {
        console.error("❌ Error fetching tasks:", error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      if (!tasks || tasks.length === 0) {
        console.log("✓ No tasks found. Sleeping...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }

      console.log(`✅ Found ${tasks.length} task(s)`);
      
      for (const task of tasks) {
        console.log(`📋 Processing task: ${task.task_type}`);
        
        const handler = getHandler(task.task_type);
        if (!handler) {
          console.error(`❌ Unknown task type: ${task.task_type}`);
          continue;
        }

        try {
          // Mark task as running
          await client
            .from("agent_tasks")
            .update({ status: "running" })
            .eq("id", task.id);

          // Execute task
          const result = await handler({
            supabase: client,
            task,
          });

          // Mark task as completed
          await client
            .from("agent_tasks")
            .update({ status: "completed", result })
            .eq("id", task.id);

          console.log(`✅ Task ${task.task_type} completed`);
        } catch (err) {
          console.error(`❌ Task ${task.task_type} failed:`, err.message);
          // Mark task as failed
          await client
            .from("agent_tasks")
            .update({ status: "failed", result: { error: err.message } })
            .eq("id", task.id);
        }
      }

      console.log("🔄 Sleeping...");
      await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (err) {
      console.error("❌ Worker error:", err.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main().catch(console.error);