export type KanbanTask = {
  title: string;
  summary: string;
  agent: string;
  skills: string[];
  status: string;
  score: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  vibe: string;
  accent: string;
  tasks: KanbanTask[];
};
