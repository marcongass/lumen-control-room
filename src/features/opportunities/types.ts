export type OpportunityType =
  | "lead"
  | "software_project"
  | "website_opportunity"
  | "real_estate"
  | "marketing_client"
  | "automation_project"
  | "saas_product";

export type Opportunity = {
  id: string;
  type: OpportunityType;
  title?: string | null;
  company_name?: string | null;
  description?: string | null;
  source?: string | null;
  source_ref?: string | null;
  location?: Record<string, unknown> | null;
  has_website?: boolean | null;
  website_url?: string | null;
  digital_presence?: string | null;
  opportunity_score?: number | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};
