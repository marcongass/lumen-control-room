"use client";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export function MetricCards() {
  const metrics = useDashboardMetrics();

  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Métricas del día</h3>
        <span className="text-xs text-slate-400">Actualizado 16:20</span>
      </div>
      <div className="mt-3 grid gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
            <div>
              <p className="text-xs text-slate-400">{metric.label}</p>
              <p className="text-base font-semibold text-white">{metric.value}</p>
            </div>
            <span className="text-xs text-emerald-300">{metric.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
