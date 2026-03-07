export type LeadStage =
  | "discovered"
  | "analyzed"
  | "qualified"
  | "contacted"
  | "negotiating"
  | "converted"
  | "lost";

export type LeadCard = {
  id: string;
  opportunityId?: string;
  company: string;
  industry: string;
  companySize?: string;
  source?: string;
  stage: LeadStage;
  score: number;
  owner: string;
  nextStep: string;
  opportunityType?: string;
  hasWebsite?: boolean;
};
