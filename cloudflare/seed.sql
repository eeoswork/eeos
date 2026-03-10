-- Seed data for Revelry Labs launch

INSERT OR IGNORE INTO accounts (
  company_id,
  email,
  password_hash,
  company_name,
  admin_name,
  state_blob,
  state_version,
  created_at,
  updated_at
) VALUES (
  'revelry-labs',
  'admin@revelrylabs.example',
  'seed:replace-this-after-real-signup',
  'Revelry Labs',
  '',
  '{"companyName":"Revelry Labs","adminName":""}',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO magic_links (
  id,
  host,
  token_id,
  company_id,
  company_name_default,
  admin_name_default,
  active,
  expires_at,
  created_at
) VALUES (
  'magic-revelry-1',
  'revelrylabs.eeos.work',
  'rlabs2026a1b2c3d4',
  'revelry-labs',
  'Revelry Labs',
  'Jennifer Baldwin',
  1,
  NULL,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO events_master (event_id, name, description, url, cost_per_person, goals_json, schedules_json, type, active, created_at, updated_at) VALUES
('evt-1','Team Trivia Live','Live-hosted team trivia with custom company rounds.','https://www.withconfetti.com/',35,'["Retention & Engagement","Employer Brand & Recruiting"]','["After 5p","Lunch"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-2','Virtual Escape Room','Collaborative puzzle challenge for remote teams.','https://www.theescapegame.com/remote-adventures/',42,'["Retention & Engagement","Performance & Productivity"]','["After 5p","Weekday mornings"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-3','Coffee Chat Roulette','Automated 1:1 pairings for informal team connection.','https://www.donut.com/',0,'["Retention & Engagement","DEI & Belonging"]','["Weekday mornings","Lunch"]','free',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-4','Mindfulness Session','Guided mindfulness workshop for stress reduction.','https://www.headspace.com/work',18,'["Performance & Productivity","Retention & Engagement"]','["Weekday mornings","Lunch"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-5','Volunteer Impact Day','Team volunteering experience with local nonprofits.','https://www.volunteermatch.org/',12,'["Employer Brand & Recruiting","DEI & Belonging"]','["Weekday mornings","Lunch"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-6','Cooking Class Social','Interactive cooking experience led by a chef.','https://www.cozymeal.com/team-building',65,'["Retention & Engagement","Employer Brand & Recruiting"]','["After 5p"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-7','Lunch-and-Learn Lightning Talks','Employee-led quick talks for knowledge sharing.','https://calendar.google.com/',12,'["Performance & Productivity","Employer Brand & Recruiting"]','["Lunch"]','paid',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('evt-8','Recognition Roundtable','Peer appreciation format to boost morale.','https://www.withconfetti.com/',0,'["Retention & Engagement"]','["After 5p","Lunch"]','free',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
