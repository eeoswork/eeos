# Supabase Integration Setup Guide

> Deprecated for current deployment path. The app now uses Cloudflare Worker + D1 for auth, state, magic links, and recommendations. See `README.md` Cloudflare API setup section.

This document explains how to enable Supabase for data persistence when you're ready.

## Current Architecture

The app currently uses **localStorage** for all data persistence. The data service layer (`data-service.js`) abstracts storage operations, allowing seamless switching between localStorage and Supabase without changing the application code.

```
app.js (persistState) 
    ↓
data-service.js (saveState/loadState)
    ↓
storage-mode: localStorage OR Supabase
```

## When You're Ready to Enable Supabase

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to initialize (2-3 minutes)

### Step 2: Get Your Credentials

1. Go to **Settings > API** in your Supabase project
2. Copy the **Project URL**
3. Copy the **anon public key**

### Step 3: Create Database Tables

In your Supabase project, go to **SQL Editor** and run this schema:

```sql
-- Programs table (main data store)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company & Admin Info
  company_name TEXT,
  admin_name TEXT,
  
  -- Setup Data
  goals JSONB DEFAULT '[]'::jsonb,
  budget_mode TEXT DEFAULT 'total',
  total_budget NUMERIC,
  per_employee_budget NUMERIC,
  employee_count INTEGER,
  cadence TEXT,
  preferred_schedule JSONB DEFAULT '[]'::jsonb,
  
  -- Setup Status
  setup_completed BOOLEAN DEFAULT FALSE,
  setup_events_generated BOOLEAN DEFAULT FALSE,
  current_setup_step INTEGER DEFAULT 1,
  completed_setup_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per user
  UNIQUE(user_id)
);

-- Events table (for event shortlist & workflow)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  event_name TEXT NOT NULL,
  event_date DATE,
  description TEXT,
  details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for programs table
CREATE POLICY "Users can read their own programs"
  ON programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON programs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
  ON programs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for events table
CREATE POLICY "Users can read events in their programs"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = events.program_id
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events in their programs"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_id
      AND programs.user_id = auth.uid()
    )
  );
```

### Step 4: Enable Authentication (Optional)

To enable user authentication with Supabase:

1. Go to **Authentication > Providers** in Supabase
2. Enable your desired auth methods (Email/Password, Google, GitHub, etc.)
3. Configure settings as needed

### Step 5: Update Configuration

In `config.js`, update:

```javascript
window.__EEOS_CONFIG__ = {
  // Change to 'supabase' to enable
  storageMode: 'supabase',
  
  supabase: {
    url: 'YOUR_PROJECT_URL', // Paste your Supabase URL
    anonKey: 'YOUR_ANON_KEY'  // Paste your anon public key
  },
  
  features: {
    supabaseEnabled: true,
    debugLogging: false
  }
};
```

### Step 6: Test the Connection

1. Open the browser developer console (F12)
2. You should see: `"Data Service: Supabase initialized"`
3. Refresh the page and verify data persists across sessions

## Using Environment Variables (Production)

For production, use environment variables instead of hardcoding secrets:

**In your hosting environment** (Vercel, Netlify, etc.), set:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

The config.js already reads these:

```javascript
supabase: {
  url: process.env.REACT_APP_SUPABASE_URL || '',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || ''
}
```

## Features When Supabase is Enabled

### Automatic User Isolation
- Data is automatically associated with the authenticated user
- Users only see their own data (enforced by Row Level Security policies)

### Real-time Sync (Optional)
- The data service can be extended to use Supabase Realtime
- Multiple tabs/devices stay in sync

### Backup & Recovery
- All data is securely stored on Supabase servers
- Snapshots and point-in-time recovery available

## Fallback Behavior

If Supabase connection fails:
- The app automatically falls back to localStorage
- No data is lost
- User experiences no interruption

## Data Sync: localStorage → Supabase

If you need to migrate existing localStorage data to Supabase:

1. Export localStorage data (run in console):
```javascript
console.log(JSON.stringify(localStorage.getItem('eeos_state')));
```

2. In Supabase SQL Editor, manually insert the data into the programs table

3. Alternatively, you can write a one-time migration script in app.js

## Support for Future Features

The data service is designed to support:
- ✅ Authentication (signIn, signUp, signOut)
- ✅ User profiles
- ✅ Real-time collaboration (via Supabase Realtime)
- ✅ Offline sync (via Supabase offline plugin)
- ✅ Full-text search
- ✅ Analytics via Supabase dashboards

## Questions?

Check the Supabase docs at [https://supabase.com/docs](https://supabase.com/docs)

Or review the data-service.js source code—it has detailed comments explaining each method.
