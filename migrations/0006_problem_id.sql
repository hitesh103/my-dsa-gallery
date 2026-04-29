-- Migration to add id column to problems table
-- This migration was run manually via wrangler commands

-- Steps performed:
-- 1. Renamed problems to problems_old
-- 2. Created new problems table without id initially
-- 3. Copied data from problems_old
-- 4. Added id column and populated with sequential numbers based on row order
-- 5. Created FTS triggers
-- 6. Dropped problems_old

-- For future migrations, use this pattern:
-- ALTER TABLE problems ADD COLUMN id INTEGER;
-- UPDATE problems SET id = (SELECT COUNT(*) FROM problems p2 WHERE p2.rowid <= problems.rowid);