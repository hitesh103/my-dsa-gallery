-- Migration: content_items
-- Description: Universal content system for problems, notes, etc.

CREATE TABLE IF NOT EXISTS content_items (
  slug TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'public',
  source TEXT,
  source_url TEXT,
  difficulty TEXT,
  topic TEXT,
  pattern TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  content_json TEXT NOT NULL,
  revision_json TEXT NOT NULL DEFAULT '[]',
  mistakes_json TEXT NOT NULL DEFAULT '[]',
  visuals_json TEXT NOT NULL DEFAULT '[]',
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS content_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_slug TEXT NOT NULL,
  to_slug TEXT NOT NULL,
  relation TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(from_slug, to_slug, relation),
  FOREIGN KEY(from_slug) REFERENCES content_items(slug) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE IF NOT EXISTS content_items_fts USING fts5(
  slug UNINDEXED,
  type,
  title,
  summary,
  search_text
);

CREATE TRIGGER IF NOT EXISTS content_items_ai AFTER INSERT ON content_items BEGIN
  INSERT INTO content_items_fts (slug, type, title, summary, search_text)
  VALUES (new.slug, new.type, new.title, new.summary, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS content_items_ad AFTER DELETE ON content_items BEGIN
  DELETE FROM content_items_fts WHERE slug = old.slug;
END;

CREATE TRIGGER IF NOT EXISTS content_items_au AFTER UPDATE ON content_items BEGIN
  DELETE FROM content_items_fts WHERE slug = old.slug;
  INSERT INTO content_items_fts (slug, type, title, summary, search_text)
  VALUES (new.slug, new.type, new.title, new.summary, new.search_text);
END;
