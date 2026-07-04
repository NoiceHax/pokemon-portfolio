-- NeonDB schema for Trainer Chandan.
-- Run once against your Neon database (psql "$DATABASE_URL" -f src/lib/db/schema.sql),
-- or paste into the Neon SQL editor. Safe to re-run (IF NOT EXISTS).

-- Hall of Fame leaderboard: people who found the hidden links.
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  handle       TEXT,                 -- optional @handle / site
  message      TEXT,                 -- optional short note
  links_found  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hall_of_fame_created_idx ON hall_of_fame (created_at DESC);

-- Blog / Journal posts (frontmatter + MDX body stored as text).
CREATE TABLE IF NOT EXISTS blog_posts (
  slug          TEXT PRIMARY KEY,
  entry_number  INTEGER NOT NULL,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  body_mdx      TEXT NOT NULL DEFAULT '',
  post_date     DATE NOT NULL,
  read_minutes  INTEGER NOT NULL DEFAULT 1,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  draft         BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_posts_date_idx ON blog_posts (post_date DESC);

-- Rate limiting: one row per (bucket-key, window-start). A "key" is ip+route.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key    TEXT NOT NULL,
  window_start  BIGINT NOT NULL,       -- epoch ms of the window's start
  hits          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
-- Lets us cheaply prune old windows.
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

-- Simple site counters (e.g. total trainers who visited).
CREATE TABLE IF NOT EXISTS counters (
  name   TEXT PRIMARY KEY,
  value  BIGINT NOT NULL DEFAULT 0
);
