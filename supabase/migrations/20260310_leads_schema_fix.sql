-- Fix leads table: add missing columns
ALTER TABLE IF EXISTS leads
  ADD COLUMN IF NOT EXISTS pipeline_state text DEFAULT 'discovered',
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES opportunities(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_id ON leads(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_state ON leads(pipeline_state);
