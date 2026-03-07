export const supportedTasks = ["company_research"];

function heuristicDigitalPresence(hasWebsite) {
  return hasWebsite ? "average" : "poor";
}

export async function handleCompanyResearch({ supabase, task }) {
  const opportunityId = task.payload?.opportunity_id;
  if (!opportunityId) throw new Error("Missing opportunity_id in payload");

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("id, has_website, opportunity_score, metadata")
    .eq("id", opportunityId)
    .single();

  if (error) throw error;

  const digitalPresence = heuristicDigitalPresence(opportunity.has_website);
  const updatedMetadata = {
    ...(opportunity.metadata ?? {}),
    research_notes: task.payload?.notes ?? "baseline",
  };

  await supabase
    .from("opportunities")
    .update({
      digital_presence: digitalPresence,
      status: "researching",
      metadata: updatedMetadata,
    })
    .eq("id", opportunityId);

  await supabase.from("opportunity_events").insert({
    opportunity_id: opportunityId,
    event_type: "research_completed",
    metadata: { digitalPresence },
  });

  return { updated: opportunityId };
}
