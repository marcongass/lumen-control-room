
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface LeadReport {
  id: string;
  company_name: string;
  industry: string | null;
  opportunity_score: number;
  location: any; // { address?: string; ... }
  source: string;
}


export async function GET() {
  const client = getSupabaseClient(); if (!client) return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  if (!client) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  // Fetch top opportunities with high scores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from('opportunities') as any)
    .select('id, company_name, industry, opportunity_score, location, source')
    .gte('opportunity_score', 70)  // threshold for high potential
    .order('opportunity_score', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    count: data?.length || 0,
    leads: data?.map((lead: LeadReport) => ({
      id: lead.id,
      name: lead.company_name,
      industry: lead.industry,
      score: lead.opportunity_score,
      location: lead.location?.address || lead.location,
      source: lead.source,
    })) || [],
  });
}

export async function POST(request: Request) {
  // Allow triggering report generation manually
  return NextResponse.json({
    message: 'Report generation triggered',
    endpoint: '/api/report',
    method: 'GET to retrieve top leads',
  });
}
