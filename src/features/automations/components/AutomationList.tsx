"use client";

import { useAutomationQueue } from "../hooks/useAutomationQueue";

export function AutomationList() {
  const jobs = useAutomationQueue();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Automations</h3>
        <button className="text-xs text-emerald-300">+ Nuevo job</button>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        {jobs.map((job) => (
          <div key={job.title} className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{job.title}</p>
              <span className="text-xs text-slate-400">{job.owner}</span>
            </div>
            <p className="text-xs text-slate-300">Estado: {job.status}</p>
            <p className="text-xs text-emerald-200">ETA: {job.eta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
