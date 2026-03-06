export type LeadStage =
  | "discovered"
  | "analyzed"
  | "qualified"
  | "contacted"
  | "negotiating"
  | "converted";

export type LeadCard = {
  id: string;
  company: string;
  industry: string;
  stage: LeadStage;
  score: number;
  owner: string;
  nextStep: string;
};
