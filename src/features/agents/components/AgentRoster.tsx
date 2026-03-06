"use client";

import { useAgentRoster } from "../hooks/useAgentRoster";

export function AgentRoster() {
  const agents = useAgentRoster();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
          Agentes
        </h3>
        <span className="text-xs text-emerald-300">{agents.length} activos</span>
      </div>
      <div className="mt-3 space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{agent.name}</p>
              <span className="text-xs text-slate-400">{agent.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-slate-300">
              {agent.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 px-2 py-1">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
                style={{ width: `${agent.energy * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Carga: {agent.load}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
