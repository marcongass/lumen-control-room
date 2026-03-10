-- Add pending_review flag to agent_tasks for human validation gate
ALTER TABLE IF EXISTS agent_tasks
  ADD COLUMN IF NOT EXISTS pending_review boolean DEFAULT false;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_agent_tasks_pending_review ON agent_tasks(pending_review) WHERE pending_review = true;
