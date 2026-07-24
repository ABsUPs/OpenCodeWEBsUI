-- OpenCodeABsUI/UX D1 Database Schema

CREATE TABLE IF NOT EXISTS orgs (
  name TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  mission TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  agent_count INTEGER NOT NULL DEFAULT 0,
  storage_used INTEGER NOT NULL DEFAULT 0,
  storage_limit INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orgs_owner ON orgs(owner);
