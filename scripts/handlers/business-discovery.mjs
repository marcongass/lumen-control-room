const GOOGLE_TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

export const supportedTasks = ["business_discovery"];

function scoreOpportunity(signals) {
  let score = 0;
  if (signals.hasWebsite === false) score += 40;
  if (signals.digitalPresenceQuality === "poor") score += 15;
  if (signals.multiLocation) score += 10;
  if ((signals.reviews ?? 0) > 10) score += 20;
  if (signals.rating && signals.rating >= 4.2) score += 5;
  if (signals.industry && ["restaurant", "retail", "hotel", "education"].includes(signals.industry)) {
    score += 25;
  }
  return score;
}

async function fetchDetails(placeId, apiKey) {
  const url = new URL(GOOGLE_DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "website,formatted_phone_number,international_phone_number");
  url.searchParams.set("key", apiKey);
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Google details error: ${resp.status}`);
  }
  return resp.json();
}

async function upsertOpportunity(supabase, payload) {
  const { data, error } = await supabase
    .from("opportunities")
    .upsert(payload, { onConflict: "source_ref" })
    .select("id, type, has_website")
    .single();

  if (error) throw error;
  return data;
}

async function ensureLeadForOpportunity(supabase, opportunityId, companyName, industry, source) {
  if (!opportunityId) return;
  const { data } = await supabase
    .from("leads")
    .select("id")
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (data) return;

  await supabase.from("leads").insert({
    opportunity_id: opportunityId,
    company_name: companyName,
    industry,
    source,
    pipeline_state: "discovered",
  });
}

async function enqueueResearchTask(supabase, opportunityId, parentTaskId) {
  await supabase.from("agent_tasks").insert({
    task_type: "company_research",
    status: "queued",
    pipeline_id: opportunityId,
    parent_task_id: parentTaskId,
    payload: { opportunity_id: opportunityId },
    priority: 3,
    max_attempts: 2,
  });
}

export async function handleBusinessDiscovery({ supabase, task }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY");
  }

  const payload = task.payload || {};
  const query = payload.query || "negocio";
  const city = payload.city || "Costa Rica";
  const category = payload.category || "";
  const radius = Math.min(Number(payload.radius) || 2000, 5000);
  const maxResults = Math.min(Number(payload.maxResults) || 5, 8);

  const url = new URL(GOOGLE_TEXTSEARCH_URL);
  url.searchParams.set("query", `${query} ${city} ${category}`.trim());
  url.searchParams.set("radius", radius.toString());
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Places error ${response.status}`);
  }
  const body = await response.json();
  const results = (body.results || []).slice(0, maxResults);

  const processed = [];

  for (const result of results) {
    const placeId = result.place_id;
    if (!placeId) continue;

    let websiteUrl = null;
    try {
      const details = await fetchDetails(placeId, apiKey);
      websiteUrl = details.result?.website ?? null;
    } catch (err) {
      console.warn("[business-discovery] details error", err.message);
    }

    const hasWebsite = Boolean(websiteUrl);
    const digitalPresence = hasWebsite ? "basic" : "poor";
    const industry = result.types?.[0] ?? null;
    const score = scoreOpportunity({
      hasWebsite,
      digitalPresenceQuality: digitalPresence,
      industry,
      reviews: result.user_ratings_total,
      rating: result.rating,
    });

    const opportunityPayload = {
      type: hasWebsite ? "lead" : "website_opportunity",
      title: result.name,
      company_name: result.name,
      industry,
      description: result.formatted_address,
      source: "google_places",
      source_ref: placeId,
      location: {
        address: result.formatted_address,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
      },
      has_website: hasWebsite,
      website_url: websiteUrl,
      digital_presence: digitalPresence,
      metadata: {
        google_place_id: placeId,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
        maps_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      },
      opportunity_score: score,
      status: "new",
    };

    const opportunity = await upsertOpportunity(supabase, opportunityPayload);

    await supabase.from("opportunity_events").insert({
      opportunity_id: opportunity.id,
      event_type: "discovered",
      metadata: opportunityPayload.metadata,
    });

    await ensureLeadForOpportunity(
      supabase,
      opportunity.id,
      result.name,
      industry,
      "google_places"
    );

    await enqueueResearchTask(supabase, opportunity.id, task.id);

    processed.push({ id: opportunity.id, hasWebsite });
  }

  return { processedCount: processed.length };
}
