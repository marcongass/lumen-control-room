"use client";

import { useMemo } from "react";
import type { AutomationJob } from "../types";

const jobs: AutomationJob[] = [
  {
    title: "Scraping LATAM",
    owner: "Growth",
    status: "Corriendo",
    eta: "18m",
  },
  {
    title: "Reporte diario",
    owner: "Core",
    status: "Programado 21:00",
    eta: "Auto",
  },
];

export const useAutomationQueue = () => useMemo(() => jobs, []);
