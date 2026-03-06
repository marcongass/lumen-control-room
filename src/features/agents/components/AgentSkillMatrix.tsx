"use client";

import { useSkillMatrix } from "../hooks/useSkillMatrix";

export function AgentSkillMatrix() {
  const rows = useSkillMatrix();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Skill Matrix</h3>
      <div className="mt-3 space-y-3 text-xs">
        {rows.map((row) => (
          <div
            key={row.skill}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold">{row.skill}</p>
              <p className="text-slate-400">{row.owner}</p>
            </div>
            <div className="text-right text-slate-300">
              <p>Queue: {row.queue}</p>
              <p className="text-emerald-200">{row.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
