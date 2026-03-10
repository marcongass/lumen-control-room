import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseClient } from '@/lib/supabase/client';

// Configuration
const DEFAULT_QUERY = 'negocio';
const DEFAULT_CITY = 'San José, Costa Rica';
const DEFAULT_RADIUS = 2000;
const DEFAULT_MAX_RESULTS = 5;
const DEFAULT_CATEGORY = '';

// Scoring criteria
const HIGH_PROBABILITY_INDUSTRIES = ['restaurant', 'retail', 'hotel', 'education', 'healthcare', 'professional services'];

async function fetchGooglePlaces(query, city, category, radius, maxResults) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_PLACES_API_KEY');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', `${query} ${city} ${category}`.trim());
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.slice(0, maxResults);
}

function scoreBusiness(place) {
  let score = 0;
  
  // Industry scoring
  const industry = place.types?.[0] ?? null;
  if (industry && HIGH_PROBABILITY_INDUSTRIES.includes(industry.toLowerCase())) {
    score += 30;
  }
  
  // Size scoring (based on name length as proxy)
  const nameLength = place.name?.length || 0;
  if (nameLength > 10 && nameLength < 50) {
    score += 20;
  }
  
  // Digital presence scoring
  const reviews = place.user_ratings_total || 0;
  if (reviews > 50) {
    score += 20;
  } else if (reviews > 10) {
    score += 10;
  }
  
  // Rating scoring
  const rating = place.rating || 0;
  if (rating >= 4.0) {
    score += 15;
  } else if (rating >= 3.5) {
    score += 10;
  }
  
  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
}

async function upsertOpportunity(supabase, payload) {
  const { data, error } = await supabase
    .from('opportunities')
    .upsert(payload, { onConflict: 'source_ref' })
    .select('id, type, has_website')
    .single();

  if (error) throw error;
  return data;
}

async function ensureLead(supabase, opportunityId, companyName, industry, source) {
  if (!opportunityId) return;
  
  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .maybeSingle();

  if (!data) {
    await supabase.from('leads').insert({
      opportunity_id: opportunityId,
      company_name: companyName,
      industry,
      source,
      pipeline_state: 'discovered',
    });
  }
}

async function logEvent(supabase, opportunityId, eventType, metadata) {
  if (!opportunityId) return;
  
  await supabase.from('opportunity_events').insert({
    opportunity_id: opportunityId,
    event_type: eventType,
    metadata,
  });
}

export async function GET(request: NextRequest) {
  try {
    // Configuration from environment
    const query = process.env.DISCOVERY_QUERY || DEFAULT_QUERY;
    const city = process.env.DISCOVERY_CITY || DEFAULT_CITY;
    const category = process.env.DISCOVERY_CATEGORY || DEFAULT_CATEGORY;
    const radius = Number(process.env.DISCOVERY_RADIUS) || DEFAULT_RADIUS;
    const maxResults = Number(process.env.DISCOVERY_MAX_RESULTS) || DEFAULT_MAX_RESULTS;

    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Step 1: Fetch businesses from Google Places
    const results = await fetchGooglePlaces(query, city, category, radius, maxResults);
    
    const processed = [];
    const leads = [];

    for (const place of results) {
      const placeId = place.place_id;
      if (!placeId) continue;

      // Compute score
      const score = scoreBusiness(place);

      // Create opportunity
      const opportunityPayload = {
        type: 'lead',
        title: place.name,
        company_name: place.name,
        industry: place.types?.[0] ?? null,
        description: place.formatted_address,
        source: 'google_places_auto',
        source_ref: placeId,
        location: {
          address: place.formatted_address,
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        },
        has_website: false, // placeholder, will be updated by research
        website_url: null,
        metadata: {
          google_place_id: placeId,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          maps_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        },
        opportunity_score: score,
        status: 'new',
      };

      // Upsert opportunity
      const opportunity = await upsertOpportunity(supabase, opportunityPayload);

      // Log event
      await logEvent(supabase, opportunity.id, 'discovered', opportunityPayload.metadata);

      // Ensure lead exists
      await ensureLead(supabase, opportunity.id, place.name, place.types?.[0] ?? null, 'google_places_auto');

      processed.push({
        id: opportunity.id,
        name: place.name,
        address: place.formatted_address,
        score,
        hasWebsite: false,
        industry: place.types?.[0] ?? null,
        rating: place.rating,
        reviews: place.user_ratings_total,
      });
    }

    // Sort by score (highest first)
    processed.sort((a, b) => b.score - a.score);

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      city,
      query,
      processedCount: processed.length,
      leads: processed.slice(0, 10), // Top 10 leads
      totalOpportunities: processed.length,
      summary: {
        averageScore: processed.length > 0 ? processed.reduce((sum, o) => sum + o.score, 0) / processed.length : 0,
        highPotentialCount: processed.filter(o => o.score >= 70).length,
        websiteCount: processed.filter(o => o.hasWebsite).length,
      },
    };

    // Enqueue company research tasks for all opportunities
    for (const opp of processed) {
      await supabase.from('agent_tasks').insert({
        task_type: 'company_research',
        status: 'queued',
        pipeline_id: opp.id,
        parent_task_id: null,
        payload: {
          opportunity_id: opp.id,
        },
        priority: 5, // high priority for research
        max_attempts: 2,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Discovery completed successfully',
      report,
    }, { status: 200 });

  } catch (error) {
    console.error('Discovery error', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Discovery failed',
      error: error instanceof Error ? error.message : error,
    }, { status: 500 });
  }
}
