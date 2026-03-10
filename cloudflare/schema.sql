-- Cloudflare D1 schema for EEOS onboarding and recommendations

CREATE TABLE IF NOT EXISTS accounts (
  company_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  admin_name TEXT DEFAULT '',
  state_blob TEXT DEFAULT '{}',
  state_version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES accounts(company_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_company_id ON sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  host TEXT NOT NULL,
  token_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name_default TEXT DEFAULT '',
  admin_name_default TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES accounts(company_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_magic_links_host_token ON magic_links(host, token_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_lookup ON magic_links(host, active, expires_at);

CREATE TABLE IF NOT EXISTS events_master (
  event_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  url TEXT DEFAULT '',
  cost_per_person REAL NOT NULL DEFAULT 0,
  goals_json TEXT NOT NULL DEFAULT '[]',
  schedules_json TEXT NOT NULL DEFAULT '[]',
  type TEXT NOT NULL DEFAULT 'paid',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_master_active ON events_master(active);

CREATE TABLE IF NOT EXISTS events_recommended (
  company_id TEXT NOT NULL,
  cycle_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score REAL NOT NULL,
  generated_at TEXT NOT NULL,
  algorithm_version TEXT NOT NULL,
  PRIMARY KEY (company_id, cycle_id, rank),
  FOREIGN KEY (company_id) REFERENCES accounts(company_id),
  FOREIGN KEY (event_id) REFERENCES events_master(event_id)
);

CREATE INDEX IF NOT EXISTS idx_events_recommended_company_cycle ON events_recommended(company_id, cycle_id);
