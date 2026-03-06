"use client";

import { useKanbanData } from "../hooks/useKanbanData";

export function KanbanBoard() {
  const columns = useKanbanData();

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`rounded-3xl border border-white/10 bg-gradient-to-b ${column.accent} p-4 backdrop-blur`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <p className="text-xs text-slate-200">{column.vibe}</p>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
              {column.tasks.length} tareas
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {column.tasks.map((task) => (
              <article key={task.title} className="rounded-2xl border border-white/20 bg-black/25 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{task.title}</p>
                  <span className="text-xs text-emerald-300">{task.score}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{task.summary}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-slate-300">
                  <span className="rounded-full border border-white/10 px-2 py-1 uppercase tracking-widest">
                    Agent · {task.agent}
                  </span>
                  {task.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 px-2 py-1">
                      {skill}
                    </span>
                  ))}
                  <span className="rounded-full border border-amber-400/40 px-2 py-1 text-amber-200">
                    {task.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
