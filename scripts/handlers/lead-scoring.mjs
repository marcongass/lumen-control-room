// Lead Scoring Agent Handler
// This handler calculates final probability scores for leads after discovery and research

export const supportedTasks = ["lead_scoring"];

async function processLeadScoring(supabase, task) {
  const { opportunityId, researchData } = task.payload || {};
  
  if (!opportunityId) {
    throw new Error("Opportunity ID missing");
  }

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .single();

  if (error) {
    throw new Error(`Opportunity lookup failed: ${error.message}`);
  }

  let baseScore = opportunity.opportunity_score || 0;
  let adjustments = 0;

  if (researchData?.needs_automation) {
    adjustments += 15;
  }
  if (researchData?.has_budget) {
    adjustments += 20;
  }
  if (researchData?.decision_maker_identified) {
    adjustments += 10;
  }
  if (researchData?.has_competitors) {
    adjustments += 5;
  }
  if (researchData?.has_website_modern) {
    adjustments -= 10;
  }

  const finalScore = baseScore + adjustments;
  const probability = Math.min(100, finalScore);

  const { error: updateError } = await supabase
    .from("opportunities")
    .update({ opportunity_score: probability })
    .eq("id", opportunityId);

  if (updateError) {
    throw new Error(`Opportunity update failed: ${updateError.message}`);
  }

  await supabase.from("agent_events").insert({
    agent_id: task.agent_id,
    task_id: task.id,
    event_type: "scoring_completed",
    metadata: {
      opportunity_id: opportunityId,
      base_score: baseScore,
      final_score: probability,
      adjustments,
      research_data: researchData,
    },
  });

  // Enqueue generate_report task as specified
  await supabase.from("agent_tasks").insert({
    task_type: "generate_report",
    status: "queued",
    pipeline_id: opportunityId,
    parent_task_id: task.id,
    payload: {
      opportunity_id: opportunityId,
      include_global: true,
    },
    priority: 1, // highest priority for report
    max_attempts: 1,
  });

  return { opportunityId: opportunityId, finalScore: probability };
}

export async function handleLeadScoring({ supabase, task }) {
  try {
    const result = await processLeadScoring(supabase, task);
    return {
      status: "completed",
      result,
    };
  } catch (error) {
    console.error("[lead_scoring] error", error);
    return {
      status: "failed",
      error: error.message,
    };
  }
}
