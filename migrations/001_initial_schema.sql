-- Migration 001: initial schema
-- Tables: sources, items

CREATE TABLE IF NOT EXISTS sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('rss', 'hackernews', 'github')),
  url         TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  raw_content  TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'traité', 'archivé')),
  summary      TEXT,
  score        NUMERIC,
  tags         TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT items_url_source_unique UNIQUE (url, source_id)
);

CREATE INDEX IF NOT EXISTS items_source_id_idx ON items(source_id);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS items_published_at_idx ON items(published_at DESC);
