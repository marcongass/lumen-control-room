"use client";

import { useMemo } from "react";
import type { Agent } from "../types";

const roster: Agent[] = [
  {
    name: "Lumen·Código",
    status: "En misión",
    load: "72%",
    skills: ["Next.js", "Supabase", "Automations"],
    energy: 0.8,
  },
  {
    name: "Lumen·Growth",
    status: "En cola",
    load: "41%",
    skills: ["Copy", "Outbound", "Scraping"],
    energy: 0.6,
  },
  {
    name: "Lumen·CS",
    status: "Listo",
    load: "0%",
    skills: ["Playbooks", "Insights"],
    energy: 1,
  },
];

export const useAgentRoster = () => useMemo(() => roster, []);
