-- D1 schema: Tags for pattern and topic categorization

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('topic', 'pattern')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_type ON tags(name, type);
