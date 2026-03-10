// Company Research Agent Handler
// Investigates opportunities and prepares data for scoring

export const supportedTasks = ["company_research"];

async function heuristicDigitalPresence(hasWebsite, websiteUrl) {
  if (!hasWebsite || !websiteUrl) return "poor";
  // Simple heuristic: if website is present, assume average at least
  return "average";
}

async function fetchWebsiteMetadata(url) {
  try {
    // Placeholder: could fetch title, meta description, technology stack
    return { has_website: true, technology: "unknown" };
  } catch (error) {
    return { has_website: false };
  }
}

export async function handleCompanyResearch({ supabase, task }) {
  const opportunityId = task.payload?.opportunity_id;
  if (!opportunityId) throw new Error("Missing opportunity_id in payload");

  // Get opportunity data
  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .single();

  if (error) throw error;

  // Gather additional research signals
  const digitalPresence = heuristicDigitalPresence(opportunity.has_website, opportunity.website_url);
  const metadata = {
    ...(opportunity.metadata ?? {}),
    research_timestamp: new Date().toISOString(),
    research_agent_version: 1,
  };

  // Update opportunity with research results
  await supabase
    .from("opportunities")
    .update({
      digital_presence: digitalPresence,
      status: "research_completed",
      metadata,
    })
    .eq("id", opportunityId);

  // Log research event
  await supabase.from("opportunity_events").insert({
    opportunity_id: opportunityId,
    event_type: "research_completed",
    metadata: { digitalPresence },
  });

  // Enqueue lead_scoring task
  await supabase.from("agent_tasks").insert({
    task_type: "lead_scoring",
    status: "queued",
    pipeline_id: opportunityId,
    parent_task_id: task.id,
    payload: {
      opportunity_id: opportunityId,
      research_data: {
        digitalPresence,
        metadata,
      },
    },
    priority: 5, // high priority for scoring
    max_attempts: 2,
  });

  return { updated: opportunityId, enqueuedScoring: true };
}
