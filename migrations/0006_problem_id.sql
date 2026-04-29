-- Add auto-incrementing ID column to problems table
ALTER TABLE problems ADD COLUMN id INTEGER;

-- Populate IDs sequentially based on created_at order (oldest = 1)
UPDATE problems SET id = (
  SELECT COUNT(*) 
  FROM problems p2 
  WHERE p2.created_at < problems.created_at 
     OR (p2.created_at = problems.created_at AND p2.slug <= problems.slug)
);

-- Create index on the new id column
CREATE INDEX IF NOT EXISTS idx_problems_id ON problems(id);

-- Add index for created_at for better sorting performance
CREATE INDEX IF NOT EXISTS idx_problems_created ON problems(created_at);