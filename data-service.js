/**
 * Data Service Layer
 * Abstracts storage operations (localStorage | Supabase)
 * 
 * This allows the app to work with either local storage or Supabase
 * without changing the application code.
 * 
 * To switch to Supabase:
 * 1. Update config.js with your Supabase URL and Anon Key
 * 2. Change storageMode to 'supabase'
 * 3. Supabase client will automatically initialize
 */

let supabaseClient = null;
const STORAGE_KEY = 'eeos_state';

/**
 * Initialize the data service
 * Called once at app startup
 */
function initDataService() {
  const config = window.__EEOS_CONFIG__;
  
  // Check if config exists
  if (!config) {
    console.warn('Data Service: No config found, using localStorage');
    return;
  }
  
  if (config.storageMode === 'supabase' && config.supabase && config.supabase.url && config.supabase.anonKey) {
    try {
      // Initialize Supabase client
      supabaseClient = window.supabase.createClient(
        config.supabase.url,
        config.supabase.anonKey
      );
      console.log('Data Service: Supabase initialized');
    } catch (error) {
      console.error('Data Service: Failed to initialize Supabase', error);
      fallbackToLocalStorage();
    }
  } else {
    console.log('Data Service: Using localStorage');
  }
}

/**
 * Save application state
 * @param {Object} state - The state object to persist
 */
async function saveState(state) {
  const config = window.__EEOS_CONFIG__;
  if (supabaseClient && config && config.storageMode === 'supabase') {
    return saveToSupabase(state);
  } else {
    return saveToLocalStorage(state);
  }
}

/**
 * Load application state
 * @returns {Object|null} The loaded state or null if not found
 */
async function loadState() {
  const config = window.__EEOS_CONFIG__;
  if (supabaseClient && config && config.storageMode === 'supabase') {
    return loadFromSupabase();
  } else {
    return loadFromLocalStorage();
  }
}

/**
 * Delete application state
 */
async function deleteState() {
  const config = window.__EEOS_CONFIG__;
  if (supabaseClient && config && config.storageMode === 'supabase') {
    return deleteFromSupabase();
  } else {
    return deleteFromLocalStorage();
  }
}

// ============================================================
// LOCAL STORAGE IMPLEMENTATIONS
// ============================================================

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return Promise.resolve();
  } catch (error) {
    console.error('Data Service: Failed to save to localStorage', error);
    return Promise.reject(error);
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return Promise.resolve(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.error('Data Service: Failed to load from localStorage', error);
    return Promise.reject(error);
  }
}

function deleteFromLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return Promise.resolve();
  } catch (error) {
    console.error('Data Service: Failed to delete from localStorage', error);
    return Promise.reject(error);
  }
}

// ============================================================
// SUPABASE IMPLEMENTATIONS
// ============================================================

async function saveToSupabase(state) {
  if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
  
  try {
    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.warn('Data Service: No authenticated user');
      return fallbackToLocalStorage();
    }
    
    // Upsert program data
    const { error } = await supabaseClient
      .from('programs')
      .upsert({
        user_id: user.id,
        company_name: state.companyName,
        admin_name: state.adminName,
        goals: state.goals || [],
        budget_mode: state.budgetMode,
        total_budget: state.totalBudget,
        per_employee_budget: state.perEmployeeBudget,
        employee_count: state.employeeCount,
        cadence: state.programSettings?.cadence,
        preferred_schedule: state.preferredSchedule || [],
        setup_completed: state.setupComplete || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
    console.log('Data Service: State saved to Supabase');
    return Promise.resolve();
  } catch (error) {
    console.error('Data Service: Failed to save to Supabase', error);
    // Fallback to localStorage if Supabase fails
    return saveToLocalStorage(state);
  }
}

async function loadFromSupabase() {
  if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
  
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.warn('Data Service: No authenticated user, trying localStorage');
      return loadFromLocalStorage();
    }
    
    const { data, error } = await supabaseClient
      .from('programs')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    if (data) {
      console.log('Data Service: State loaded from Supabase');
      return Promise.resolve(data);
    } else {
      console.log('Data Service: No data in Supabase, trying localStorage');
      return loadFromLocalStorage();
    }
  } catch (error) {
    console.error('Data Service: Failed to load from Supabase', error);
    return loadFromLocalStorage();
  }
}

async function deleteFromSupabase() {
  if (!supabaseClient) return Promise.reject(new Error('Supabase not initialized'));
  
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return Promise.resolve();
    
    const { error } = await supabaseClient
      .from('programs')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
    console.log('Data Service: State deleted from Supabase');
    return Promise.resolve();
  } catch (error) {
    console.error('Data Service: Failed to delete from Supabase', error);
    return deleteFromLocalStorage();
  }
}

// ============================================================
// AUTHENTICATION
// ============================================================

/**
 * Sign in with Supabase (when enabled)
 */
async function signIn(email, password) {
  if (!supabaseClient) {
    return Promise.reject(new Error('Supabase not initialized'));
  }
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return Promise.resolve(data);
  } catch (error) {
    console.error('Data Service: Sign in failed', error);
    return Promise.reject(error);
  }
}

/**
 * Sign up with Supabase (when enabled)
 */
async function signUp(email, password) {
  if (!supabaseClient) {
    return Promise.reject(new Error('Supabase not initialized'));
  }
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return Promise.resolve(data);
  } catch (error) {
    console.error('Data Service: Sign up failed', error);
    return Promise.reject(error);
  }
}

/**
 * Sign out from Supabase (when enabled)
 */
async function signOut() {
  if (!supabaseClient) {
    return Promise.resolve();
  }
  
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return Promise.resolve();
  } catch (error) {
    console.error('Data Service: Sign out failed', error);
    return Promise.reject(error);
  }
}

/**
 * Get current authenticated user (when using Supabase)
 */
async function getCurrentUser() {
  if (!supabaseClient) {
    return Promise.resolve(null);
  }
  
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return Promise.resolve(user);
  } catch (error) {
    console.error('Data Service: Failed to get current user', error);
    return Promise.resolve(null);
  }
}

// ============================================================
// UTILITIES
// ============================================================

function fallbackToLocalStorage() {
  console.warn('Data Service: Falling back to localStorage');
  if (window.__EEOS_CONFIG__) {
    window.__EEOS_CONFIG__.storageMode = 'localStorage';
  }
  supabaseClient = null;
}

function isSupabaseEnabled() {
  const config = window.__EEOS_CONFIG__;
  return supabaseClient && config && config.storageMode === 'supabase';
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDataService);
} else {
  initDataService();
}
