-- D1 schema: Problems + search index (FTS5)

CREATE TABLE IF NOT EXISTS problems (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  pattern TEXT NOT NULL,
  link TEXT NOT NULL,
  content_json TEXT NOT NULL,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_problems_topic ON problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_pattern ON problems(pattern);
CREATE INDEX IF NOT EXISTS idx_problems_updated ON problems(updated_at);

CREATE VIRTUAL TABLE IF NOT EXISTS problems_fts USING fts5(
  slug UNINDEXED,
  title,
  topic,
  pattern,
  search_text
);

CREATE TRIGGER IF NOT EXISTS problems_ai AFTER INSERT ON problems BEGIN
  INSERT INTO problems_fts (slug, title, topic, pattern, search_text)
  VALUES (new.slug, new.title, new.topic, new.pattern, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS problems_ad AFTER DELETE ON problems BEGIN
  DELETE FROM problems_fts WHERE slug = old.slug;
END;

CREATE TRIGGER IF NOT EXISTS problems_au AFTER UPDATE ON problems BEGIN
  DELETE FROM problems_fts WHERE slug = old.slug;
  INSERT INTO problems_fts (slug, title, topic, pattern, search_text)
  VALUES (new.slug, new.title, new.topic, new.pattern, new.search_text);
END;

