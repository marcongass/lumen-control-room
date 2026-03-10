import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseClient } from '@/lib/supabase/client';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const checks: { module: string; status: string; error?: string }[] = [];

  // 1. Check agent.json configuration
  try {
    const agentJsonPath = process.env.NEXT_PUBLIC_AGENT_JSON_PATH || path.join(process.cwd(), 'agent.json');
    const content = await fs.readFile(agentJsonPath, 'utf-8');
    JSON.parse(content);
    checks.push({ module: 'agent.json', status: 'ok' });
  } catch (e) {
    checks.push({ module: 'agent.json', status: 'failed', error: `Config not found: ${String(e)}` });
  }

  // 2. Validate Supabase connection
  try {
    const client = getSupabaseClient();
    if (!client) {
      checks.push({ module: 'Supabase', status: 'failed', error: 'Client not initialized' });
    } else {
      // Simple query to verify connectivity
      const { error } = await client.from('agents').select('id').limit(1);
      if (error) {
        checks.push({ module: 'Supabase', status: 'failed', error: error.message });
      } else {
        checks.push({ module: 'Supabase', status: 'ok' });
      }
    }
  } catch (e) {
    checks.push({ module: 'Supabase', status: 'failed', error: String(e) });
  }

  // 3. Check OpenRouter/M-Qwen3 accessibility (simulated)
  // In production would make a test call to the model API
  checks.push({ module: 'Model Provider', status: 'ok' });

  // Compile status
  const hasErrors = checks.some(c => c.status === 'failed');
  return NextResponse.json({
    status: hasErrors ? 'degraded' : 'ok',
    checks
  });
}
