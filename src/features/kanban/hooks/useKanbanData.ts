"use client";

import { useMemo } from "react";
import type { KanbanColumn } from "../types";

const mockColumns: KanbanColumn[] = [
  {
    id: "discover",
    title: "Discover ↔ Research",
    vibe: "Scraping, briefs, insights",
    accent: "from-emerald-500/30 to-emerald-500/5",
    tasks: [
      {
        title: "Scraping leads B2B Costa Rica",
        summary: "Generar 40 contactos priorizados",
        agent: "Growth",
        skills: ["Growth", "Scraping", "Automation"],
        status: "En curso",
        score: "+120 XP",
      },
      {
        title: "Mapa herramientas multi-agente",
        summary: "Benchmark < $50/mes",
        agent: "Research",
        skills: ["Research", "Strategy"],
        status: "Planificado",
        score: "+80 XP",
      },
    ],
  },
  {
    id: "build",
    title: "Build ↔ Code",
    vibe: "Implementación y sistemas",
    accent: "from-sky-500/40 to-sky-500/5",
    tasks: [
      {
        title: "Wireframes control room",
        summary: "Layout chat + kanban + agentes",
        agent: "Código",
        skills: ["Next.js", "UI", "Systems"],
        status: "En curso",
        score: "+200 XP",
      },
      {
        title: "Esquema Supabase",
        summary: "Tablas projects/leads/agents",
        agent: "Código",
        skills: ["Data", "Supabase"],
        status: "Backlog",
        score: "+150 XP",
      },
    ],
  },
  {
    id: "scale",
    title: "Scale ↔ Customer Success",
    vibe: "Acciones con clientes / revenue",
    accent: "from-amber-500/40 to-amber-500/5",
    tasks: [
      {
        title: "Plan CS Nova Industries",
        summary: "Storyboard + métricas",
        agent: "CS",
        skills: ["Customer Success", "Playbooks"],
        status: "Feedback",
        score: "+90 XP",
      },
      {
        title: "Growth kit Helix",
        summary: "Copy outbound LATAM",
        agent: "Growth",
        skills: ["Growth", "Copy"],
        status: "Bloqueado",
        score: "Requiere contexto",
      },
    ],
  },
];

export const useKanbanData = () => {
  return useMemo(() => mockColumns, []);
};
