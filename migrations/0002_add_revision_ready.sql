-- Add is_revision_ready column to problems table

ALTER TABLE problems ADD COLUMN is_revision_ready INTEGER NOT NULL DEFAULT 0;