/**
 * Configuration file for EEOS (Employee Experience Operating System)
 * 
 * MULTI-USER ARCHITECTURE:
 * ------------------------
 * The app is fully ready for multi-user/multi-tenant operation via Supabase.
 * 
 * - Each user gets a unique accountId (company/workspace identifier)
 * - All data is scoped by account_id in Supabase tables
 * - localStorage uses account-specific keys for browser caching
 * - Setup flow (landing draft) data syncs to Supabase automatically
 * 
 * SUPABASE SETUP (when ready):
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the schema.sql file from /supabase/schema.sql
 * 3. Get your Project URL and Anon Key from Settings > API
 * 4. Paste them below as supabaseUrl and supabaseAnonKey
 * 5. Optional: Enable Supabase Auth for user authentication
 * 
 * CURRENT MODE:
 * - localStorage only (Supabase config empty = local-only mode)
 * - Each browser stores data per accountId
 * - When Supabase is configured, data automatically syncs to cloud
 */

window.__EEOS_CONFIG__ = {
  // Cloudflare API configuration
  apiBaseUrl: 'https://api.eeos.work/api',

  // Launch magic-link host defaults
  magicLinks: {
    hostDefaults: {
      'revelrylabs.eeos.work': {
        companyName: 'Revelry Labs',
        adminName: 'Jennifer Baldwin'
      },
      'testing.eeos.work': {
        companyName: 'Revelry Labs (Testing)',
        adminName: 'Jennifer Baldwin'
      }
    }
  },

  // Legacy Supabase configuration (unused in Cloudflare mode)
  supabaseUrl: '',
  supabaseAnonKey: '',
  
  // Feature flags
  features: {
    supabaseEnabled: false,
    debugLogging: false
  }
};

/**
 * SUPABASE SCHEMA (for reference)
 * 
 * Create these tables in your Supabase project when ready:
 * 
 * Table: programs
 * - id: uuid, primary key
 * - user_id: uuid, foreign key to auth.users
 * - company_name: text
 * - admin_name: text
 * - goals: jsonb (array of selected goals)
 * - budget_mode: text (total | perEmployee)
 * - total_budget: numeric
 * - per_employee_budget: numeric
 * - employee_count: integer
 * - cadence: text
 * - preferred_schedule: jsonb (array)
 * - setup_completed: boolean
 * - created_at: timestamptz
 * - updated_at: timestamptz
 * 
 * Table: events
 * - id: uuid, primary key
 * - program_id: uuid, foreign key to programs
 * - event_name: text
 * - date: date
 * - details: jsonb
 * - created_at: timestamptz
 */

