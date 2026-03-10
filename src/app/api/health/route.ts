import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const checks: { module: string; status: string; error?: string }[] = [];

  try {
    const agentJsonPath = process.env.NEXT_PUBLIC_AGENT_JSON_PATH || path.join(process.cwd(), 'agent.json');
    const content = await fs.readFile(agentJsonPath, 'utf-8');
    const agent = JSON.parse(content);
    checks.push({ module: 'agent.json', status: 'ok', data: { provider: agent.model_provider, model: agent.model_name } });

    // Supabase
    try {
      const client = getSupabaseClient();
      if (!client) {
        checks.push({ module: 'Supabase', status: 'failed', error: 'Client not initialized' });
      } else {
        const { error } = await client.from('agents').select('id').limit(1);
        checks.push(error ? { module: 'Supabase', status: 'failed', error: error.message } : { module: 'Supabase', status: 'ok' });
      }
    } catch (e) {
      checks.push({ module: 'Supabase', status: 'failed', error: String(e) });
    }

    // OpenRouter ping
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        checks.push({ module: 'OpenRouter', status: 'failed', error: 'API key missing' });
      } else {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: agent.model_name,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 1,
            temperature: 0,
          }),
        });
        if (response.ok) {
          checks.push({ module: 'OpenRouter', status: 'ok', data: { model: agent.model_name } });
        } else {
          const err = await response.text();
          checks.push({ module: 'OpenRouter', status: 'failed', error: `HTTP ${response.status}` });
        }
      }
    } catch (e) {
      checks.push({ module: 'OpenRouter', status: 'failed', error: String(e) });
    }

    // Queue metrics
    try {
      const client = getSupabaseClient();
      if (client) {
        const [pendingRes, runningRes] = await Promise.all([
          client.from('agent_tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          client.from('agent_tasks').select('id', { count: 'exact', head: true }).eq('status', 'running'),
        ]);
        checks.push({ module: 'Queue Metrics', status: 'ok', data: { pending: pendingRes.count || 0, running: runningRes.count || 0 } });
      }
    } catch (e) {
      checks.push({ module: 'Queue Metrics', status: 'degraded', error: String(e) });
    }

  } catch (e) {
    checks.push({ module: 'agent.json', status: 'failed', error: `Config error: ${String(e)}` });
  }

  const hasErrors = checks.some(c => c.status === 'failed');
  return NextResponse.json({
    status: hasErrors ? 'degraded' : 'ok',
    checks,
  });
}
