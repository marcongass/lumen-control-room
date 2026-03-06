import { listAgentsWithStats } from "../services/agents";

export async function AgentControlRoom() {
  const { agents, source } = await listAgentsWithStats();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Agent Control Room</p>
          <h3 className="text-lg font-semibold text-white">Ejecuciones paralelas 24/7</h3>
        </div>
        <span className="text-xs text-emerald-300">Fuente: {source}</span>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{agent.name}</p>
              <span className="text-xs text-slate-400">{agent.status}</span>
            </div>
            <p className="text-xs text-slate-400">Rol: {agent.role}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="text-[0.6rem] uppercase text-slate-400">Queue</p>
                <p className="text-base font-semibold text-white">{agent.queue}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="text-[0.6rem] uppercase text-slate-400">Running</p>
                <p className="text-base font-semibold text-white">{agent.running}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="text-[0.6rem] uppercase text-slate-400">24h</p>
                <p className="text-base font-semibold text-white">{agent.completed24h}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-emerald-200">
              Success rate: {(agent.successRate * 100).toFixed(0)}%
            </p>
          </div>
        ))}
        {agents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 p-4 text-xs text-slate-400">
            No hay agentes registrados aún.
          </div>
        )}
      </div>
    </div>
  );
}
