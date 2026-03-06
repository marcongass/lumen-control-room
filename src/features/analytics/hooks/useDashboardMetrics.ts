"use client";

import { useMemo } from "react";
import type { MetricCard } from "../types";

const cards: MetricCard[] = [
  { label: "Execution Velocity", value: "12/15", trend: "+2" },
  { label: "Strategic Focus", value: "40% CS", trend: "Balance" },
  { label: "Pipeline Salud", value: "$42k", trend: "2 riesgos" },
];

export const useDashboardMetrics = () => useMemo(() => cards, []);
