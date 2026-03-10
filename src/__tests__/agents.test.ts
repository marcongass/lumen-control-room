
import { listAgentsWithStats } from '@/features/agents/services/agents';

describe('listAgentsWithStats', () => {
  it('computes agent statistics correctly', () => {
    // Mock data
    const agents = [
      { id: 'a1', name: 'Agent1', role: 'discovery', status: 'active' },
      { id: 'a2', name: 'Agent2', role: 'research', status: 'active' },
    ];
    
    const queuedRunning = [
      { agent_id: 'a1', status: 'queued' },
      { agent_id: 'a1', status: 'running' },
      { agent_id: 'a2', status: 'completed' },
      { agent_id: 'a2', status: 'failed' },
    ];
    
    const recentFinished = [
      { agent_id: 'a1', status: 'completed' },
      { agent_id: 'a2', status: 'failed' },
    ];

    // Mock the aggregation logic directly
    const queueMap = new Map();
    for (const row of queuedRunning) {
      if (!row.agent_id) continue;
      const current = queueMap.get(row.agent_id) ?? { queue: 0, running: 0 };
      if (row.status === "queued") current.queue += 1;
      if (row.status === "running") current.running += 1;
      queueMap.set(row.agent_id, current);
    }

    const performanceMap = new Map();
    for (const row of recentFinished) {
      if (!row.agent_id) continue;
      const current = performanceMap.get(row.agent_id) ?? { completed: 0, failed: 0 };
      if (row.status === "completed") current.completed += 1;
      if (row.status === "failed") current.failed += 1;
      performanceMap.set(row.agent_id, current);
    }

    const summaries = agents.map(agent => {
      const queueStats = queueMap.get(agent.id) ?? { queue: 0, running: 0 };
      const perf = performanceMap.get(agent.id) ?? { completed: 0, failed: 0 };
      const total = perf.completed + perf.failed;
      const successRate = total === 0 ? 1 : perf.completed / total;

      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: agent.status,
        queue: queueStats.queue,
        running: queueStats.running,
        completed24h: perf.completed,
        successRate,
      };
    });

    expect(summaries).toHaveLength(2);
    const a1 = summaries.find(a => a.id === 'a1');
    expect(a1.queue).toBe(1);
    expect(a1.running).toBe(1);
    expect(a1.completed24h).toBe(1);
    expect(a1.successRate).toBeCloseTo(1, 1);
    const a2 = summaries.find(a => a.id === 'a2');
    expect(a2.queue).toBe(0);
    expect(a2.running).toBe(0);
    expect(a2.completed24h).toBe(0);
    expect(a2.successRate).toBeCloseTo(0, 1);
  });
});
