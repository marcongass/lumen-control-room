// Generate Report Agent Handler
// Queries top opportunities and stores a report

export const supportedTasks = ["generate_report"];

export async function handleGenerateReport({ supabase, task }) {
  const { opportunityId, include_global } = task.payload || {};

  try {
    // Query top opportunities with score >= 70
    const { data: topLeads, error } = await supabase
      .from("opportunities")
      .select("id, company_name, industry, opportunity_score, location, source")
      .gte("opportunity_score", 70)
      .order("opportunity_score", { ascending: false })
      .limit(20);

    if (error) throw error;

    const reportData = {
      timestamp: new Date().toISOString(),
      count: topLeads?.length || 0,
      leads: topLeads?.map(lead => ({
        id: lead.id,
        name: lead.company_name,
        industry: lead.industry,
        score: lead.opportunity_score,
        location: lead.location?.address || lead.location,
        source: lead.source,
      })) || [],
    };

    // Insert into reports table if it exists (ignore errors if not)
    try {
      await supabase.from("reports").insert({
        generated_by_task_id: task.id,
        name: `Report ${new Date().toISOString()}`,
        data: reportData,
      });
    } catch (e) {
      console.warn('Reports table not ready, skipping insert', e);
    }

    // Log event
    await supabase.from("agent_events").insert({
      agent_id: task.agent_id,
      task_id: task.id,
      event_type: "report_generated",
      metadata: { count: topLeads?.length || 0 },
    });

    return { success: true, report: reportData };
  } catch (error) {
    console.error('Generate report error', error);
    return {
      status: 'failed',
      error: error.message,
    };
  }
}
