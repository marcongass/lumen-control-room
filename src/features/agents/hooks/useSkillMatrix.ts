"use client";

import { useMemo } from "react";

export type SkillMatrixRow = {
  skill: string;
  owner: string;
  queue: number;
  status: string;
};

const rows: SkillMatrixRow[] = [
  { skill: "Código", owner: "Lumen·Código", queue: 2, status: "En curso" },
  { skill: "Growth", owner: "Lumen·Growth", queue: 1, status: "Esperando input" },
  { skill: "Customer Success", owner: "Lumen·CS", queue: 0, status: "Libre" },
  { skill: "Research", owner: "Lumen·Research", queue: 1, status: "Planificado" },
];

export const useSkillMatrix = () => useMemo(() => rows, []);
