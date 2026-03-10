// Company Research Agent Handler
// Investigates opportunities and prepares data for scoring

export const supportedTasks = ["company_research"];

async function heuristicDigitalPresence(hasWebsite) {
  if (!hasWebsite) return "poor";
  return "average";
}

async function fetchWebsiteMetadata(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, { redirect: "follow", signal: controller.signal });
      if (!res.ok) {
        return { error: `HTTP ${res.status}`, fetched: false };
      }
      const html = await res.text();
      const titleMatch = html.match(/\u003ctitle\u003e([^\u003c]+)\u003c\/title\u003e/i);
      const title = titleMatch ? titleMatch[1].trim() : null;
      const descriptionMatch = html.match(/\u003cmeta[^\u003e]+name=["']description["'][^\u003e]*content=["']([^"']+)/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : null;
      const generatorMatch = html.match(/\u003cmeta[^\u003e]+name=["']generator["'][^\u003e]*content=["']([^"']+)/i);
      const generator = generatorMatch ? generatorMatch[1].trim() : null;
      return { title, description, generator, fetched: true };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    return { error: error.message, fetched: false };
  }
}

export async function handleCompanyResearch({ supabase, task }) {
  const opportunityId = task.payload?.opportunity_id;
  if (!opportunityId) throw new Error("Missing opportunity_id in payload");

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .single();

  if (error) throw error;

  const digitalPresence = await heuristicDigitalPresence(opportunity.has_website);
  
  let websiteMeta = {};
  if (opportunity.has_website && opportunity.website_url) {
    websiteMeta = await fetchWebsiteMetadata(opportunity.website_url);
  }

  const needs_automation = !opportunity.has_website || digitalPresence === "poor";
  const has_website_modern = Boolean(websiteMeta.fetched && websiteMeta.generator);
  const has_budget = false;
  const decision_maker_identified = false;
  const has_competitors = false;

  const enrichedMetadata = {
    ...(opportunity.metadata ?? {}),
    research_timestamp: new Date().toISOString(),
    research_agent_version: 1,
    website_meta: websiteMeta,
    signals: {
      needs_automation,
      has_website_modern,
      has_budget,
      decision_maker_identified,
      has_competitors,
    },
  };

  await supabase
    .from("opportunities")
    .update({
      digital_presence: digitalPresence,
      status: "research_completed",
      metadata: enrichedMetadata,
    })
    .eq("id", opportunityId);

  await supabase.from("opportunity_events").insert({
    opportunity_id: opportunityId,
    event_type: "research_completed",
    metadata: { digitalPresence, signals: enrichedMetadata.signals },
  });

  // Enqueue lead_scoring task with priority 2 as specified
  await supabase.from("agent_tasks").insert({
    task_type: "lead_scoring",
    status: "queued",
    pipeline_id: opportunityId,
    parent_task_id: task.id,
    payload: {
      opportunity_id: opportunityId,
      research_data: enrichedMetadata.signals,
    },
    priority: 2,
    max_attempts: 2,
  });

  return { updated: opportunityId, enqueuedScoring: true };
}
