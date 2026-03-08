// --- Sidebar Setup Collapse/Expand Logic ---
function updateSidebarSetupCollapseUI() {
  const heading = document.getElementById("sidebarSetupHeading");
  const check = document.getElementById("sidebarSetupCheck");
  const editPrefs = document.getElementById("sidebarSetupEditPrefs");
  const collapseWrap = document.getElementById("sidebarSetupMenuCollapse");
  const headingText = document.getElementById("sidebarSetupLabel");
  const allStepsComplete = [1,2,3,4,5,6].every(s => state.completedSetupSteps.includes(s));
  const expanded = !!state.sidebarSetupExpanded;
  const headingLabel = headingText || (heading ? heading.querySelector("div > span") : null);
  const headingColor = headingLabel
    ? window.getComputedStyle(headingLabel).color
    : (heading ? window.getComputedStyle(heading).color : "");

  if (check) {
    check.style.display = allStepsComplete ? "inline" : "none";
    if (headingColor) check.style.color = headingColor;
  }
  if (editPrefs) {
    editPrefs.style.display = allStepsComplete ? "inline" : "none";
    editPrefs.textContent = expanded ? "Hide" : "Edit";
    editPrefs.style.textDecoration = "none";
    editPrefs.style.color = expanded ? "#475569" : "#94a3b8";
  }
  if (collapseWrap) {
    if (allStepsComplete && !expanded) {
      collapseWrap.style.maxHeight = "0px";
      collapseWrap.style.overflow = "hidden";
    } else {
      collapseWrap.style.maxHeight = "500px";
      collapseWrap.style.overflow = "visible";
    }
  }
}

function bindSidebarSetupEditPrefs() {
  const editPrefs = document.getElementById("sidebarSetupEditPrefs");
  if (!editPrefs) return;
  editPrefs.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextExpanded = !state.sidebarSetupExpanded;
    setSetupExpansionState(nextExpanded, { headersOnly: true });
    persistState();
    renderSetupMenuState();
    updateSidebarSetupCollapseUI();
    renderSetupStepStates();
    renderSidebarStepMenus();
  });
}

function bindMainSetupEditPrefs() {
  const editMain = document.getElementById("setupHeadingMainEdit");
  if (!editMain) return;
  editMain.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextExpanded = !Boolean(state.mainSetupExpandAll || state.sidebarSetupExpanded);
    setSetupExpansionState(nextExpanded, { headersOnly: true });
    persistState();
    renderSetupMenuState();
    updateSidebarSetupCollapseUI();
    renderSetupStepStates();
    renderSidebarStepMenus();
  });
}

function setSetupExpansionState(expanded, options = {}) {
  const headersOnly = options?.headersOnly === true;
  state.mainSetupExpandAll = Boolean(expanded);
  state.sidebarSetupExpanded = Boolean(expanded);
  state.setupMenuExpanded = Boolean(expanded);
  state.sidebarSetupAutoCollapsed = true;

  if (headersOnly && Number.isInteger(state.currentSetupStep) && state.currentSetupStep >= 1 && state.currentSetupStep <= 6) {
    state.currentSetupStep = null;
  }
}
/*
 * JOLLY HR - Employee Experience OS
 * 
 * MULTI-USER ARCHITECTURE:
 * -------------------------
 * This app is designed to support multiple users/accounts:
 * 
 * 1. STATE MANAGEMENT
 *    - Each user has a unique accountId assigned on first visit or auth
 *    - localStorage uses account-scoped keys: "eeos.m1.state::{accountId}" (or "eeos.m1.state::anon")
 *    - "eeos.m1.lastAccountId" stores the latest account pointer
 *    - All state includes accountId to scope data per user/company
 * 
 * 2. DATA PERSISTENCE
 *    - Local: persistState() saves to localStorage with user-specific key
 *    - Cloud: syncStateToSupabase() saves all user data to Supabase tables
 *    - All Supabase tables have account_id column for multi-tenancy
 * 
 * 3. DATA LOADING
 *    - loadLocalState() checks for accountId and loads user-specific data
 *    - loadStateFromSupabase() fetches all user data filtered by account_id
 *    - Landing draft (setup flow) stored separately as "{accountId}-landing-draft"
 * 
 * 4. AUTHENTICATION (Future)
 *    - Supabase Auth will provide user.id
 *    - ensureAccountForUser() links auth_user_id to account_id
 *    - Multiple users can belong to same account (team scenario)
 * 
 * 5. READY FOR SUPABASE
 *    - All CRUD operations use account_id scoping
 *    - Setup flow data (landingDraft) syncs to program_settings table
 *    - Current: localStorage works standalone, Supabase is optional
 *    - Future: Enable Supabase config to activate cloud sync + auth
 */

const GOALS = [
"Retention & Engagement",
"Team Connection & Culture",
"Performance & Productivity",
"Wellbeing, Growth & Recognition",
"Employer Brand & Recruiting",
"Inclusion & Belonging"
];


const GOAL_DESCRIPTIONS = {
  "Retention & Engagement": "Boost morale, loyalty, and employee commitment",
  "Team Connection & Culture": "Strengthen relationships and shared culture across teams",
  "Performance & Productivity": "Improve employee focus, energy, and effectiveness",
  "Employer Brand & Recruiting": "Enhance attractiveness to current and future employees",
  "Wellbeing, Growth & Recognition": "Support employee development, mental health, and appreciation",
  "Inclusion & Belonging": "Ensure all employees feel respected and included"
};

const INTEREST_OPTIONS = [
  "Fun / Social event",
  "Professional development",
  "Wellness / Health focused",
  "Food / Drinks experience",
  "Learn a new creative skill",
  "Volunteering"
];

const INTEREST_DESCRIPTIONS = {
  "Fun / Social event": "High-energy events focused on team connection",
  "Professional development": "Learning-oriented sessions to build practical skills",
  "Wellness / Health focused": "Activities that support wellbeing and healthy habits",
  "Food / Drinks experience": "Shared tasting, cooking, or hosted culinary moments",
  "Learn a new creative skill": "Hands-on creative workshops and maker-style sessions",
  "Volunteering": "Purpose-driven experiences that support local communities"
};




const CADENCE_OPTIONS = ["Weekly", "Biweekly", "Monthly", "Quarterly"];
const SCHEDULE_OPTIONS = [
  "Remote / virtual",
  "In-person (outside the office)",
  "In-office events",
  "Hybrid (mix of remote + in-person)"
];




const SURVEY_QUESTIONS = [
"Preferred activity energy level",
"Comfort with virtual events",
"Comfort with in-person events",
"Interest in wellness programming",
"Interest in learning sessions",
"Interest in social games",
"Preferred event duration",
"Preferred group size",
"Openness to new formats",
"Importance of flexibility"
];




const SURVEY_CHOICES = ["Low", "Medium", "High"];




const EVENTS_MASTER_DEFAULT = [
{
  id: "evt-1",
  name: "Virtual Trivia League",
  description: "Live-hosted team trivia with custom company rounds.",
  url: "https://teambuilding.com/team-building/virtual",
  cost_per_person: 35,
  goals: ["Retention & Engagement", "Team Connection & Culture"],
  schedules: ["Lunch", "After 5p"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-2",
  name: "Mindful Monday Workshop",
  description: "Guided wellbeing and stress reset for teams.",
  url: "https://www.withconfetti.com/",
  cost_per_person: 20,
  goals: ["Wellbeing, Growth & Recognition", "Retention & Engagement"],
  schedules: ["Before 9a", "Lunch"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-3",
  name: "Creative Build Challenge",
  description: "Hands-on problem-solving challenge in small groups.",
  url: "https://www.kraftylab.com/",
  cost_per_person: 42,
  goals: ["Performance & Productivity", "Team Connection & Culture"],
  schedules: ["After 5p", "Weekends"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-4",
  name: "Employer Brand Story Jam",
  description: "Employee storytelling sprint for recruiting brand content.",
  url: "https://www.teamraderie.com/experience-finder/",
  cost_per_person: 28,
  goals: ["Employer Brand & Recruiting", "Retention & Engagement"],
  schedules: ["Lunch", "After 5p"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-5",
  name: "Peer Coaching Pods",
  description: "Structured peer coaching circles with prompts.",
  url: "https://www.withconfetti.com/",
  cost_per_person: 18,
  goals: ["Retention & Engagement", "Performance & Productivity"],
  schedules: ["Before 9a", "Lunch"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-6",
  name: "Zero-Cost Team Reflection Sprint",
  description: "Facilitated retrospective format to improve team alignment.",
  url: "https://www.notion.so/",
  cost_per_person: 0,
  goals: ["Team Connection & Culture", "Performance & Productivity"],
  schedules: ["Lunch", "After 5p"],
  type: "free",
  facilitation_kit: {
    host_script: "Kickoff, framing, and closing script.",
    agenda: "45-minute agenda with checkpoints.",
    timeline: "Minute-by-minute facilitation timeline.",
    discussion_prompts: "Guided prompts for team reflection.",
    follow_up_template: "Post-session action follow-up template."
  }
},
{
  id: "evt-7",
  name: "Lunch-and-Learn Lightning Talks",
  description: "Employee-led quick talks for knowledge sharing.",
  url: "https://calendar.google.com/",
  cost_per_person: 12,
  goals: ["Performance & Productivity", "Employer Brand & Recruiting"],
  schedules: ["Lunch"],
  type: "paid",
  facilitation_kit: null
},
{
  id: "evt-8",
  name: "Recognition Roundtable",
  description: "Peer appreciation format to boost morale.",
  url: "https://www.withconfetti.com/",
  cost_per_person: 0,
  goals: ["Retention & Engagement", "Retention & Engagement"],
  schedules: ["After 5p", "Lunch"],
  type: "free",
  facilitation_kit: {
    host_script: "Recognition-focused facilitation script.",
    agenda: "30-minute recognition agenda.",
    timeline: "Structured round-robin timing guide.",
    discussion_prompts: "Prompt list for appreciation and wins.",
    follow_up_template: "Template for monthly recognition follow-up."
  }
}
];




const WORKFLOW_STEPS = [
"Determine Event Shortlist",
"Copy Poll",
"Book Event",
"Promote Event",
"Run Event",
"Collect Feedback",
"Review Impact"
];

const FORCE_POLL_CLOSED_ADMIN_VIEW = true;
const FORCE_POLL_OPEN_ADMIN_VIEW = false;
const FORCE_POLL_PRE_SHARE_VIEW = false;
const POLL_API_BASE = "https://esos-polls.ajolly2.workers.dev/api";
const POLL_PUBLIC_BASE_URL = "https://eeoswork.github.io/eeos";

const SETUP_MENU_ITEM_TO_STEP = {
  cadence: 3,
  setting: 4,
  goals: 1,
  budget: 2,
  availability: 5,
  interests: 6
};

const SETUP_STEP_TO_MENU_ITEM = {
  1: "goals",
  2: "budget",
  3: "cadence",
  4: "setting",
  5: "availability",
  6: "interests"
};




const STORAGE_KEY_PREFIX = "eeos.m1.state::";
const LAST_ACCOUNT_ID_KEY = "eeos.m1.lastAccountId";
const LEGACY_STORAGE_KEY = "eeos.m1.state";
const GLOBAL_TO_ACCOUNT_MIGRATION_PREFIX = "eeos.m1.migratedGlobalToAccount::";
const PINNED_IDENTITY_KEY = "eeos.m1.identity";
const SIDEBAR_SNAPSHOT_KEY_PREFIX = "eeos.m1.sidebarSnapshot::";
const CALENDAR_PROVIDER_KEY = "eeos.calendarProvider";
const AUTH_TOKEN_KEY = "eeos.auth.token";
const AUTH_COMPANY_ID_KEY = "eeos.auth.companyId";

function getEffectiveStorageAccountId(accountId = null) {
  const explicit = String(accountId || "").trim();
  if (explicit) return explicit;
  const fromState = String(state.accountId || "").trim();
  return fromState || "anon";
}

// Get account-scoped storage key
function getStorageKey(accountId = null) {
  return `${STORAGE_KEY_PREFIX}${getEffectiveStorageAccountId(accountId)}`;
}

function getSidebarSnapshotKey(accountId = null) {
  return `${SIDEBAR_SNAPSHOT_KEY_PREFIX}${getEffectiveStorageAccountId(accountId)}`;
}

function getGlobalToAccountMigrationKey(accountId = null) {
  return `${GLOBAL_TO_ACCOUNT_MIGRATION_PREFIX}${getEffectiveStorageAccountId(accountId)}`;
}

function hasCriticalSidebarDataShape(payload) {
  if (!payload || typeof payload !== "object") return false;
  const bookedCount = Array.isArray(payload.eventsBooked) ? payload.eventsBooked.length : 0;
  const txCount = Array.isArray(payload.budgetTransactions) ? payload.budgetTransactions.length : 0;
  const hasBooking = Boolean(payload.pollBuilder?.bookingConfirmation);
  return bookedCount > 0 || txCount > 0 || hasBooking;
}

function isSupabaseHydrationEnabled() {
  return false;
}



const state = {
meta: {
  lastUpdated: null
},
accountId: null,
user: { id: "local-dev-user", email: "local@jolly.dev" },
companyName: "",
adminName: "",
programSettings: {
  budgetMode: "total",
  totalBudget: 3000,
  perEmployeeBudget: 75,
  employeeCount: 40,
  goals: [],
  teamPreferenceEstimate: [],
  admin_preference_weight: { boost: 0.22, first_cycle_only: true },
  cadence: "Monthly",
  preferredSchedule: [],
  surveyAnswers: {}
},
eventsMaster: [...EVENTS_MASTER_DEFAULT],
eventsRecommended: [],
eventsSelected: [],
eventsBooked: [],
budgetTransactions: [],
activeEventId: null,
workflowStates: {
  "current-cycle": { currentStep: 1, completed: [] }
},
toolPreferences: {
  chat: "Slack",
  email: "Gmail",
  calendar: "Google Calendar"
},
settings: {
  expenseToolUrl: ""
},
browserTabs: [],
activeBrowserTabId: null,
landingIdentityMode: "generic",
landingIdentityCommitted: false,
appIdentityCommitted: false,
setupCompleted: true,
setupMenuExpanded: false,
sidebarSetupAutoCollapsed: false, // triggers one-time auto-collapse after final setup step
devBypassSetupEditAuth: true,
debugModeOn: false,
currentSetupStep: 1,
completedSetupSteps: [],
setupEventsGenerated: false,
setupShortlistMode: "poll",
mainSetupExpandAll: false,
eventWorkflowProcessStep: 7,
timeZone: "",
setupPollSelectedEventIndexes: [0, 1, 2],
setupBookSelectedEventIndex: 0,
pollBuilder: {
  pollId: "",
  rsvpId: "",
  rsvpShareUrl: "",
  rsvpResults: null,
  pollSharedConfirmed: false,
  rsvpSharedConfirmed: false,
  rsvpAttendeesExpanded: false,
  selectedEventIds: [],
  eventLabelOverrides: {},
  introMessageOverride: "",
  responses: [],
  proposedDateTimes: [],
  createdAt: "",
  shareLink: "",
  showResultsPage: false,
  rsvpSent: false,
  vendorLinkOpened: false,
  markedBooked: false,
  bookingResetRequested: false,
  inviteMessageOverride: "",
  timeZone: "",
  voteDeadlineDateTime: "",
  voteDeadlineTimeZone: "",
  chosenEventId: "",
  chosenDateTime: "",
  eventLocationType: "virtual",
  costPerPerson: 50,
  rsvpDeadlineDateTime: "",
  vendorBookingUrl: "",
  bookingConfirmation: null,
  scheduleEntries: []
},
promoteEvent: {
  activeStep: "calendar",
  calendar: { done: false, doneAt: "" },
  announcement: { done: false, doneAt: "" },
  reminderWeek: { done: false, doneAt: "" },
  reminderDayOf: { done: false, doneAt: "" },
  messages: {
    announcementOverride: "",
    inviteOverride: "",
    reminderWeekOverride: "",
    reminderDayOfOverride: ""
  },
  ics: {
    generated: false,
    lastGeneratedAt: ""
  }
},
setupStepDirty: {},
landingDraft: {
  budgetMode: "total",
  totalBudget: 3000,
  employeeCount: 0,
  perEmployee: 0,
  cadence: "Monthly",
  goals: [],
  teamPreferenceEstimate: [],
  schedule: [],
  daysSelected: [],
  timesSelected: [],
  localCity: "",
  surveyAnswers: {}
}
};




let supabaseClient = null;
let identityEditMode = false;
let isSidebarHydrating = false;
let cloudSaveDebounceTimer = null;
let isHydratingCloudState = false;
let pendingPostAuthAction = null;

function logIdentityDebug(stage, extra = {}) {
  try {
    const pinnedRaw = localStorage.getItem(PINNED_IDENTITY_KEY);
    const snapshot = {
      stage,
      identityEditMode,
      stateCompany: state.companyName,
      stateAdmin: state.adminName,
      appIdentityCommitted: state.appIdentityCommitted,
      landingIdentityCommitted: state.landingIdentityCommitted,
      pinnedRaw,
      ...extra
    };
    console.debug("[identity-debug]", snapshot);
    window.__identityDebug = snapshot;
  } catch (error) {
    console.debug("[identity-debug] logging failed", error?.message || error);
  }
}




const $ = (id) => document.getElementById(id);




function isElectron() {
return !!window.electronAPI;
}

function fmtMoney(value) {
const n = Number(value || 0);
return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}




function uid() {
return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}




function clone(v) {
return JSON.parse(JSON.stringify(v));
}

function getAuthToken() {
  return String(localStorage.getItem(AUTH_TOKEN_KEY) || "").trim();
}

function getAuthCompanyId() {
  return String(localStorage.getItem(AUTH_COMPANY_ID_KEY) || "").trim();
}

function setAuthSession(token, companyId) {
  localStorage.setItem(AUTH_TOKEN_KEY, String(token || "").trim());
  localStorage.setItem(AUTH_COMPANY_ID_KEY, String(companyId || "").trim());
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_COMPANY_ID_KEY);
}

function hasNonEmptyValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function isProtectedEmptyOverwrite(path, serverValue) {
  const normalizedPath = String(path || "").trim();
  const protectedPaths = ["eventsBooked", "budgetTransactions", "pollBuilder.bookingConfirmation"];
  if (!protectedPaths.includes(normalizedPath)) return false;
  return !hasNonEmptyValue(serverValue);
}

function mergeServerStateIntoLocal(localValue, serverValue, path = "") {
  if (serverValue === undefined) return localValue;
  if (isProtectedEmptyOverwrite(path, serverValue)) return localValue;

  if (Array.isArray(serverValue)) {
    if (serverValue.length === 0) return localValue;
    return clone(serverValue);
  }

  if (serverValue && typeof serverValue === "object") {
    const keys = Object.keys(serverValue);
    if (!keys.length) return localValue;
    const base = (localValue && typeof localValue === "object" && !Array.isArray(localValue))
      ? clone(localValue)
      : {};
    keys.forEach((key) => {
      const nextPath = path ? `${path}.${key}` : key;
      base[key] = mergeServerStateIntoLocal(base[key], serverValue[key], nextPath);
    });
    return base;
  }

  if (typeof serverValue === "string" && serverValue.trim().length === 0) {
    return localValue;
  }
  return serverValue;
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  const token = getAuthToken();
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${POLL_API_BASE}${normalizedPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let data = null;
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }
  }

  if (!response.ok) {
    const apiMessage = String(data?.error || data?.message || "").trim();
    throw new Error(apiMessage || `Request failed (${response.status})`);
  }
  return data;
}

async function authSignup(email, password, companyName) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: { email, password, companyName }
  });
}

async function authLogin(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });
}

async function fetchCloudState() {
  return apiRequest("/state", { method: "GET" });
}

async function saveCloudState(stateBlob) {
  return apiRequest("/state", {
    method: "POST",
    body: { stateBlob }
  });
}

function showAuthGate() {
  const gate = $("authGate");
  if (gate) gate.classList.remove("hidden");
}

function hideAuthGate() {
  const gate = $("authGate");
  if (gate) gate.classList.add("hidden");
}

function openAuthGateWithContext(context = "save") {
  const titleEl = $("authGateTitle");
  const subtitleEl = $("authGateSubtitle");
  const continueButton = $("authContinueWithoutSaving");
  const createAccountButton = $("authCreateAccount");
  const statusEl = $("authStatus");
  const mode = String(context || "save").trim();
  if (titleEl) {
    titleEl.textContent = mode === "poll_review"
      ? "Save your poll and responses"
      : mode === "rsvp_review"
      ? "Save your RSVP and responses"
      : "Save your progress";
  }
  if (subtitleEl) {
    subtitleEl.textContent = mode === "poll_review"
      ? "You’ve shared this poll with your team. Create a free account so you can come back later and keep your links and results safe."
      : mode === "rsvp_review"
      ? "You’ve shared this RSVP with your team. Create a free account so your event data and responses stay safe across browsers and devices."
      : "Create a free account to keep your workspace across browsers and devices.";
  }
  if (createAccountButton) {
    createAccountButton.textContent = "Create free account";
  }
  if (continueButton) {
    const shouldShowContinue = mode === "poll_review" || mode === "rsvp_review";
    continueButton.classList.toggle("hidden", !shouldShowContinue);
  }
  if (mode !== "poll_review" && mode !== "rsvp_review") {
    clearPendingPostAuthAction();
  }
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.classList.remove("text-rose-700");
    statusEl.classList.add("text-slate-600");
  }
  const emailInput = $("authEmail");
  if (emailInput && context === "signin") {
    emailInput.focus();
  }
  showAuthGate();
}

function setAuthStatus(text, isError = false) {
  const status = $("authStatus");
  if (!status) return;
  status.textContent = String(text || "").trim();
  status.classList.toggle("text-rose-700", isError);
  status.classList.toggle("text-slate-600", !isError);
}

function setPendingPostAuthAction(actionType, resumeFn = null) {
  pendingPostAuthAction = {
    type: String(actionType || "").trim(),
    resume: typeof resumeFn === "function" ? resumeFn : null
  };
}

function clearPendingPostAuthAction() {
  pendingPostAuthAction = null;
}

function runPendingPostAuthAction() {
  const pending = pendingPostAuthAction;
  pendingPostAuthAction = null;
  if (!pending || typeof pending.resume !== "function") return;
  pending.resume();
}

function getStoredCalendarProvider() {
  try {
    const provider = String(localStorage.getItem(CALENDAR_PROVIDER_KEY) || "").trim().toLowerCase();
    return provider === "google" || provider === "outlook" || provider === "icloud" ? provider : "";
  } catch (_error) {
    return "";
  }
}

function setStoredCalendarProvider(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  if (normalized !== "google" && normalized !== "outlook" && normalized !== "icloud") return;
  localStorage.setItem(CALENDAR_PROVIDER_KEY, normalized);
}

function getCalendarProviderUrl(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  if (normalized === "google") return "https://calendar.google.com/calendar/u/0/r/month";
  if (normalized === "outlook") return "https://outlook.live.com/calendar/0/view/month";
  if (normalized === "icloud") return "https://www.icloud.com/calendar/";
  return "";
}

function openCalendarProvider(provider) {
  const url = getCalendarProviderUrl(provider);
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function isValidHttpUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  return /^https?:\/\//i.test(raw);
}

const PROMOTE_STEP_ORDER = ["calendar", "announcement", "reminder_week", "reminder_dayof"];

function normalizePromoteEventState() {
  if (!state.promoteEvent || typeof state.promoteEvent !== "object") {
    state.promoteEvent = {};
  }
  const promote = state.promoteEvent;
  if (!PROMOTE_STEP_ORDER.includes(promote.activeStep)) {
    promote.activeStep = "calendar";
  }
  if (typeof promote.collapsedStep !== "string") {
    promote.collapsedStep = "";
  }

  const ensureStepStatus = (key) => {
    if (!promote[key] || typeof promote[key] !== "object") {
      promote[key] = { done: false, doneAt: "" };
    }
    if (typeof promote[key].done !== "boolean") promote[key].done = false;
    if (typeof promote[key].doneAt !== "string") promote[key].doneAt = "";
  };

  ensureStepStatus("calendar");
  ensureStepStatus("announcement");
  ensureStepStatus("reminderWeek");
  ensureStepStatus("reminderDayOf");

  if (!promote.messages || typeof promote.messages !== "object") {
    promote.messages = {};
  }
  if (typeof promote.messages.announcementOverride !== "string") promote.messages.announcementOverride = "";
  if (typeof promote.messages.inviteOverride !== "string") promote.messages.inviteOverride = "";
  if (typeof promote.messages.reminderWeekOverride !== "string") promote.messages.reminderWeekOverride = "";
  if (typeof promote.messages.reminderDayOfOverride !== "string") promote.messages.reminderDayOfOverride = "";

  if (!promote.ics || typeof promote.ics !== "object") {
    promote.ics = {};
  }
  if (typeof promote.ics.generated !== "boolean") promote.ics.generated = false;
  if (typeof promote.ics.lastGeneratedAt !== "string") promote.ics.lastGeneratedAt = "";
}

function getPromoteStepDone(stepKey) {
  normalizePromoteEventState();
  if (stepKey === "calendar") return Boolean(state.promoteEvent.calendar.done);
  if (stepKey === "announcement") return Boolean(state.promoteEvent.announcement.done);
  if (stepKey === "reminder_week") return Boolean(state.promoteEvent.reminderWeek.done);
  if (stepKey === "reminder_dayof") return Boolean(state.promoteEvent.reminderDayOf.done);
  return false;
}

function detectAppTimeZone() {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/New_York|Detroit|Indiana|Kentucky|Eastern/i.test(iana)) return "Eastern";
    if (/Chicago|Central/i.test(iana)) return "Central";
    if (/Denver|Boise|Mountain|Phoenix/i.test(iana)) return "Mountain";
    if (/Los_Angeles|Pacific|Anchorage/i.test(iana)) return "Pacific";
  } catch (error) {
    // no-op fallback below
  }
  return "Pacific";
}




function getBudgetTotal(settings = state.programSettings) {
if (settings.budgetMode === "perEmployee") {
  return Number(settings.perEmployeeBudget || 0) * Number(settings.employeeCount || 0);
}
return Number(settings.totalBudget || 0);
}




function getTotalSpent() {
const transactions = Array.isArray(state.budgetTransactions) ? state.budgetTransactions : [];
return transactions.reduce((sum, tx) => {
  const amount = Number(tx?.amount || 0);
  return sum + (amount < 0 ? Math.abs(amount) : amount);
}, 0);
}




function getRemainingBudget() {
return getBudgetTotal() - getTotalSpent();
}




function getWorkflowKey() {
return state.activeEventId || "current-cycle";
}




function getWorkflowState() {
const key = getWorkflowKey();
if (!state.workflowStates[key]) {
  state.workflowStates[key] = { currentStep: 1, completed: [] };
}
return state.workflowStates[key];
}

function deriveEventWorkflowProcessStep() {
  const completed = Array.isArray(state.completedSetupSteps) ? state.completedSetupSteps : [];
  const isBookPath = state.setupShortlistMode === "book" && completed.includes(7);
  for (let step = 7; step <= 13; step += 1) {
    const treatAsCompleted = completed.includes(step) || (step === 8 && isBookPath);
    if (!treatAsCompleted) {
      return step;
    }
  }
  return 13;
}

function getEventWorkflowProcessStep() {
  if (Number.isInteger(state.eventWorkflowProcessStep) && state.eventWorkflowProcessStep >= 7 && state.eventWorkflowProcessStep <= 13) {
    return state.eventWorkflowProcessStep;
  }
  state.eventWorkflowProcessStep = deriveEventWorkflowProcessStep();
  return state.eventWorkflowProcessStep;
}

function getRunEventContext() {
  const bookedEvents = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];
  const bookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
    ? state.pollBuilder.bookingConfirmation
    : null;
  const bookingEventId = String(bookingConfirmation?.eventId || "").trim();

  const bookedEvent = bookedEvents.find((eventItem) => {
    const eventId = String(eventItem?.id || "");
    const masterId = String(eventItem?.event_master_id || "");
    return bookingEventId && (eventId === bookingEventId || masterId === bookingEventId);
  }) || bookedEvents.find((eventItem) => {
    const status = String(eventItem?.status || "").toLowerCase();
    return status === "booked" || status === "upcoming" || status === "active";
  }) || bookedEvents[0] || null;

  const eventDate = String(bookingConfirmation?.bookedDate || bookedEvent?.date || "").trim();
  const eventTime = String(bookingConfirmation?.bookedTime || bookedEvent?.time || "").trim();
  const chosenDateTime = String(state.pollBuilder?.chosenDateTime || "").trim();

  const hasDateTime = Boolean((eventDate && eventTime) || chosenDateTime);
  const hasBookedSignal = Boolean(
    state.pollBuilder?.markedBooked
    || bookingConfirmation?.timestampBookedConfirmed
  );

  return {
    bookedEvent,
    bookingConfirmation,
    bookingEventId,
    eventDate,
    eventTime,
    chosenDateTime,
    hasDateTime,
    hasBookedSignal
  };
}

function canShowRunEventStep() {
  if (state.debugModeOn === true) return true;
  const context = getRunEventContext();
  return Boolean(context.hasBookedSignal && context.hasDateTime);
}

function getCollectFeedbackContext() {
  const runContext = getRunEventContext();
  const bookedEvent = runContext.bookedEvent;
  const runCompletedAt = String(
    bookedEvent?.runEventCompletedAt
    || bookedEvent?.runEvent?.runEventCompletedAt
    || state.pollBuilder?.runEventCompletedAt
    || state.pollBuilder?.runEvent?.runEventCompletedAt
    || ""
  ).trim();
  const unlocked = Boolean(runCompletedAt);
  const debugPreview = state.debugModeOn === true;
  return {
    ...runContext,
    runCompletedAt,
    unlocked,
    debugPreview,
    canAccess: unlocked || debugPreview
  };
}

function getFeedbackDeadlineStatus(deadlineValue, closedAtValue = "") {
  const closedAt = String(closedAtValue || "").trim();
  if (closedAt) {
    return { text: "● Feedback closed", isClosed: true, dotClass: "bg-slate-500" };
  }
  const raw = String(deadlineValue || "").trim();
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { text: "● Feedback open", isClosed: false, dotClass: "bg-slate-300" };
  }

  const msLeft = parsed.getTime() - Date.now();
  if (msLeft <= 0) {
    return { text: "● Feedback closed", isClosed: true, dotClass: "bg-slate-500" };
  }

  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  if (msLeft >= 48 * hourMs) {
    const days = Math.ceil(msLeft / dayMs);
    return { text: `● Closes in ${days} day${days === 1 ? "" : "s"}`, isClosed: false, dotClass: "bg-slate-300" };
  }

  const hours = Math.max(1, Math.ceil(msLeft / hourMs));
  return { text: `● Closes in ${hours} hour${hours === 1 ? "" : "s"}`, isClosed: false, dotClass: "bg-slate-300" };
}

function formatRelativeTime(timestampValue) {
  const raw = String(timestampValue || "").trim();
  if (!raw) return "just now";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "just now";
  const diffMs = Date.now() - parsed.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  if (diffMs < hourMs) {
    const mins = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.floor(diffMs / hourMs));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.max(1, Math.floor(diffMs / dayMs));
  return `${days} day${days === 1 ? "" : "s"} ago`;
}




function setWorkflowStep(step) {
const wf = getWorkflowState();
wf.currentStep = step;
if (!wf.completed.includes(step - 1) && step > 1) {
  wf.completed.push(step - 1);
}
}




function completeStep(stepNum) {
const wf = getWorkflowState();
if (!wf.completed.includes(stepNum)) {
  wf.completed.push(stepNum);
}
wf.currentStep = Math.min(stepNum + 1, WORKFLOW_STEPS.length);
persistState();
renderAll();
}




function toggleGoal(list, goal, max = 3) {
if (list.includes(goal)) {
  return list.filter((g) => g !== goal);
}
if (list.length >= max) {
  return list;
}
return [...list, goal];
}


function getPinnedIdentity() {
try {
  const raw = localStorage.getItem(PINNED_IDENTITY_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  const company = (parsed?.companyName || "").trim();
  const admin = (parsed?.adminName || "").trim();
  if (!company || !admin) return null;
  return { companyName: company, adminName: admin };
} catch (error) {
  return null;
}
}


function ensurePinnedIdentityFromCommittedState() {
  const existingPinned = getPinnedIdentity();
  if (existingPinned) return;

  const company = (state.companyName || "").trim();
  const admin = (state.adminName || "").trim();
  const isCommitted = !!(state.appIdentityCommitted && state.landingIdentityCommitted);
  if (!company || !admin || !isCommitted) return;

  localStorage.setItem(
    PINNED_IDENTITY_KEY,
    JSON.stringify({
      companyName: company,
      adminName: admin,
      committedAt: new Date().toISOString(),
      source: "committed-state-backfill"
    })
  );
  logIdentityDebug("ensurePinnedIdentityFromCommittedState");
}


function applyPinnedIdentity() {
try {
  ensurePinnedIdentityFromCommittedState();
  const pinned = getPinnedIdentity();
  if (!pinned) return;
  state.companyName = pinned.companyName;
  state.adminName = pinned.adminName;
  state.landingIdentityCommitted = true;
  state.appIdentityCommitted = true;
  logIdentityDebug("applyPinnedIdentity", { pinned });
} catch (error) {
  console.warn("Failed to apply pinned identity", error);
}
}


function persistPinnedIdentity() {
try {
  const company = (state.companyName || "").trim();
  const admin = (state.adminName || "").trim();
  if (!company || !admin) return;
  localStorage.setItem(
    PINNED_IDENTITY_KEY,
    JSON.stringify({
      companyName: company,
      adminName: admin,
      committedAt: new Date().toISOString()
    })
  );
  logIdentityDebug("persistPinnedIdentity", { company, admin });
} catch (error) {
  console.warn("Failed to persist pinned identity", error);
}
}




function loadLocalState(preferredAccountId = null, options = {}) {
try {
  let shouldPersistDetectedTimeZone = false;
  const strictAccount = options?.strictAccount === true;
  const targetAccountId = getEffectiveStorageAccountId(preferredAccountId);
  const targetStorageKey = getStorageKey(targetAccountId);
  const previousCriticalEvents = Array.isArray(state.eventsBooked) ? clone(state.eventsBooked) : [];
  const previousCriticalTransactions = Array.isArray(state.budgetTransactions) ? clone(state.budgetTransactions) : [];
  const previousCriticalBooking = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
    ? clone(state.pollBuilder.bookingConfirmation)
    : null;

  let raw = localStorage.getItem(targetStorageKey);
  console.debug("[persist-debug] loadLocalState:start", {
    strictAccount,
    preferredAccountId,
    targetAccountId,
    targetStorageKey,
    rawExisted: Boolean(raw)
  });

  if (!raw) {
    const legacyKey = targetAccountId === "anon"
      ? LEGACY_STORAGE_KEY
      : `${LEGACY_STORAGE_KEY}.${targetAccountId}`;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw) {
      raw = legacyRaw;
      localStorage.setItem(targetStorageKey, legacyRaw);
    }
  }

  if (strictAccount && targetAccountId !== "anon") {
    const migrationKey = getGlobalToAccountMigrationKey(targetAccountId);
    const migrationDone = localStorage.getItem(migrationKey) === "1";
    if (!migrationDone) {
      const lastAccountIdFromLocalStorage = String(localStorage.getItem(LAST_ACCOUNT_ID_KEY) || "").trim();
      let scopedParsed = null;
      try {
        scopedParsed = raw ? JSON.parse(raw) : null;
      } catch (error) {
        scopedParsed = null;
      }
      const scopedHasCriticalData = hasCriticalSidebarDataShape(scopedParsed);
      let migratedFromFallback = false;

      if (!scopedHasCriticalData) {
        const fallbackSources = [
          { label: "target-state", raw: localStorage.getItem(getStorageKey(targetAccountId)) },
          { label: "target-snapshot", raw: localStorage.getItem(getSidebarSnapshotKey(targetAccountId)) },
          { label: "anon-state", raw: localStorage.getItem(getStorageKey("anon")) },
          { label: "anon-snapshot", raw: localStorage.getItem(getSidebarSnapshotKey("anon")) },
          {
            label: "last-account-state",
            raw: lastAccountIdFromLocalStorage ? localStorage.getItem(getStorageKey(lastAccountIdFromLocalStorage)) : null
          },
          {
            label: "last-account-snapshot",
            raw: lastAccountIdFromLocalStorage ? localStorage.getItem(getSidebarSnapshotKey(lastAccountIdFromLocalStorage)) : null
          },
          { label: "legacy-global", raw: localStorage.getItem(LEGACY_STORAGE_KEY) }
        ];

        const toArray = (value) => (Array.isArray(value) ? value : []);
        const extractCriticalData = (payload) => {
          const bookedFromState = toArray(payload?.eventsBooked);
          const txFromState = toArray(payload?.budgetTransactions);
          const bookedFromSnapshot = toArray(payload?.eventsBooked);
          const txFromSnapshot = toArray(payload?.budgetTransactions);
          const bookingConfirmation =
            payload?.pollBuilder?.bookingConfirmation && typeof payload.pollBuilder.bookingConfirmation === "object"
              ? payload.pollBuilder.bookingConfirmation
              : (payload?.bookingConfirmation && typeof payload.bookingConfirmation === "object" ? payload.bookingConfirmation : null);

          const eventsBooked = bookedFromState.length > 0 ? bookedFromState : bookedFromSnapshot;
          const budgetTransactions = txFromState.length > 0 ? txFromState : txFromSnapshot;
          const hasCritical = eventsBooked.length > 0 || budgetTransactions.length > 0 || Boolean(bookingConfirmation);
          return { hasCritical, eventsBooked, budgetTransactions, bookingConfirmation };
        };

        for (const source of fallbackSources) {
          if (!source.raw) continue;
          let parsedSource = null;
          try {
            parsedSource = JSON.parse(source.raw);
          } catch (error) {
            continue;
          }

          const sourceHasCriticalShape = hasCriticalSidebarDataShape(parsedSource);
          const criticalData = extractCriticalData(parsedSource);
          if (!sourceHasCriticalShape && !criticalData.hasCritical) {
            continue;
          }

          const mergedTarget = scopedParsed && typeof scopedParsed === "object" ? clone(scopedParsed) : {};
          mergedTarget.accountId = targetAccountId;
          if (criticalData.eventsBooked.length > 0) {
            mergedTarget.eventsBooked = criticalData.eventsBooked;
          }
          if (criticalData.budgetTransactions.length > 0) {
            mergedTarget.budgetTransactions = criticalData.budgetTransactions;
          }
          if (!mergedTarget.pollBuilder || typeof mergedTarget.pollBuilder !== "object") {
            mergedTarget.pollBuilder = {};
          }
          if (criticalData.bookingConfirmation) {
            mergedTarget.pollBuilder.bookingConfirmation = criticalData.bookingConfirmation;
          }

          if (parsedSource?.programSettings && typeof parsedSource.programSettings === "object") {
            mergedTarget.programSettings = {
              ...(mergedTarget.programSettings && typeof mergedTarget.programSettings === "object" ? mergedTarget.programSettings : {}),
              ...parsedSource.programSettings
            };
          } else if (parsedSource?.programBudget && typeof parsedSource.programBudget === "object") {
            const sourceBudget = parsedSource.programBudget;
            mergedTarget.programSettings = {
              ...(mergedTarget.programSettings && typeof mergedTarget.programSettings === "object" ? mergedTarget.programSettings : {}),
              budgetMode: sourceBudget.budgetMode || mergedTarget.programSettings?.budgetMode || "total",
              totalBudget: Number(sourceBudget.totalBudget || mergedTarget.programSettings?.totalBudget || 0),
              perEmployeeBudget: Number(sourceBudget.perEmployeeBudget || mergedTarget.programSettings?.perEmployeeBudget || 0),
              employeeCount: Number(sourceBudget.employeeCount || mergedTarget.programSettings?.employeeCount || 0)
            };
          }

          raw = JSON.stringify(mergedTarget);
          localStorage.setItem(targetStorageKey, raw);
          migratedFromFallback = true;
          console.debug("[persist-debug] loadLocalState:migrated", {
            source: source.label,
            targetAccountId,
            targetStorageKey,
            eventsBookedLength: toArray(mergedTarget.eventsBooked).length,
            budgetTransactionsLength: toArray(mergedTarget.budgetTransactions).length
          });
          break;
        }
      }

      let finalHasCriticalData = scopedHasCriticalData;
      if (!finalHasCriticalData) {
        try {
          const finalParsed = raw ? JSON.parse(raw) : null;
          finalHasCriticalData = hasCriticalSidebarDataShape(finalParsed);
        } catch (error) {
          finalHasCriticalData = false;
        }
      }
      if (finalHasCriticalData || migratedFromFallback) {
        localStorage.setItem(migrationKey, "1");
      }
    }
  }

  // For unauthenticated mode, hydrate anon key only.
  // For authenticated mode (strictAccount), hydrate only the exact account key.
  if (!raw && !strictAccount && targetAccountId === "anon") {
    const lastAccountId = String(localStorage.getItem(LAST_ACCOUNT_ID_KEY) || "").trim();
    if (lastAccountId && lastAccountId !== "anon") {
      const candidateRaw = localStorage.getItem(getStorageKey(lastAccountId));
      if (candidateRaw) {
        raw = candidateRaw;
        state.accountId = lastAccountId;
      }
    }
  }

  if (!raw) {
    state.accountId = targetAccountId === "anon" ? null : targetAccountId;
    if (typeof state.timeZone !== "string" || !state.timeZone.trim()) {
      state.timeZone = detectAppTimeZone();
      shouldPersistDetectedTimeZone = true;
    }
    console.debug("[persist-debug] loadLocalState:hydrated", {
      strictAccount,
      preferredAccountId,
      targetAccountId,
      targetStorageKey,
      rawExisted: false,
      eventsBookedLength: Array.isArray(state.eventsBooked) ? state.eventsBooked.length : 0,
      budgetTransactionsLength: Array.isArray(state.budgetTransactions) ? state.budgetTransactions.length : 0
    });
    applyPinnedIdentity();
    if (shouldPersistDetectedTimeZone) persistState();
    return;
  }
  const parsed = JSON.parse(raw);
  Object.assign(state, parsed);

  const parsedHasBooked = Array.isArray(parsed?.eventsBooked) && parsed.eventsBooked.length > 0;
  const parsedHasTransactions = Array.isArray(parsed?.budgetTransactions) && parsed.budgetTransactions.length > 0;
  const parsedHasBookingConfirmation = Boolean(parsed?.pollBuilder?.bookingConfirmation);
  if (!parsedHasBooked && previousCriticalEvents.length > 0) {
    state.eventsBooked = previousCriticalEvents;
  }
  if (!parsedHasTransactions && previousCriticalTransactions.length > 0) {
    state.budgetTransactions = previousCriticalTransactions;
  }
  if (!parsedHasBookingConfirmation && previousCriticalBooking) {
    if (!state.pollBuilder || typeof state.pollBuilder !== "object") {
      state.pollBuilder = {};
    }
    state.pollBuilder.bookingConfirmation = previousCriticalBooking;
  }
  state.accountId = targetAccountId === "anon" ? null : targetAccountId;
  if (!state.accountId && targetAccountId !== "anon") {
    state.accountId = targetAccountId;
  }
  if (typeof state.setupCompleted !== "boolean") {
    state.setupCompleted = true;
  }
  if (typeof state.setupMenuExpanded !== "boolean") {
    state.setupMenuExpanded = false;
  }
  if (typeof state.devBypassSetupEditAuth !== "boolean") {
    state.devBypassSetupEditAuth = true;
  }
  if (typeof state.debugModeOn !== "boolean") {
    state.debugModeOn = false;
  }
  if (!state.settings || typeof state.settings !== "object") {
    state.settings = { expenseToolUrl: "" };
  }
  if (typeof state.settings.expenseToolUrl !== "string") {
    state.settings.expenseToolUrl = "";
  }
  if (!state.settings.expenseToolUrl && typeof state.programSettings?.expenseToolUrl === "string") {
    state.settings.expenseToolUrl = String(state.programSettings.expenseToolUrl || "").trim();
  }
  if (state.currentSetupStep !== null && (typeof state.currentSetupStep !== "number" || state.currentSetupStep < 1 || state.currentSetupStep > 13)) {
    state.currentSetupStep = 1;
  }
  if (typeof state.setupEventsGenerated !== "boolean") {
    state.setupEventsGenerated = false;
  }
  if (typeof state.mainSetupExpandAll !== "boolean") {
    state.mainSetupExpandAll = false;
  }
  if (state.setupShortlistMode !== "poll" && state.setupShortlistMode !== "book") {
    state.setupShortlistMode = "poll";
  }
  if (!Number.isInteger(state.eventWorkflowProcessStep) || state.eventWorkflowProcessStep < 7 || state.eventWorkflowProcessStep > 13) {
    state.eventWorkflowProcessStep = deriveEventWorkflowProcessStep();
  }
  if (!Array.isArray(state.setupPollSelectedEventIndexes)) {
    state.setupPollSelectedEventIndexes = [0, 1, 2];
  }
  if (!Number.isInteger(state.setupBookSelectedEventIndex) || state.setupBookSelectedEventIndex < 0) {
    state.setupBookSelectedEventIndex = 0;
  }
  if (!state.setupStepDirty || typeof state.setupStepDirty !== "object") {
    state.setupStepDirty = {};
  }
  if (!Array.isArray(state.completedSetupSteps)) {
    state.completedSetupSteps = [];
  }
  if (!state.meta || typeof state.meta !== "object") {
    state.meta = { lastUpdated: null };
  }
  if (typeof state.meta.lastUpdated !== "string" && state.meta.lastUpdated !== null) {
    state.meta.lastUpdated = null;
  }
  if (!Array.isArray(state.eventsBooked)) {
    state.eventsBooked = [];
  }
  if (!Array.isArray(state.budgetTransactions)) {
    state.budgetTransactions = [];
  }
  if (!state.programSettings || typeof state.programSettings !== "object") {
    state.programSettings = {
      budgetMode: "total",
      totalBudget: 3000,
      perEmployeeBudget: 75,
      employeeCount: 40,
      goals: [],
      teamPreferenceEstimate: [],
      admin_preference_weight: { boost: 0.22, first_cycle_only: true },
      cadence: "Monthly",
      preferredSchedule: [],
      surveyAnswers: {}
    };
  }
  if (!state.eventsMaster || state.eventsMaster.length === 0) {
    state.eventsMaster = [...EVENTS_MASTER_DEFAULT];
  }
  if (!state.workflowStates || typeof state.workflowStates !== "object") {
    state.workflowStates = { "current-cycle": { currentStep: 1, completed: [] } };
  }
  if (typeof state.timeZone !== "string" || !state.timeZone.trim()) {
    state.timeZone = detectAppTimeZone();
    shouldPersistDetectedTimeZone = true;
  }
  if (!Array.isArray(state.programSettings?.teamPreferenceEstimate)) {
    state.programSettings.teamPreferenceEstimate = [];
  }
  if (!state.programSettings?.admin_preference_weight || typeof state.programSettings.admin_preference_weight !== "object") {
    state.programSettings.admin_preference_weight = { boost: 0.22, first_cycle_only: true };
  }
  if (!Array.isArray(state.landingDraft?.teamPreferenceEstimate)) {
    state.landingDraft.teamPreferenceEstimate = [];
  }
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") {
    state.pollBuilder = {
      pollId: "",
      rsvpId: "",
      rsvpShareUrl: "",
      rsvpResults: null,
      pollSharedConfirmed: false,
      rsvpSharedConfirmed: false,
      rsvpAttendeesExpanded: false,
      selectedEventIds: [],
      eventLabelOverrides: {},
      introMessageOverride: "",
      responses: [],
      proposedDateTimes: [],
      createdAt: "",
      shareLink: "",
      showResultsPage: false,
      rsvpSent: false,
      vendorLinkOpened: false,
      markedBooked: false,
      bookingResetRequested: false,
      inviteMessageOverride: "",
      timeZone: "",
      voteDeadlineDateTime: "",
      voteDeadlineTimeZone: ""
    };
  }
  if (!Array.isArray(state.pollBuilder.selectedEventIds)) state.pollBuilder.selectedEventIds = [];
  if (!state.pollBuilder.eventLabelOverrides || typeof state.pollBuilder.eventLabelOverrides !== "object") state.pollBuilder.eventLabelOverrides = {};
  if (!Array.isArray(state.pollBuilder.responses)) state.pollBuilder.responses = [];
  if (!Array.isArray(state.pollBuilder.proposedDateTimes)) state.pollBuilder.proposedDateTimes = [];
  if (typeof state.pollBuilder.introMessageOverride !== "string") state.pollBuilder.introMessageOverride = "";
  if (typeof state.pollBuilder.pollId !== "string") state.pollBuilder.pollId = "";
  if (typeof state.pollBuilder.rsvpId !== "string") state.pollBuilder.rsvpId = "";
  if (typeof state.pollBuilder.rsvpShareUrl !== "string") state.pollBuilder.rsvpShareUrl = "";
  if (!state.pollBuilder.rsvpResults || typeof state.pollBuilder.rsvpResults !== "object") state.pollBuilder.rsvpResults = null;
  if (typeof state.pollBuilder.pollSharedConfirmed !== "boolean") state.pollBuilder.pollSharedConfirmed = false;
  if (typeof state.pollBuilder.rsvpSharedConfirmed !== "boolean") state.pollBuilder.rsvpSharedConfirmed = false;
  if (typeof state.pollBuilder.rsvpAttendeesExpanded !== "boolean") state.pollBuilder.rsvpAttendeesExpanded = false;
  if (typeof state.pollBuilder.shareLink !== "string") state.pollBuilder.shareLink = "";
  if (typeof state.pollBuilder.showResultsPage !== "boolean") state.pollBuilder.showResultsPage = false;
  if (typeof state.pollBuilder.rsvpSent !== "boolean") state.pollBuilder.rsvpSent = false;
  if (typeof state.pollBuilder.vendorLinkOpened !== "boolean") state.pollBuilder.vendorLinkOpened = false;
  if (typeof state.pollBuilder.markedBooked !== "boolean") state.pollBuilder.markedBooked = false;
  if (typeof state.pollBuilder.bookingResetRequested !== "boolean") state.pollBuilder.bookingResetRequested = false;
  if (typeof state.pollBuilder.inviteMessageOverride !== "string") state.pollBuilder.inviteMessageOverride = "";
  if (typeof state.pollBuilder.timeZone !== "string") state.pollBuilder.timeZone = "";
  if (typeof state.pollBuilder.voteDeadlineDateTime !== "string") state.pollBuilder.voteDeadlineDateTime = "";
  if (typeof state.pollBuilder.voteDeadlineTimeZone !== "string") state.pollBuilder.voteDeadlineTimeZone = "";
  if (typeof state.pollBuilder.chosenEventId !== "string") state.pollBuilder.chosenEventId = "";
  if (typeof state.pollBuilder.chosenDateTime !== "string") state.pollBuilder.chosenDateTime = "";
  if (typeof state.pollBuilder.eventLocationType !== "string") state.pollBuilder.eventLocationType = "virtual";
  if (typeof state.pollBuilder.costPerPerson !== "number") state.pollBuilder.costPerPerson = 50;
  if (typeof state.pollBuilder.rsvpDeadlineDateTime !== "string") state.pollBuilder.rsvpDeadlineDateTime = "";
  if (typeof state.pollBuilder.vendorBookingUrl !== "string") state.pollBuilder.vendorBookingUrl = "";
  if (!state.pollBuilder.bookingConfirmation || typeof state.pollBuilder.bookingConfirmation !== "object") state.pollBuilder.bookingConfirmation = null;
  if (!Array.isArray(state.pollBuilder.scheduleEntries)) state.pollBuilder.scheduleEntries = [];
  normalizePromoteEventState();

  try {
    const snapshotRaw = localStorage.getItem(getSidebarSnapshotKey(targetAccountId));
    if (snapshotRaw) {
      const snapshot = JSON.parse(snapshotRaw);
      const snapshotBooked = Array.isArray(snapshot?.eventsBooked) ? snapshot.eventsBooked : [];
      const snapshotTx = Array.isArray(snapshot?.budgetTransactions) ? snapshot.budgetTransactions : [];
      const snapshotBookingConfirmation = snapshot?.bookingConfirmation && typeof snapshot.bookingConfirmation === "object"
        ? snapshot.bookingConfirmation
        : null;
      const snapshotBudget = snapshot?.programBudget && typeof snapshot.programBudget === "object"
        ? snapshot.programBudget
        : null;

      const canRestoreBookedSnapshot = state.pollBuilder?.bookingResetRequested !== true;
      if (canRestoreBookedSnapshot) {
        if (state.eventsBooked.length === 0 && snapshotBooked.length > 0) {
          state.eventsBooked = snapshotBooked;
        }
        if (state.budgetTransactions.length === 0 && snapshotTx.length > 0) {
          state.budgetTransactions = snapshotTx;
        }
        if (!state.pollBuilder.bookingConfirmation && snapshotBookingConfirmation) {
          state.pollBuilder.bookingConfirmation = snapshotBookingConfirmation;
        }
      }
      if (snapshotBudget) {
        const currentTotal = Number(state.programSettings?.totalBudget || 0);
        const snapTotal = Number(snapshotBudget.totalBudget || 0);
        if (currentTotal <= 0 && snapTotal > 0) {
          state.programSettings.budgetMode = snapshotBudget.budgetMode || state.programSettings.budgetMode;
          state.programSettings.totalBudget = snapTotal;
          state.programSettings.perEmployeeBudget = Number(snapshotBudget.perEmployeeBudget || state.programSettings.perEmployeeBudget || 0);
          state.programSettings.employeeCount = Number(snapshotBudget.employeeCount || state.programSettings.employeeCount || 0);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to restore sidebar snapshot", error);
  }

  applyPinnedIdentity();
  console.debug("[persist-debug] loadLocalState:hydrated", {
    strictAccount,
    preferredAccountId,
    targetAccountId,
    targetStorageKey,
    rawExisted: true,
    eventsBookedLength: Array.isArray(state.eventsBooked) ? state.eventsBooked.length : 0,
    budgetTransactionsLength: Array.isArray(state.budgetTransactions) ? state.budgetTransactions.length : 0
  });
  if (shouldPersistDetectedTimeZone) persistState();
} catch (error) {
  console.warn("Failed to load local state", error);
}
}




function applyLandingIdentityFromQuery() {
try {
  const params = new URLSearchParams(window.location.search || "");
  const company = (params.get("company") || "").trim();
  const admin = (params.get("admin") || "").trim();


 state.landingIdentityMode = company || admin ? "magic" : "generic";


  const hasCompany = Boolean((state.companyName || "").trim());
  const hasAdmin = Boolean((state.adminName || "").trim());

  if (company && !hasCompany) state.companyName = company;
  if (admin && !hasAdmin) state.adminName = admin;
  applyPinnedIdentity();
} catch (error) {
  console.warn("Failed to parse landing identity params", error);
}
}




function renderLandingIdentityView() {
const inputsWrap = $("landingIdentityInputs");
const displayWrap = $("landingIdentityDisplay");
const companyValue = $("landingCompanyValue");
const adminValue = $("landingAdminValue");
const pinnedIdentity = getPinnedIdentity();
const company = (state.companyName || pinnedIdentity?.companyName || "").trim();
const admin = (state.adminName || pinnedIdentity?.adminName || "").trim();


if (!inputsWrap || !displayWrap || !companyValue || !adminValue) return;


const shouldShowStatic = !identityEditMode && Boolean(company) && Boolean(admin);


 inputsWrap.style.display = shouldShowStatic ? "none" : "grid";
 displayWrap.style.display = shouldShowStatic ? "grid" : "none";


companyValue.textContent = company;
adminValue.textContent = admin;
}




function renderAppIdentityView() {
const companyInputWrap = $("appCompanyInputWrap");
const companyDisplayRow = $("appCompanyDisplayRow");
const adminInputWrap = $("appAdminInputWrap");
const companyLabel = $("appCompanyLabel");
const adminLabel = $("appAdminLabel");
 const editBtn = $("appIdentityEdit");
const companyDisplay = $("appCompanyDisplay");
const adminDisplay = $("appAdminDisplay");
const pinnedIdentity = getPinnedIdentity();
const company = (state.companyName || pinnedIdentity?.companyName || "").trim();
const admin = (state.adminName || pinnedIdentity?.adminName || "").trim();


if (!companyInputWrap || !companyDisplayRow || !adminInputWrap || !companyDisplay || !adminDisplay) return;


const shouldShowStatic = !identityEditMode && Boolean(company) && Boolean(admin);
logIdentityDebug("renderAppIdentityView", { shouldShowStatic, pinnedIdentity });


companyInputWrap.style.display = shouldShowStatic ? "none" : "block";
adminInputWrap.style.display = shouldShowStatic ? "none" : "block";
companyDisplayRow.style.display = shouldShowStatic ? "flex" : "none";
if (companyLabel) companyLabel.style.display = shouldShowStatic ? "none" : "block";
if (adminLabel) adminLabel.style.display = shouldShowStatic ? "none" : "block";
adminDisplay.style.display = shouldShowStatic ? "block" : "none";


companyDisplay.textContent = company;
adminDisplay.textContent = admin;
}




function commitLandingIdentityOnEnter() {
const company = (state.companyName || "").trim();
const admin = (state.adminName || "").trim();
if (!company || !admin) return;


state.landingIdentityCommitted = true;
state.appIdentityCommitted = true;
persistPinnedIdentity();
persistState();
renderLandingIdentityView();
renderAppIdentityView();
}




function commitAppIdentityOnEnter() {
const company = (state.companyName || "").trim();
const admin = (state.adminName || "").trim();
if (!company || !admin) return;


state.appIdentityCommitted = true;
state.landingIdentityCommitted = true;
persistPinnedIdentity();
persistState();
renderAppIdentityView();
renderLandingIdentityView();
}

function submitAppIdentity() {
  const companyInput = $("companyName");
  const adminInput = $("adminName");
  state.companyName = (companyInput?.value || "").trim();
  state.adminName = (adminInput?.value || "").trim();
  if (!state.companyName || !state.adminName) return;
  identityEditMode = false;
  logIdentityDebug("submitAppIdentity:beforePersist", { company: state.companyName, admin: state.adminName });
  persistPinnedIdentity();
  commitAppIdentityOnEnter();
  renderAppIdentityView();
  renderLandingIdentityView();
}

function editAppIdentity() {
  identityEditMode = true;
  logIdentityDebug("editAppIdentity");
  renderAppIdentityView();
  renderLandingIdentityView();
  if ($("companyName")) {
    $("companyName").focus();
  }
}




function persistState() {
if (!state.meta || typeof state.meta !== "object") {
  state.meta = { lastUpdated: null };
}
state.meta.lastUpdated = new Date().toISOString();

const storageAccountId = getEffectiveStorageAccountId();
const storageKey = getStorageKey(storageAccountId);
const serialized = JSON.stringify(state);
localStorage.setItem(storageKey, serialized);
localStorage.setItem(LAST_ACCOUNT_ID_KEY, storageAccountId);
console.debug("[persist-debug] persistState", {
  storageAccountId,
  storageKey,
  eventsBookedLength: Array.isArray(state.eventsBooked) ? state.eventsBooked.length : 0,
  budgetTransactionsLength: Array.isArray(state.budgetTransactions) ? state.budgetTransactions.length : 0
});

try {
  const sidebarSnapshotKey = getSidebarSnapshotKey(storageAccountId);
  let existingSnapshot = null;
  try {
    const existingRaw = localStorage.getItem(sidebarSnapshotKey);
    existingSnapshot = existingRaw ? JSON.parse(existingRaw) : null;
  } catch (error) {
    existingSnapshot = null;
  }

  const nextEventsBooked = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];
  const nextBudgetTransactions = Array.isArray(state.budgetTransactions) ? state.budgetTransactions : [];
  const nextBookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
    ? state.pollBuilder.bookingConfirmation
    : null;

  const existingEventsBooked = Array.isArray(existingSnapshot?.eventsBooked) ? existingSnapshot.eventsBooked : [];
  const existingBudgetTransactions = Array.isArray(existingSnapshot?.budgetTransactions) ? existingSnapshot.budgetTransactions : [];
  const existingBookingConfirmation = existingSnapshot?.bookingConfirmation && typeof existingSnapshot.bookingConfirmation === "object"
    ? existingSnapshot.bookingConfirmation
    : null;

  const explicitlyClearingBookingState = state.pollBuilder?.bookingResetRequested === true;
  const mergedSnapshotEvents = explicitlyClearingBookingState
    ? nextEventsBooked
    : (nextEventsBooked.length > 0 ? nextEventsBooked : existingEventsBooked);
  const mergedSnapshotTransactions = explicitlyClearingBookingState
    ? nextBudgetTransactions
    : (nextBudgetTransactions.length > 0 ? nextBudgetTransactions : existingBudgetTransactions);
  const mergedSnapshotBookingConfirmation = explicitlyClearingBookingState
    ? null
    : (nextBookingConfirmation || existingBookingConfirmation || null);

  localStorage.setItem(
    sidebarSnapshotKey,
    JSON.stringify({
      accountId: state.accountId || null,
      eventsBooked: mergedSnapshotEvents,
      budgetTransactions: mergedSnapshotTransactions,
      bookingConfirmation: mergedSnapshotBookingConfirmation,
      programBudget: {
        budgetMode: state.programSettings?.budgetMode || "total",
        totalBudget: Number(state.programSettings?.totalBudget || 0),
        perEmployeeBudget: Number(state.programSettings?.perEmployeeBudget || 0),
        employeeCount: Number(state.programSettings?.employeeCount || 0)
      },
      updatedAt: new Date().toISOString()
    })
  );
} catch (error) {
  console.warn("Failed to persist sidebar snapshot", error);
}

if (cloudSaveDebounceTimer) {
  clearTimeout(cloudSaveDebounceTimer);
}
cloudSaveDebounceTimer = setTimeout(() => {
  cloudSaveDebounceTimer = null;
  const token = getAuthToken();
  if (!token || isHydratingCloudState) return;
  saveCloudState(clone(state)).catch((error) => {
    console.warn("Cloud sync skipped", error?.message || error);
  });
}, 1000);
}




function setupSupabase() {
const banner = $("authBanner");
const cfg = window.__EEOS_CONFIG__ || {};
if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  if (banner) {
    banner.classList.remove("hidden");
    banner.textContent = "Supabase is not configured. Running in local-only mode. Add config.js values to enable auth + cloud sync.";
  }
  return;
}
supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}




async function ensureAccountForUser(user) {
if (!supabaseClient || !user) return;




const { data: existingUser } = await supabaseClient
  .from("users")
  .select("id, account_id")
  .eq("auth_user_id", user.id)
  .maybeSingle();




if (existingUser?.account_id) {
  state.accountId = existingUser.account_id;
  return;
}




if (state.accountId) {
  await supabaseClient.from("accounts").upsert({
    id: state.accountId,
    name: state.companyName || user.email?.split("@")[0] || "Jolly HR Workspace"
  });




  await supabaseClient.from("users").upsert({
    id: uid(),
    account_id: state.accountId,
    auth_user_id: user.id,
    email: user.email || ""
  });
  return;
}




const accountId = uid();
state.accountId = accountId;




await supabaseClient.from("accounts").upsert({
  id: accountId,
  name: user.email?.split("@")[0] || "Jolly HR Workspace"
});




await supabaseClient.from("users").upsert({
  id: uid(),
  account_id: accountId,
  auth_user_id: user.id,
  email: user.email || ""
});
}




async function ensureProspectAccount() {
if (!supabaseClient) return;
if (!state.accountId) {
  state.accountId = uid();
}


await supabaseClient.from("accounts").upsert({
  id: state.accountId,
  name: state.companyName || "Prospect Workspace"
});
}




async function loadStateFromSupabase() {
if (!supabaseClient || !state.accountId || !isSupabaseHydrationEnabled()) return;

const localEventsBooked = Array.isArray(state.eventsBooked) ? [...state.eventsBooked] : [];
const localBudgetTransactions = Array.isArray(state.budgetTransactions) ? [...state.budgetTransactions] : [];
const localBookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
  ? clone(state.pollBuilder.bookingConfirmation)
  : null;
let cloudBookingConfirmation = null;
const localLastUpdatedMs = Number(new Date(state.meta?.lastUpdated || 0).getTime()) || 0;

const cloudUpdatedCandidates = [];
const pushCloudUpdatedAt = (value) => {
  const ms = Number(new Date(value || 0).getTime()) || 0;
  if (ms > 0) cloudUpdatedCandidates.push(ms);
};

const mergeById = (localItems, cloudItems, preferCloud) => {
  const merged = new Map();
  const safeLocal = Array.isArray(localItems) ? localItems : [];
  const safeCloud = Array.isArray(cloudItems) ? cloudItems : [];
  if (preferCloud) {
    safeLocal.forEach((item) => {
      if (!item?.id) return;
      merged.set(String(item.id), item);
    });
    safeCloud.forEach((item) => {
      if (!item?.id) return;
      merged.set(String(item.id), item);
    });
    return Array.from(merged.values());
  }
  safeCloud.forEach((item) => {
    if (!item?.id) return;
    merged.set(String(item.id), item);
  });
  safeLocal.forEach((item) => {
    if (!item?.id) return;
    merged.set(String(item.id), item);
  });
  return Array.from(merged.values());
};




const masterResult = await supabaseClient
  .from("events_master")
  .select("*")
  .or(`is_global.eq.true,account_id.eq.${state.accountId}`)
  .order("created_at", { ascending: true });




if (masterResult.data?.length) {
  state.eventsMaster = masterResult.data.map((row) => ({
    id: row.id,
    name: row.event_name,
    description: row.short_description,
    url: row.vendor_url,
    cost_per_person: Number(row.cost_per_person || 0),
    goals: row.goals || [],
    schedules: row.schedules || [],
    type: row.event_type || "paid",
    facilitation_kit: row.facilitation_kit || null
  }));
}




const programResult = await supabaseClient
  .from("program_settings")
  .select("*")
  .eq("account_id", state.accountId)
  .order("updated_at", { ascending: false })
  .limit(1)
  .maybeSingle();




if (programResult.data) {
  const p = programResult.data;
  pushCloudUpdatedAt(p.updated_at);
  const cloudBookingRaw = p.booking_confirmation || p.bookingConfirmation || null;
  if (cloudBookingRaw && typeof cloudBookingRaw === "object") {
    cloudBookingConfirmation = clone(cloudBookingRaw);
  }
  const hasLocalIdentity = Boolean((state.companyName || "").trim()) && Boolean((state.adminName || "").trim());
  const localIdentityLocked = hasLocalIdentity || state.appIdentityCommitted || state.landingIdentityCommitted;
  if (!localIdentityLocked) {
    state.companyName = p.company_name || state.companyName;
    state.adminName = p.admin_name || state.adminName;
  }
  state.programSettings = {
    budgetMode: p.budget_mode || "total",
    totalBudget: Number(p.total_budget || 0),
    perEmployeeBudget: Number(p.per_employee_budget || 0),
    employeeCount: Number(p.employee_count || 0),
    goals: p.goals || [],
    teamPreferenceEstimate: Array.isArray(p.team_preference_estimate) ? p.team_preference_estimate : [],
    admin_preference_weight: { boost: 0.22, first_cycle_only: true },
    cadence: p.cadence || "Monthly",
    preferredSchedule: p.preferred_schedule || [],
    surveyAnswers: p.survey_answers || {}
  };
}

applyPinnedIdentity();

// Load landing draft (setup flow data)
const draftResult = await supabaseClient
  .from("program_settings")
  .select("*")
  .eq("id", `${state.accountId}-landing-draft`)
  .maybeSingle();

if (draftResult.data) {
  const d = draftResult.data;
  pushCloudUpdatedAt(d.updated_at);
  state.landingDraft = {
    budgetMode: d.budget_mode || "total",
    totalBudget: Number(d.total_budget || 0),
    perEmployee: Number(d.per_employee_budget || 0),
    employeeCount: Number(d.employee_count || 0),
    goals: d.goals || [],
    teamPreferenceEstimate: Array.isArray(d.team_preference_estimate) ? d.team_preference_estimate : [],
    cadence: d.cadence || "Monthly",
    schedule: d.preferred_schedule || [],
    daysSelected: d.days_selected || [],
    timesSelected: d.times_selected || [],
    localCity: d.local_city || "",
    surveyAnswers: d.survey_answers || {}
  };
  state.setupCompleted = d.setup_completed ?? true;
  state.setupEventsGenerated = d.setup_events_generated ?? false;
  state.currentSetupStep = d.current_setup_step || 1;
  state.completedSetupSteps = d.completed_setup_steps || [];
}




const bookedResult = await supabaseClient
  .from("events_booked")
  .select("*")
  .eq("account_id", state.accountId)
  .order("created_at", { ascending: false });




const cloudEventsBooked = Array.isArray(bookedResult.data)
  ? bookedResult.data.map((row) => {
      pushCloudUpdatedAt(row.updated_at || row.created_at);
      return {
    id: row.id,
    event_master_id: row.event_master_id,
    name: row.event_name,
    url: row.vendor_url,
    date: row.event_date,
    time: row.event_time,
    totalCost: Number(row.total_cost || 0),
    rsvps: Number(row.rsvps || 0),
    notes: row.notes || "",
    status: row.status || "upcoming",
    attendance: Number(row.attendance || 0),
    workflow: row.workflow_state || { currentStep: 1, completed: [] },
    feedback: row.feedback || null
      };
    })
  : [];




const txResult = await supabaseClient
  .from("budget_transactions")
  .select("*")
  .eq("account_id", state.accountId)
  .order("created_at", { ascending: false });




const cloudBudgetTransactions = Array.isArray(txResult.data)
  ? txResult.data.map((row) => {
      pushCloudUpdatedAt(row.updated_at || row.created_at || row.occurred_at);
      return {
    id: row.id,
    eventId: row.event_id,
    amount: Number(row.amount || 0),
    description: row.description || "",
    occurredAt: row.occurred_at
      };
    })
  : [];

const cloudLastUpdatedMs = cloudUpdatedCandidates.length ? Math.max(...cloudUpdatedCandidates) : 0;
const preferCloudForCritical = cloudLastUpdatedMs > localLastUpdatedMs;

const localEventsCount = localEventsBooked.length;
const cloudEventsCount = cloudEventsBooked.length;
if (localEventsCount === 0 && cloudEventsCount > 0) {
  state.eventsBooked = cloudEventsBooked;
} else if (localEventsCount > 0 && cloudEventsCount === 0) {
  state.eventsBooked = localEventsBooked;
} else if (localEventsCount > 0 && cloudEventsCount > 0) {
  state.eventsBooked = mergeById(localEventsBooked, cloudEventsBooked, preferCloudForCritical);
}

const localTxCount = localBudgetTransactions.length;
const cloudTxCount = cloudBudgetTransactions.length;
if (localTxCount === 0 && cloudTxCount > 0) {
  state.budgetTransactions = cloudBudgetTransactions;
} else if (localTxCount > 0 && cloudTxCount === 0) {
  state.budgetTransactions = localBudgetTransactions;
} else if (localTxCount > 0 && cloudTxCount > 0) {
  state.budgetTransactions = mergeById(localBudgetTransactions, cloudBudgetTransactions, preferCloudForCritical);
}

if (localBookingConfirmation && !cloudBookingConfirmation) {
  state.pollBuilder.bookingConfirmation = localBookingConfirmation;
} else if (!localBookingConfirmation && cloudBookingConfirmation) {
  state.pollBuilder.bookingConfirmation = cloudBookingConfirmation;
} else if (localBookingConfirmation && cloudBookingConfirmation) {
  state.pollBuilder.bookingConfirmation = preferCloudForCritical ? cloudBookingConfirmation : localBookingConfirmation;
}
}




async function syncStateToSupabase() {
if (!supabaseClient || !state.accountId || !isSupabaseHydrationEnabled()) return;

// Sync landing draft (setup flow data)
await supabaseClient.from("program_settings").upsert({
  id: `${state.accountId}-landing-draft`,
  account_id: state.accountId,
  company_name: state.companyName,
  admin_name: state.adminName,
  budget_mode: state.landingDraft.budgetMode,
  total_budget: state.landingDraft.totalBudget,
  per_employee_budget: state.landingDraft.perEmployee,
  employee_count: state.landingDraft.employeeCount,
  goals: state.landingDraft.goals,
  cadence: state.landingDraft.cadence,
  preferred_schedule: state.landingDraft.schedule,
  days_selected: state.landingDraft.daysSelected,
  times_selected: state.landingDraft.timesSelected,
  local_city: state.landingDraft.localCity,
  survey_answers: state.landingDraft.surveyAnswers,
  setup_completed: state.setupCompleted,
  setup_events_generated: state.setupEventsGenerated,
  current_setup_step: state.currentSetupStep,
  completed_setup_steps: state.completedSetupSteps,
  updated_at: new Date().toISOString()
});

// Sync main program settings
await supabaseClient.from("program_settings").upsert({
  id: `${state.accountId}-program`,
  account_id: state.accountId,
  company_name: state.companyName,
  admin_name: state.adminName,
  budget_mode: state.programSettings.budgetMode,
  total_budget: getBudgetTotal(),
  per_employee_budget: Number(state.programSettings.perEmployeeBudget || 0),
  employee_count: Number(state.programSettings.employeeCount || 0),
  goals: state.programSettings.goals,
  cadence: state.programSettings.cadence,
  preferred_schedule: state.programSettings.preferredSchedule,
  survey_answers: state.programSettings.surveyAnswers,
  updated_at: new Date().toISOString()
});




await supabaseClient.from("employee_survey_responses").upsert({
  id: `${state.accountId}-survey-latest`,
  account_id: state.accountId,
  respondent_label: state.adminName || "admin",
  responses: state.programSettings.surveyAnswers,
  created_at: new Date().toISOString()
});




if (state.eventsRecommended.length) {
  const cycleId = `${state.accountId}-current`;
  await supabaseClient.from("events_recommended").upsert(
    state.eventsRecommended.map((event, index) => ({
      id: `${cycleId}-${event.id}`,
      account_id: state.accountId,
      recommendation_cycle_id: cycleId,
      event_master_id: event.id,
      rank: index + 1,
      score: event.score
    }))
  );
}




if (state.eventsSelected.length) {
  const cycleId = `${state.accountId}-current`;
  await supabaseClient.from("events_selected").upsert(
    state.eventsSelected.map((event, index) => ({
      id: `${cycleId}-${event.id}`,
      account_id: state.accountId,
      recommendation_cycle_id: cycleId,
      event_master_id: event.id,
      selected_rank: index + 1
    }))
  );
}




if (state.eventsBooked.length) {
  await supabaseClient.from("events_booked").upsert(
    state.eventsBooked.map((event) => ({
      id: event.id,
      account_id: state.accountId,
      event_master_id: event.event_master_id || null,
      event_name: event.name,
      vendor_url: event.url,
      event_date: event.date,
      event_time: event.time,
      total_cost: Number(event.totalCost || 0),
      rsvps: Number(event.rsvps || 0),
      notes: event.notes || "",
      status: event.status || "upcoming",
      attendance: Number(event.attendance || 0),
      workflow_state: event.workflow || { currentStep: 1, completed: [] },
      feedback: event.feedback || null,
      updated_at: new Date().toISOString()
    }))
  );
}




if (state.budgetTransactions.length) {
  await supabaseClient.from("budget_transactions").upsert(
    state.budgetTransactions.map((tx) => ({
      id: tx.id,
      account_id: state.accountId,
      event_id: tx.eventId || null,
      amount: Number(tx.amount || 0),
      description: tx.description || "",
      occurred_at: tx.occurredAt || new Date().toISOString()
    }))
  );
}




const feedbackRows = state.eventsBooked
  .filter((event) => event.feedback)
  .map((event) => ({
    id: `${event.id}-feedback`,
    account_id: state.accountId,
    booked_event_id: event.id,
    star_rating: Number(event.feedback.starRating || 0),
    satisfaction_level: event.feedback.satisfaction || "",
    what_worked: event.feedback.whatWorked || "",
    what_improve: event.feedback.whatImprove || ""
  }));




if (feedbackRows.length) {
  await supabaseClient.from("event_feedback").upsert(feedbackRows);
}
}




function surveySignal(settings) {
const answers = Object.values(settings.surveyAnswers || {});
if (!answers.length) return 0.5;
const numeric = answers.map((a) => (a === "High" ? 1 : a === "Medium" ? 0.6 : 0.3));
return numeric.reduce((sum, n) => sum + n, 0) / numeric.length;
}




function scoreEvent(event, settings) {
const goalsMatch = settings.goals.filter((goal) => event.goals.includes(goal)).length;
const goalWeight = goalsMatch / 3;




const budgetLimit = settings.employeeCount ? getBudgetTotal(settings) / settings.employeeCount : getBudgetTotal(settings);
const budgetFitWeight = event.cost_per_person <= budgetLimit ? 1 : Math.max(0, 1 - ((event.cost_per_person - budgetLimit) / Math.max(budgetLimit, 1)));




const scheduleMatches = settings.preferredSchedule.filter((slot) => event.schedules.includes(slot)).length;
const scheduleWeight = settings.preferredSchedule.length ? scheduleMatches / settings.preferredSchedule.length : 0.5;




const surveyWeight = surveySignal(settings);



const baseScore = goalWeight * 0.35 + budgetFitWeight * 0.25 + scheduleWeight * 0.2 + surveyWeight * 0.2;
const boostMultiplier = getAdminPreferenceBoostMultiplier(event, settings);

return Number(Math.min(1, baseScore * boostMultiplier).toFixed(4));
}

function getAdminPreferenceBoostMultiplier(event, settings) {
  const selected = Array.isArray(settings?.teamPreferenceEstimate) ? settings.teamPreferenceEstimate : [];
  if (!selected.length) return 1;

  const adminPreferenceWeight = settings?.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
  const boostValue = Number(adminPreferenceWeight.boost || 0.22);
  const normalizedBoost = Math.max(0, Math.min(0.25, boostValue));
  const firstCycleOnly = adminPreferenceWeight.first_cycle_only !== false;
  const isFirstCycle = !Array.isArray(state.eventsBooked) || state.eventsBooked.length === 0;
  if (firstCycleOnly && !isFirstCycle) return 1;

  const hasMatch = selected.some((interest) => eventMatchesInterest(event, interest));
  return hasMatch ? 1 + normalizedBoost : 1;
}

function eventMatchesInterest(event, interest) {
  const haystack = `${event?.name || ""} ${event?.description || ""} ${(event?.goals || []).join(" ")}`.toLowerCase();
  const normalized = String(interest || "").toLowerCase();

  const keywordMap = {
    "fun / social event": ["fun", "social", "team", "trivia", "escape", "game", "bond"],
    "professional development": ["workshop", "learning", "skills", "coaching", "development"],
    "wellness / health focused": ["wellness", "mindful", "health", "fitness", "workout"],
    "food / drinks experience": ["food", "drink", "cocktail", "cooking", "tasting"],
    "learn a new creative skill": ["creative", "build", "craft", "making", "skill"],
    "volunteering": ["volunteer", "community", "service", "nonprofit", "impact"]
  };

  const keywords = keywordMap[normalized] || [];
  if (!keywords.length) return false;
  return keywords.some((keyword) => haystack.includes(keyword));
}




function generateRecommendations(settings, sourceCatalog = state.eventsMaster) {
const scored = sourceCatalog.map((event) => ({
  ...event,
  score: scoreEvent(event, settings)
}));




const freeEvents = scored.filter((event) => event.type === "free").sort((a, b) => b.score - a.score);
const paidEvents = scored.filter((event) => event.type !== "free").sort((a, b) => b.score - a.score);




const picked = [];
if (freeEvents.length) {
  picked.push(freeEvents[0]);
}
for (const event of paidEvents) {
  if (picked.length >= 5) break;
  if (!picked.find((p) => p.id === event.id)) {
    picked.push(event);
  }
}
for (const event of freeEvents.slice(1)) {
  if (picked.length >= 5) break;
  if (!picked.find((p) => p.id === event.id)) {
    picked.push(event);
  }
}




return picked.slice(0, 5);
}




function renderGoalInputs(containerId, selected, onToggle) {
const container = $(containerId);
if (!container) return;
container.innerHTML = "";
const selectedValues = Array.isArray(selected) ? selected : [];

GOALS.forEach((goal) => {
  const id = `${containerId}-${goal}`.replace(/[^a-zA-Z0-9]/g, "-");
  const checked = selectedValues.includes(goal);
  const description = GOAL_DESCRIPTIONS[goal] || "";
  const wrapper = document.createElement("label");
  wrapper.className = "goal-pill";
  wrapper.innerHTML = `
    <input id="${id}" type="checkbox" ${checked ? "checked" : ""} />
    <span>
      <div class="goal-title">${goal}</div>
      <div class="goal-description">${description}</div>
    </span>
  `;
  wrapper.querySelector("input").addEventListener("change", (event) => onToggle(goal, event.target));
  container.appendChild(wrapper);
});
}

function renderInterestInputs(containerId, selected, onToggle) {
const container = $(containerId);
if (!container) return;
container.innerHTML = "";
const selectedValues = Array.isArray(selected) ? selected : [];

INTEREST_OPTIONS.forEach((interest) => {
  const id = `${containerId}-${interest}`.replace(/[^a-zA-Z0-9]/g, "-");
  const checked = selectedValues.includes(interest);
  const description = INTEREST_DESCRIPTIONS[interest] || "";
  const wrapper = document.createElement("label");
  wrapper.className = "goal-pill";
  wrapper.innerHTML = `
    <input id="${id}" type="checkbox" ${checked ? "checked" : ""} />
    <span>
      <div class="goal-title">${interest}</div>
      <div class="goal-description">${description}</div>
    </span>
  `;
  wrapper.querySelector("input").addEventListener("change", (event) => onToggle(interest, event.target));
  container.appendChild(wrapper);
});
}




function renderScheduleInputs(containerId, selected, onToggle) {
const container = $(containerId);
if (!container) return;
container.innerHTML = "";
SCHEDULE_OPTIONS.forEach((option) => {
  const id = `${containerId}-${option}`.replace(/[^a-zA-Z0-9]/g, "-");
  const checked = selected.includes(option);
  const label = document.createElement("label");
  label.className = "schedule-pill";
  label.innerHTML = `<input id="${id}" type="checkbox" ${checked ? "checked" : ""} /><span>${option}</span>`;
  label.querySelector("input").addEventListener("change", () => onToggle(option));
  container.appendChild(label);
});
}




function renderSurveyQuestions() {
const container = $("surveyQuestions");
if (!container) return;
container.innerHTML = "";




SURVEY_QUESTIONS.forEach((question, index) => {
  const key = `q${index + 1}`;
  const row = document.createElement("div");
  row.className = "rounded-lg border border-slate-200 p-2";
  row.innerHTML = `
    <label class="text-xs font-medium block mb-1">${index + 1}. ${question}</label>
    <select class="w-full rounded border border-slate-300 px-2 py-1 text-xs" data-survey-key="${key}">
      ${SURVEY_CHOICES.map((choice) => `<option value="${choice}" ${state.programSettings.surveyAnswers[key] === choice ? "selected" : ""}>${choice}</option>`).join("")}
    </select>
  `;
  container.appendChild(row);
});




container.querySelectorAll("[data-survey-key]").forEach((select) => {
  select.addEventListener("change", (event) => {
    state.programSettings.surveyAnswers[event.target.dataset.surveyKey] = event.target.value;
    persistState();
  });
});
}




function renderLanding() {
const companyInput = $("landingCompanyName");
const adminInput = $("landingAdminName");
if (companyInput) companyInput.value = state.companyName || "";
if (adminInput) adminInput.value = state.adminName || "";
const setupCompanyInput = $("setupCompanyName");
const setupAdminInput = $("setupAdminName");
if (setupCompanyInput) setupCompanyInput.value = state.companyName || "";
if (setupAdminInput) setupAdminInput.value = state.adminName || "";
renderLandingIdentityView();

const cadenceLanding = $("landingCadence");
const landingGoalsContainer = $("landingGoals");
const landingScheduleContainer = $("landingSchedule");
if (!cadenceLanding || !landingGoalsContainer || !landingScheduleContainer) {
  return;
}
cadenceLanding.innerHTML = CADENCE_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("");
cadenceLanding.value = state.landingDraft.cadence;




renderGoalInputs("landingGoals", state.landingDraft.goals, (goal) => {
  state.landingDraft.goals = toggleGoal(state.landingDraft.goals, goal, 3);
  renderLanding();
});




renderScheduleInputs("landingSchedule", state.landingDraft.schedule, (option) => {
  state.landingDraft.schedule = state.landingDraft.schedule.includes(option)
    ? state.landingDraft.schedule.filter((s) => s !== option)
    : [...state.landingDraft.schedule, option];
  renderLanding();
});
}




function renderLandingRecommendations(events) {
const container = $("landingRecommendations");
if (!container) return;
container.innerHTML = events
  .map((event) => {
    const totalBudget = Number(state.landingDraft.totalBudget || 0);
    const estimated = event.cost_per_person * (state.programSettings.employeeCount || 40);
    const maxAttendees = event.cost_per_person === 0 ? "Unlimited" : Math.floor(totalBudget / event.cost_per_person);
    return `
      <article class="rounded-lg border border-slate-200 p-3">
        <h3 class="font-medium">${event.name}</h3>
        <p class="text-xs text-slate-600 mt-1">${event.description}</p>
        <p class="text-xs mt-2">Cost / person: <strong>${fmtMoney(event.cost_per_person)}</strong> · Est total: <strong>${fmtMoney(estimated)}</strong></p>
        <p class="text-xs mt-1">Max attendees in budget: <strong>${maxAttendees}</strong></p>
        <p class="text-xs mt-1 text-slate-500">Goal fit score: ${(event.score * 100).toFixed(0)}%</p>
      </article>
    `;
  })
  .join("");




if (!events.length) {
  container.textContent = "No recommendations yet.";
}
}




function getSelectedEvents() {
return state.eventsRecommended.filter((event) => state.eventsSelected.includes(event.id));
}




function buildPollCopy(selectedEvents) {
const voteDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();
const options = selectedEvents
  .map((event, idx) => `${String.fromCharCode(65 + idx)}) ${event.name}\n${event.description}\n${event.url}\nWhat you get: ${event.goals.join(", ")}`)
  .join("\n\n");
return `Team Poll — Choose Our Next Event\n\n${options}\n\nPlease vote by ${voteDeadline}.`;
}




function getActiveEvent() {
return state.eventsBooked.find((event) => event.id === state.activeEventId) || null;
}




function openVendorUrl(url, title = "Vendor") {
if (!url) return;
if (isElectron()) {
  const tab = { id: uid(), title, url };
  state.browserTabs.push(tab);
  state.activeBrowserTabId = tab.id;
  renderBrowserPanel();
  persistState();
  return;
}
window.open(url, "_blank", "noopener,noreferrer");
}




async function openSlack() {
if (isElectron() && window.electronAPI?.openSlackApp) {
  await window.electronAPI.openSlackApp();
  return;
}
window.open("slack://open", "_blank");
}




function renderSidebar() {
const active = getActiveEvent();
$("activeEventLabel").textContent = active ? active.name : "No active event";
$("activeEventMeta").textContent = active ? `${active.date || "TBD"} · ${active.time || "TBD"}` : "Choose one in the workflow to continue.";
const eventsBooked = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];

const upcomingEventCard = $("sidebarUpcomingEventCard");
const upcomingEventContent = $("sidebarUpcomingEventContent");
const bookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
  ? state.pollBuilder.bookingConfirmation
  : null;
const bookedEventFromList = eventsBooked.find((eventItem) => {
  const status = String(eventItem?.status || "").toLowerCase();
  return status === "booked";
});
const sidebarBookedSource = bookedEventFromList || bookingConfirmation;

if (upcomingEventCard && upcomingEventContent) {
  if (isSidebarHydrating && !sidebarBookedSource) {
    upcomingEventContent.innerHTML = `
      <div class="space-y-2">
        <div class="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
        <div class="h-3 w-full animate-pulse rounded bg-slate-200"></div>
        <div class="h-3 w-5/6 animate-pulse rounded bg-slate-200"></div>
        <div class="text-xs text-slate-500">Syncing saved booking…</div>
      </div>
    `;
    upcomingEventCard.classList.remove("hidden");
  } else if (sidebarBookedSource) {
    const eventName = String(sidebarBookedSource?.name || sidebarBookedSource?.title || "Team Event").trim() || "Team Event";
    const dateText = String(sidebarBookedSource?.date || sidebarBookedSource?.bookedDate || "TBD").trim() || "TBD";
    const timeText = String(sidebarBookedSource?.time || sidebarBookedSource?.bookedTime || "TBD").trim() || "TBD";
    const headcountValue = Number(sidebarBookedSource?.headcount || sidebarBookedSource?.bookedHeadcount || sidebarBookedSource?.rsvps || 0);
    const totalCostValue = Number(sidebarBookedSource?.totalCost || sidebarBookedSource?.bookedTotalCost || 0);
    const vendorUrl = String(sidebarBookedSource?.url || sidebarBookedSource?.vendorUrl || "").trim();
    const vendorHost = (() => {
      try {
        return vendorUrl ? new URL(vendorUrl).hostname.replace(/^www\./, "") : "";
      } catch (error) {
        return "";
      }
    })();
    const rsvpConfirmedCount = Number(sidebarBookedSource?.rsvps || sidebarBookedSource?.bookedHeadcount || headcountValue || 0);

    upcomingEventContent.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-900">${escapeHtml(eventName)}</div>
            <div class="mt-0.5 text-xs text-slate-500">Confirmed booking</div>
          </div>
          <span class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Booked</span>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <div class="flex items-center justify-between gap-2 py-0.5"><span class="text-slate-500">When</span><span class="text-right font-medium text-slate-800">${escapeHtml(`${dateText} · ${timeText}`)}</span></div>
          <div class="flex items-center justify-between gap-2 py-0.5"><span class="text-slate-500">People</span><span class="text-right font-medium text-slate-800">${headcountValue > 0 ? `${headcountValue}` : "TBD"}</span></div>
          <div class="flex items-center justify-between gap-2 py-0.5"><span class="text-slate-500">Total cost</span><span class="text-right font-semibold text-slate-900">${fmtMoney(totalCostValue)}</span></div>
        </div>
        ${rsvpConfirmedCount > 0 ? `<div class="text-xs text-slate-500">RSVP confirmed: ${rsvpConfirmedCount}</div>` : ""}
        ${vendorUrl ? `<div class="border-t border-slate-200 pt-2"><a class="break-all text-xs font-medium text-slate-700 hover:underline" href="${escapeHtml(vendorUrl)}" target="_blank" rel="noopener noreferrer">View vendor · ${escapeHtml(vendorHost || "Link")}</a></div>` : ""}
      </div>
    `;
    upcomingEventCard.classList.remove("hidden");
  } else {
    upcomingEventCard.classList.add("hidden");
    upcomingEventContent.innerHTML = "";
  }
}




const upcoming = eventsBooked.filter((event) => {
  const status = String(event?.status || "").toLowerCase();
  return status === "upcoming" || status === "active" || status === "booked";
});
const past = eventsBooked.filter((event) => event.status === "past");




const upcomingListEl = $("upcomingList");
if (upcomingListEl) {
  upcomingListEl.innerHTML = upcoming.length
    ? upcoming.map((event) => {
      const statusRaw = String(event?.status || "upcoming");
      const statusLabel = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      const headcountValue = Number(event?.headcount || event?.rsvps || 0);
      const totalCostValue = Number(event?.totalCost || 0);
      return `<li class="event-row" data-load-event="${event.id}"><div class="flex items-center justify-between gap-2"><strong>${event.name}</strong><span class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">${statusLabel}</span></div><span>${event.date || "TBD"} · ${event.time || "TBD"}</span><br/><span class="text-[11px] text-slate-500">${headcountValue > 0 ? `${headcountValue} attending` : "Headcount TBD"} · ${fmtMoney(totalCostValue)}</span></li>`;
    }).join("")
    : `<li class="text-xs text-slate-500">No upcoming events</li>`;
}




const pastListEl = $("pastList");
if (pastListEl) {
  pastListEl.innerHTML = past.length
    ? past.map((event) => `<li class="event-row" data-load-event="${event.id}"><strong>${event.name}</strong><br/><span>${event.date || "TBD"} · ${event.time || "TBD"}</span></li>`).join("")
    : `<li class="text-xs text-slate-500">No past events</li>`;
}




const landingView = $("landingView");
const isLandingActive = landingView && !landingView.classList.contains("hidden");
const setupTotal = Number(state.landingDraft?.totalBudget || 0);
const sidebarTotal = isLandingActive && setupTotal > 0 ? setupTotal : getBudgetTotal();
const sidebarSpent = getTotalSpent();
const sidebarRemaining = sidebarTotal - sidebarSpent;

$("budgetTotalLabel").textContent = `Total: ${fmtMoney(sidebarTotal)}`;
$("budgetSpentLabel").textContent = `Spent: ${fmtMoney(sidebarSpent)}`;
$("budgetRemainingLabel").textContent = `Remaining: ${fmtMoney(sidebarRemaining)}`;




document.querySelectorAll("[data-load-event]").forEach((row) => {
  row.addEventListener("click", () => {
    const eventId = row.dataset.loadEvent;
    state.activeEventId = eventId;
    if (!state.workflowStates[eventId]) {
      const event = state.eventsBooked.find((e) => e.id === eventId);
      state.workflowStates[eventId] = event?.workflow || { currentStep: 1, completed: [] };
    }
    renderAll();
    persistState();
  });
});


renderSetupMenuState();
renderSidebarStepMenus();
}




function renderSetupMenuState() {
const setupMenu = $("sidebarSetupMenu");
const setupArrow = $("sidebarSetupArrow");
if (!setupMenu) return;


const isHidden = !!state.setupCompleted && !state.setupMenuExpanded;
setupMenu.style.display = isHidden ? "none" : "block";
if (setupArrow) {
  setupArrow.textContent = isHidden ? "▸" : "▾";
}
}


function scrollSetupStepIntoView(stepNum, behavior = "smooth", exactFocus = false) {
if (!Number.isInteger(stepNum)) return;


requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const setupStepsContainer = document.getElementById("setupStepsContainer");
    if (setupStepsContainer) {
      let spacer = document.getElementById("setupStepsScrollSpacer");
      if (!spacer) {
        spacer = document.createElement("div");
        spacer.id = "setupStepsScrollSpacer";
        spacer.setAttribute("aria-hidden", "true");
        spacer.style.height = `${Math.max(Math.round(window.innerHeight * 0.45), 220)}px`;
        spacer.style.pointerEvents = "none";
        setupStepsContainer.appendChild(spacer);
      } else {
        spacer.style.height = `${Math.max(Math.round(window.innerHeight * 0.45), 220)}px`;
      }
    }

    const currentStepEl = document.querySelector(`.setup-step[data-step="${stepNum}"]`);
    if (!currentStepEl) return;

    const isElementVisible = (element) => {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    };

    let anchorStepNum = stepNum;
    if (!exactFocus) {
      for (let candidate = stepNum - 1; candidate >= 1; candidate -= 1) {
        const candidateEl = document.querySelector(`.setup-step[data-step="${candidate}"]`);
        if (isElementVisible(candidateEl)) {
          anchorStepNum = candidate;
          break;
        }
      }
    }

    const anchorStepEl = document.querySelector(`.setup-step[data-step="${anchorStepNum}"]`) || currentStepEl;
    const headerEl = anchorStepEl.querySelector(".setup-step-header") || anchorStepEl;
    const scrollHost = document.querySelector(".eeos-main");

    if (!scrollHost) {
      headerEl.style.scrollMarginTop = "17px";
      headerEl.scrollIntoView({ behavior, block: "start", inline: "nearest" });
      return;
    }

    const hostRect = scrollHost.getBoundingClientRect();
    const headerRect = headerEl.getBoundingClientRect();
    const targetTop = scrollHost.scrollTop + (headerRect.top - hostRect.top) - 17;

    scrollHost.scrollTo({
      top: Math.max(0, targetTop),
      behavior
    });
  });
});
}

function forceExpandSetupStep(stepNum) {
  if (!Number.isInteger(stepNum)) return;
  const allSteps = document.querySelectorAll(".setup-step");
  allSteps.forEach((stepEl) => {
    const currentNum = Number(stepEl.dataset.step || 0);
    const content = stepEl.querySelector(".setup-step-content");
    const arrow = stepEl.querySelector(".setup-step-arrow");
    if (!content) return;
    if (currentNum === stepNum) {
      content.classList.remove("hidden");
      if (arrow) arrow.textContent = "▾";
    } else {
      content.classList.add("hidden");
      if (arrow) arrow.textContent = "▸";
    }
  });
}




function renderSidebarStepMenus() {
  updateSidebarSetupCollapseUI();
const setupItems = document.querySelectorAll("[data-setup-menu-item]");
const workflowItems = document.querySelectorAll("[data-workflow-menu-step]");
const eventWorkflowItems = document.querySelectorAll("[data-event-workflow-menu-item]");
const eventWorkflowSection = $("sidebarEventWorkflowSection");
const landingView = $("landingView");
const isLandingActive = landingView && !landingView.classList.contains("hidden");
const allCoreSetupComplete = [1,2,3,4,5,6].every(s => state.completedSetupSteps.includes(s));
const activeSidebarStepBg = "#E0E7FF";
const activeSidebarStepText = "#1F2937";
const runEventVisible = canShowRunEventStep();
const activeSetupKey = isLandingActive ? SETUP_STEP_TO_MENU_ITEM[state.currentSetupStep] : null;
const wf = getWorkflowState();
const rawStep = Number(wf?.currentStep || 1);
const activeMenuStep = rawStep >= 6 ? 6 : Math.max(1, rawStep);
const setupProcessCurrentStep = (() => {
  for (let step = 1; step <= 6; step += 1) {
    if (!state.completedSetupSteps.includes(step)) {
      return step;
    }
  }
  return null;
})();


// Add click handler for sidebar setup steps
setupItems.forEach((item) => {
  const stepNum = SETUP_MENU_ITEM_TO_STEP[item.dataset.setupMenuItem];
  const isActive = state.currentSetupStep === stepNum;
  const isProcessCurrent = stepNum === setupProcessCurrentStep;
  const isCompleted = state.completedSetupSteps.includes(stepNum);
  const iconStateClass = isCompleted ? "sidebar-step-completed" : (isProcessCurrent ? "sidebar-step-current" : "sidebar-step-future");
  item.classList.remove("sidebar-step-current", "sidebar-step-completed", "sidebar-step-future", "sidebar-step-process-current");
  item.classList.add(iconStateClass);
  item.classList.toggle("sidebar-step-process-current", isProcessCurrent);
  item.style.background = isActive ? activeSidebarStepBg : "transparent";
  item.style.borderColor = isActive ? activeSidebarStepBg : "transparent";
  item.style.color = isActive ? activeSidebarStepText : (isCompleted ? "#64748b" : "#1e293b");
  item.onclick = () => {
    if (stepNum) {
      state.currentSetupStep = stepNum;
      state.setupMenuExpanded = true;
      state.sidebarSetupExpanded = true;
      persistState();
      renderSetupMenuState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      forceExpandSetupStep(stepNum);
      scrollSetupStepIntoView(stepNum, "smooth", true);
    }
  };
});

if (eventWorkflowSection) {
  eventWorkflowSection.style.display = allCoreSetupComplete ? "block" : "none";
}

eventWorkflowItems.forEach((item) => {
  if (item.dataset.eventWorkflowMenuItem === "run-event" && !runEventVisible) {
    item.style.display = "none";
    return;
  }
  item.style.display = "";
  const processCurrentStep = getEventWorkflowProcessStep();
  const isBookEventDebugOverride = Boolean(state.debugMode) && item.dataset.eventWorkflowMenuItem === "book-event";
  const stepKeyToNum = {
    "events-shortlist": 7,
    poll: 8,
    "book-event": 9,
    "tell-team": 10,
    "run-event": 11,
    "track-results": 12,
    "review-impact": 13
  };
  const stepNum = stepKeyToNum[item.dataset.eventWorkflowMenuItem];
  const isActive = state.currentSetupStep === stepNum;
  const isProcessCurrent = stepNum === processCurrentStep;
  const isCompleted = state.completedSetupSteps.includes(stepNum) && stepNum < processCurrentStep;
  const isLocked = !isBookEventDebugOverride && !isCompleted && (stepNum > 7) && !state.completedSetupSteps.includes(stepNum - 1);
  const iconStateClass = isCompleted ? "sidebar-step-completed" : (isProcessCurrent ? "sidebar-step-current" : "sidebar-step-future");
  item.classList.remove("sidebar-step-current", "sidebar-step-completed", "sidebar-step-future", "sidebar-step-process-current");
  item.classList.add(iconStateClass);
  item.classList.toggle("sidebar-step-process-current", isProcessCurrent);
  item.classList.toggle("sidebar-step-locked", isLocked && !isActive);
  item.style.background = isActive ? activeSidebarStepBg : "transparent";
  item.style.borderColor = isActive ? activeSidebarStepBg : "transparent";
  item.style.color = isActive ? activeSidebarStepText : (isCompleted ? "#64748b" : "#1e293b");
  item.onclick = () => {
    if (!allCoreSetupComplete || !stepNum) return;
    collapseSetupViewsForWorkflowStep();
    state.currentSetupStep = stepNum;
    persistState();
    renderSetupMenuState();
    renderSetupStepStates();
    renderSidebarStepMenus();
    forceExpandSetupStep(stepNum);
    scrollSetupStepIntoView(stepNum, "smooth", true);
  };
});


workflowItems.forEach((item) => {
  if (isLandingActive) {
    // Hide workflow items when in landing setup view
    item.style.background = "transparent";
    item.style.borderColor = "transparent";
    item.style.color = "";
  } else {
    const step = Number(item.dataset.workflowMenuStep || 0);
    const isActive = step === activeMenuStep;
    item.style.background = isActive ? "#ffffff" : "transparent";
    item.style.borderColor = isActive ? "#e2e8f0" : "transparent";
  }
});
}




function renderProgramSetupForm() {
$("companyName").value = state.companyName || "";
$("adminName").value = state.adminName || "";
if ($("landingCompanyName")) $("landingCompanyName").value = state.companyName || "";
if ($("landingAdminName")) $("landingAdminName").value = state.adminName || "";
renderAppIdentityView();




const cadence = $("cadence");
cadence.innerHTML = CADENCE_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("");
cadence.value = state.programSettings.cadence;




$("budgetMode").value = state.programSettings.budgetMode;
$("totalBudget").value = state.programSettings.totalBudget;
$("perEmployeeBudget").value = state.programSettings.perEmployeeBudget;
$("employeeCount").value = state.programSettings.employeeCount;




renderGoalInputs("goalOptions", state.programSettings.goals, (goal) => {
  state.programSettings.goals = toggleGoal(state.programSettings.goals, goal, 3);
  renderProgramSetupForm();
  persistState();
});




renderScheduleInputs("scheduleOptions", state.programSettings.preferredSchedule, (option) => {
  state.programSettings.preferredSchedule = state.programSettings.preferredSchedule.includes(option)
    ? state.programSettings.preferredSchedule.filter((s) => s !== option)
    : [...state.programSettings.preferredSchedule, option];
  renderProgramSetupForm();
  persistState();
});




renderSurveyQuestions();
}




function recommendationCardsHtml() {
if (!state.eventsRecommended.length) {
  return `<p class="text-sm text-slate-500">Generate recommendations to continue.</p>`;
}
return state.eventsRecommended.map((event) => {
  const estimatedTotal = Number(event.cost_per_person) * Number(state.programSettings.employeeCount || 0);
  const maxAttendees = event.cost_per_person === 0 ? "Unlimited" : Math.floor(getRemainingBudget() / event.cost_per_person);
  const selected = state.eventsSelected.includes(event.id);
  return `
    <article class="rounded-lg border border-slate-200 p-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-medium">${event.name}</h4>
          <p class="text-xs text-slate-600 mt-1">${event.description}</p>
          <a class="text-xs text-slate-700 underline mt-1 inline-block" href="${event.url}" target="_blank" rel="noopener noreferrer">Vendor URL</a>
        </div>
        <button class="rounded-lg border px-2 py-1 text-xs ${selected ? "bg-slate-900 text-white border-slate-900" : "border-slate-300"}" data-action="toggle-select-event" data-event-id="${event.id}">${selected ? "Selected" : "Select"}</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3 text-slate-600">
        <div>Cost / person: <strong>${fmtMoney(event.cost_per_person)}</strong></div>
        <div>Estimated total: <strong>${fmtMoney(estimatedTotal)}</strong></div>
        <div>Max attendees: <strong>${maxAttendees}</strong></div>
        <div>Score: <strong>${(event.score * 100).toFixed(0)}%</strong></div>
      </div>
    </article>
  `;
}).join("");
}




function renderWorkflowStepper() {
const wf = getWorkflowState();
const selected = getSelectedEvents();
const activeEvent = getActiveEvent();




const stepper = $("workflowStepper");
if (!stepper) return;




stepper.innerHTML = WORKFLOW_STEPS.map((label, index) => {
  const step = index + 1;
  const isCurrent = wf.currentStep === step;
  const isComplete = wf.completed.includes(step);
  const stateClass = isCurrent ? "step-current" : isComplete ? "step-complete" : "step-idle";
  return `
    <li class="step-row ${stateClass}">
      <div class="step-badge">${isComplete ? "✓" : step}</div>
      <div class="step-body">
        <div class="step-title-row">
          <h3 class="step-title">${label}</h3>
        </div>
        <div class="step-content ${isCurrent ? "" : "hidden"}" id="step-content-${step}">
          ${renderStepContent(step, selected, activeEvent)}
        </div>
      </div>
    </li>
  `;
}).join("");
}




function renderStepContent(step, selected, activeEvent) {
if (step === 1) {
  return `
    <p class="text-sm text-slate-600 mb-3">System selects 5 events using goals, budget, schedule, survey signal, and free-event inclusion rule.</p>
    <div class="flex gap-2 mb-3">
      <button class="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs" data-action="generate-recommendations">Generate 5 Recommendations</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="complete-step" data-step="1">Next</button>
    </div>
    <div class="space-y-3">${recommendationCardsHtml()}</div>
    <p class="text-xs text-slate-500 mt-2">Selected: ${state.eventsSelected.length}/3</p>
  `;
}




if (step === 2) {
  const poll = selected.length ? buildPollCopy(selected) : "Select 3 events in Step 1 to generate poll copy.";
  return `
    <p class="text-sm text-slate-600 mb-2">Generate poll copy or skip and book directly.</p>
    <div class="relative rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap pr-12" id="pollText">${poll}</div>
    <div class="flex gap-2 mt-2">
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="copy-poll">Copy Poll</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="skip-poll">Skip Poll</button>
      <button class="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs" data-action="complete-step" data-step="2">Next</button>
    </div>
    <div id="copyPollStatus" class="text-xs text-emerald-600 mt-2"></div>
  `;
}




if (step === 3) {
  return `
    <p class="text-sm text-slate-600 mb-2">Choose winner, book event, save details, and move to upcoming events.</p>
    <div class="space-y-2 mb-3">
      ${selected.map((event) => `
        <label class="winner-option">
          <input type="radio" name="winnerEvent" value="${event.id}" ${state.activeEventId === event.id ? "checked" : ""} />
          <span><strong>${event.name}</strong> · ${fmtMoney(event.cost_per_person)} / person</span>
          <button class="rounded border border-slate-300 px-2 py-1 text-xs ml-auto" data-action="open-vendor" data-event-id="${event.id}">Book Event</button>
        </label>
      `).join("") || `<p class="text-xs text-slate-500">No selected events yet.</p>`}
    </div>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
      <input id="bookDate" type="date" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <input id="bookTime" type="time" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <input id="bookCost" type="number" min="0" placeholder="Total Cost" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <input id="bookRsvps" type="number" min="0" placeholder="RSVPs" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <input id="bookNotes" type="text" placeholder="Notes" class="rounded border border-slate-300 px-2 py-1 text-xs" />
    </div>
    <div class="flex gap-2 mt-2">
      <button class="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs" data-action="save-booked-event">Save Event from Page</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="complete-step" data-step="3">Next</button>
    </div>
  `;
}




if (step === 4) {
  const name = activeEvent?.name || "[Event Name]";
  const date = activeEvent?.date || "[Date]";
  const time = activeEvent?.time || "[Time]";
  const url = activeEvent?.url || "[Link]";
  const master = `Hi team — ${name} is booked for ${date} at ${time}. RSVP and details: ${url}`;
  const slack = `:tada: ${master}`;
  const email = `Subject: Upcoming Team Event\n\n${master}`;
  const calendar = `${name}\n${master}`;




  return `
    <p class="text-sm text-slate-600 mb-2">Auto-generate Slack, email, and calendar copy from one master message.</p>
    <textarea id="promotionMaster" class="w-full h-20 rounded border border-slate-300 p-2 text-xs">${master}</textarea>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-xs">
      <div class="rounded border border-slate-200 p-2"><strong>Slack</strong><br/>${slack}</div>
      <div class="rounded border border-slate-200 p-2"><strong>Email</strong><br/>${email}</div>
      <div class="rounded border border-slate-200 p-2"><strong>Calendar</strong><br/>${calendar}</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <select id="prefChat" class="rounded border border-slate-300 px-2 py-1 text-xs">
        <option ${state.toolPreferences.chat === "Slack" ? "selected" : ""}>Slack</option>
        <option ${state.toolPreferences.chat === "Teams" ? "selected" : ""}>Teams</option>
      </select>
      <select id="prefEmail" class="rounded border border-slate-300 px-2 py-1 text-xs">
        <option ${state.toolPreferences.email === "Gmail" ? "selected" : ""}>Gmail</option>
        <option ${state.toolPreferences.email === "Outlook" ? "selected" : ""}>Outlook</option>
      </select>
      <select id="prefCalendar" class="rounded border border-slate-300 px-2 py-1 text-xs">
        <option ${state.toolPreferences.calendar === "Google Calendar" ? "selected" : ""}>Google Calendar</option>
        <option ${state.toolPreferences.calendar === "Outlook Calendar" ? "selected" : ""}>Outlook Calendar</option>
      </select>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="copy-master-promo">Copy Message</button>
      <button class="rounded-lg bg-sky-600 text-white px-3 py-2 text-xs" data-action="open-slack">Open Slack ↗</button>
      <button class="rounded-lg bg-sky-600 text-white px-3 py-2 text-xs" data-action="open-gmail">Open Gmail</button>
      <button class="rounded-lg bg-sky-600 text-white px-3 py-2 text-xs" data-action="open-calendar">Open Calendar</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="complete-step" data-step="4">Next</button>
    </div>
  `;
}




if (step === 5) {
  const defaultAtt = activeEvent?.attendance || "";
  return `
    <p class="text-sm text-slate-600 mb-2">Record attendance to calculate participation and cost per participant.</p>
    <div class="flex flex-wrap gap-2 items-center">
      <input id="attendanceInput" type="number" min="0" value="${defaultAtt}" placeholder="Number attended" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <button class="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs" data-action="save-attendance">Save Attendance</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="complete-step" data-step="5">Next</button>
    </div>
  `;
}




if (step === 6) {
  const feedback = activeEvent?.feedback || {};
  return `
    <p class="text-sm text-slate-600 mb-2">Collect qualitative and quantitative feedback.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <input id="feedbackStars" type="number" min="1" max="5" value="${feedback.starRating || ""}" placeholder="Star Rating (1-5)" class="rounded border border-slate-300 px-2 py-1 text-xs" />
      <select id="feedbackSatisfaction" class="rounded border border-slate-300 px-2 py-1 text-xs">
        <option value="">Satisfaction level</option>
        <option ${feedback.satisfaction === "Very Satisfied" ? "selected" : ""}>Very Satisfied</option>
        <option ${feedback.satisfaction === "Satisfied" ? "selected" : ""}>Satisfied</option>
        <option ${feedback.satisfaction === "Neutral" ? "selected" : ""}>Neutral</option>
        <option ${feedback.satisfaction === "Dissatisfied" ? "selected" : ""}>Dissatisfied</option>
      </select>
    </div>
    <textarea id="feedbackWorked" class="w-full mt-2 rounded border border-slate-300 p-2 text-xs" placeholder="What worked?">${feedback.whatWorked || ""}</textarea>
    <textarea id="feedbackImprove" class="w-full mt-2 rounded border border-slate-300 p-2 text-xs" placeholder="What could improve?">${feedback.whatImprove || ""}</textarea>
    <div class="flex gap-2 mt-2">
      <button class="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs" data-action="save-feedback">Save Feedback</button>
      <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs" data-action="complete-step" data-step="6">Next</button>
    </div>
  `;
}




const spend = getTotalSpent();
const attendanceTotal = state.eventsBooked.reduce((sum, event) => sum + Number(event.attendance || 0), 0);
const costPerParticipant = attendanceTotal ? spend / attendanceTotal : 0;
const avgSat = (() => {
  const rows = state.eventsBooked.filter((event) => event.feedback?.starRating);
  if (!rows.length) return 0;
  return rows.reduce((sum, event) => sum + Number(event.feedback.starRating || 0), 0) / rows.length;
})();
return `
  <p class="text-sm text-slate-600 mb-2">ROI anchor metrics for the program.</p>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
    <div class="rounded border border-slate-200 p-2">Total spend<br/><strong>${fmtMoney(spend)}</strong></div>
    <div class="rounded border border-slate-200 p-2">Cost/participant<br/><strong>${fmtMoney(costPerParticipant)}</strong></div>
    <div class="rounded border border-slate-200 p-2">Participation<br/><strong>${attendanceTotal}</strong></div>
    <div class="rounded border border-slate-200 p-2">Avg satisfaction<br/><strong>${avgSat.toFixed(1)}/5</strong></div>
  </div>
  <button class="rounded-lg border border-slate-300 px-3 py-2 text-xs mt-2" data-action="complete-step" data-step="7">Mark Program Review Complete</button>
`;
}




function renderImpact() {
const spend = getTotalSpent();
const attendance = state.eventsBooked.reduce((sum, event) => sum + Number(event.attendance || 0), 0);
const avgParticipation = state.eventsBooked.length ? (attendance / state.eventsBooked.reduce((sum, event) => sum + Math.max(event.rsvps || 0, 1), 0)) * 100 : 0;
const avgSatRows = state.eventsBooked.filter((event) => event.feedback?.starRating);
const avgSat = avgSatRows.length ? avgSatRows.reduce((sum, event) => sum + Number(event.feedback.starRating), 0) / avgSatRows.length : 0;
const cpp = attendance ? spend / attendance : 0;




$("impactSpend").textContent = fmtMoney(spend);
$("impactParticipation").textContent = `${avgParticipation.toFixed(0)}%`;
$("impactSatisfaction").textContent = `${avgSat.toFixed(1)}/5`;
$("impactCostPerParticipant").textContent = fmtMoney(cpp);
}




function renderBrowserPanel() {
const panel = $("browserPanel");
const tabs = $("browserTabs");
const host = $("browserHost");
const placeholder = $("browserPlaceholder");




if (!isElectron() || !state.browserTabs.length) {
  panel.classList.add("hidden");
  if (host.querySelector("webview")) {
    host.querySelector("webview").remove();
  }
  return;
}




panel.classList.remove("hidden");
tabs.innerHTML = state.browserTabs
  .map((tab) => `
    <button class="tab-chip ${state.activeBrowserTabId === tab.id ? "tab-chip-active" : ""}" data-action="switch-browser-tab" data-tab-id="${tab.id}">${tab.title}</button>
    <button class="tab-close" data-action="close-browser-tab" data-tab-id="${tab.id}">×</button>
  `)
  .join("");




const activeTab = state.browserTabs.find((tab) => tab.id === state.activeBrowserTabId) || state.browserTabs[0];
if (!activeTab) return;
state.activeBrowserTabId = activeTab.id;




if (placeholder) {
  placeholder.remove();
}
const existing = host.querySelector("webview");
if (existing) {
  existing.remove();
}




const webview = document.createElement("webview");
webview.src = activeTab.url;
webview.style.width = "100%";
webview.style.height = "100%";
host.appendChild(webview);
}




function saveProgramSetupFromInputs() {
state.companyName = $("companyName").value.trim();
state.adminName = $("adminName").value.trim();
state.programSettings.budgetMode = $("budgetMode").value;
state.programSettings.cadence = $("cadence").value;
state.programSettings.totalBudget = Number($("totalBudget").value || 0);
state.programSettings.perEmployeeBudget = Number($("perEmployeeBudget").value || 0);
state.programSettings.employeeCount = Number($("employeeCount").value || 0);
state.setupCompleted = true;
persistState();
renderAll();
}




function saveBookedEvent() {
const winnerInput = document.querySelector("input[name='winnerEvent']:checked");
if (!winnerInput) {
  alert("Select a winning event first.");
  return;
}




const winner = state.eventsRecommended.find((event) => event.id === winnerInput.value) || getSelectedEvents().find((event) => event.id === winnerInput.value);
if (!winner) {
  alert("Winning event not found.");
  return;
}




const totalCost = Number($("bookCost")?.value || winner.cost_per_person * Number(state.programSettings.employeeCount || 0));
const booked = {
  id: uid(),
  event_master_id: winner.id,
  name: winner.name,
  url: winner.url,
  date: $("bookDate")?.value || "",
  time: $("bookTime")?.value || "",
  totalCost,
  rsvps: Number($("bookRsvps")?.value || 0),
  notes: $("bookNotes")?.value || "",
  status: "upcoming",
  attendance: 0,
  workflow: clone(getWorkflowState()),
  feedback: null
};




state.eventsBooked.unshift(booked);
state.activeEventId = booked.id;
state.workflowStates[booked.id] = clone(getWorkflowState());




state.budgetTransactions.unshift({
  id: uid(),
  eventId: booked.id,
  amount: totalCost,
  description: `Booked: ${booked.name}`,
  occurredAt: new Date().toISOString()
});




completeStep(3);
}




function saveAttendance() {
const active = getActiveEvent();
if (!active) {
  alert("Book an event first.");
  return;
}
active.attendance = Number($("attendanceInput")?.value || 0);
persistState();
renderAll();
}




function saveFeedback() {
const active = getActiveEvent();
if (!active) {
  alert("Book an event first.");
  return;
}




active.feedback = {
  starRating: Number($("feedbackStars")?.value || 0),
  satisfaction: $("feedbackSatisfaction")?.value || "",
  whatWorked: $("feedbackWorked")?.value || "",
  whatImprove: $("feedbackImprove")?.value || ""
};




persistState();
renderAll();
}




async function copyText(text, statusId) {
try {
  await navigator.clipboard.writeText(text);
  if (statusId && $(statusId)) {
    $(statusId).textContent = "Copied to clipboard.";
    setTimeout(() => {
      if ($(statusId)) {
        $(statusId).textContent = "";
      }
    }, 2200);
  }
} catch {
  alert("Copy failed.");
}
}




function handleWorkflowAction(event) {
const actionTarget = event.target.closest("[data-action]");
if (!actionTarget) return;




const action = actionTarget.dataset.action;




if (action === "generate-recommendations") {
  state.eventsRecommended = generateRecommendations(state.programSettings);
  if (!state.eventsSelected.length) {
    state.eventsSelected = [];
  }
  persistState();
  renderAll();
  return;
}




if (action === "toggle-select-event") {
  const eventId = actionTarget.dataset.eventId;
  if (state.eventsSelected.includes(eventId)) {
    state.eventsSelected = state.eventsSelected.filter((id) => id !== eventId);
  } else if (state.eventsSelected.length < 3) {
    state.eventsSelected.push(eventId);
  }
  persistState();
  renderAll();
  return;
}




if (action === "copy-poll") {
  copyText($("pollText")?.textContent || "", "copyPollStatus");
  return;
}




if (action === "skip-poll") {
  setWorkflowStep(3);
  persistState();
  renderAll();
  return;
}




if (action === "open-vendor") {
  const eventId = actionTarget.dataset.eventId;
  const selectedEvent = state.eventsRecommended.find((eventItem) => eventItem.id === eventId);
  if (selectedEvent) {
    openVendorUrl(selectedEvent.url, selectedEvent.name);
  }
  return;
}




if (action === "save-booked-event") {
  saveBookedEvent();
  return;
}




if (action === "copy-master-promo") {
  copyText($("promotionMaster")?.value || "");
  return;
}




if (action === "open-slack") {
  openSlack();
  return;
}




if (action === "open-gmail") {
  openVendorUrl("https://mail.google.com/", "Gmail");
  return;
}




if (action === "open-calendar") {
  openVendorUrl("https://calendar.google.com/", "Google Calendar");
  return;
}




if (action === "save-attendance") {
  saveAttendance();
  return;
}




if (action === "save-feedback") {
  saveFeedback();
  return;
}




if (action === "switch-browser-tab") {
  state.activeBrowserTabId = actionTarget.dataset.tabId;
  renderBrowserPanel();
  persistState();
  return;
}




if (action === "close-browser-tab") {
  const tabId = actionTarget.dataset.tabId;
  state.browserTabs = state.browserTabs.filter((tab) => tab.id !== tabId);
  if (state.activeBrowserTabId === tabId) {
    state.activeBrowserTabId = state.browserTabs[0]?.id || null;
  }
  renderBrowserPanel();
  persistState();
  return;
}




if (action === "complete-step") {
  const step = Number(actionTarget.dataset.step || 0);
  if (step === 1 && state.eventsSelected.length !== 3) {
    alert("Select exactly 3 events before advancing.");
    return;
  }
  if (step > 0) {
    completeStep(step);
  }
}
}




function renderAll() {
renderProgramSetupForm();
renderSidebar();
renderWorkflowStepper();
renderImpact();
renderBrowserPanel();




const active = getActiveEvent();
if (active && state.workflowStates[active.id]) {
  active.workflow = clone(state.workflowStates[active.id]);
}
}




function showLanding() {
$("landingView").classList.remove("hidden");
$("appView").classList.add("hidden");
renderLandingIdentityView();
renderAppIdentityView();
}




function showApp() {
$("landingView").classList.add("hidden");
$("appView").classList.remove("hidden");
renderLandingIdentityView();
renderAppIdentityView();
}

let authRequestBusy = false;

async function hydrateCloudStateForSession(companyIdFromSession = "") {
  const sessionCompanyId = String(companyIdFromSession || getAuthCompanyId() || "").trim();
  if (sessionCompanyId) {
    state.accountId = sessionCompanyId;
  }

  loadLocalState(sessionCompanyId || "anon", { strictAccount: Boolean(sessionCompanyId) });

  const token = getAuthToken();
  if (!token) return;

  const cloudResponse = await fetchCloudState();
  const responseRoot = (cloudResponse?.data && typeof cloudResponse.data === "object")
    ? cloudResponse.data
    : cloudResponse;
  const cloudCompanyId = String(responseRoot?.companyId || sessionCompanyId || "").trim();
  const cloudStateBlob = responseRoot?.stateBlob && typeof responseRoot.stateBlob === "object"
    ? responseRoot.stateBlob
    : null;

  if (cloudCompanyId) {
    state.accountId = cloudCompanyId;
    localStorage.setItem(AUTH_COMPANY_ID_KEY, cloudCompanyId);
  }

  if (cloudStateBlob) {
    const mergedState = mergeServerStateIntoLocal(clone(state), cloudStateBlob, "");
    Object.keys(state).forEach((key) => {
      delete state[key];
    });
    Object.assign(state, mergedState);
  }

  isHydratingCloudState = true;
  try {
    persistState();
  } finally {
    isHydratingCloudState = false;
  }
}

function bindAuthGateActions() {
  const signupButton = $("authCreateAccount");
  const signinButton = $("authSignIn");
  const saveProgressAction = $("saveProgressAction");
  const createAccountAction = $("createAccountAction");
  const signInAction = $("signInAction");
  const closeButton = $("authGateClose");
  const continueWithoutSavingButton = $("authContinueWithoutSaving");
  if (!signupButton || signupButton.dataset.bound === "true") return;

  const handleSaveProgress = async () => {
    const token = getAuthToken();
    if (!token) {
      openAuthGateWithContext("save");
      return;
    }
    try {
      await saveCloudState(clone(state));
      showMiniToast("Progress saved");
    } catch (error) {
      showMiniToast(String(error?.message || "Couldn’t save progress.").trim());
    }
  };

  if (saveProgressAction) {
    saveProgressAction.onclick = handleSaveProgress;
  }
  if (createAccountAction) {
    createAccountAction.onclick = () => openAuthGateWithContext("signup");
  }
  if (signInAction) {
    signInAction.onclick = () => openAuthGateWithContext("signin");
  }
  if (closeButton) {
    closeButton.onclick = () => {
      hideAuthGate();
      clearPendingPostAuthAction();
    };
  }
  if (continueWithoutSavingButton) {
    continueWithoutSavingButton.onclick = () => {
      hideAuthGate();
      runPendingPostAuthAction();
    };
  }

  const runAuth = async (mode) => {
    if (authRequestBusy) return;
    const email = String($("authEmail")?.value || "").trim();
    const password = String($("authPassword")?.value || "").trim();
    const companyName = String($("authCompanyName")?.value || "").trim();

    if (!email || !password) {
      setAuthStatus("Enter email and password.", true);
      return;
    }
    if (mode === "signup" && !companyName) {
      setAuthStatus("Enter company name to create account.", true);
      return;
    }

    authRequestBusy = true;
    signupButton.disabled = true;
    signinButton.disabled = true;
    setAuthStatus(mode === "signup" ? "Creating account..." : "Signing in...");

    try {
      const response = mode === "signup"
        ? await authSignup(email, password, companyName)
        : await authLogin(email, password);
      const root = (response?.data && typeof response.data === "object") ? response.data : response;
      const token = String(root?.token || "").trim();
      const companyId = String(root?.companyId || "").trim();
      if (!token || !companyId) {
        throw new Error("Auth service returned an unexpected response.");
      }

      setAuthSession(token, companyId);
      state.accountId = companyId;
      if (companyName) {
        state.companyName = companyName;
      }
      await hydrateCloudStateForSession(companyId);
      hideAuthGate();
      showLanding();
      renderAll();
      setAuthStatus("");
      if (mode === "signup") {
        await saveCloudState(clone(state));
        showMiniToast("Account created — progress saved.");
      } else {
        await saveCloudState(clone(state));
        showMiniToast("Signed in successfully.");
      }
      runPendingPostAuthAction();
    } catch (error) {
      clearAuthSession();
      setAuthStatus(String(error?.message || "Couldn’t sign in.").trim(), true);
      showAuthGate();
    } finally {
      authRequestBusy = false;
      signupButton.disabled = false;
      signinButton.disabled = false;
    }
  };

  signupButton.onclick = () => runAuth("signup");
  signinButton.onclick = () => runAuth("login");
  signupButton.dataset.bound = "true";
  signinButton.dataset.bound = "true";
}




async function sendMagicLink() {
const email = $("authEmail").value.trim();
if (!email) {
  $("authStatus").textContent = "Enter an email address.";
  return;
}
if (!supabaseClient) {
  $("authStatus").textContent = "Supabase is not configured. Add config.js first.";
  return;
}




const redirectTo = window.location.href.split("#")[0];
const { error } = await supabaseClient.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: redirectTo
  }
});




$("authStatus").textContent = error ? error.message : "Check your inbox for the sign-in link.";
}

function captureCriticalSidebarStateSnapshot() {
  return {
    accountId: state.accountId || null,
    eventsBooked: Array.isArray(state.eventsBooked) ? clone(state.eventsBooked) : [],
    budgetTransactions: Array.isArray(state.budgetTransactions) ? clone(state.budgetTransactions) : [],
    bookingConfirmation: state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
      ? clone(state.pollBuilder.bookingConfirmation)
      : null,
    programSettings: state.programSettings && typeof state.programSettings === "object"
      ? clone(state.programSettings)
      : null
  };
}

function hasCriticalSidebarStateData(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  const eventsCount = Array.isArray(snapshot.eventsBooked) ? snapshot.eventsBooked.length : 0;
  const txCount = Array.isArray(snapshot.budgetTransactions) ? snapshot.budgetTransactions.length : 0;
  const hasBooking = Boolean(snapshot.bookingConfirmation);
  return eventsCount > 0 || txCount > 0 || hasBooking;
}

function restoreCriticalSidebarStateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;
  const snapshotEvents = Array.isArray(snapshot.eventsBooked) ? snapshot.eventsBooked : [];
  const snapshotTransactions = Array.isArray(snapshot.budgetTransactions) ? snapshot.budgetTransactions : [];
  const snapshotBooking = snapshot.bookingConfirmation && typeof snapshot.bookingConfirmation === "object"
    ? snapshot.bookingConfirmation
    : null;
  const snapshotSettings = snapshot.programSettings && typeof snapshot.programSettings === "object"
    ? snapshot.programSettings
    : null;

  if ((!Array.isArray(state.eventsBooked) || state.eventsBooked.length === 0) && snapshotEvents.length > 0) {
    state.eventsBooked = clone(snapshotEvents);
  }
  if ((!Array.isArray(state.budgetTransactions) || state.budgetTransactions.length === 0) && snapshotTransactions.length > 0) {
    state.budgetTransactions = clone(snapshotTransactions);
  }
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") {
    state.pollBuilder = {};
  }
  if (!state.pollBuilder.bookingConfirmation && snapshotBooking) {
    state.pollBuilder.bookingConfirmation = clone(snapshotBooking);
  }

  if (snapshotSettings && typeof state.programSettings === "object") {
    const currentTotal = Number(state.programSettings.totalBudget || 0);
    const snapshotTotal = Number(snapshotSettings.totalBudget || 0);
    if (currentTotal <= 0 && snapshotTotal > 0) {
      state.programSettings = { ...state.programSettings, ...snapshotSettings };
    }
  }
}

function setSidebarHydrationLoading(next) {
  isSidebarHydrating = Boolean(next);
}




async function handleAuthState() {
if (!supabaseClient) return;
const { data } = await supabaseClient.auth.getSession();
const sessionUser = data?.session?.user || null;
if (!sessionUser) {
  showLanding();
  return;
}




setSidebarHydrationLoading(true);
try {
  const preResolvedSnapshot = captureCriticalSidebarStateSnapshot();
  state.user = { id: sessionUser.id, email: sessionUser.email };
  await ensureAccountForUser(sessionUser);
  loadLocalState(state.accountId, { strictAccount: true });
  const accountScopedSnapshot = captureCriticalSidebarStateSnapshot();
  const preAuthSnapshot = hasCriticalSidebarStateData(accountScopedSnapshot)
    ? accountScopedSnapshot
    : preResolvedSnapshot;
  await loadStateFromSupabase();
  const isPostLoadBookedEmpty = !Array.isArray(state.eventsBooked) || state.eventsBooked.length === 0;
  const isPostLoadBudgetEmpty = !Array.isArray(state.budgetTransactions) || state.budgetTransactions.length === 0;
  if (isPostLoadBookedEmpty && isPostLoadBudgetEmpty && hasCriticalSidebarStateData(preAuthSnapshot)) {
    restoreCriticalSidebarStateSnapshot(preAuthSnapshot);
  }
  persistState();
  showApp();
  renderAll();
} finally {
  setSidebarHydrationLoading(false);
  renderSidebar();
}




supabaseClient.auth.onAuthStateChange(async (_event, session) => {
  if (!session?.user) {
    state.user = null;
    state.accountId = null;
    showLanding();
    return;
  }
  setSidebarHydrationLoading(true);
  try {
    const preResolvedSnapshot = captureCriticalSidebarStateSnapshot();
    state.user = { id: session.user.id, email: session.user.email };
    await ensureAccountForUser(session.user);
    loadLocalState(state.accountId, { strictAccount: true });
    const accountScopedSnapshot = captureCriticalSidebarStateSnapshot();
    const authChangeSnapshot = hasCriticalSidebarStateData(accountScopedSnapshot)
      ? accountScopedSnapshot
      : preResolvedSnapshot;
    await loadStateFromSupabase();
    const isPostLoadBookedEmpty = !Array.isArray(state.eventsBooked) || state.eventsBooked.length === 0;
    const isPostLoadBudgetEmpty = !Array.isArray(state.budgetTransactions) || state.budgetTransactions.length === 0;
    if (isPostLoadBookedEmpty && isPostLoadBudgetEmpty && hasCriticalSidebarStateData(authChangeSnapshot)) {
      restoreCriticalSidebarStateSnapshot(authChangeSnapshot);
    }
    persistState();
    showApp();
    renderAll();
  } finally {
    setSidebarHydrationLoading(false);
    renderSidebar();
  }
});
}

function showSetupSignUpPopup() {
  const popup = $("setupSignUpPopup");
  if (!popup) return;
  popup.classList.remove("hidden");
  popup.style.display = "flex";
}

function hideSetupSignUpPopup() {
  const popup = $("setupSignUpPopup");
  if (!popup) return;
  popup.classList.add("hidden");
  popup.style.display = "none";
}

function isCompletedStepEditBlocked(stepNum) {
  return state.completedSetupSteps.includes(stepNum) && !state.user && !state.devBypassSetupEditAuth;
}




function initializeLandingSetupFlow() {
  // Check if landing setup flow exists (won't exist if app view is shown)
  if (!$("landingSetupFlow")) return;

  if (state.currentSetupStep !== null && state.currentSetupStep <= 6 && state.completedSetupSteps.includes(state.currentSetupStep)) {
    state.currentSetupStep = null;
  }

  if (!state.setupStepDirty || typeof state.setupStepDirty !== "object") {
    state.setupStepDirty = {};
  }
  [1, 2, 3, 4, 5, 6].forEach((stepNum) => {
    if (state.completedSetupSteps.includes(stepNum)) {
      state.setupStepDirty[stepNum] = false;
    }
  });

  const allCoreSetupComplete = [1,2,3,4,5,6].every(s => state.completedSetupSteps.includes(s));
  if (!allCoreSetupComplete && (state.currentSetupStep === null || state.currentSetupStep > 6)) {
    state.currentSetupStep = 1;
  }
  if (allCoreSetupComplete) {
    state.setupMenuExpanded = false;
    state.sidebarSetupExpanded = false;
    state.sidebarSetupAutoCollapsed = true;
  } else {
    state.setupMenuExpanded = true;
  }
  persistState();
  renderSetupMenuState();
  renderSidebarStepMenus();

  // Populate step 1: Goals
  if (Array.isArray(state.landingDraft.goals) && state.landingDraft.goals.length > 3) {
    state.landingDraft.goals = state.landingDraft.goals.slice(0, 3);
    persistState();
  }
  renderGoalInputs("landingGoalsSetup", state.landingDraft.goals, (goal, inputEl) => {
    if (isCompletedStepEditBlocked(1)) {
      if (inputEl) inputEl.checked = state.landingDraft.goals.includes(goal);
      showSetupSignUpPopup();
      return;
    }
    let changed = false;
    if (state.landingDraft.goals.includes(goal)) {
      state.landingDraft.goals = state.landingDraft.goals.filter(g => g !== goal);
      changed = true;
    } else if (state.landingDraft.goals.length < 3) {
      state.landingDraft.goals.push(goal);
      changed = true;
    } else if (inputEl) {
      inputEl.checked = false;
    }
    if (!changed) return;
    persistState();
    validateAndUpdateStep1();
  });

  // Populate step 3: Cadence
  const cadenceSelect = $("setupCadence");
  if (cadenceSelect) {
    cadenceSelect.innerHTML = CADENCE_OPTIONS.map(opt => 
      `<option value="${opt}" ${state.landingDraft.cadence === opt ? 'selected' : ''}>${opt}</option>`
    ).join('');
    cadenceSelect.addEventListener("change", (e) => {
      if (isCompletedStepEditBlocked(3)) {
        e.target.value = state.landingDraft.cadence;
        showSetupSignUpPopup();
        return;
      }
      state.landingDraft.cadence = e.target.value;
      persistState();
      validateAndUpdateStep3();
    });
  }

  // Populate step 4: Preferred Schedule
  const scheduleContainer = $("setupSchedule");
  if (scheduleContainer) {
    scheduleContainer.innerHTML = SCHEDULE_OPTIONS.map((opt) => {
      const id = `setupSchedule-${opt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      const checked = state.landingDraft.schedule.includes(opt);
      return `
        <label class="schedule-pill">
          <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} />
          <span>${opt}</span>
        </label>
      `;
    }).join('');

    const localCityRow = $("setupLocalCityRow");
    const localCityInput = $("setupLocalCity");
    const localCityTriggers = new Set([
      "In-person (outside the office)",
      "In-office events",
      "Hybrid (mix of remote + in-person)"
    ]);
    const updateLocalCityVisibility = () => {
      if (!localCityRow) return;
      const selected = Array.from(scheduleContainer.querySelectorAll('input:checked')).map(i => i.nextElementSibling.textContent);
      const shouldShow = selected.some(option => localCityTriggers.has(option));
      localCityRow.classList.toggle("hidden", !shouldShow);
    };

    scheduleContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener("change", () => {
        const option = input.nextElementSibling?.textContent;
        if (isCompletedStepEditBlocked(4)) {
          input.checked = state.landingDraft.schedule.includes(option);
          showSetupSignUpPopup();
          return;
        }
        state.landingDraft.schedule = Array.from(scheduleContainer.querySelectorAll('input:checked')).map(i => i.nextElementSibling.textContent);
        updateLocalCityVisibility();
        persistState();
        validateAndUpdateStep4();
      });
    });

    if (localCityInput) {
      localCityInput.addEventListener("input", (e) => {
        if (isCompletedStepEditBlocked(4)) {
          e.target.value = state.landingDraft.localCity || "";
          showSetupSignUpPopup();
          return;
        }
        state.landingDraft.localCity = e.target.value;
        persistState();
        validateAndUpdateStep4();
      });
    }

    updateLocalCityVisibility();
  }

  // Populate step 5: Availability (Days and Times)
  const setupStepContent5 = document.querySelector('.setup-step[data-step="5"] .setup-step-content');
  if (setupStepContent5) {
    const dayCheckboxes = Array.from(setupStepContent5.querySelectorAll('input[type="checkbox"]')).filter(cb => 
      ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].includes(cb.value)
    );
    const timeCheckboxes = Array.from(setupStepContent5.querySelectorAll('input[type="checkbox"]')).filter(cb => 
      ['Before 9a', '12-1p', 'After 5p', 'Weekends'].includes(cb.value)
    );

    // Restore checked state from state
    dayCheckboxes.forEach(cb => {
      if (state.landingDraft.daysSelected.includes(cb.value)) {
        cb.checked = true;
      }
      cb.addEventListener("change", () => {
        if (isCompletedStepEditBlocked(5)) {
          cb.checked = state.landingDraft.daysSelected.includes(cb.value);
          showSetupSignUpPopup();
          return;
        }
        state.landingDraft.daysSelected = dayCheckboxes.filter(c => c.checked).map(c => c.value);
        persistState();
        validateAndUpdateStep5();
      });
    });

    timeCheckboxes.forEach(cb => {
      if (state.landingDraft.timesSelected.includes(cb.value)) {
        cb.checked = true;
      }
      cb.addEventListener("change", () => {
        if (isCompletedStepEditBlocked(5)) {
          cb.checked = state.landingDraft.timesSelected.includes(cb.value);
          showSetupSignUpPopup();
          return;
        }
        state.landingDraft.timesSelected = timeCheckboxes.filter(c => c.checked).map(c => c.value);
        persistState();
        validateAndUpdateStep5();
      });
    });
  }

  // Populate step 6: Interests
  if (Array.isArray(state.landingDraft.teamPreferenceEstimate) && state.landingDraft.teamPreferenceEstimate.length > 3) {
    state.landingDraft.teamPreferenceEstimate = state.landingDraft.teamPreferenceEstimate.slice(0, 3);
    persistState();
  }
  renderInterestInputs("landingInterestsSetup", state.landingDraft.teamPreferenceEstimate || [], (interest, inputEl) => {
    if (isCompletedStepEditBlocked(6)) {
      if (inputEl) inputEl.checked = (state.landingDraft.teamPreferenceEstimate || []).includes(interest);
      showSetupSignUpPopup();
      return;
    }
    if (!Array.isArray(state.landingDraft.teamPreferenceEstimate)) {
      state.landingDraft.teamPreferenceEstimate = [];
    }
    let changed = false;
    if (state.landingDraft.teamPreferenceEstimate.includes(interest)) {
      state.landingDraft.teamPreferenceEstimate = state.landingDraft.teamPreferenceEstimate.filter((item) => item !== interest);
      changed = true;
    } else if (state.landingDraft.teamPreferenceEstimate.length < 3) {
      state.landingDraft.teamPreferenceEstimate.push(interest);
      changed = true;
    } else if (inputEl) {
      inputEl.checked = false;
    }
    if (!changed) return;
    state.programSettings.teamPreferenceEstimate = [...state.landingDraft.teamPreferenceEstimate];
    state.programSettings.admin_preference_weight = state.programSettings.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
    persistState();
    validateAndUpdateStep6();
  });

  // Populate step 2: Budget with auto-calculation
  const totalBudgetInput = $("setupTotalBudget");
  const employeeCountInput = $("setupEmployeeCount");
  const perEmployeeInput = $("setupPerEmployee");
  const budgetGuidanceToggle = $("setupBudgetGuidanceToggle");
  const budgetGuidanceOptions = $("setupBudgetGuidanceOptions");
  
  // Initialize values from state
  if (totalBudgetInput && state.landingDraft.totalBudget) {
    totalBudgetInput.value = state.landingDraft.totalBudget;
  }
  if (employeeCountInput) {
    employeeCountInput.value = "";
  }
  if (perEmployeeInput) {
    perEmployeeInput.value = "";
  }
  
  const saveBudgetState = () => {
    if (isCompletedStepEditBlocked(2)) {
      if (totalBudgetInput) totalBudgetInput.value = state.landingDraft.totalBudget || "";
      if (employeeCountInput) employeeCountInput.value = state.landingDraft.employeeCount || "";
      if (perEmployeeInput) perEmployeeInput.value = state.landingDraft.perEmployee || "";
      showSetupSignUpPopup();
      return;
    }
    const prevTotal = Number(state.landingDraft.totalBudget || 0);
    const prevEmployee = Number(state.landingDraft.employeeCount || 0);
    const prevPerEmployee = Number(state.landingDraft.perEmployee || 0);

    const totalValue = Number(totalBudgetInput?.value || 0);
    const employeeValue = Number(employeeCountInput?.value || 0);
    const perEmployeeValue = Number(perEmployeeInput?.value || 0);
    const computedTotal = totalValue > 0 ? totalValue : Math.round(employeeValue * perEmployeeValue);
    const budgetChanged = computedTotal !== prevTotal || employeeValue !== prevEmployee || perEmployeeValue !== prevPerEmployee;

    state.landingDraft.totalBudget = computedTotal;
    state.landingDraft.employeeCount = employeeValue;
    state.landingDraft.perEmployee = perEmployeeValue;
    state.programSettings.totalBudget = computedTotal;
    state.programSettings.employeeCount = employeeValue;
    state.programSettings.perEmployeeBudget = perEmployeeValue;
    state.programSettings.budgetMode = "total";

    if (totalBudgetInput && computedTotal > 0) {
      totalBudgetInput.value = String(computedTotal);
    }
    persistState();
    renderSidebar();
    if ($("budgetTotalLabel")) $("budgetTotalLabel").textContent = `Total: ${fmtMoney(computedTotal)}`;
    if ($("budgetSpentLabel")) $("budgetSpentLabel").textContent = `Spent: ${fmtMoney(getTotalSpent())}`;
    if ($("budgetRemainingLabel")) $("budgetRemainingLabel").textContent = `Remaining: ${fmtMoney(computedTotal - getTotalSpent())}`;
    validateAndUpdateStep2(budgetChanged);
  };
  
  const handleBudgetCalculation = (sourceField) => {
    let totalBudget = Number(totalBudgetInput?.value || 0);
    let employeeCount = Number(employeeCountInput?.value || 0);
    let perEmployee = Number(perEmployeeInput?.value || 0);
    
    // Prevent negative numbers
    if (totalBudget < 0) {
      totalBudgetInput.value = 0;
      totalBudget = 0;
    }
    if (employeeCount < 0) {
      employeeCountInput.value = 0;
      employeeCount = 0;
    }
    if (perEmployee < 0) {
      perEmployeeInput.value = 0;
      perEmployee = 0;
    }
    
    // Auto-calculate based on which field just changed
    if (sourceField === "totalBudget" && employeeCount > 0) {
      // User edited total budget and employees exist → calculate per-employee
      const calculated = employeeCount > 0 ? Math.round((totalBudget / employeeCount) * 100) / 100 : 0;
      perEmployeeInput.value = calculated;
    } else if ((sourceField === "employeeCount" || sourceField === "perEmployee") && employeeCount > 0 && perEmployee > 0) {
      // User edited employees or per-employee and both have values → calculate total
      const calculated = Math.round(employeeCount * perEmployee);
      totalBudgetInput.value = calculated;
    }
    
    saveBudgetState();
  };
  
  // Event listeners
  if (totalBudgetInput) {
    totalBudgetInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBudgetCalculation("totalBudget");
        totalBudgetInput.blur();
      }
    });
    
    totalBudgetInput.addEventListener("blur", () => {
      handleBudgetCalculation("totalBudget");
    });
    
    totalBudgetInput.addEventListener("input", (e) => {
      if (Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      validateAndUpdateStep2(true);
      saveBudgetState();
    });
  }
  
  if (employeeCountInput) {
    employeeCountInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBudgetCalculation("employeeCount");
        employeeCountInput.blur();
      }
    });
    
    employeeCountInput.addEventListener("blur", () => {
      handleBudgetCalculation("employeeCount");
    });
    
    employeeCountInput.addEventListener("input", (e) => {
      if (Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      validateAndUpdateStep2(true);
      saveBudgetState();
    });
  }
  
  if (perEmployeeInput) {
    perEmployeeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleBudgetCalculation("perEmployee");
        perEmployeeInput.blur();
      }
    });
    
    perEmployeeInput.addEventListener("blur", () => {
      handleBudgetCalculation("perEmployee");
    });
    
    perEmployeeInput.addEventListener("input", (e) => {
      if (Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      validateAndUpdateStep2(true);
      saveBudgetState();
    });
  }

  if (budgetGuidanceToggle && budgetGuidanceOptions) {
    budgetGuidanceToggle.addEventListener("click", () => {
      if (isCompletedStepEditBlocked(2)) {
        showSetupSignUpPopup();
        return;
      }
      budgetGuidanceOptions.classList.toggle("hidden");
    });

    budgetGuidanceOptions.querySelectorAll(".setup-budget-guidance-option").forEach((optionBtn) => {
      optionBtn.addEventListener("click", () => {
        if (isCompletedStepEditBlocked(2)) {
          showSetupSignUpPopup();
          return;
        }
        const value = Number(optionBtn.dataset.value || 0);
        if (perEmployeeInput) {
          perEmployeeInput.value = value > 0 ? String(value) : "";
          handleBudgetCalculation("perEmployee");
        }
        budgetGuidanceOptions.classList.add("hidden");
      });
    });
  }

  // Populate step 6: Survey questions
  const surveyContainer = $("setupSurvey");
  if (surveyContainer) {
    surveyContainer.innerHTML = SURVEY_QUESTIONS.map((q, idx) => {
      const id = `setupSurvey-${idx}`;
      return `
        <div>
          <label class="block text-xs font-medium mb-1">${q}</label>
          <select id="${id}" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs">
            <option value="">Select...</option>
            ${SURVEY_CHOICES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      `;
    }).join('');
    
    surveyContainer.querySelectorAll('select').forEach((select, idx) => {
      select.addEventListener("change", (e) => {
        if (!state.landingDraft.surveyAnswers) state.landingDraft.surveyAnswers = {};
        state.landingDraft.surveyAnswers[idx] = e.target.value;
        persistState();
      });
    });
  }

  // Attach handlers to step headers and next buttons
  attachSetupStepHandlers();
  renderSetupStepStates();
}




function attachSetupStepHandlers() {
  document.querySelectorAll(".setup-step-header").forEach(header => {
    header.onclick = () => {
      const step = header.closest(".setup-step").dataset.step;
      const stepNum = parseInt(step);
      const isSetupStep = stepNum >= 1 && stepNum <= 6;
      const isEventWorkflowStep = stepNum >= 7 && stepNum <= 13;

      if (isSetupStep) {
        if (stepNum === state.currentSetupStep) {
          state.currentSetupStep = null;
        } else {
          state.currentSetupStep = stepNum;
        }
        persistState();
        renderSetupMenuState();
        renderSetupStepStates();
        renderSidebarStepMenus();
        return;
      }

      // Event workflow steps: toggle open/closed for any visible step
      if (isEventWorkflowStep && stepNum === state.currentSetupStep) {
        state.currentSetupStep = null;
        persistState();
        renderSetupMenuState();
        renderSetupStepStates();
        renderSidebarStepMenus();
        return;
      }

      if (isEventWorkflowStep) {
        collapseSetupViewsForWorkflowStep();
        state.currentSetupStep = stepNum;
        persistState();
        renderSetupMenuState();
        renderSetupStepStates();
        renderSidebarStepMenus();
      }
    };
  });

  document.querySelectorAll(".setup-step-next").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step);
      const isCompletedStep = state.completedSetupSteps.includes(step);
      const isSaveAction = step <= 6 && isCompletedStep;
      
      // Validate step before allowing advance
      if (!isSetupStepValid(step)) {
        return;
      }

      // Completed setup steps use Save behavior instead of advancing
      if (isSaveAction) {
        if (isCompletedStepEditBlocked(step)) {
          showSetupSignUpPopup();
          return;
        }

        if (!state.setupStepDirty || typeof state.setupStepDirty !== "object") {
          state.setupStepDirty = {};
        }
        state.setupStepDirty[step] = false;

        // Rebuild recommendations from updated setup answers
        if (state.setupEventsGenerated || state.completedSetupSteps.includes(6)) {
          generateRecommendedEvents();
        }

        // Collapse the edited step after save
        state.currentSetupStep = null;
        persistState();
        renderSetupStepStates();
        renderSidebarStepMenus();
        updateSetupStepButtonStates();
        return;
      }

      if (step === 7) {
        if (state.setupShortlistMode === "book") {
          const bookTarget = getSelectedShortlistBookTarget();
          if (bookTarget && Number.isInteger(bookTarget.index)) {
            state.setupBookSelectedEventIndex = bookTarget.index;
          }
        } else {
          const totalCards = getShortlistCards().length;
          const domSelection = normalizePollSelection(getShortlistSelectedIndexes(), totalCards);
          const persistedSelection = normalizePollSelection(
            Array.isArray(state.setupPollSelectedEventIndexes) ? state.setupPollSelectedEventIndexes : [],
            totalCards
          );
          const effectiveSelection = domSelection.length ? domSelection : persistedSelection;
          state.setupShortlistMode = "poll";
          state.setupPollSelectedEventIndexes = effectiveSelection;
          resetPollBuilderDraftFields();
          collapseSetupViewsForWorkflowStep();
        }
      }
      
      // Mark current step as completed
      if (!state.completedSetupSteps.includes(step)) {
        state.completedSetupSteps.push(step);
      }
      if (!state.setupStepDirty || typeof state.setupStepDirty !== "object") {
        state.setupStepDirty = {};
      }
      state.setupStepDirty[step] = false;

      if (step === 6) {
        state.programSettings.teamPreferenceEstimate = Array.isArray(state.landingDraft.teamPreferenceEstimate)
          ? [...state.landingDraft.teamPreferenceEstimate]
          : [];
        state.programSettings.admin_preference_weight = state.programSettings.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
      }
      
      // Generate recommended events when advancing from final setup step
      if (step === 6) {
        generateRecommendedEvents();
        // One-time auto-collapse after final setup step is completed
        if (!state.sidebarSetupAutoCollapsed) {
          state.sidebarSetupExpanded = false;
          state.sidebarSetupAutoCollapsed = true;
          persistState();
        }
      }
      
      // Advance to next step if exists (book mode intentionally skips poll step and jumps to Book Event)
      if (step < 13 && !(step === 7 && state.setupShortlistMode === "book")) {
        state.currentSetupStep = step + 1;
      }

      if (step === 7 && state.setupShortlistMode === "book") {
        const bookTarget = getSelectedShortlistBookTarget();
        if (bookTarget?.url) {
          openVendorUrl(bookTarget.url, bookTarget.title);
        }
        state.completedSetupSteps = state.completedSetupSteps.filter((completedStep) => completedStep < 9);
        if (!state.completedSetupSteps.includes(8)) {
          state.completedSetupSteps.push(8);
        }
        collapseSetupViewsForWorkflowStep();
        state.currentSetupStep = 9;
        state.eventWorkflowProcessStep = 9;
      } else if (step >= 7) {
        state.eventWorkflowProcessStep = Math.min(step + 1, 13);
      }
      
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      updateSetupStepButtonStates();
    });
  });
  
  // Update button state whenever inputs change
  updateSetupStepButtonStates();
}

function isSetupStepValid(step) {
  switch (step) {
    case 1: // Set Program Goals
      return state.landingDraft.goals.length >= 1 && state.landingDraft.goals.length <= 3;
    
    case 2: // Budget
      const totalBudget = Number(state.landingDraft.totalBudget || 0);
      const employees = Number(state.landingDraft.employeeCount || 0);
      const perEmp = Number(state.landingDraft.perEmployee || 0);
      // Valid if: total budget entered OR (employees AND per-employee entered)
      return totalBudget > 0 || (employees > 0 && perEmp > 0);
    
    case 3: // Cadence
      return state.landingDraft.cadence && state.landingDraft.cadence.length > 0;
    
    case 4: // Setting
      if (!state.landingDraft.schedule || state.landingDraft.schedule.length === 0) {
        return false;
      }
      // Check if city sub-question should be shown and if it's filled
      const cityTriggers = new Set([
        "In-person (outside the office)",
        "In-office events",
        "Hybrid (mix of remote + in-person)"
      ]);
      const shouldShowCity = state.landingDraft.schedule.some(option => cityTriggers.has(option));
      if (shouldShowCity) {
        const city = (state.landingDraft.localCity || "").trim();
        return city.length > 0;
      }
      return true;
    
    case 5: // Availability
      if (!state.landingDraft.daysSelected || state.landingDraft.daysSelected.length === 0) {
        return false;
      }
      if (!state.landingDraft.timesSelected || state.landingDraft.timesSelected.length === 0) {
        return false;
      }
      return true;

    case 6: // Interests
      return Array.isArray(state.landingDraft.teamPreferenceEstimate)
        && state.landingDraft.teamPreferenceEstimate.length >= 1
        && state.landingDraft.teamPreferenceEstimate.length <= 3;

    case 7: { // Events shortlist -> Poll
      if (state.setupShortlistMode === "book") {
        const domSelection = getShortlistSelectedIndexes();
        return Number.isInteger(state.setupBookSelectedEventIndex) || domSelection.length === 1;
      }
      const totalCards = getShortlistCards().length;
      const domSelection = normalizePollSelection(getShortlistSelectedIndexes(), totalCards);
      const persistedSelection = normalizePollSelection(
        Array.isArray(state.setupPollSelectedEventIndexes) ? state.setupPollSelectedEventIndexes : [],
        totalCards
      );
      const effectiveSelection = domSelection.length ? domSelection : persistedSelection;
      const pollSelectionCount = effectiveSelection.length;
      return pollSelectionCount >= 2 && pollSelectionCount <= 3;
    }
    
    default:
      return true;
  }
}

function updateSetupStepButtonStates() {
  document.querySelectorAll(".setup-step-next").forEach(btn => {
    const step = parseInt(btn.dataset.step);
    const isValid = isSetupStepValid(step);
    const isCompleted = state.completedSetupSteps.includes(step);
    const isDirty = !!(state.setupStepDirty && state.setupStepDirty[step]);
    const canAdvance = isValid && (!isCompleted || isDirty);

    if (!btn.dataset.defaultLabel) {
      btn.dataset.defaultLabel = btn.textContent.trim();
    }
    if (step <= 6 && isCompleted) {
      btn.textContent = "Save";
    } else if (step === 6) {
      btn.textContent = "Submit";
    } else if (step === 7) {
      btn.textContent = state.setupShortlistMode === "book"
        ? "Book this event ↗"
        : "Let your team choose — Generate poll";
    } else {
      btn.textContent = btn.dataset.defaultLabel;
    }

    if (canAdvance) {
      btn.classList.remove("opacity-50", "cursor-not-allowed", "bg-slate-300", "text-slate-600", "hover:bg-slate-300");
      btn.classList.add("bg-slate-800", "text-white", "hover:bg-slate-700");
      btn.disabled = false;
    } else {
      btn.classList.add("opacity-50", "cursor-not-allowed", "bg-slate-300", "text-slate-600", "hover:bg-slate-300");
      btn.classList.remove("bg-slate-800", "text-white", "hover:bg-slate-700");
      btn.disabled = true;
    }
  });
}

let setupEditPersistTimeout;
function persistSetupEditsDebounced() {
  if (setupEditPersistTimeout) {
    clearTimeout(setupEditPersistTimeout);
  }
  setupEditPersistTimeout = setTimeout(() => {
    persistState();
  }, 300);
}

function validateAndUpdateStep1() {
  // Step 1: Goal selections change
  state.setupStepDirty = state.setupStepDirty || {};
  state.setupStepDirty[1] = true;
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}

function validateAndUpdateStep2(markDirty = true) {
  // Step 2: Budget inputs change
  state.setupStepDirty = state.setupStepDirty || {};
  if (markDirty) {
    state.setupStepDirty[2] = true;
  }
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}

function validateAndUpdateStep3() {
  // Step 3: Cadence changes
  state.setupStepDirty = state.setupStepDirty || {};
  state.setupStepDirty[3] = true;
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}

function validateAndUpdateStep4() {
  // Step 4: Schedule or city changes
  state.setupStepDirty = state.setupStepDirty || {};
  state.setupStepDirty[4] = true;
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}

function validateAndUpdateStep5() {
  // Step 5: Days or times change
  state.setupStepDirty = state.setupStepDirty || {};
  state.setupStepDirty[5] = true;
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}

function validateAndUpdateStep6() {
  // Step 6: Interests change
  state.setupStepDirty = state.setupStepDirty || {};
  state.setupStepDirty[6] = true;
  persistSetupEditsDebounced();
  updateSetupStepButtonStates();
}




function toggleSetupStep(stepNum) {
  const allPriorStepsCompleted = Array.from({length: stepNum - 1}, (_, i) => i + 1).every(s => state.completedSetupSteps.includes(s));
  if (stepNum !== state.currentSetupStep && !state.completedSetupSteps.includes(stepNum) && !allPriorStepsCompleted) return;
  state.currentSetupStep = stepNum;
  persistState();
  renderSetupStepStates();
  renderSidebarStepMenus();
}

function collapseSetupViewsForWorkflowStep() {
  state.sidebarSetupExpanded = false;
  state.setupMenuExpanded = false;
  state.sidebarSetupAutoCollapsed = true;
}

function reorderMainSetupCards() {
  const setupContainer = document.getElementById("setupStepsContainer");
  const workflowHeading = document.getElementById("eventWorkflowHeadingMain");
  if (!setupContainer || !workflowHeading) return;

  const orderedSteps = [1, 2, 3, 4, 5, 6];
  orderedSteps.forEach((stepNum) => {
    const stepEl = setupContainer.querySelector(`.setup-step[data-step="${stepNum}"]`);
    if (stepEl) {
      setupContainer.insertBefore(stepEl, workflowHeading);
    }
  });
}




function renderSetupStepStates() {
  reorderMainSetupCards();
  const allCoreSetupComplete = [1,2,3,4,5,6].every(s => state.completedSetupSteps.includes(s));
  const setupProcessCurrentStep = (() => {
    for (let step = 1; step <= 6; step += 1) {
      if (!state.completedSetupSteps.includes(step)) return step;
    }
    return null;
  })();
  const eventWorkflowProcessCurrentStep = getEventWorkflowProcessStep();
  const runEventVisible = canShowRunEventStep();
  const expandMainSetupAll = allCoreSetupComplete && Boolean(state.mainSetupExpandAll);
  const collapseMainSetupCards = allCoreSetupComplete && !state.sidebarSetupExpanded && !expandMainSetupAll;
  const setupHeadingMain = document.getElementById("setupHeadingMain");
  const setupHeadingMainLabel = document.getElementById("setupHeadingMainLabel");
  const setupHeadingMainEdit = document.getElementById("setupHeadingMainEdit");
  const eventWorkflowHeadingMain = document.getElementById("eventWorkflowHeadingMain");
  const eventWorkflowHeadingMainLabel = document.getElementById("eventWorkflowHeadingMainLabel");
  const setupSectionActive = !collapseMainSetupCards;
  const eventWorkflowSectionActive = allCoreSetupComplete && !setupSectionActive;

  if (setupHeadingMainLabel) {
    setupHeadingMainLabel.textContent = setupSectionActive ? "Setup" : "SETUP";
  }

  if (setupHeadingMainEdit) {
    const setupExpanded = allCoreSetupComplete ? setupSectionActive : true;
    setupHeadingMainEdit.style.display = allCoreSetupComplete ? "inline" : "none";
    setupHeadingMainEdit.textContent = setupExpanded ? "Hide" : "Edit";
    setupHeadingMainEdit.style.color = setupExpanded ? "#475569" : "#94a3b8";
  }

  if (eventWorkflowHeadingMainLabel) {
    eventWorkflowHeadingMainLabel.textContent = eventWorkflowSectionActive ? "Event Workflow" : "EVENT WORKFLOW";
  }

  if (setupHeadingMain) {
    if (collapseMainSetupCards) {
      setupHeadingMain.style.fontSize = "0.875rem";
      setupHeadingMain.style.color = "#94a3b8";
      setupHeadingMain.style.fontWeight = "500";
      setupHeadingMain.style.fontFamily = "Inter, Helvetica, Arial, sans-serif";
      setupHeadingMain.style.lineHeight = "1.25rem";
      setupHeadingMain.style.textTransform = "uppercase";
    } else {
      setupHeadingMain.style.fontSize = "1.5rem";
      setupHeadingMain.style.color = "#0f172a";
      setupHeadingMain.style.fontWeight = "600";
      setupHeadingMain.style.fontFamily = "Inter, Helvetica, Arial, sans-serif";
      setupHeadingMain.style.lineHeight = "2rem";
      setupHeadingMain.style.textTransform = "none";
    }
  }

  if (eventWorkflowHeadingMain) {
    eventWorkflowHeadingMain.style.display = allCoreSetupComplete ? "block" : "none";
    eventWorkflowHeadingMain.style.marginTop = collapseMainSetupCards ? "1em" : "3em";
    if (allCoreSetupComplete) {
      if (eventWorkflowSectionActive) {
        eventWorkflowHeadingMain.style.fontSize = "1.5rem";
        eventWorkflowHeadingMain.style.color = "#0f172a";
        eventWorkflowHeadingMain.style.fontWeight = "600";
        eventWorkflowHeadingMain.style.fontFamily = "Inter, Helvetica, Arial, sans-serif";
        eventWorkflowHeadingMain.style.lineHeight = "2rem";
        eventWorkflowHeadingMain.style.textTransform = "none";
      } else {
        eventWorkflowHeadingMain.style.fontSize = "0.875rem";
        eventWorkflowHeadingMain.style.color = "#64748b";
        eventWorkflowHeadingMain.style.fontWeight = "500";
        eventWorkflowHeadingMain.style.fontFamily = "Inter, Helvetica, Arial, sans-serif";
        eventWorkflowHeadingMain.style.lineHeight = "1.25rem";
        eventWorkflowHeadingMain.style.textTransform = "uppercase";
      }
    }
  }
  const setupSectionIcon = document.getElementById("setupSectionIcon");
  if (setupSectionIcon) {
    if (allCoreSetupComplete) {
      const setupHeadingColor = setupHeadingMain
        ? window.getComputedStyle(setupHeadingMain).color
        : "#64748b";
      setupSectionIcon.innerHTML = "✓";
      setupSectionIcon.style.color = setupHeadingColor;
      setupSectionIcon.style.fontSize = "16px";
      setupSectionIcon.style.fontWeight = "600";
      setupSectionIcon.style.lineHeight = "1";
    } else {
      setupSectionIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0 .274 1.128 1.514 1.66 2.515 1.168 1.556-.765 3.323 1.002 2.558 2.558-.492 1.001.04 2.241 1.168 2.515 1.756.426 1.756 2.924 0 3.35-1.128.274-1.66 1.514-1.168 2.515.765 1.556-1.002 3.323-2.558 2.558-1.001-.492-2.241.04-2.515 1.168-.426 1.756-2.924 1.756-3.35 0-.274-1.128-1.514-1.66-2.515-1.168-1.556.765-3.323-1.002-2.558-2.558.492-1.001-.04-2.241-1.168-2.515-1.756-.426-1.756-2.924 0-3.35 1.128-.274 1.66-1.514 1.168-2.515-.765-1.556 1.002-3.323 2.558-2.558 1.001.492 2.241-.04 2.515-1.168Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      setupSectionIcon.style.color = "#64748b";
      setupSectionIcon.style.fontSize = "";
      setupSectionIcon.style.fontWeight = "";
      setupSectionIcon.style.lineHeight = "1";
    }
  }
  document.querySelectorAll(".setup-step").forEach(stepEl => {
    const stepNum = parseInt(stepEl.dataset.step);
    const isCompletedStep = state.completedSetupSteps.includes(stepNum);
    const isCoreSetupStep = stepNum >= 1 && stepNum <= 6;
    const isEventWorkflowStep = stepNum >= 7 && stepNum <= 13;
    const isEventWorkflowStepLocked = isEventWorkflowStep
      && !(Boolean(state.debugMode) && stepNum === 9)
      && !state.completedSetupSteps.includes(stepNum)
      && stepNum > 7
      && !state.completedSetupSteps.includes(stepNum - 1);
    stepEl.classList.toggle("setup-step-locked", isEventWorkflowStepLocked);
    if (!allCoreSetupComplete && isEventWorkflowStep) {
      stepEl.style.display = "none";
    } else {
      const hideForCollapsedSetup = collapseMainSetupCards && isCoreSetupStep;
      const hideRunEventByGate = stepNum === 11 && !runEventVisible;
      stepEl.style.display = (hideForCollapsedSetup || hideRunEventByGate) ? "none" : "";
    }
    const header = stepEl.querySelector(".setup-step-header");
    const content = stepEl.querySelector(".setup-step-content");
    const numberCircle = stepEl.querySelector(".setup-step-number");
    const title = stepEl.querySelector("h3");
    const arrow = stepEl.querySelector(".setup-step-arrow");
    if (content) {
      const controls = content.querySelectorAll("button, input, select, textarea, a");
      controls.forEach((control) => {
        const allowWhenLocked = String(control?.dataset?.allowLocked || "") === "true";
        if (isEventWorkflowStepLocked) {
          if (allowWhenLocked) {
            if (control.tagName === "A") {
              control.removeAttribute("aria-disabled");
              control.removeAttribute("tabindex");
              control.style.pointerEvents = "";
            } else {
              control.disabled = false;
            }
            return;
          }
          if (control.tagName === "A") {
            control.setAttribute("aria-disabled", "true");
            control.setAttribute("tabindex", "-1");
            control.style.pointerEvents = "none";
          } else {
            control.disabled = true;
          }
        } else {
          if (control.tagName === "A") {
            control.removeAttribute("aria-disabled");
            control.removeAttribute("tabindex");
            control.style.pointerEvents = "";
          } else {
            control.disabled = false;
          }
        }
      });
    }
    if (stepNum === state.currentSetupStep) {
      // Active step: white background, dark circle, expand content
      header.style.background = "#ffffff";
      header.style.borderColor = "#e2e8f0";
      numberCircle.style.background = "#1e293b";
      numberCircle.style.color = "#fff";
      numberCircle.textContent = stepNum;
      title.className = "text-sm font-medium";
      content.classList.remove("hidden");
      arrow.textContent = "▾";
    } else if (isCompletedStep) {
      // Completed step: light gray background, light circle with text "✓"
      header.style.background = "#f1f5f9";
      header.style.borderColor = "#e2e8f0";
      numberCircle.style.background = "#cbd5e1";
      numberCircle.style.color = "#64748b";
      numberCircle.innerHTML = "✓";
      title.className = "text-sm font-medium text-slate-500";
      content.classList.add("hidden");
      arrow.textContent = "▸";
    } else {
      // Inactive step: grayed out, light circle
      header.style.background = "#f8fafc";
      header.style.borderColor = "#e2e8f0";
      numberCircle.style.background = "#cbd5e1";
      numberCircle.style.color = "#64748b";
      numberCircle.textContent = stepNum;
      title.className = "text-sm font-medium text-slate-500";
      content.classList.add("hidden");
      arrow.textContent = "▸";
    }


    const isProcessCurrentStep =
      (isCoreSetupStep && stepNum === setupProcessCurrentStep)
      || (isEventWorkflowStep && stepNum === eventWorkflowProcessCurrentStep);
    if (title) {
      title.style.fontWeight = isProcessCurrentStep ? "700" : "500";
    }

    if (isCompletedStep) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#cbd5e1";
      numberCircle.style.color = "#64748b";
      numberCircle.style.border = "none";
      numberCircle.style.fontSize = "";
      numberCircle.style.fontWeight = "600";
      numberCircle.innerHTML = "✓";
    } else if (stepNum === 7) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontWeight = "600";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "🎉";
    } else if (stepNum === 8) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "";
      numberCircle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="4" cy="5" r="2" fill="currentColor"/><rect x="7" y="3.5" width="13" height="3" rx="1.5" fill="currentColor"/><circle cx="4" cy="12" r="2" fill="currentColor"/><rect x="7" y="10.5" width="9" height="3" rx="1.5" fill="currentColor"/><circle cx="4" cy="19" r="2" fill="currentColor"/><rect x="7" y="17.5" width="13" height="3" rx="1.5" fill="currentColor"/></svg>';
    } else if (stepNum === 9) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "↗";
    } else if (stepNum === 10) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "✉️";
    } else if (stepNum === 11) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "🏁";
    } else if (stepNum === 12) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "📊";
    } else if (stepNum === 13) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "📈";
    } else {
      numberCircle.style.border = "none";
      numberCircle.style.fontSize = "";
    }
  });

  renderPollBuilderStep();
  renderPromoteEventStep();
  renderBookEventStep();
  renderRunEventStep();
  renderCollectFeedbackStep();
  renderReviewImpactStep();
}




function bindStaticEvents() {
// Initialize landing setup flow if it exists
try {
  initializeLandingSetupFlow();
} catch (error) {
  console.warn("initializeLandingSetupFlow failed", error);
  attachSetupStepHandlers();
  renderSetupStepStates();
  updateSetupStepButtonStates();
}

const setupSignUpPopup = $("setupSignUpPopup");
const setupSignUpPopupClose = $("setupSignUpPopupClose");
const setupSignUpPopupCloseX = $("setupSignUpPopupCloseX");
if (setupSignUpPopupClose) {
  setupSignUpPopupClose.addEventListener("click", hideSetupSignUpPopup);
}
if (setupSignUpPopupCloseX) {
  setupSignUpPopupCloseX.addEventListener("click", hideSetupSignUpPopup);
}
if (setupSignUpPopup) {
  setupSignUpPopup.style.display = "none";
  setupSignUpPopup.addEventListener("click", (event) => {
    if (event.target === setupSignUpPopup) {
      hideSetupSignUpPopup();
    }
  });
}

try {
  initializeEventsShortlistInteractions();
} catch (error) {
  console.warn("initializeEventsShortlistInteractions failed", error);
}

try {
  initializePollBuilderInteractions();
} catch (error) {
  console.warn("initializePollBuilderInteractions failed", error);
}

const landingCompanyInput = $("landingCompanyName");
const landingAdminInput = $("landingAdminName");
if (landingCompanyInput) {
  landingCompanyInput.addEventListener("input", () => {
    state.companyName = landingCompanyInput.value.trim();
    if ($("companyName")) $("companyName").value = state.companyName;
    persistState();
    renderLandingIdentityView();
     renderAppIdentityView();
  });
}
if (landingAdminInput) {
  landingAdminInput.addEventListener("input", () => {
    state.adminName = landingAdminInput.value.trim();
    if ($("adminName")) $("adminName").value = state.adminName;
    persistState();
    renderLandingIdentityView();
     renderAppIdentityView();
  });
}

// Setup landing identity inputs
const setupCompanyInput = $("setupCompanyName");
if (setupCompanyInput) {
  setupCompanyInput.addEventListener("input", () => {
    state.companyName = setupCompanyInput.value.trim();
    persistState();
  });
}
const setupAdminInput = $("setupAdminName");
if (setupAdminInput) {
  setupAdminInput.addEventListener("input", () => {
    state.adminName = setupAdminInput.value.trim();
    persistState();
  });
}


// Remove old landing input handlers (no longer exist in new setup flow)
// Previous handlers for landingBudgetMode, landingTotalBudget, etc. are now
// handled in initializeLandingSetupFlow()


const btnMagicLink = $("btnMagicLink");
if (btnMagicLink) {
  btnMagicLink.addEventListener("click", sendMagicLink);
}




$("btnSaveProgramSetup").addEventListener("click", () => {
  saveProgramSetupFromInputs();
});




$("workflowStepper").addEventListener("click", handleWorkflowAction);
$("browserPanel").addEventListener("click", handleWorkflowAction);


const sidebarSetupHeading = $("sidebarSetupHeading");
if (sidebarSetupHeading) {
  sidebarSetupHeading.style.cursor = "pointer";
  sidebarSetupHeading.addEventListener("click", () => {
    state.setupMenuExpanded = !state.setupMenuExpanded;
    state.sidebarSetupExpanded = state.setupMenuExpanded;
    persistState();
    renderSetupMenuState();
    renderSidebarStepMenus();
    renderSetupStepStates();
  });
}


const btnOpenBudgetDetail = $("btnOpenBudgetDetail");
if (btnOpenBudgetDetail) {
  btnOpenBudgetDetail.addEventListener("click", () => {
    alert(`Total: ${fmtMoney(getBudgetTotal())}\nSpent: ${fmtMoney(getTotalSpent())}\nRemaining: ${fmtMoney(getRemainingBudget())}`);
  });
}




$("budgetFooter").addEventListener("click", () => {
  alert(`Total: ${fmtMoney(getBudgetTotal())}\nSpent: ${fmtMoney(getTotalSpent())}\nRemaining: ${fmtMoney(getRemainingBudget())}`);
});




$("btnCloseBrowserPanel").addEventListener("click", () => {
  $("browserPanel").classList.add("hidden");
});




const signOutButton = $("btnSignOut");
if (signOutButton) {
  signOutButton.addEventListener("click", async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    state.user = null;
    state.accountId = null;
    showLanding();
  });
}




$("companyName").addEventListener("input", () => {
  state.companyName = $("companyName").value;
  if ($("landingCompanyName")) $("landingCompanyName").value = state.companyName;
  persistState();
  renderLandingIdentityView();
  renderAppIdentityView();
});




$("adminName").addEventListener("input", () => {
  state.adminName = $("adminName").value;
  if ($("landingAdminName")) $("landingAdminName").value = state.adminName;
  persistState();
  renderLandingIdentityView();
  renderAppIdentityView();
});


 const appIdentitySubmitBtn = $("appIdentitySubmit");
 if (appIdentitySubmitBtn) {
   appIdentitySubmitBtn.addEventListener("click", submitAppIdentity);
 }


 const appIdentityEditBtn = $("appIdentityEdit");
 if (appIdentityEditBtn) {
   appIdentityEditBtn.addEventListener("click", editAppIdentity);
 }




$("budgetMode").addEventListener("change", () => {
  state.programSettings.budgetMode = $("budgetMode").value;
  persistState();
  renderAll();
});




$("cadence").addEventListener("change", () => {
  state.programSettings.cadence = $("cadence").value;
  persistState();
});




$("totalBudget").addEventListener("input", () => {
  state.programSettings.totalBudget = Number($("totalBudget").value || 0);
  persistState();
  renderSidebar();
  renderImpact();
});




$("perEmployeeBudget").addEventListener("input", () => {
  state.programSettings.perEmployeeBudget = Number($("perEmployeeBudget").value || 0);
  persistState();
  renderSidebar();
  renderImpact();
});




$("employeeCount").addEventListener("input", () => {
  state.programSettings.employeeCount = Number($("employeeCount").value || 0);
  persistState();
  renderSidebar();
  renderImpact();
});




document.addEventListener("change", (event) => {
  if (event.target.id === "prefChat") {
    state.toolPreferences.chat = event.target.value;
    persistState();
  }
  if (event.target.id === "prefEmail") {
    state.toolPreferences.email = event.target.value;
    persistState();
  }
  if (event.target.id === "prefCalendar") {
    state.toolPreferences.calendar = event.target.value;
    persistState();
  }
});




if (window.electronAPI?.onCreateTabFromPopup) {
  window.electronAPI.onCreateTabFromPopup((url) => {
    const tab = { id: uid(), title: "Popup", url };
    state.browserTabs.push(tab);
    state.activeBrowserTabId = tab.id;
    renderBrowserPanel();
    persistState();
  });
}
}




async function bootstrap() {
  state.sidebarSetupExpanded = false;
  bindSidebarSetupEditPrefs();
  bindMainSetupEditPrefs();
  logIdentityDebug("bootstrap:start");
  applyPinnedIdentity();
  const storedCompanyId = getAuthCompanyId();
  loadLocalState(storedCompanyId || "anon", { strictAccount: Boolean(storedCompanyId) });
  applyPinnedIdentity();
  applyLandingIdentityFromQuery();
  applyPinnedIdentity();
  logIdentityDebug("bootstrap:afterIdentityHydration");
  renderLandingIdentityView();
  renderAppIdentityView();
  renderLanding();
  applyVerticalEventFade();

  if (state.setupEventsGenerated) {
    generateRecommendedEvents();
  }

  bindStaticEvents();
  bindAuthGateActions();

  const token = getAuthToken();
  if (token) {
    setSidebarHydrationLoading(true);
    try {
      await hydrateCloudStateForSession(storedCompanyId);
      setAuthStatus("");
    } catch (error) {
      clearAuthSession();
      setAuthStatus(String(error?.message || "Session expired. Signed out.").trim(), true);
    } finally {
      setSidebarHydrationLoading(false);
      renderSidebar();
    }
  }

  hideAuthGate();
  showLanding();
  renderAll();
}




function getShortlistCards() {
  const container = document.getElementById("eventsShortlistCards");
  if (!container) return [];
  return Array.from(container.querySelectorAll(".event-card"));
}

function setShortlistCardSelected(card, isSelected) {
  if (!card) return;
  const circle = card.querySelector(".event-circle");
  if (!circle) return;

  if (isSelected) {
    card.classList.add("selected");
    circle.classList.add("selected");
    circle.classList.remove("empty");
    circle.textContent = "";
    return;
  }

  card.classList.remove("selected");
  circle.classList.remove("selected");
  circle.classList.add("empty");
  circle.textContent = "○";
}

function getShortlistSelectedIndexes() {
  const cards = getShortlistCards();
  const selectedIndexes = [];
  cards.forEach((card, index) => {
    if (card.classList.contains("selected")) {
      selectedIndexes.push(index);
    }
  });
  return selectedIndexes;
}

function getSelectedShortlistBookTarget() {
  const cards = getShortlistCards();
  const domSelected = getShortlistSelectedIndexes();
  let selectedIndex = Number.isInteger(state.setupBookSelectedEventIndex) ? state.setupBookSelectedEventIndex : null;
  if (!Number.isInteger(selectedIndex) && domSelected.length === 1) {
    selectedIndex = domSelected[0];
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= cards.length) {
    return null;
  }

  const selectedCard = cards[selectedIndex];
  const title = selectedCard?.querySelector(".event-title")?.textContent?.trim() || `Event ${selectedIndex + 1}`;
  const linkEl = selectedCard?.querySelector(".event-footer a[href]");
  const href = (linkEl?.getAttribute("href") || "").trim();
  return {
    index: selectedIndex,
    title,
    url: (!href || href === "#") ? "" : href
  };
}

function normalizePollSelection(indexes, totalCards) {
  const cleaned = Array.from(new Set((indexes || []).filter((index) => Number.isInteger(index) && index >= 0 && index < totalCards)));
  return cleaned.slice(0, 3);
}

function applyShortlistSelectedIndexes(indexes) {
  const cards = getShortlistCards();
  const selectedSet = new Set(indexes || []);
  cards.forEach((card, index) => {
    setShortlistCardSelected(card, selectedSet.has(index));
  });
}

function isEventsShortlistReadOnly() {
  return false;
}

function updateEventsShortlistModeUI() {
  const hintIcon = document.getElementById("eventsSelectionHintIcon");
  const primaryLine = document.getElementById("eventsSelectionHintPrimary");
  const secondaryLine = document.getElementById("eventsSelectionHintSecondary");
  const lineBreak = document.getElementById("eventsSelectionHintBreak");
  const modePromptText = document.getElementById("eventsModePromptText");
  const modeToggleButton = document.getElementById("eventsModeToggleButton");
  const eventsPollButton = document.getElementById("eventsPollButton");
  const helperText = document.getElementById("eventsPrimaryHelperText");
  const shortlistContainer = document.getElementById("eventsShortlistCards");

  const isBookMode = state.setupShortlistMode === "book";

  // Poll mode: disable CTA unless at least 2 selected
  // Book mode: disable CTA unless exactly 1 selected
  if (eventsPollButton) {
    const domSelectedCount = getShortlistSelectedIndexes().length;
    const persistedSelectedCount = normalizePollSelection(
      Array.isArray(state.setupPollSelectedEventIndexes) ? state.setupPollSelectedEventIndexes : [],
      getShortlistCards().length
    ).length;
    const selectedCount = isBookMode
      ? (Number.isInteger(state.setupBookSelectedEventIndex) ? 1 : domSelectedCount)
      : Math.max(domSelectedCount, persistedSelectedCount);
    if (
      (!isBookMode && selectedCount < 2) ||
      (isBookMode && selectedCount !== 1)
    ) {
      eventsPollButton.disabled = true;
      eventsPollButton.classList.add("opacity-50", "cursor-not-allowed", "bg-slate-300", "text-slate-600", "hover:bg-slate-300");
      eventsPollButton.classList.remove("bg-slate-800", "text-white", "hover:bg-slate-700");
    } else {
      eventsPollButton.disabled = false;
      eventsPollButton.classList.remove("opacity-50", "cursor-not-allowed", "bg-slate-300", "text-slate-600", "hover:bg-slate-300");
      eventsPollButton.classList.add("bg-slate-800", "text-white", "hover:bg-slate-700");
    }
  }

  if (hintIcon) {
    hintIcon.textContent = isBookMode ? "🎟️" : "📈";
  }

  if (primaryLine) {
    primaryLine.textContent = isBookMode
      ? "Choose an event to book."
      : "Teams that vote on events usually see higher attendance and engagement.";
    if (isBookMode) {
      primaryLine.style.fontWeight = "bold";
      primaryLine.style.color = "#1e293b";
      primaryLine.style.fontFamily = 'inherit';
    } else {
      primaryLine.style.fontWeight = "400";
      primaryLine.style.color = "#1e293b";
      primaryLine.style.fontFamily = 'inherit';
    }
  }
  if (secondaryLine) {
    secondaryLine.textContent = isBookMode
      ? ""
      : "Choose up to 3 events for your team to vote on.";
    secondaryLine.style.display = isBookMode ? "none" : "inline";
  }
  if (lineBreak) {
    lineBreak.style.display = isBookMode ? "none" : "inline";
  }
  if (modePromptText) {
    modePromptText.textContent = isBookMode
      ? "Prefer a team vote?"
      : "Prefer to choose the event yourself?";
  }
  if (modeToggleButton) {
    modeToggleButton.textContent = isBookMode ? "Generate a poll" : "Skip poll → Book now";
  }
  if (eventsPollButton) {
    eventsPollButton.textContent = isBookMode
      ? "Book this event ↗"
      : "Let your team choose — Generate poll";
  }
  if (helperText) {
    helperText.classList.toggle("hidden", !isBookMode);
  }

  if (shortlistContainer) {
    delete shortlistContainer.dataset.shortlistReadonly;
  }
}

function setEventsShortlistMode(nextMode) {
  const cards = getShortlistCards();
  const totalCards = cards.length;
  if (!totalCards) {
    state.setupShortlistMode = nextMode === "book" ? "book" : "poll";
    updateEventsShortlistModeUI();
    persistState();
    return;
  }

  if (nextMode === "book") {
    state.setupShortlistMode = "book";
    // Restore previous book selection if valid, else none
    let idx = state.setupBookSelectedEventIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= totalCards) idx = null;
    state.setupBookSelectedEventIndex = idx;
    applyShortlistSelectedIndexes(idx !== null ? [idx] : []);
    updateEventsShortlistModeUI();
    persistState();
    return;
  }

  // Poll mode
  state.setupShortlistMode = "poll";
  // Restore previous poll selection if valid, else none
  let pollSel = Array.isArray(state.setupPollSelectedEventIndexes) ? state.setupPollSelectedEventIndexes.filter(i => Number.isInteger(i) && i >= 0 && i < totalCards) : [];
  state.setupPollSelectedEventIndexes = pollSel;
  applyShortlistSelectedIndexes(pollSel);
  updateEventsShortlistModeUI();
  persistState();
}

function initializeEventsShortlistInteractions() {
  const modeToggleButton = document.getElementById("eventsModeToggleButton");
  if (modeToggleButton && modeToggleButton.dataset.shortlistBound !== "true") {
    modeToggleButton.addEventListener("click", () => {
      const nextMode = state.setupShortlistMode === "book" ? "poll" : "book";
      setEventsShortlistMode(nextMode);
    });
    modeToggleButton.dataset.shortlistBound = "true";
  }

  const cards = getShortlistCards();
  cards.forEach((card, index) => {
    if (card.dataset.shortlistBound === "true") {
      return;
    }


    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      const container = document.getElementById("eventsShortlistCards");
      if (container?.classList.contains("events-locked")) {
        return;
      }

      if (state.setupShortlistMode === "book") {
        state.setupBookSelectedEventIndex = index;
        applyShortlistSelectedIndexes([index]);
        persistState();
        updateEventsShortlistModeUI();
        return;
      }

      const selectedIndexes = getShortlistSelectedIndexes();
      const selectedSet = new Set(selectedIndexes);
      if (selectedSet.has(index)) {
        selectedSet.delete(index);
      } else if (selectedSet.size < 3) {
        selectedSet.add(index);
      }

      const nextSelection = Array.from(selectedSet).sort((a, b) => a - b);
      state.setupPollSelectedEventIndexes = nextSelection;
      // If exactly one selected, also update book selection for persistence
      state.setupBookSelectedEventIndex = nextSelection.length === 1 ? nextSelection[0] : state.setupBookSelectedEventIndex;
      applyShortlistSelectedIndexes(nextSelection);
      syncPollBuilderSelectionFromShortlist();
      persistState();
      updateEventsShortlistModeUI();
      renderPollBuilderStep();
    });

    card.dataset.shortlistBound = "true";
  });

  const totalCards = cards.length;
  if (totalCards) {
    const hasSavedShortlist = Array.isArray(state.completedSetupSteps) && state.completedSetupSteps.includes(7);
    if (hasSavedShortlist) {
      if (state.setupShortlistMode === "book") {
        const idx = Number.isInteger(state.setupBookSelectedEventIndex) ? state.setupBookSelectedEventIndex : null;
        applyShortlistSelectedIndexes(idx !== null ? [idx] : []);
      } else {
        const pollSel = normalizePollSelection(
          Array.isArray(state.setupPollSelectedEventIndexes) ? state.setupPollSelectedEventIndexes : [],
          totalCards
        );
        applyShortlistSelectedIndexes(pollSel);
      }
    } else {
      state.setupPollSelectedEventIndexes = [];
      state.setupBookSelectedEventIndex = null;
      applyShortlistSelectedIndexes([]);
    }
  }
  updateEventsShortlistModeUI();
}

function applyVerticalEventFade() {
  const previews = document.querySelectorAll(".event-preview");
  previews.forEach(preview => {
    if (preview.dataset.fadeApplied === "true") return;
    const blocks = preview.querySelectorAll(
      ".event-why, .event-description, .event-footer"
    );
    const total = blocks.length;
    if (!total) return;

    blocks.forEach((block, index) => {
      block.classList.add("fade-away-vertical");
      block.style.setProperty("--i", index);
      block.style.setProperty("--total", total);
    });

    preview.dataset.fadeApplied = "true";
  });
}

function getDefaultPollIntro() {
  return "We’re narrowing down the details for an upcoming team event. Pick the event(s) you’d participate in and any times you’re available. We’ll use your responses to finalize an event and time that works for as many of us as possible.";
}

function resetPollBuilderDraftFields() {
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") return;
  state.pollBuilder.proposedDateTimes = [];
  state.pollBuilder.pollId = "";
  state.pollBuilder.rsvpId = "";
  state.pollBuilder.rsvpShareUrl = "";
  state.pollBuilder.rsvpResults = null;
  state.pollBuilder.pollSharedConfirmed = false;
  state.pollBuilder.rsvpSharedConfirmed = false;
  state.pollBuilder.rsvpAttendeesExpanded = false;
  state.pollBuilder.createdAt = "";
  state.pollBuilder.shareLink = "";
  state.pollBuilder.showResultsPage = false;
  state.pollBuilder.rsvpSent = false;
  state.pollBuilder.vendorLinkOpened = false;
  state.pollBuilder.markedBooked = false;
  state.pollBuilder.bookingResetRequested = true;
  state.pollBuilder.bookingConfirmation = null;
  state.pollBuilder.scheduleEntries = [];
  state.pollBuilder.inviteMessageOverride = "";
}
const pollUiState = {
  editingIntro: false,
  editingEventLabels: false,
  pendingDateTimes: [],
  pendingTimeZone: "",
  createPollBusy: false,
  createPollError: "",
  resultsSyncBusy: false,
  resultsSyncError: "",
  resultsSyncLastAt: 0,
  copyMessageBusy: false,
  copyMessageStatusText: "",
  copyMessageStatusTone: "",
  helperInfoVisible: false,
  reminderPanelOpen: false,
  reminderChannel: "slack",
  reminderHelperVisible: false,
  reminderCopyBusy: false,
  reminderSubjectCopyBusy: false,
  rsvpSetupOpen: false,
  rsvpScrollPending: false,
  rsvpCollectionStarted: false,
  rsvpDeadlineDate: "",
  rsvpDeadlineHour: "",
  rsvpDeadlineMinute: "",
  rsvpDeadlinePeriod: "",
  rsvpDeadlineTimeZone: "",
  rsvpDeadlineEditing: true,
  rsvpCopyBusy: false,
  rsvpShareStatus: "",
  rsvpCreateBusy: false,
  rsvpCreateError: "",
  rsvpResultsError: "",
  debugPreviewPanelOpen: false,
  pollPreviewOverrides: {
    pollStatus: "",
    deadline: "",
    responses: null,
    recommendedPlan: null
  },
  pollPreviewResponsesPreset: "",
  pollPreviewDeadlinePreset: "",
  editingDeadline: false,
  pendingDeadlineDate: "",
  pendingDeadlineHour: "",
  pendingDeadlineMinute: "",
  pendingDeadlinePeriod: "",
  pendingDeadlineTimeZone: "",
  bookAttendingExpanded: false,
  bookAttendingRows: 0,
  bookEventDefaultCardHeight: 0,
  bookShowCollapsedDetails: false,
  bookForceInitialPreClickReset: true,
  bookVendorBookedChecked: false,
  bookConfirmHeadcount: "",
  bookConfirmDateTimeLocal: "",
  bookConfirmDate: "",
  bookConfirmTime: "",
  bookConfirmTotalCost: "",
  bookConfirmErrorMessage: "",
  bookingConfirmOpen: false,
  bookExpenseModalOpen: false,
  bookExpenseToolInput: ""
};

let pollCopyBusyTimeout = null;
let pollCopyStatusTimeout = null;
let pollHelperInfoTimeout = null;
let pollReminderStatusTimeout = null;
let pollReminderSubjectStatusTimeout = null;
let pollRsvpCopyTimeout = null;
let pollRsvpStatusTimeout = null;
let pollRsvpResultsIntervalId = null;
let pollRsvpResultsIntervalRsvpId = "";

function stopRsvpResultsPolling() {
  if (pollRsvpResultsIntervalId) {
    clearInterval(pollRsvpResultsIntervalId);
    pollRsvpResultsIntervalId = null;
  }
  pollRsvpResultsIntervalRsvpId = "";
}

function normalizeRsvpResultsPayload(responseData) {
  const root = (responseData?.data && typeof responseData.data === "object")
    ? responseData.data
    : responseData;
  const resultsRoot = (root?.results && typeof root.results === "object") ? root.results : root;
  const rawResponses = Array.isArray(resultsRoot?.responses) ? resultsRoot.responses : [];
  const responses = rawResponses.map((row) => ({
    answer: String(row?.answer || "").trim().toLowerCase(),
    name: String(row?.name || "").trim(),
    email: String(row?.email || "").trim(),
    respondedAt: String(row?.respondedAt || row?.createdAt || "").trim()
  })).filter((row) => row.answer === "yes" || row.answer === "no");
  const yesFallback = responses.filter((row) => row.answer === "yes").length;
  const noFallback = responses.filter((row) => row.answer === "no").length;
  const yesCountRaw = Number(resultsRoot?.yesCount);
  const noCountRaw = Number(resultsRoot?.noCount);
  const totalRaw = Number(resultsRoot?.totalResponses);
  const yesCount = Number.isFinite(yesCountRaw) ? Math.max(0, yesCountRaw) : yesFallback;
  const noCount = Number.isFinite(noCountRaw) ? Math.max(0, noCountRaw) : noFallback;
  const totalResponses = Number.isFinite(totalRaw) ? Math.max(0, totalRaw) : Math.max(yesCount + noCount, responses.length);
  return { yesCount, noCount, totalResponses, responses };
}

async function createRsvpInBackend(payload) {
  const response = await fetch(`${POLL_API_BASE}/rsvps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok || !data) {
    const apiMessage = String(data?.error || data?.message || "").trim();
    throw new Error(apiMessage || `Couldn’t create RSVP (${response.status}).`);
  }

  const root = (data?.data && typeof data.data === "object") ? data.data : data;
  const rsvpId = String(root?.rsvpId || root?.id || "").trim();
  const shareUrl = String(root?.shareUrl || "").trim();
  if (!rsvpId || !shareUrl) {
    throw new Error("RSVP service returned an unexpected response.");
  }
  return { rsvpId, shareUrl };
}

async function fetchRsvpFromBackend(rsvpId) {
  const normalizedId = String(rsvpId || "").trim();
  if (!normalizedId) throw new Error("RSVP ID missing.");
  const response = await fetch(`${POLL_API_BASE}/rsvps/${encodeURIComponent(normalizedId)}`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(`Unexpected response (${response.status}): ${String(text || "").slice(0, 160)}`);
  }

  const data = await response.json();
  if (!response.ok || !data) {
    const apiMessage = String(data?.error || data?.message || "").trim();
    throw new Error(apiMessage || `Couldn’t fetch RSVP (${response.status}).`);
  }
  return normalizeRsvpResultsPayload(data);
}

async function refreshRsvpResultsFromBackend(rsvpId, options = {}) {
  const normalizedId = String(rsvpId || state.pollBuilder?.rsvpId || "").trim();
  if (!normalizedId) return null;
  const results = await fetchRsvpFromBackend(normalizedId);
  state.pollBuilder.rsvpId = normalizedId;
  state.pollBuilder.rsvpResults = results;
  pollUiState.rsvpResultsError = "";
  persistState();
  if (options.render !== false) {
    renderPollBuilderStep();
  }
  return results;
}

function startRsvpResultsPolling(rsvpId) {
  const normalizedId = String(rsvpId || "").trim();
  if (!normalizedId) {
    stopRsvpResultsPolling();
    return;
  }
  if (pollRsvpResultsIntervalId && pollRsvpResultsIntervalRsvpId === normalizedId) {
    return;
  }
  stopRsvpResultsPolling();
  pollRsvpResultsIntervalRsvpId = normalizedId;
  refreshRsvpResultsFromBackend(normalizedId, { render: true }).catch((error) => {
    pollUiState.rsvpResultsError = String(error?.message || "Couldn’t refresh RSVP results.").trim();
    renderPollBuilderStep();
  });
  pollRsvpResultsIntervalId = setInterval(() => {
    refreshRsvpResultsFromBackend(normalizedId, { render: true }).catch((error) => {
      pollUiState.rsvpResultsError = String(error?.message || "Couldn’t refresh RSVP results.").trim();
      renderPollBuilderStep();
    });
  }, 10000);
}
let pollResultsCountdownInterval = null;
let runEventNotesDebounceTimeout = null;
let feedbackNotesDebounceTimeout = null;

const runEventUiState = {
  confirmCompleteWithoutChecks: false
};

const feedbackUiState = {
  channel: "slack",
  feedbackSentScrollPending: false
};

function getPollCloseCountdownStatus(deadlineValue) {
  const deadlineRaw = String(deadlineValue || "").trim();
  const deadlineDate = deadlineRaw ? new Date(deadlineRaw) : null;
  if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) {
    return { text: "Poll closed", dotClass: "bg-slate-500", isClosed: true };
  }

  const remainingMs = deadlineDate.getTime() - Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  if (remainingMs <= 0) {
    return { text: "Poll closed", dotClass: "bg-slate-500", isClosed: true };
  }

  let text = "";
  if (remainingMs >= 48 * hourMs) {
    const days = Math.ceil(remainingMs / dayMs);
    text = `Poll closes in ${days} day${days === 1 ? "" : "s"}`;
  } else if (remainingMs >= 24 * hourMs) {
    const hours = Math.ceil(remainingMs / hourMs);
    text = `Poll closes in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else if (remainingMs >= 2 * hourMs) {
    const hours = Math.ceil(remainingMs / hourMs);
    text = `Poll closes in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else {
    const minutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
    text = `Poll closes in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const dotClass = remainingMs <= 24 * hourMs ? "bg-amber-400" : "bg-slate-300";
  return { text, dotClass, isClosed: false };
}

function getRsvpCloseCountdownStatus(deadlineValue) {
  const deadlineRaw = String(deadlineValue || "").trim();
  const deadlineDate = deadlineRaw ? new Date(deadlineRaw) : null;
  if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) {
    return { text: "RSVP closed", dotClass: "bg-slate-400", isClosed: true };
  }

  const remainingMs = deadlineDate.getTime() - Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  if (remainingMs <= 0) {
    return { text: "RSVP closed", dotClass: "bg-slate-400", isClosed: true };
  }

  let text = "";
  if (remainingMs >= 48 * hourMs) {
    const days = Math.ceil(remainingMs / dayMs);
    text = `RSVP closes in ${days} day${days === 1 ? "" : "s"}`;
  } else if (remainingMs >= 2 * hourMs) {
    const hours = Math.ceil(remainingMs / hourMs);
    text = `RSVP closes in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else {
    const minutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
    text = `RSVP closes in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  return { text, dotClass: "bg-slate-500", isClosed: false };
}

function getHorizontalProcessBarHtml(stages = [], activeStageIndex = 0, options = {}) {
  if (!Array.isArray(stages) || !stages.length) return "";
  const maxIndex = stages.length - 1;
  const normalizedActive = Number.isInteger(activeStageIndex)
    ? Math.max(0, Math.min(activeStageIndex, stages.length))
    : 0;
  const completedIndexes = Array.isArray(options?.completedIndexes)
    ? options.completedIndexes.filter((value) => Number.isInteger(value) && value >= 0 && value <= maxIndex)
    : null;
  const completedSet = completedIndexes ? new Set(completedIndexes) : null;
  const clickable = options?.clickable === true;

  const stageHtml = stages.map((label, index) => {
    const isCompleted = completedSet
      ? completedSet.has(index)
      : (normalizedActive > maxIndex ? true : index < normalizedActive);
    const isActive = normalizedActive <= maxIndex && index === normalizedActive;
    const indicatorHtml = isCompleted
      ? `<span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-white">✓</span>`
      : isActive
      ? `<span class="inline-flex h-4 w-4 rounded-full bg-slate-700 ring-2 ring-slate-700/20"></span>`
      : `<span class="inline-flex h-4 w-4 rounded-full border-2 border-slate-300 bg-white"></span>`;
    const labelClass = isCompleted
      ? "font-semibold text-slate-800"
      : isActive
      ? "font-semibold text-slate-900"
      : "font-medium text-slate-500";
    const connectorClass = isCompleted
      ? "bg-slate-500"
      : "bg-slate-200";
    const connectorHtml = index < maxIndex
      ? `<div class="mx-3 h-px flex-1 ${connectorClass}"></div>`
      : "";

    return `
      <li class="flex min-w-[180px] flex-1 items-center ${clickable ? "cursor-pointer" : ""}" ${clickable ? `data-process-index="${index}"` : ""}>
        <div class="flex items-center gap-2">
          ${indicatorHtml}
          <span class="text-xs ${labelClass}">${escapeHtml(String(label || ""))}</span>
        </div>
        ${connectorHtml}
      </li>
    `;
  }).join("");

  return `
    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <ol class="flex items-center overflow-x-auto">
        ${stageHtml}
      </ol>
    </div>
  `;
}

function ensurePollResultsCountdownTicker() {
  if (pollResultsCountdownInterval) return;
  pollResultsCountdownInterval = setInterval(() => {
    const isFinalized = Boolean(String(state?.pollBuilder?.shareLink || "").trim());
    const showingResults = isFinalized && Boolean(state?.pollBuilder?.showResultsPage);
    if (!showingResults) return;
    renderPollBuilderStep();
  }, 60000);
}

function getPollSelectedEvents() {
  const cards = getShortlistCards();
  const selectedIndexes = Array.isArray(state.setupPollSelectedEventIndexes)
    ? state.setupPollSelectedEventIndexes.filter((index) => Number.isInteger(index) && index >= 0)
    : [];

  return selectedIndexes.slice(0, 3).map((index) => {
    const card = cards[index];
    const title = card?.querySelector(".event-title")?.textContent?.trim() || `Event ${index + 1}`;
    const id = card?.dataset?.eventId || `shortlist-${index}`;
    const linkEl = card?.querySelector(".event-footer a[href]");
    const href = (linkEl?.getAttribute("href") || "").trim();
    const url = (!href || href === "#") ? "" : href;
    return { id, index, defaultLabel: title, url };
  });
}

function syncPollBuilderSelectionFromShortlist() {
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") return;
  const selectedEvents = getPollSelectedEvents();
  state.pollBuilder.selectedEventIds = selectedEvents.map((eventItem) => eventItem.id);

  const existingOverrides = state.pollBuilder.eventLabelOverrides || {};
  const nextOverrides = {};
  selectedEvents.forEach((eventItem) => {
    nextOverrides[eventItem.id] = typeof existingOverrides[eventItem.id] === "string"
      ? existingOverrides[eventItem.id]
      : eventItem.defaultLabel;
  });
  state.pollBuilder.eventLabelOverrides = nextOverrides;
}

function formatPollDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.toLocaleDateString(undefined, { day: "numeric" });
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${weekday} ${month} ${day} @ ${time}`;
}

function parsePollDateTimeValue(value) {
  const raw = String(value || "").trim();
  if (!raw || !raw.includes("T")) {
    return { date: "", hour12: "", minute: "00", period: "PM" };
  }
  const [datePart, timePart] = raw.split("T");
  const [hourRaw, minuteRaw] = String(timePart || "").split(":");
  const hour24 = Number.parseInt(hourRaw, 10);
  const minute = Number.isInteger(Number.parseInt(minuteRaw, 10)) ? String(minuteRaw).slice(0, 2) : "00";
  if (!Number.isInteger(hour24)) {
    return { date: (datePart || "").slice(0, 10), hour12: "", minute, period: "PM" };
  }
  const period = hour24 >= 12 ? "PM" : "AM";
  const normalized = hour24 % 12 || 12;
  return {
    date: (datePart || "").slice(0, 10),
    hour12: String(normalized),
    minute,
    period
  };
}

function buildPollDateTimeValue(date, hour12, minute, period) {
  const monthDay = String(date || "").trim();
  const hourRaw = Number.parseInt(String(hour12 || ""), 10);
  const minuteRaw = String(minute || "").padStart(2, "0").slice(0, 2);
  const meridiem = String(period || "PM").toUpperCase() === "PM" ? "PM" : "AM";
  if (!monthDay || !Number.isInteger(hourRaw) || hourRaw < 1 || hourRaw > 12) return "";
  let hour24 = hourRaw % 12;
  if (meridiem === "PM") hour24 += 12;
  return `${monthDay}T${String(hour24).padStart(2, "0")}:${minuteRaw}`;
}

function getTodayLocalIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalIsoDatePlusBusinessDays(businessDaysToAdd = 0) {
  const remainingTarget = Number.isInteger(businessDaysToAdd) ? Math.max(0, businessDaysToAdd) : 0;
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  let added = 0;
  while (added < remainingTarget) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      added += 1;
    }
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolvePollShareLinkUrl(linkValue) {
  const raw = String(linkValue || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = String(window.location?.origin || "").trim();
  if (!origin) return raw;
  return `${origin}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

function toPollSlug(value, fallback = "item") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const clipped = normalized.slice(0, 30);
  return clipped || fallback;
}

function getShortRandomSuffix(length = 6) {
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);
  const combined = `${randomPart}${timePart}`;
  return combined.slice(0, Math.max(4, length));
}

function toIsoOrNull(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function buildCreatePollPayload() {
  const selectedEvents = getPollSelectedEvents();
  const labelOverrides = state.pollBuilder?.eventLabelOverrides && typeof state.pollBuilder.eventLabelOverrides === "object"
    ? state.pollBuilder.eventLabelOverrides
    : {};
  const options = selectedEvents.map((eventItem, index) => {
    const overrideLabel = typeof labelOverrides[eventItem.id] === "string" ? labelOverrides[eventItem.id].trim() : "";
    const label = overrideLabel || String(eventItem.defaultLabel || `Event ${index + 1}`).trim() || `Event ${index + 1}`;
    const baseSlug = toPollSlug(label, `event_${index + 1}`);
    return {
      id: `opt_${index + 1}_${baseSlug}`,
      label
    };
  });

  const rawTimes = Array.isArray(state.pollBuilder?.proposedDateTimes)
    ? state.pollBuilder.proposedDateTimes.filter((value) => String(value || "").trim().length > 0).slice(0, 3)
    : [];
  const times = rawTimes.map((rawValue, index) => {
    const label = formatPollDateTime(rawValue) || String(rawValue || "").trim() || `Time ${index + 1}`;
    const baseSlug = toPollSlug(label, `time_${index + 1}`);
    return {
      id: `t_${index + 1}_${baseSlug}`,
      label
    };
  });

  const titleOverride = typeof state.pollBuilder?.titleOverride === "string" ? state.pollBuilder.titleOverride.trim() : "";
  const introOverride = typeof state.pollBuilder?.introMessageOverride === "string" ? state.pollBuilder.introMessageOverride.trim() : "";
  const title = titleOverride || "Help choose our next team event";
  const intro = introOverride || getDefaultPollIntro();
  const deadlineIso = toIsoOrNull(state.pollBuilder?.voteDeadlineDateTime);

  return {
    title,
    intro,
    deadlineIso,
    publicBaseUrl: POLL_PUBLIC_BASE_URL,
    options,
    times
  };
}

async function createPollInBackend(payload) {
  const response = await fetch(`${POLL_API_BASE}/polls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let responseData = null;
  try {
    responseData = await response.json();
  } catch (_error) {
    responseData = null;
  }

  if (!response.ok) {
    const apiMessage = typeof responseData?.error === "string" ? responseData.error.trim() : "";
    throw new Error(apiMessage || "We couldn’t create the poll right now. Please try again.");
  }

  if (!responseData || responseData.ok !== true || !responseData.pollId || !responseData.shareUrl) {
    throw new Error("Poll service returned an unexpected response. Please try again.");
  }

  return {
    pollId: String(responseData.pollId),
    shareUrl: String(responseData.shareUrl)
  };
}

function getPollIdForBackend() {
  const explicitPollId = String(state.pollBuilder?.pollId || "").trim();
  if (explicitPollId) return explicitPollId;

  const rawShareLink = String(state.pollBuilder?.shareLink || "").trim();
  if (!rawShareLink) return "";

  const pathMatch = rawShareLink.match(/\/poll\/([^/?#]+)/i);
  if (pathMatch?.[1]) {
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch (_error) {
      return String(pathMatch[1] || "").trim();
    }
  }

  try {
    const parsedUrl = new URL(rawShareLink, window.location?.origin || "http://localhost");
    const queryPollId = parsedUrl.searchParams.get("pollId") || parsedUrl.searchParams.get("poll") || "";
    return String(queryPollId || "").trim();
  } catch (_error) {
    return "";
  }
}

function normalizeSelectionList(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeSelectionList(entry)).filter(Boolean);
  }
  if (value && typeof value === "object") {
    if (typeof value.id === "string" && value.id.trim()) return [value.id.trim()];
    if (typeof value.label === "string" && value.label.trim()) return [value.label.trim()];
    if (typeof value.value === "string" && value.value.trim()) return [value.value.trim()];
    if (typeof value.optionId === "string" && value.optionId.trim()) return [value.optionId.trim()];
    if (typeof value.timeId === "string" && value.timeId.trim()) return [value.timeId.trim()];
    return Object.entries(value)
      .filter(([, selected]) => selected === true)
      .map(([key]) => String(key || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "number") return [String(value)];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (!trimmed.includes(",")) return [trimmed];
    return trimmed.split(",").map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

function mapSelectionsToLabels(rawSelections, idToLabelMap, labelToLabelMap) {
  const labels = normalizeSelectionList(rawSelections).map((token) => {
    const normalizedToken = String(token || "").trim();
    if (!normalizedToken) return "";
    const byId = idToLabelMap.get(normalizedToken);
    if (byId) return byId;
    const byLabel = labelToLabelMap.get(normalizedToken.toLowerCase());
    if (byLabel) return byLabel;
    return normalizedToken;
  }).filter(Boolean);
  return Array.from(new Set(labels));
}

function parsePollResultsResponse(responseData) {
  const root = (responseData?.data && typeof responseData.data === "object")
    ? responseData.data
    : responseData;
  const pollObj = (root?.poll && typeof root.poll === "object") ? root.poll : root;

  const optionsRaw = Array.isArray(root?.options)
    ? root.options
    : (Array.isArray(pollObj?.options) ? pollObj.options : []);
  const timesRaw = Array.isArray(root?.times)
    ? root.times
    : (Array.isArray(pollObj?.times)
      ? pollObj.times
      : (Array.isArray(pollObj?.timeOptions) ? pollObj.timeOptions : []));
  const optionLabels = optionsRaw
    .map((entry, index) => String(entry?.label || entry?.name || `Event ${index + 1}`).trim())
    .filter(Boolean);
  const timeLabels = timesRaw
    .map((entry, index) => String(entry?.label || entry?.name || `Time ${index + 1}`).trim())
    .filter(Boolean);

  const optionIdToLabel = new Map();
  const optionLabelLookup = new Map();
  optionsRaw.forEach((entry, index) => {
    const id = String(entry?.id || entry?.optionId || `option_${index + 1}`).trim();
    const label = String(entry?.label || entry?.name || `Event ${index + 1}`).trim();
    if (id && label) optionIdToLabel.set(id, label);
    if (label) optionLabelLookup.set(label.toLowerCase(), label);
  });

  const timeIdToLabel = new Map();
  const timeLabelLookup = new Map();
  timesRaw.forEach((entry, index) => {
    const id = String(entry?.id || entry?.timeId || `time_${index + 1}`).trim();
    const label = String(entry?.label || entry?.name || `Time ${index + 1}`).trim();
    if (id && label) timeIdToLabel.set(id, label);
    if (label) timeLabelLookup.set(label.toLowerCase(), label);
  });

  const responseCandidates = [
    root?.responses,
    root?.votes,
    root?.ballots,
    root?.submissions,
    root?.results?.responses,
    root?.results?.votes,
    pollObj?.responses,
    pollObj?.votes,
    pollObj?.ballots,
    pollObj?.submissions
  ];
  const rawResponses = responseCandidates.find((candidate) => Array.isArray(candidate)) || [];

  const normalizedResponses = rawResponses.map((entry, index) => {
    const voterName = String(
      entry?.voterName
      || entry?.name
      || entry?.employeeName
      || entry?.respondentName
      || entry?.email
      || `Voter ${index + 1}`
    ).trim();

    const selectedEvents = mapSelectionsToLabels(
      entry?.selectedEvents
      ?? entry?.events
      ?? entry?.eventOptionId
      ?? entry?.optionIds
      ?? entry?.selectedOptionIds
      ?? entry?.eventOptionIds,
      optionIdToLabel,
      optionLabelLookup
    );

    const selectedTimes = mapSelectionsToLabels(
      entry?.selectedTimes
      ?? entry?.times
      ?? entry?.timeOptionIds
      ?? entry?.timeIds
      ?? entry?.selectedTimeIds
      ?? entry?.availabilityIds,
      timeIdToLabel,
      timeLabelLookup
    );

    return {
      voterName,
      selectedEvents,
      selectedTimes
    };
  }).filter((entry) => entry.voterName);

  const deadlineIso = String(
    root?.deadlineIso
    || root?.deadline
    || pollObj?.deadlineIso
    || pollObj?.deadline
    || ""
  ).trim();

  return {
    responses: normalizedResponses,
    deadlineIso: deadlineIso || "",
    optionLabels,
    timeLabels
  };
}

async function syncPollResultsFromBackend() {
  const pollId = getPollIdForBackend();
  if (!pollId) {
    throw new Error("Poll ID is missing. Create the poll link first.");
  }

  const encodedPollId = encodeURIComponent(pollId);
  const endpointCandidates = [
    `${POLL_API_BASE}/polls/${encodedPollId}/results`,
    `${POLL_API_BASE}/polls/${encodedPollId}`
  ];

  let lastErrorMessage = "";
  for (const endpoint of endpointCandidates) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        lastErrorMessage = `Request failed (${response.status})`;
        continue;
      }

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_error) {
        lastErrorMessage = "Invalid JSON response";
        continue;
      }

      const parsed = parsePollResultsResponse(responseData);
      state.pollBuilder.responses = Array.isArray(parsed.responses) ? parsed.responses : [];
      state.pollBuilder.backendOptionLabels = Array.isArray(parsed.optionLabels) ? parsed.optionLabels : [];
      state.pollBuilder.backendTimeLabels = Array.isArray(parsed.timeLabels) ? parsed.timeLabels : [];
      if (!state.pollBuilder.pollId) {
        state.pollBuilder.pollId = pollId;
      }
      if (!state.pollBuilder.voteDeadlineDateTime && parsed.deadlineIso) {
        state.pollBuilder.voteDeadlineDateTime = parsed.deadlineIso;
      }
      pollUiState.resultsSyncLastAt = Date.now();
      persistState();
      return;
    } catch (error) {
      lastErrorMessage = String(error?.message || "").trim();
    }
  }

  throw new Error(lastErrorMessage || "Couldn’t load latest poll results.");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDefaultPollInviteMessage(deadlineText, shareLink, eventLabels = []) {
  const safeLabels = Array.isArray(eventLabels) && eventLabels.length
    ? eventLabels.map((label, index) => String(label || `Event ${index + 1}`).trim() || `Event ${index + 1}`)
    : ["Event 1", "Event 2", "Event 3"];
  const separator = "\u00A0\u00A0/\u00A0\u00A0";
  const eventsLine = safeLabels.join(separator);
  return [
    "We’re planning our next team event and would love your input.",
    "",
    "Which of these events would you join?",
    eventsLine,
    "",
    "Voting takes under a minute — just pick the event(s) you’d attend and any times that work.",
    "",
    `Please vote by ${deadlineText || "[deadline]"} so we can lock it in.`,
    "",
    `👉 Vote here: ${shareLink || "[link]"}`
  ].join("\n");
}

function getDefaultPollReminderMessage(deadlineText, shareLink, eventLabels = []) {
  const safeLabels = Array.isArray(eventLabels) && eventLabels.length
    ? eventLabels.map((label, index) => String(label || `Event ${index + 1}`).trim() || `Event ${index + 1}`)
    : ["Event 1", "Event 2", "Event 3"];
  const subject = "Reminder: RSVP for our upcoming team event";
  const eventsPlainLine = safeLabels.join(" / ");
  const eventsHtmlLine = safeLabels
    .map((label) => `<span style=\"font-weight:700;\">${escapeHtml(label)}</span>`)
    .join(` <span style=\"font-weight:400;\">/</span> `);
  const pollLinkText = shareLink || "[Poll link]";
  const deadlineValue = deadlineText || "[deadline]";

  const bodyPlain = [
    "Quick reminder — we’re finalizing plans for our upcoming team event.",
    "",
    "We’re choosing between:",
    eventsPlainLine,
    "",
    "If you haven’t RSVPed yet, it takes under a minute:",
    "",
    `👉 ${pollLinkText}`,
    "",
    `Please respond by ${deadlineValue} so we can confirm the details.`
  ].join("\n");

  const fullPlain = `Subject (if email): ${subject}\n\n${bodyPlain}`;

  const previewHtml = `
    <div><span style="font-weight:700;">Subject (if email):</span> ${escapeHtml(subject)}</div>
    <br>
    <div>Quick reminder — we’re finalizing plans for our upcoming team event.</div>
    <br>
    <div>We’re choosing between:</div>
    <div>${eventsHtmlLine}</div>
    <br>
    <div>If you haven’t RSVPed yet, it takes under a minute:</div>
    <br>
    <div>👉 ${escapeHtml(pollLinkText)}</div>
    <br>
    <div>Please respond by <span style="font-weight:700;">${escapeHtml(deadlineValue)}</span> so we can confirm the details.</div>
  `;

  return {
    subject,
    bodyPlain,
    fullPlain,
    previewHtml
  };
}

function normalizePollChoiceList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(",").map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

function getFallbackPollResponses(eventLabels = [], timeLabels = []) {
  const voterNames = [
    "Alex",
    "Avery",
    "Blake",
    "Casey",
    "Devon",
    "Emerson",
    "Finley",
    "Harper",
    "Jordan",
    "Kai",
    "Morgan",
    "Parker",
    "Quinn",
    "Riley"
  ];

  return voterNames.map((name, index) => {
    const selectedEvents = [];
    const selectedTimes = [];
    if (eventLabels.length) {
      selectedEvents.push(eventLabels[index % eventLabels.length]);
      if (eventLabels.length > 1 && index % 4 === 0) {
        selectedEvents.push(eventLabels[(index + 1) % eventLabels.length]);
      }
    }
    if (timeLabels.length) {
      selectedTimes.push(timeLabels[(index + 1) % timeLabels.length]);
      if (timeLabels.length > 1 && index % 3 === 0) {
        selectedTimes.push(timeLabels[(index + 2) % timeLabels.length]);
      }
    }
    return {
      voterName: name,
      selectedEvents,
      selectedTimes
    };
  });
}

function buildPollResponsesModel(eventLabels = [], timeLabels = [], rawTimeValues = [], responsesOverride = null) {
  const normalizedEventLabels = eventLabels.length ? eventLabels : ["Event 1", "Event 2", "Event 3"];
  const normalizedTimeLabels = timeLabels.length ? timeLabels : rawTimeValues.map((value) => formatPollDateTime(value) || String(value || "")).filter(Boolean);

  const eventLookup = new Map(normalizedEventLabels.map((label, index) => [String(label || "").trim().toLowerCase(), normalizedEventLabels[index]]));
  const timeLookup = new Map(normalizedTimeLabels.map((label, index) => [String(label || "").trim().toLowerCase(), normalizedTimeLabels[index]]));

  const hasResponsesOverride = Array.isArray(responsesOverride);
  const hasRealPollReference = Boolean(
    String(state.pollBuilder?.pollId || "").trim()
    || String(state.pollBuilder?.shareLink || "").trim()
  );
  const rawResponses = hasResponsesOverride
    ? responsesOverride
    : (Array.isArray(state.pollBuilder?.responses) ? state.pollBuilder.responses : []);
  const normalizedResponses = rawResponses.map((response, index) => {
    const name = String(response?.voterName || response?.name || response?.employeeName || response?.employee || `Person ${index + 1}`).trim();
    const eventChoicesRaw = normalizePollChoiceList(response?.selectedEvents || response?.events || response?.eventLabels || response?.eventIds || response?.selectedEventIds);
    const timeChoicesRaw = normalizePollChoiceList(response?.selectedTimes || response?.times || response?.dateTimes || response?.proposedDateTimes || response?.timeSlots);

    const selectedEvents = eventChoicesRaw.map((choice) => {
      if (typeof choice === "number" && normalizedEventLabels[choice]) return normalizedEventLabels[choice];
      const normalized = String(choice || "").trim().toLowerCase();
      return eventLookup.get(normalized) || "";
    }).filter(Boolean);

    const selectedTimes = timeChoicesRaw.map((choice) => {
      if (typeof choice === "number" && normalizedTimeLabels[choice]) return normalizedTimeLabels[choice];
      const rawValue = String(choice || "").trim();
      const normalized = rawValue.toLowerCase();
      const direct = timeLookup.get(normalized);
      if (direct) return direct;
      const formatted = formatPollDateTime(rawValue);
      if (formatted && timeLookup.has(formatted.toLowerCase())) return formatted;
      return "";
    }).filter(Boolean);

    return { voterName: name, selectedEvents, selectedTimes };
  }).filter((entry) => entry.voterName);

  const shouldUseFallbackResponses = !hasResponsesOverride && !hasRealPollReference;
  const responses = normalizedResponses.length
    ? normalizedResponses
    : (shouldUseFallbackResponses ? getFallbackPollResponses(normalizedEventLabels, normalizedTimeLabels) : []);

  const eventSets = new Map(normalizedEventLabels.map((label) => [label, new Set()]));
  const timeSets = new Map(normalizedTimeLabels.map((label) => [label, new Set()]));

  responses.forEach((response) => {
    const voterName = String(response.voterName || "").trim();
    if (!voterName) return;
    response.selectedEvents.forEach((label) => {
      if (!eventSets.has(label)) eventSets.set(label, new Set());
      eventSets.get(label).add(voterName);
    });
    response.selectedTimes.forEach((label) => {
      if (!timeSets.has(label)) timeSets.set(label, new Set());
      timeSets.get(label).add(voterName);
    });
  });

  const buildRows = (labels, sourceMap) => labels.map((label) => {
    const voters = Array.from(sourceMap.get(label) || []).sort((a, b) => a.localeCompare(b));
    return { label, count: voters.length, voters };
  });

  const eventRows = buildRows(normalizedEventLabels, eventSets);
  const timeRows = buildRows(normalizedTimeLabels, timeSets);

  const topEvent = eventRows.reduce((best, row) => (row.count > best.count ? row : best), eventRows[0] || { label: "—", count: 0, voters: [] });
  const topTime = timeRows.reduce((best, row) => (row.count > best.count ? row : best), timeRows[0] || { label: "—", count: 0, voters: [] });

  return {
    totalVotes: responses.length,
    topEvent,
    topTime,
    eventRows,
    timeRows
  };
}

function isPollResponsesDebugMode() {
  try {
    const queryDebug = new URLSearchParams(String(window.location?.search || "")).get("debug") === "1";
    const storageDebug = String(window.localStorage?.getItem("eeosDebug") || "") === "1";
    return queryDebug || storageDebug;
  } catch (_error) {
    return false;
  }
}

function getDebugDeadlinePresetValue(preset) {
  const now = Date.now();
  const offsets = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "18h": 18 * 60 * 60 * 1000,
    "45m": 45 * 60 * 1000,
    closed: -5 * 60 * 1000
  };
  const offset = offsets[preset];
  if (typeof offset !== "number") return "";
  return new Date(now + offset).toISOString();
}

function getDebugResponsesPreset(preset, eventLabels = [], timeLabels = []) {
  if (preset === "none") return [];

  const sampleNamesSome = ["Alex", "Bailey", "Casey", "Drew", "Emery", "Frankie"];
  const sampleNamesMany = [
    "Alex", "Avery", "Blake", "Casey", "Devon", "Emerson", "Finley", "Harper", "Jordan", "Kai",
    "Logan", "Morgan", "Nico", "Parker", "Quinn", "Riley", "Rowan", "Sage", "Skyler", "Taylor"
  ];
  const names = preset === "many" ? sampleNamesMany : sampleNamesSome;
  if (!names.length) return [];

  return names.map((name, index) => {
    const selectedEvents = [];
    const selectedTimes = [];

    if (eventLabels.length) {
      selectedEvents.push(eventLabels[index % eventLabels.length]);
      if (eventLabels.length > 1 && index % 3 === 0) {
        selectedEvents.push(eventLabels[(index + 1) % eventLabels.length]);
      }
    }

    if (timeLabels.length) {
      selectedTimes.push(timeLabels[(index + 1) % timeLabels.length]);
      if (timeLabels.length > 1 && index % 4 === 0) {
        selectedTimes.push(timeLabels[(index + 2) % timeLabels.length]);
      }
    }

    return {
      voterName: name,
      selectedEvents,
      selectedTimes
    };
  });
}

function getEffectivePollViewModel({
  eventLabels = [],
  timeLabels = [],
  rawTimeValues = [],
  baseDeadlineValue = "",
  baseDeadlineText = "",
  timeZoneLabel = "",
  shareLink = ""
} = {}) {
  const forcePollClosed = Boolean(FORCE_POLL_CLOSED_ADMIN_VIEW);
  const forcePollOpen = Boolean(FORCE_POLL_OPEN_ADMIN_VIEW);
  const isDebugMode = isPollResponsesDebugMode();
  const debugOverrides = (isDebugMode && pollUiState.pollPreviewOverrides && typeof pollUiState.pollPreviewOverrides === "object")
    ? pollUiState.pollPreviewOverrides
    : {};

  const hasResponseOverride = Array.isArray(debugOverrides.responses);
  const storedResponses = Array.isArray(state.pollBuilder?.responses) ? state.pollBuilder.responses : null;
  const effectiveDeadlineValue = (isDebugMode && String(debugOverrides.deadline || "").trim())
    ? String(debugOverrides.deadline || "").trim()
    : String(baseDeadlineValue || "").trim();

  const model = buildPollResponsesModel(
    eventLabels,
    timeLabels,
    rawTimeValues,
    hasResponseOverride ? debugOverrides.responses : storedResponses
  );

  const recommendationOverride = isDebugMode ? debugOverrides.recommendedPlan : null;
  const recommendedLabel = typeof recommendationOverride === "string" && recommendationOverride.trim()
    ? recommendationOverride.trim()
    : (recommendationOverride && typeof recommendationOverride === "object")
      ? `${String(recommendationOverride.event || model.topEvent?.label || "—")} — ${String(recommendationOverride.time || model.topTime?.label || "—")}`
      : `${model.topEvent?.label || "—"} — ${model.topTime?.label || "—"}`;

  let countdownStatus = getPollCloseCountdownStatus(effectiveDeadlineValue);
  const pollStatusOverride = isDebugMode ? String(debugOverrides.pollStatus || "").toLowerCase() : "";
  if (forcePollOpen || pollStatusOverride === "open") {
    countdownStatus = { text: "Poll open", dotClass: "bg-emerald-500", isClosed: false };
  } else if (forcePollClosed || pollStatusOverride === "closed") {
    countdownStatus = { text: "Poll closed", dotClass: "bg-slate-500", isClosed: true };
  } else if (pollStatusOverride === "open" && countdownStatus.isClosed) {
    countdownStatus = { text: "Poll open", dotClass: "bg-emerald-500", isClosed: false };
  }

  const deadlineText = effectiveDeadlineValue
    ? `${formatPollDateTime(effectiveDeadlineValue) || baseDeadlineText || ""}${timeZoneLabel ? ` (${timeZoneLabel})` : ""}`
    : baseDeadlineText;
  const reminderMessage = getDefaultPollReminderMessage(deadlineText, shareLink, eventLabels);

  return {
    isDebugMode,
    model: {
      ...model,
      recommendedLabel
    },
    countdownStatus,
    reminderMessage,
    effectiveDeadlineValue
  };
}

function getPollResponsesBreakdownHtml(title, rows = []) {
  const highestCount = rows.length ? Math.max(...rows.map((row) => Number(row.count || 0))) : 0;
  const scaleBase = Math.max(1, highestCount);
  const rowsHtml = rows.map((row) => {
    const count = Number(row.count || 0);
    const widthPercent = count > 0 ? Math.max(6, Math.round((count / scaleBase) * 100)) : 0;
    const isTop = rows.length > 0 && count === highestCount;
    const rowCardStyle = isTop
      ? "background:#F3F4F6;border:1px solid #D1D5DB;"
      : "background:#FFFFFF;border:1px solid #E5E7EB;";
    const barColor = isTop ? "#94A3B8" : "#CBD5E1";
    const leadingBadge = isTop
      ? `<span class="rounded-full px-2 py-0.5 text-xs font-medium" style="background:#E5E7EB;color:#374151;">Leading</span>`
      : "";
    const votersHtml = row.voters.length
      ? row.voters.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
      : `<li class="text-slate-400">No votes yet</li>`;
    return `
      <div class="rounded-lg p-3" style="${rowCardStyle}">
        <div class="flex items-start justify-between gap-2">
          <div class="text-sm font-semibold text-slate-900">${escapeHtml(row.label)}</div>
          ${leadingBadge}
        </div>
        <div class="mt-2 flex items-center gap-2">
          <div class="h-5 rounded-sm" style="width:${widthPercent}%;background:${barColor};"></div>
          <span class="text-sm font-semibold text-slate-700">${count}</span>
        </div>
        <ul class="mt-2 space-y-1 text-xs text-slate-600">${votersHtml}</ul>
      </div>
    `;
  }).join("");

  return `
    <section class="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 class="text-sm font-semibold text-slate-900">${escapeHtml(title)}</h4>
      <div class="mt-3 space-y-3">${rowsHtml}</div>
    </section>
  `;
}

function getPollResponsesPageHtml(model, reminderUi = {}) {
  const topEventLabel = model.topEvent?.label || "—";
  const topTimeLabel = model.topTime?.label || "—";
  const recommendedLabel = String(model.recommendedLabel || `${topEventLabel} — ${topTimeLabel}`);
  const isPollClosed = Boolean(reminderUi.isPollClosed);
  const reminderPanelOpen = Boolean(reminderUi.reminderPanelOpen);
  const isDebugMode = Boolean(reminderUi.isDebugMode);
  const debugPreviewPanelOpen = Boolean(reminderUi.debugPreviewPanelOpen);
  const debugResponsesPreset = String(reminderUi.debugResponsesPreset || "");
  const debugDeadlinePreset = String(reminderUi.debugDeadlinePreset || "");
  const reminderChannel = String(reminderUi.reminderChannel || "slack") === "email" ? "email" : "slack";
  const isEmailMode = reminderChannel === "email";
  const reminderHelperVisible = Boolean(reminderUi.reminderHelperVisible);
  const reminderCopyBusy = Boolean(reminderUi.reminderCopyBusy);
  const reminderSubjectCopyBusy = Boolean(reminderUi.reminderSubjectCopyBusy);
  const reminderCopyLabel = reminderCopyBusy ? "Copied" : "Copy message";
  const reminderCopyButtonClass = reminderCopyBusy
    ? "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white opacity-90"
    : "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700 active:bg-slate-800";
  const reminderSubject = String(reminderUi.reminderSubject || "Reminder: RSVP for our upcoming team event");
  const reminderBodyPlain = String(reminderUi.reminderBodyPlain || "");
  const helperMessage = "Just paste the message anywhere — Teams, email, SMS all work. Later, you can save your preferred tools in Settings for the next event.";
  const countdownText = String(reminderUi.countdownText || "Poll closed");
  const countdownDotClass = String(reminderUi.countdownDotClass || "bg-slate-500");
  const resultsSyncBusy = Boolean(reminderUi.resultsSyncBusy);
  const resultsSyncError = String(reminderUi.resultsSyncError || "").trim();
  const headerTitle = isPollClosed ? "Recommended Plan" : "Poll Responses";
  const toggleSlackClass = isEmailMode
    ? "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    : "rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white";
  const toggleEmailClass = isEmailMode
    ? "rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50";
  const subjectCopyLabel = reminderSubjectCopyBusy ? "Copied" : "Copy subject";
  const subjectCopyClass = reminderSubjectCopyBusy
    ? "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 opacity-80"
    : "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50";
  const formatCurrency = (value) => {
    const numeric = Number(value || 0);
    return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };
  const pollClosedAtText = String(reminderUi.pollClosedAtText || "Poll closed");
  const rsvpDeadlineText = String(reminderUi.rsvpDeadlineText || "Date/Time");
  const rsvpSetupOpen = Boolean(reminderUi.rsvpSetupOpen);
  const rsvpCollectionStarted = Boolean(reminderUi.rsvpCollectionStarted);
  const pollCreated = Boolean(reminderUi.pollCreated);
  const pollLive = Boolean(reminderUi.pollLive);
  const pollClosed = Boolean(reminderUi.pollClosed);
  const pollRsvpSent = Boolean(reminderUi.pollRsvpSent);
  const rsvpDeadlineDate = String(reminderUi.rsvpDeadlineDate || "");
  const rsvpDeadlineHour = String(reminderUi.rsvpDeadlineHour || "12");
  const rsvpDeadlineMinute = String(reminderUi.rsvpDeadlineMinute || "00");
  const rsvpDeadlinePeriod = String(reminderUi.rsvpDeadlinePeriod || "PM");
  const rsvpDeadlineTimeZone = String(reminderUi.rsvpDeadlineTimeZone || reminderUi.defaultTimeZone || "Central");
  const rsvpDeadlineEditing = reminderUi.rsvpDeadlineEditing !== false;
  const rsvpDeadlineDisplayText = String(reminderUi.rsvpDeadlineDisplayText || "Date/Time");
  const rsvpCopyBusy = Boolean(reminderUi.rsvpCopyBusy);
  const rsvpShareStatus = String(reminderUi.rsvpShareStatus || "");
  const rsvpShareDisabled = Boolean(reminderUi.rsvpShareDisabled);
  const rsvpContinueDisabled = Boolean(reminderUi.rsvpContinueDisabled);
  const rsvpCreateBusy = Boolean(reminderUi.rsvpCreateBusy);
  const rsvpCreateError = String(reminderUi.rsvpCreateError || "").trim();
  const rsvpSharedConfirmed = Boolean(reminderUi.rsvpSharedConfirmed);
  const rsvpAttendeesExpanded = Boolean(reminderUi.rsvpAttendeesExpanded);
  const rsvpYesCount = Math.max(0, Number(reminderUi.rsvpYesCount || 0));
  const rsvpNoCount = Math.max(0, Number(reminderUi.rsvpNoCount || 0));
  const rsvpTotalResponses = Math.max(0, Number(reminderUi.rsvpTotalResponses || 0));
  const rsvpEmployeeCount = Math.max(0, Number(reminderUi.rsvpEmployeeCount || 0));
  const rsvpAwaiting = rsvpEmployeeCount > 0 ? Math.max(rsvpEmployeeCount - rsvpTotalResponses, 0) : 0;
  const rsvpProgressPct = rsvpEmployeeCount > 0
    ? Math.max(0, Math.min(100, Math.round((rsvpTotalResponses / rsvpEmployeeCount) * 100)))
    : 0;
  const rsvpAttendingNames = Array.isArray(reminderUi.rsvpAttendingNames)
    ? reminderUi.rsvpAttendingNames.filter(Boolean)
    : [];
  const attendeePreviewLimit = 9;
  const hasMoreAttendees = rsvpAttendingNames.length > attendeePreviewLimit;
  const visibleAttendees = rsvpAttendeesExpanded
    ? rsvpAttendingNames
    : rsvpAttendingNames.slice(0, attendeePreviewLimit);
  const rsvpMessageSubject = String(reminderUi.rsvpMessageSubject || `Confirm your spot — ${topEventLabel || "Selected event"}`);
  const rsvpMessageBodyPlain = String(
    reminderUi.rsvpMessageBodyPlain
      || `We’re booking ${topEventLabel || "this event"} on ${topTimeLabel || "the selected time"}.\nPlease confirm if you’ll attend so we can finalize the headcount.\n\nRSVP`
  );
  const rsvpCopyLabel = rsvpCopyBusy ? "Copied" : "Copy message";
  const rsvpCopyClass = rsvpCopyBusy
    ? "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white opacity-90"
    : "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700 active:bg-slate-800";
  const rsvpDisabledClass = rsvpShareDisabled ? " opacity-50 cursor-not-allowed" : "";
  const rsvpShareDisabledAttr = rsvpShareDisabled ? "disabled" : "";
  const rsvpHourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const rsvpMinuteOptions = ["00", "15", "30", "45"];
  const locationTypeText = String(reminderUi.locationType || "In-person");
  const estimatedCostPerPerson = Number(reminderUi.estimatedCostPerPerson || 35);
  const estimatedAttendees = Math.max(1, Number(reminderUi.estimatedAttendees || model.totalVotes || 14));
  const estimatedTotal = Math.round(estimatedCostPerPerson * estimatedAttendees);
  const monthlyBudgetRemaining = Number(reminderUi.monthlyBudgetRemaining || getBudgetTotal());
  const budgetAfterBooking = monthlyBudgetRemaining - estimatedTotal;
  const currentMonthLabel = new Date().toLocaleDateString(undefined, { month: "long" });
  const eventSnapshotRowsRaw = Array.isArray(model.eventRows) ? [...model.eventRows] : [];
  const timeSnapshotRowsRaw = Array.isArray(model.timeRows) ? [...model.timeRows] : [];
  const eventSnapshotRows = (eventSnapshotRowsRaw.length ? eventSnapshotRowsRaw : [{ label: "Event 1", count: 0 }])
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 3);
  const timeSnapshotRows = (timeSnapshotRowsRaw.length ? timeSnapshotRowsRaw : [{ label: "Time", count: 0 }])
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, 3);
  const eventMaxCount = Math.max(1, ...eventSnapshotRows.map((row) => Number(row.count || 0)));
  const timeMaxCount = Math.max(1, ...timeSnapshotRows.map((row) => Number(row.count || 0)));
  const eventSnapshotHtml = eventSnapshotRows.map((row, index) => {
    const count = Number(row.count || 0);
    const widthPercent = Math.max(6, Math.round((count / eventMaxCount) * 100));
    const percent = model.totalVotes ? Math.round((count / Math.max(1, model.totalVotes)) * 100) : 0;
    const isLeading = count === eventMaxCount && index === 0;
    return `
      <div class="rounded-lg border ${isLeading ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white"} px-3 py-2">
        <div class="mb-2 flex items-center justify-between gap-2 text-xs">
          <span class="font-medium text-slate-700">${escapeHtml(row.label || "Event")}</span>
          <span class="text-slate-600">${count} • ${percent}%</span>
        </div>
        <div class="h-2 rounded-full bg-slate-100">
          <div class="h-2 rounded-full ${isLeading ? "bg-slate-500" : "bg-slate-400"}" style="width:${widthPercent}%;"></div>
        </div>
      </div>
    `;
  }).join("");
  const timeSnapshotHtml = timeSnapshotRows.map((row, index) => {
    const count = Number(row.count || 0);
    const widthPercent = Math.max(6, Math.round((count / timeMaxCount) * 100));
    const percent = model.totalVotes ? Math.round((count / Math.max(1, model.totalVotes)) * 100) : 0;
    const isLeading = count === timeMaxCount && index === 0;
    return `
      <div class="rounded-lg border ${isLeading ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white"} px-3 py-2">
        <div class="mb-2 flex items-center justify-between gap-2 text-xs">
          <span class="font-medium text-slate-700">${escapeHtml(row.label || "Time")}</span>
          <span class="text-slate-600">${count} available • ${percent}%</span>
        </div>
        <div class="h-2 rounded-full bg-slate-100">
          <div class="h-2 rounded-full ${isLeading ? "bg-slate-500" : "bg-slate-400"}" style="width:${widthPercent}%;"></div>
        </div>
      </div>
    `;
  }).join("");
  const primaryButtonRowHtml = isEmailMode
    ? `
      <div class="mt-3 flex flex-col gap-3 md:flex-row">
        <button id="pollReminderCopyMessage" type="button" ${reminderCopyBusy ? "disabled" : ""} class="w-full md:w-auto ${reminderCopyButtonClass}">${reminderCopyLabel}</button>
        <button id="pollReminderOpenGmail" type="button" class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto">Open Gmail</button>
      </div>
    `
    : `
      <div class="mt-3 flex flex-col gap-3 md:flex-row">
        <button id="pollReminderCopyMessage" type="button" ${reminderCopyBusy ? "disabled" : ""} class="w-full md:w-auto ${reminderCopyButtonClass}">${reminderCopyLabel}</button>
        <button id="pollReminderOpenSlack" type="button" class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto">Open Slack</button>
      </div>
    `;
  const presetButtonClass = (isActive) => isActive
    ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50";
  const pollProgressStages = ["Poll Created", "Poll Live", "Poll Closed", "RSVP Sent"];
  const pollProgressActiveIndex = (() => {
    if (!pollCreated) return 0;
    if (!pollLive) return 1;
    if (!pollClosed) return 2;
    if (!pollRsvpSent) return 3;
    return pollProgressStages.length;
  })();
  const pollProgressBarHtml = getHorizontalProcessBarHtml(pollProgressStages, pollProgressActiveIndex);
  return `
    <div>
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 class="text-[22px] font-semibold text-slate-900">${headerTitle}</h3>
        <div class="mt-1 flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 md:mt-0 md:justify-end md:gap-4">
          ${isPollClosed ? "" : `<div class="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><span class="h-2 w-2 rounded-full ${countdownDotClass}"></span><span>${escapeHtml(countdownText)}</span></div>`}
          ${isPollClosed ? "" : `<button id="pollReminderToggle" type="button" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700 hover:bg-slate-50 sm:w-auto">Send reminder</button>`}
        </div>
      </div>
      ${resultsSyncBusy ? `<div class="mt-2 text-xs text-slate-500">Refreshing latest votes…</div>` : ""}
      ${resultsSyncError ? `<div class="mt-2 text-xs text-amber-700">${escapeHtml(resultsSyncError)}</div>` : ""}
      ${isPollClosed ? `
        <section id="pollClosedTopPanel" class="w-full space-y-4">
          ${pollProgressBarHtml}

          <div class="flex flex-col gap-6 md:flex-row md:items-stretch">
            <div id="recommendedPlanLeft" class="space-y-4 md:flex md:h-full md:w-[65%] md:flex-col">
              <article id="recommendedEventBlock" class="rounded-xl border border-slate-200 bg-white p-5 md:flex-1">
                <div>
                  <div class="mb-[20px] flex items-center gap-2 text-[8pt] text-slate-500">
                    <span class="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">TOP CHOICE</span>
                    <span class="font-normal">Selected based on RSVPs and availiability overlap. <span class="underline">Change</span></span>
                  </div>
                  <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div class="min-w-0 md:flex-1">
                      <h4 class="text-2xl font-semibold text-slate-900">${escapeHtml(topEventLabel || "Escape Room Experience")}</h4>

                      <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                        <span>${escapeHtml(topTimeLabel || "Thu, Mar 14 @ 5:00 PM (CST)")}</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">${escapeHtml(locationTypeText)}</span>
                      </div>

                      <p class="mt-3 text-sm font-normal text-slate-600">Lorem ispum lorum ipsum dolor. Lorem ispum lorum ipsum dolor Lorem ispum lorum ipsum dolor Lorem ispum lorum ipsum dolor. Lorem ispum lorum ipsum dolor.</p>

                    </div>
                    <div class="md:shrink-0 md:w-44">
                      <img
                        src="assets/event-placeholder.svg"
                        alt="Recommended event placeholder"
                        class="ml-auto block rounded-lg border border-slate-200 object-cover"
                        style="width:149.6px;height:95.2px;"
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-[31px] rounded-xl border border-slate-200 bg-white px-2 py-1">
                  <div class="grid grid-cols-1 md:grid-cols-4">
                    <div class="px-3 py-1">
                      <div class="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-3.5 w-3.5 text-slate-500" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M20.59 13.41 11 23l-9-9V4h10z" />
                          <circle cx="7" cy="7" r="1.5" />
                        </svg>
                        <span>Cost</span>
                      </div>
                      <div class="mt-1 text-[13px] leading-tight text-slate-900"><span class="font-semibold">${formatCurrency(estimatedCostPerPerson)}</span> <span class="font-normal">per person</span></div>
                    </div>
                    <div class="border-t border-slate-200 px-3 py-1 md:border-l md:border-t-0">
                      <div class="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-3.5 w-3.5 text-slate-500" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5Z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5h18" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7 14h4" />
                        </svg>
                        <span>Est. Total</span>
                      </div>
                      <div class="mt-1 text-[13px] font-semibold leading-tight text-slate-900">${formatCurrency(estimatedTotal)}</div>
                    </div>
                    <div class="border-t border-slate-200 px-3 py-1 md:border-l md:border-t-0">
                      <div class="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-3.5 w-3.5 text-slate-500" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.5v-1.2A3.3 3.3 0 0 0 11.7 15H6.3A3.3 3.3 0 0 0 3 18.3v1.2" />
                          <circle cx="9" cy="9" r="3" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 19.5v-1a3 3 0 0 0-2.4-2.94" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.5 6.2a3 3 0 0 1 0 5.6" />
                        </svg>
                        <span>Est. Attendees</span>
                      </div>
                      <div class="mt-1 text-[13px] font-semibold leading-tight text-slate-900">${estimatedAttendees} people</div>
                    </div>
                    <div class="border-t border-slate-200 px-3 py-1 md:border-l md:border-t-0">
                      <div class="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-3.5 w-3.5 text-slate-500" aria-hidden="true">
                          <circle cx="12" cy="12" r="8.5" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.8V12l3 1.8" />
                        </svg>
                        <span>Duration</span>
                      </div>
                      <div class="mt-1 text-[13px] font-semibold leading-tight text-slate-900">90 minutes</div>
                    </div>
                  </div>
                </div>

                <div class="mt-[10px] text-[12px] font-normal text-slate-400">
                  Est. budget left after booking: <span class="font-semibold text-slate-400">${formatCurrency(budgetAfterBooking)}</span>
                </div>
              </article>

              ${(rsvpSetupOpen || rsvpCollectionStarted) ? `
                <div class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                  <div class="text-sm font-semibold text-slate-800">✔ Event confirmed for final headcount</div>
                  <div class="mt-1 text-xs text-slate-500">You’re now collecting RSVPs before booking.</div>
                </div>
              ` : `
                <div class="flex flex-col gap-3 md:flex-row md:items-stretch">
                  <div class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div class="flex items-start gap-2 text-sm text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6" />
                        <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
                      </svg>
                      <span class="text-[12px] font-semibold">Confirm this event and collect final headcount before booking.</span>
                    </div>
                  </div>
                  <button id="pollClosedGetRsvpLink" type="button" ${rsvpCreateBusy ? "disabled" : ""} class="rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto md:px-7">${rsvpCreateBusy ? "Creating…" : "Send RSVP"}</button>
                </div>
                ${rsvpCreateError ? `<div class="mt-2 text-xs text-amber-700">${escapeHtml(rsvpCreateError)}</div>` : ""}
              `}
            </div>

            <aside id="pollSnapshotRight" class="rounded-xl border border-slate-200 bg-white p-5 md:w-[35%]">
              <h4 class="text-lg font-semibold text-slate-900">Poll Snapshot</h4>

              <div id="snapshotTopEventRow" class="mt-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Event results</div>
                <div class="space-y-2">${eventSnapshotHtml}</div>
              </div>

              <div id="snapshotTopTimeRow" class="mt-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Time availability (for selected event)</div>
                <div class="space-y-2">${timeSnapshotHtml}</div>
              </div>
            </aside>
          </div>

          ${rsvpSetupOpen ? `
            <section id="pollRsvpSetupPanel" class="rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
              <div>
                <h4 class="text-base font-semibold text-slate-900">Collect Final RSVPs</h4>
                <p class="mt-1 text-sm text-slate-600">Set a response deadline and send the RSVP to confirm final headcount before booking.</p>
              </div>

              <div class="mt-4">
                <div class="text-sm font-semibold text-slate-900">What your team will receive</div>
                <div class="mt-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div class="text-sm font-semibold text-slate-900">${escapeHtml(rsvpMessageSubject)}</div>
                  <div class="mt-2 text-sm text-slate-700">We’re booking ${escapeHtml(topEventLabel || "this event")} on ${escapeHtml(topTimeLabel || "the selected time")}.</div>
                  <div class="mt-1 text-sm text-slate-700">Please confirm if you’ll attend so we can finalize the headcount.</div>
                  ${rsvpDeadlineEditing ? `
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                      <span class="font-medium">RSVP by</span>
                      <input id="pollRsvpDeadlineDate" type="date" value="${escapeHtml(rsvpDeadlineDate)}" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                      <select id="pollRsvpDeadlineHour" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900">
                        ${rsvpHourOptions.map((hour) => `<option value="${hour}" ${hour === rsvpDeadlineHour ? "selected" : ""}>${hour}</option>`).join("")}
                      </select>
                      <select id="pollRsvpDeadlineMinute" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900">
                        ${rsvpMinuteOptions.map((minute) => `<option value="${minute}" ${minute === rsvpDeadlineMinute ? "selected" : ""}>${minute}</option>`).join("")}
                      </select>
                      <select id="pollRsvpDeadlinePeriod" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900">
                        <option value="AM" ${rsvpDeadlinePeriod === "AM" ? "selected" : ""}>AM</option>
                        <option value="PM" ${rsvpDeadlinePeriod === "PM" ? "selected" : ""}>PM</option>
                      </select>
                      <button id="pollRsvpDeadlineSubmit" type="button" class="rounded-lg border border-slate-800 bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700">Submit</button>
                    </div>
                  ` : `
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                      <span class="font-medium">RSVP by</span>
                      <span class="text-sm text-slate-900">${escapeHtml(rsvpDeadlineDisplayText)}</span>
                      <button id="pollRsvpDeadlineEdit" type="button" aria-label="Edit RSVP deadline" class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs leading-none text-slate-400 hover:bg-slate-100">×</button>
                    </div>
                  `}
                  <div class="mt-1 text-sm text-slate-700">RSVP here: [RSVP link]</div>
                </div>
              </div>

              <div class="mt-4">
                <div class="text-sm font-semibold text-slate-900">Send RSVP to your team</div>
                <div class="mt-2 flex flex-col gap-3 md:flex-row">
                  <div class="w-full md:w-auto">
                    <button id="pollRsvpCopyMessage" type="button" ${rsvpShareDisabledAttr || (rsvpCopyBusy ? "disabled" : "")} class="w-full md:w-auto ${rsvpCopyClass}${rsvpDisabledClass}">${rsvpCopyLabel}</button>
                    ${rsvpShareStatus ? `<div class="mt-2 text-xs font-medium text-emerald-600">${escapeHtml(rsvpShareStatus)}</div>` : ""}
                  </div>
                  <button id="pollRsvpOpenSlack" type="button" ${rsvpShareDisabledAttr} class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto${rsvpDisabledClass}">Open Slack</button>
                  <button id="pollRsvpOpenGmail" type="button" ${rsvpShareDisabledAttr} class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto${rsvpDisabledClass}">Open Gmail</button>
                </div>
                ${reminderUi.rsvpResultsError ? `<div class="mt-2 text-xs text-amber-700">${escapeHtml(reminderUi.rsvpResultsError)}</div>` : ""}
                ${reminderUi.rsvpId ? `
                  <div id="pollRsvpStatusBlock" tabindex="-1" class="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div class="text-sm font-semibold text-slate-900">RSVP status</div>
                    <div class="mt-2 space-y-1 text-sm text-slate-700">
                      <div>✔ Attending: ${rsvpYesCount}</div>
                      <div>✖ Can’t make it: ${rsvpNoCount}</div>
                      <div>⏳ Responses: ${rsvpTotalResponses}</div>
                      ${rsvpEmployeeCount > 0 ? `<div>⏳ Awaiting: ${rsvpAwaiting}</div>` : ""}
                    </div>
                    ${rsvpEmployeeCount > 0 ? `
                      <div class="mt-3">
                        <div class="mb-1 text-xs text-slate-600">Progress: ${rsvpProgressPct}%</div>
                        <div class="h-2 rounded-full bg-slate-200"><div class="h-2 rounded-full bg-slate-900" style="width:${rsvpProgressPct}%;"></div></div>
                      </div>
                    ` : ""}
                    <div class="mt-3 border-t border-slate-200 pt-3">
                      <div class="text-sm font-semibold text-slate-900">Attending so far</div>
                      ${visibleAttendees.length
                        ? `<div class="mt-2 flex flex-wrap gap-2">${visibleAttendees.map((name) => `<span class="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">${escapeHtml(name)}</span>`).join("")}</div>`
                        : '<div class="mt-2 text-sm text-slate-500">No attendees yet</div>'}
                      ${hasMoreAttendees
                        ? `<button id="pollRsvpToggleAttendees" type="button" class="mt-2 text-xs font-medium text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-900">${rsvpAttendeesExpanded ? "Show less" : `+${rsvpAttendingNames.length - attendeePreviewLimit} more`}</button>`
                        : ""}
                    </div>
                  </div>
                ` : `
                  <div class="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <div class="text-sm font-semibold text-slate-900">RSVP status</div>
                    <div class="mt-2 space-y-1 text-sm text-slate-700">
                      <div>✔ Attending: 0</div>
                      <div>✖ Can’t make it: 0</div>
                      <div>⏳ Responses: 0</div>
                    </div>
                    <div class="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-500">Attending so far</div>
                    <div class="mt-1 text-sm text-slate-500">No attendees yet</div>
                  </div>
                `}
              </div>

              <div class="mt-6 w-full">
                <div class="flex w-full flex-col-reverse gap-2 md:items-end">
                  <div class="text-sm text-slate-500 md:text-right">Next: review RSVP results, then book with final headcount.</div>
                  <label class="flex items-center gap-2 text-sm text-slate-700">
                    <input id="pollRsvpSharedConfirmed" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" ${rsvpSharedConfirmed ? "checked" : ""}>
                    <span>I shared the RSVP with my team</span>
                  </label>
                  <button id="pollRsvpContinueCollecting" type="button" ${rsvpContinueDisabled || !rsvpSharedConfirmed ? "disabled" : ""} class="h-11 w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 active:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-900 md:w-auto">Review RSVPs →</button>
                </div>
              </div>
            </section>
          ` : ""}
        </section>
      ` : `
      ${isDebugMode ? `
        <div class="mt-2">
          <button id="pollDebugPreviewToggle" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Preview</button>
          <section id="pollDebugPreviewPanel" class="${debugPreviewPanelOpen ? "mt-2" : "hidden"} rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Responses</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button id="pollDebugResponsesNone" type="button" class="${presetButtonClass(debugResponsesPreset === "none")}">No responses</button>
              <button id="pollDebugResponsesSome" type="button" class="${presetButtonClass(debugResponsesPreset === "some")}">Some</button>
              <button id="pollDebugResponsesMany" type="button" class="${presetButtonClass(debugResponsesPreset === "many")}">Many</button>
            </div>
            <div class="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button id="pollDebugDeadline7d" type="button" class="${presetButtonClass(debugDeadlinePreset === "7d")}">7 days left</button>
              <button id="pollDebugDeadline18h" type="button" class="${presetButtonClass(debugDeadlinePreset === "18h")}">18 hours left</button>
              <button id="pollDebugDeadline45m" type="button" class="${presetButtonClass(debugDeadlinePreset === "45m")}">45 min left</button>
              <button id="pollDebugDeadlineClosed" type="button" class="${presetButtonClass(debugDeadlinePreset === "closed")}">Closed</button>
            </div>
          </section>
        </div>
      ` : ""}
      <div id="pollReminderPanelWrap" class="mt-2 overflow-hidden transition-all duration-200" style="max-height:${reminderPanelOpen ? "2200px" : "0px"};opacity:${reminderPanelOpen ? "1" : "0"};">
        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h4 class="text-sm font-semibold text-slate-900">Send reminder to your team</h4>
              <p class="mt-1 text-sm text-slate-600">This message will nudge anyone who hasn’t responded yet.</p>
            </div>
            <button id="pollReminderClose" type="button" class="h-6 w-6 rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50" aria-label="Close reminder panel">×</button>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <span class="text-sm text-slate-600">Send via</span>
            <button id="pollReminderChannelSlack" type="button" class="${toggleSlackClass}">Slack</button>
            <button id="pollReminderChannelEmail" type="button" class="${toggleEmailClass}">Email</button>
          </div>
          ${isEmailMode ? `
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div class="text-sm text-slate-700"><span class="font-semibold">Subject (if email):</span> ${escapeHtml(reminderSubject)}</div>
              <button id="pollReminderCopySubject" type="button" ${reminderSubjectCopyBusy ? "disabled" : ""} class="${subjectCopyClass}">${subjectCopyLabel}</button>
            </div>
          ` : ""}
          <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800" style="white-space: pre-line;">${escapeHtml(reminderBodyPlain)}</div>
          ${primaryButtonRowHtml}
          <div class="mt-2 text-center text-xs text-slate-500">
            <button id="pollReminderHelperToggle" type="button" class="underline hover:text-slate-700">Using a different workspace or email?</button>
          </div>
          <div id="pollReminderHelperInfo" class="${reminderHelperVisible ? "" : "hidden"} mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">${escapeHtml(helperMessage)}</div>
        </section>
      </div>
      <div class="mt-2 text-lg font-medium">
        <span class="text-slate-600">Recommended option:</span>
        <span class="font-semibold text-slate-900"> ${escapeHtml(recommendedLabel)}</span>
      </div>
      `}
      ${isPollClosed ? "" : `
      <section class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="text-center">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total voters</div>
            <div class="mt-2 text-3xl font-bold text-slate-900">${model.totalVotes}</div>
          </div>
          <div class="text-center">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Most popular event</div>
            <div class="mt-2 text-base font-bold text-slate-900">${escapeHtml(model.topEvent.label || "—")}</div>
            <div class="mt-1 text-sm text-slate-600">${model.topEvent.count} RSVPs</div>
          </div>
          <div class="text-center">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Best time</div>
            <div class="mt-2 text-base font-semibold text-slate-900">${escapeHtml(model.topTime.label || "—")}</div>
            <div class="mt-1 text-sm text-slate-600">${model.topTime.count} available</div>
          </div>
        </div>
      </section>
      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        ${getPollResponsesBreakdownHtml("Event interest breakdown", model.eventRows)}
        ${getPollResponsesBreakdownHtml("Availability overlap", model.timeRows)}
      </div>
      `}
    </div>
  `;
}

function renderPromoteEventStep() {
  const panel = document.getElementById("promoteEventPanel");
  if (!panel) return;
  normalizePromoteEventState();
  const promote = state.promoteEvent;

  const bookedEvents = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];
  const bookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
    ? state.pollBuilder.bookingConfirmation
    : null;
  const bookingEventId = String(bookingConfirmation?.eventId || "").trim();
  const bookedEvent = bookedEvents.find((eventItem) => {
    const eventId = String(eventItem?.id || "");
    const masterId = String(eventItem?.event_master_id || "");
    return bookingEventId && (eventId === bookingEventId || masterId === bookingEventId);
  }) || bookedEvents.find((eventItem) => {
    const status = String(eventItem?.status || "").toLowerCase();
    return status === "booked" || status === "upcoming" || status === "active";
  }) || bookedEvents[0] || null;

  const eventName = String(
    bookedEvent?.name
    || state.pollBuilder?.chosenEventLabel
    || state.pollBuilder?.chosenEventId
    || "Upcoming team event"
  ).trim() || "Upcoming team event";
  const eventDate = String(bookingConfirmation?.bookedDate || bookedEvent?.date || "Date TBD").trim() || "Date TBD";
  const eventTime = String(bookingConfirmation?.bookedTime || bookedEvent?.time || "Time TBD").trim() || "Time TBD";
  const locationFormat = state.pollBuilder?.eventLocationType === "in-person"
    ? "In-person"
    : state.pollBuilder?.eventLocationType === "hybrid"
      ? "Hybrid"
      : "Virtual";
  const eventSummary = `${eventName} · ${eventDate} · ${eventTime} · ${locationFormat}`;
  const attendeeCount = Number(bookingConfirmation?.bookedHeadcount || bookedEvent?.headcount || bookedEvent?.rsvps || 63);

  const rsvpRows = Array.isArray(state.pollBuilder?.responses) ? state.pollBuilder.responses : [];
  const attendeeEmails = Array.from(new Set(
    rsvpRows
      .map((row) => String(row?.email || row?.voterEmail || "").trim())
      .filter((value) => value.includes("@"))
  ));
  const hasAttendeeEmails = attendeeEmails.length > 0;

  const getStepObject = (stepKey) => {
    if (stepKey === "calendar") return promote.calendar;
    if (stepKey === "announcement") return promote.announcement;
    if (stepKey === "reminder_week") return promote.reminderWeek;
    return promote.reminderDayOf;
  };

  const getDefaultInviteMessage = () => (
    `Subject: ${eventName} calendar invite\n\n` +
    `You are invited: ${eventName}\n` +
    `When: ${eventDate} at ${eventTime}\n` +
    `Format: ${locationFormat}\n\n` +
    "Please add this to your calendar using the attached .ics file."
  );

  const getDefaultAnnouncementMessage = () => (
    `Team update: ${eventName} is scheduled for ${eventDate} at ${eventTime}.\n` +
    "Add the event to your calendar using the .ics file and join us there.\n" +
    "Those who RSVPed will receive a calendar invite at the email they used for RSVP. If you forgot to RSVP, DM me and we'll confirm availability"
  );

  const getDefaultReminderWeekMessage = () => (
    `Reminder: ${eventName} is coming up in one week (${eventDate} at ${eventTime}).\n` +
    "Please confirm your calendar is up to date."
  );

  const getDefaultReminderDayOfMessage = () => (
    `Today is the day: ${eventName} starts at ${eventTime}.\n` +
    "See you soon — please join on time."
  );

  const inviteMessage = (promote.messages.inviteOverride || getDefaultInviteMessage()).trim();
  const announcementMessage = (promote.messages.announcementOverride || getDefaultAnnouncementMessage()).trim();
  const reminderWeekMessage = (promote.messages.reminderWeekOverride || getDefaultReminderWeekMessage()).trim();
  const reminderDayOfMessage = (promote.messages.reminderDayOfOverride || getDefaultReminderDayOfMessage()).trim();

  const parseDateFromContext = () => {
    const raw = String(bookedEvent?.startDateTime || state.pollBuilder?.chosenDateTime || "").trim();
    if (raw) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const composed = `${eventDate} ${eventTime}`.trim();
    const composedParsed = new Date(composed);
    if (!Number.isNaN(composedParsed.getTime())) return composedParsed;
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  const formatIcsUtc = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const buildIcs = () => {
    const start = parseDateFromContext();
    const end = new Date(start.getTime() + (60 * 60 * 1000));
    const createdAt = new Date();
    const description = inviteMessage.replace(/\n/g, "\\n");
    const uidValue = `${Date.now()}@jolly-hr`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jolly HR//Promote Event//EN",
      "BEGIN:VEVENT",
      `UID:${uidValue}`,
      `DTSTAMP:${formatIcsUtc(createdAt)}`,
      `DTSTART:${formatIcsUtc(start)}`,
      `DTEND:${formatIcsUtc(end)}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${locationFormat}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  };

  const processSteps = [
    { key: "calendar", label: "Calendar invite", title: "Calendar invite" },
    { key: "announcement", label: "Announcement", title: "Announcement" },
    { key: "reminder_week", label: "Reminder (1 week out)", title: "Reminder (1 week out)" },
    { key: "reminder_dayof", label: "Reminder (day of)", title: "Reminder (day of)" }
  ];
  const doneFlags = {
    calendar: Boolean(promote.calendar.done),
    announcement: Boolean(promote.announcement.done),
    reminder_week: Boolean(promote.reminderWeek.done),
    reminder_dayof: Boolean(promote.reminderDayOf.done)
  };
  const isPromoteCompleted = doneFlags.calendar && doneFlags.announcement && doneFlags.reminder_week && doneFlags.reminder_dayof;
  const activeStep = PROMOTE_STEP_ORDER.includes(promote.activeStep) ? promote.activeStep : "calendar";
  const activeIndex = processSteps.findIndex((item) => item.key === activeStep);
  const promoteProgressStages = processSteps.map((step) => step.label);
  const promoteCompletedIndexes = processSteps
    .map((step, index) => (doneFlags[step.key] ? index : -1))
    .filter((index) => index >= 0);
  const promoteProgressBarHtml = getHorizontalProcessBarHtml(promoteProgressStages, activeIndex, {
    completedIndexes: promoteCompletedIndexes,
    clickable: true
  });
  const firstIncompleteIndex = processSteps.findIndex((item) => !doneFlags[item.key]);
  const isOutOfOrderActive = firstIncompleteIndex >= 0 && activeIndex > firstIncompleteIndex;
  const canContinue = doneFlags.calendar || doneFlags.announcement;

  const getNodeSymbol = (stepKey) => {
    if (doneFlags[stepKey]) return "✓";
    if (activeStep === stepKey) return "●";
    return "○";
  };

  const getStatusPill = (stepKey) => {
    if (doneFlags[stepKey]) return "✓ Done";
    if (activeStep === stepKey) return "● Active";
    return "○ Not started";
  };

  const getCardActionLabel = (stepKey) => {
    const isDone = doneFlags[stepKey];
    const isActive = activeStep === stepKey;
    const isCollapsed = promote.collapsedStep === stepKey;
    if (isActive && !isCollapsed) return "Collapse";
    if (isDone) return "Edit";
    return "Start";
  };

  const isCardExpanded = (stepKey) => activeStep === stepKey && promote.collapsedStep !== stepKey;

  const renderStepBody = (stepKey) => {
    const stepState = getStepObject(stepKey);
    const doneAtText = stepState.doneAt ? `Last sent: ${new Date(stepState.doneAt).toLocaleString()}` : "";
    const showOrderNote = isCardExpanded(stepKey) && isOutOfOrderActive;
    const rowBase = "mt-4 flex flex-wrap items-center gap-2";

    if (stepKey === "calendar") {
      return `
        <div class="mt-3 text-sm text-slate-600">Send a calendar invite to confirmed attendees so the time is blocked.</div>
        <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span class="font-medium">Attendees (from RSVPs)</span>
          <span class="ml-2">${Number.isFinite(attendeeCount) ? attendeeCount : 63}</span>
          ${hasAttendeeEmails
            ? `<button type="button" data-promote-action="copy-emails" class="ml-3 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Copy emails</button>`
            : ""}
        </div>
        ${hasAttendeeEmails ? "" : `<div class="mt-2 text-xs text-slate-500">To send calendar invites to only attendees, collect emails during RSVP (future). For MVP, send invites manually or share .ics.</div>`}
        <div class="${rowBase}">
          <button type="button" data-promote-action="download-ics" class="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Download .ics</button>
          <button type="button" data-promote-action="copy-invite" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy invite message</button>
          <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Gmail</button>
        </div>
        <div class="mt-2 text-xs text-slate-500">If you’re using Slack only, attendees can still add the event using the .ics file.</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(inviteMessage)}</div>
        <div class="mt-4 flex items-center justify-end gap-3">
          ${doneAtText ? `<span class="text-xs text-slate-500">${escapeHtml(doneAtText)}</span>` : ""}
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="calendar" class="h-4 w-4 rounded border-slate-300" ${doneFlags.calendar ? "checked" : ""} />
            <span>Calendar invite sent</span>
          </label>
        </div>
      `;
    }

    if (stepKey === "announcement") {
      return `
        ${!doneFlags.calendar ? `<div class="mt-2 text-xs text-slate-500">Calendar invite not marked as sent yet (recommended before announcing).</div>` : ""}
        ${showOrderNote ? `<div class="mt-2 text-xs text-slate-500">Recommended order: Calendar → Announcement → Reminders.</div>` : ""}
        <div class="mt-3 text-sm text-slate-600">Post the announcement to your team channel.</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(announcementMessage)}</div>
        <div class="${rowBase}">
          <button type="button" data-promote-action="copy-announcement" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy Slack message</button>
          <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          <button type="button" data-promote-action="download-ics" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Download .ics</button>
        </div>
        <div class="mt-4 flex items-center justify-end gap-3">
          ${doneAtText ? `<span class="text-xs text-slate-500">${escapeHtml(doneAtText)}</span>` : ""}
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="announcement" class="h-4 w-4 rounded border-slate-300" ${doneFlags.announcement ? "checked" : ""} />
            <span>Announcement posted</span>
          </label>
        </div>
      `;
    }

    if (stepKey === "reminder_week") {
      return `
        ${showOrderNote ? `<div class="mt-2 text-xs text-slate-500">Recommended order: Calendar → Announcement → Reminders.</div>` : ""}
        <div class="mt-3 text-sm text-slate-600">Send this reminder about a week before the event.</div>
        <div class="mt-2 text-xs text-slate-500">When: 1 week before</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(reminderWeekMessage)}</div>
        <div class="${rowBase}">
          <button type="button" data-promote-action="copy-reminder-week" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy message</button>
          <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Gmail</button>
        </div>
        <div class="mt-4 flex items-center justify-end gap-3">
          ${doneAtText ? `<span class="text-xs text-slate-500">${escapeHtml(doneAtText)}</span>` : ""}
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="reminder_week" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_week ? "checked" : ""} />
            <span>1-week reminder sent</span>
          </label>
        </div>
      `;
    }

    return `
      ${showOrderNote ? `<div class="mt-2 text-xs text-slate-500">Recommended order: Calendar → Announcement → Reminders.</div>` : ""}
      <div class="mt-3 text-sm text-slate-600">Send this reminder the day of the event.</div>
      <div class="mt-2 text-xs text-slate-500">When: day of (morning)</div>
      <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(reminderDayOfMessage)}</div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" data-promote-action="copy-reminder-dayof" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy message</button>
        <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
        <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Gmail</button>
      </div>
      <div class="mt-4 flex items-center justify-end gap-3">
        ${doneAtText ? `<span class="text-xs text-slate-500">${escapeHtml(doneAtText)}</span>` : ""}
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-promote-complete="reminder_dayof" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_dayof ? "checked" : ""} />
          <span>Day-of reminder sent</span>
        </label>
      </div>
    `;
  };

  const cardsHtml = processSteps.map((step) => {
    const expanded = isCardExpanded(step.key);
    return `
      <article id="promote-card-${step.key}" class="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <h4 class="truncate text-base font-semibold text-slate-900">${escapeHtml(step.title)}</h4>
            <span class="inline-flex h-6 items-center rounded-full border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600">${escapeHtml(getStatusPill(step.key))}</span>
          </div>
          <button type="button" data-promote-toggle="${step.key}" class="promote-card-toggle rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">${getCardActionLabel(step.key)}</button>
        </div>
        ${expanded ? `<div class="mt-4 border-t border-slate-200 pt-4">${renderStepBody(step.key)}</div>` : ""}
      </article>
    `;
  }).join("");

  panel.innerHTML = `
    <div id="promoteProcessBar">
      ${promoteProgressBarHtml}
    </div>

    <div class="mt-3 rounded-xl border border-slate-200 bg-white p-5 md:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900 md:text-3xl">Promote Event</h2>
          <p class="mt-1 text-sm text-slate-600">Send the calendar invite and initial announcement for the event, and schedule reminders.</p>
          <p class="mt-2 text-xs text-slate-500">${escapeHtml(eventSummary)}</p>
        </div>
        <span class="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">${isPromoteCompleted ? "✓ Completed" : "● In progress"}</span>
      </div>
    </div>

    <div class="mt-4 space-y-3">${cardsHtml}</div>

    <div class="mt-4 flex justify-end">
      <div class="w-full md:w-auto">
        <button id="promoteFinishContinue" class="setup-step-next w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" data-step="10" ${canContinue ? "" : "disabled"}>Finish Promote Step → Continue</button>
        <p class="mt-2 text-right text-xs text-slate-500">You can come back anytime to send reminders.</p>
      </div>
    </div>
  `;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
    } catch (error) {
      console.warn("Clipboard copy failed", error?.message || error);
    }
  };

  const setActiveStep = (stepKey) => {
    normalizePromoteEventState();
    if (!PROMOTE_STEP_ORDER.includes(stepKey)) return;
    state.promoteEvent.activeStep = stepKey;
    state.promoteEvent.collapsedStep = "";
    persistState();
    renderPromoteEventStep();
  };

  const toggleCard = (stepKey) => {
    normalizePromoteEventState();
    const isActive = state.promoteEvent.activeStep === stepKey;
    const isCollapsed = state.promoteEvent.collapsedStep === stepKey;
    if (isActive && !isCollapsed) {
      state.promoteEvent.collapsedStep = stepKey;
    } else {
      state.promoteEvent.activeStep = stepKey;
      state.promoteEvent.collapsedStep = "";
    }
    persistState();
    renderPromoteEventStep();
  };

  const setStepDone = (stepKey, done) => {
    normalizePromoteEventState();
    const stamp = done ? new Date().toISOString() : "";
    if (stepKey === "calendar") {
      state.promoteEvent.calendar.done = done;
      state.promoteEvent.calendar.doneAt = stamp;
    } else if (stepKey === "announcement") {
      state.promoteEvent.announcement.done = done;
      state.promoteEvent.announcement.doneAt = stamp;
    } else if (stepKey === "reminder_week") {
      state.promoteEvent.reminderWeek.done = done;
      state.promoteEvent.reminderWeek.doneAt = stamp;
    } else if (stepKey === "reminder_dayof") {
      state.promoteEvent.reminderDayOf.done = done;
      state.promoteEvent.reminderDayOf.doneAt = stamp;
    }
    if (done) {
      const currentIndex = PROMOTE_STEP_ORDER.indexOf(stepKey);
      const nextStep = PROMOTE_STEP_ORDER[currentIndex + 1];
      if (nextStep) {
        state.promoteEvent.activeStep = nextStep;
        state.promoteEvent.collapsedStep = "";
      }
    } else {
      state.promoteEvent.activeStep = stepKey;
      state.promoteEvent.collapsedStep = "";
    }
    persistState();
    renderPromoteEventStep();
  };

  panel.querySelectorAll("#promoteProcessBar [data-process-index]").forEach((item) => {
    item.addEventListener("click", () => {
      const stageIndex = Number(item.getAttribute("data-process-index"));
      const stepKey = processSteps[stageIndex]?.key;
      if (!stepKey) return;
      setActiveStep(stepKey);
      setTimeout(() => {
        const card = document.getElementById(`promote-card-${stepKey}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  });

  panel.querySelectorAll("[data-promote-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const stepKey = String(button.getAttribute("data-promote-toggle") || "");
      toggleCard(stepKey);
    });
  });

  panel.querySelectorAll("[data-promote-complete]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const stepKey = String(checkbox.getAttribute("data-promote-complete") || "");
      setStepDone(stepKey, Boolean(checkbox.checked));
    });
  });

  panel.querySelectorAll("[data-promote-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = String(button.getAttribute("data-promote-action") || "");
      if (action === "copy-emails") {
        copyToClipboard(attendeeEmails.join(", "));
        return;
      }
      if (action === "download-ics") {
        const icsContent = buildIcs();
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${eventName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "event-invite"}.ics`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        state.promoteEvent.ics.generated = true;
        state.promoteEvent.ics.lastGeneratedAt = new Date().toISOString();
        persistState();
        return;
      }
      if (action === "copy-invite") {
        copyToClipboard(inviteMessage);
        return;
      }
      if (action === "copy-announcement") {
        copyToClipboard(announcementMessage);
        return;
      }
      if (action === "copy-reminder-week") {
        copyToClipboard(reminderWeekMessage);
        return;
      }
      if (action === "copy-reminder-dayof") {
        copyToClipboard(reminderDayOfMessage);
        return;
      }
      if (action === "open-slack") {
        window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
        return;
      }
      if (action === "open-gmail") {
        const subjectEncoded = encodeURIComponent(`Event message: ${eventName}`);
        const bodyEncoded = encodeURIComponent(inviteMessage);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subjectEncoded}&body=${bodyEncoded}`, "_blank", "noopener,noreferrer");
      }
    });
  });

  const promoteFinishContinueButton = document.getElementById("promoteFinishContinue");
  if (promoteFinishContinueButton) {
    promoteFinishContinueButton.addEventListener("click", () => {
      if (promoteFinishContinueButton.disabled) return;
      if (!Array.isArray(state.completedSetupSteps)) {
        state.completedSetupSteps = [];
      }
      if (!state.completedSetupSteps.includes(10)) {
        state.completedSetupSteps.push(10);
      }
      if (!state.setupStepDirty || typeof state.setupStepDirty !== "object") {
        state.setupStepDirty = {};
      }
      state.setupStepDirty[10] = false;
      state.currentSetupStep = 11;
      state.eventWorkflowProcessStep = 11;
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      updateSetupStepButtonStates();
      scrollSetupStepIntoView(11);
    });
  }
}

function renderRunEventStep() {
  const panel = document.getElementById("runEventPanel");
  if (!panel) return;

  const debugPreview = state.debugModeOn === true;
  const context = getRunEventContext();
  const {
    bookedEvent,
    bookingConfirmation,
    eventDate,
    eventTime,
    chosenDateTime,
    hasDateTime,
    hasBookedSignal
  } = context;

  if (!debugPreview && !(hasBookedSignal && hasDateTime)) {
    panel.innerHTML = "";
    return;
  }

  const eventName = String(
    bookedEvent?.name
    || state.pollBuilder?.chosenEventLabel
    || state.pollBuilder?.chosenEventId
    || "Upcoming team event"
  ).trim() || "Upcoming team event";
  const locationType = state.pollBuilder?.eventLocationType === "in-person"
    ? "In-person"
    : state.pollBuilder?.eventLocationType === "hybrid"
      ? "Hybrid"
      : "Virtual";
  const vendorUrl = String(bookingConfirmation?.vendorUrl || bookedEvent?.url || state.pollBuilder?.vendorBookingUrl || "").trim();
  const confirmedHeadcount = Number(bookingConfirmation?.bookedHeadcount || bookedEvent?.headcount || bookedEvent?.rsvps || 0);
  const timezoneLabel = String(state.pollBuilder?.timeZone || state.timeZone || "Local").trim() || "Local";

  const parseEventDateTime = () => {
    const fromChosen = String(chosenDateTime || "").trim();
    if (fromChosen) {
      const parsed = new Date(fromChosen);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const composed = `${eventDate} ${eventTime}`.trim();
    if (composed) {
      const parsed = new Date(composed);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const dateOnly = String(eventDate || "").trim();
    if (dateOnly) {
      const parsed = new Date(dateOnly);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const eventDateTime = parseEventDateTime();
  const eventDateTimeText = eventDateTime
    ? `${eventDateTime.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })} (${timezoneLabel})`
    : [eventDate, eventTime].filter(Boolean).join(" ") || "Date/time TBD";

  const toDateKey = (dateObj) => `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  const today = new Date();
  const todayKey = toDateKey(today);
  const eventKey = eventDateTime ? toDateKey(eventDateTime) : "";
  const statusText = !eventDateTime
    ? "● Upcoming"
    : eventKey === todayKey
      ? "● Today"
      : eventKey > todayKey
        ? "● Upcoming"
        : "● Past";

  const runStateTarget = bookedEvent && typeof bookedEvent === "object"
    ? bookedEvent
    : state.pollBuilder;

  const ensureRunEventState = () => {
    const target = runStateTarget;
    if (!target.runEvent || typeof target.runEvent !== "object") {
      target.runEvent = {};
    }
    const run = target.runEvent;
    if (!run.runEventChecklist || typeof run.runEventChecklist !== "object") {
      run.runEventChecklist = {
        vendorConfirmed: false,
        teamPrepared: false,
        readyToRun: false
      };
    }
    if (typeof run.runEventChecklist.vendorConfirmed !== "boolean") run.runEventChecklist.vendorConfirmed = false;
    if (typeof run.runEventChecklist.teamPrepared !== "boolean") run.runEventChecklist.teamPrepared = false;
    if (typeof run.runEventChecklist.readyToRun !== "boolean") run.runEventChecklist.readyToRun = false;
    if (typeof run.runEventNotes !== "string") run.runEventNotes = "";
    if (!(typeof run.attendanceEstimate === "number" || run.attendanceEstimate === null)) run.attendanceEstimate = null;
    if (!(typeof run.runEventCompletedAt === "string" || run.runEventCompletedAt === null)) run.runEventCompletedAt = null;

    target.runEventChecklist = run.runEventChecklist;
    target.runEventNotes = run.runEventNotes;
    target.attendanceEstimate = run.attendanceEstimate;
    target.runEventCompletedAt = run.runEventCompletedAt;
    return run;
  };

  const runState = ensureRunEventState();
  const checklist = runState.runEventChecklist;
  const checkedCount = Number(Boolean(checklist.vendorConfirmed)) + Number(Boolean(checklist.teamPrepared)) + Number(Boolean(checklist.readyToRun));

  panel.innerHTML = `
    ${debugPreview ? `
      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">Debug preview (event details may be missing).</div>
    ` : ""}

    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">Run Event</h3>
          <p class="mt-1 text-sm text-slate-600">Day-of checklist and notes.</p>
        </div>
        <span class="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">${statusText}</span>
      </div>
    </div>

    <article class="rounded-xl border border-slate-200 bg-white p-5">
      <h4 class="text-base font-semibold text-slate-900">Today’s plan</h4>

      <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <div class="font-semibold text-slate-900">${escapeHtml(eventName)}</div>
        <div class="mt-1">${escapeHtml(eventDateTimeText)}</div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">${escapeHtml(locationType)}</span>
          <span class="text-xs text-slate-600">Headcount: ${Number.isFinite(confirmedHeadcount) && confirmedHeadcount > 0 ? confirmedHeadcount : "—"}</span>
          ${vendorUrl ? `<button id="runEventOpenVendor" type="button" class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Open vendor booking</button>` : ""}
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <label class="flex items-start gap-3 text-sm text-slate-700">
          <input id="runEventVendorConfirmed" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300" ${checklist.vendorConfirmed ? "checked" : ""} />
          <span><span class="font-medium text-slate-900">Vendor confirmed</span><br><span class="text-xs text-slate-500">Time, link/address, and headcount confirmed.</span></span>
        </label>
        <label class="flex items-start gap-3 text-sm text-slate-700">
          <input id="runEventTeamPrepared" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300" ${checklist.teamPrepared ? "checked" : ""} />
          <span><span class="font-medium text-slate-900">Team has what they need</span><br><span class="text-xs text-slate-500">Link, location, or prep instructions shared.</span></span>
        </label>
        <label class="flex items-start gap-3 text-sm text-slate-700">
          <input id="runEventReadyToRun" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300" ${checklist.readyToRun ? "checked" : ""} />
          <span><span class="font-medium text-slate-900">Ready to run</span><br><span class="text-xs text-slate-500">All set for the event.</span></span>
        </label>
      </div>

      <div class="mt-3 text-xs text-slate-500">Checklist confidence: ${checkedCount}/3 complete.</div>

      ${runEventUiState.confirmCompleteWithoutChecks ? `
        <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <div>Mark as completed anyway?</div>
          <div class="mt-2 flex items-center gap-2">
            <button id="runEventConfirmComplete" type="button" class="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">Yes</button>
            <button id="runEventCancelComplete" type="button" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      ` : ""}

      <div class="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
        <p class="text-xs text-slate-500 md:mr-3">Do this after the event ends.</p>
        <button id="runEventMarkCompleted" type="button" class="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Mark event completed →</button>
      </div>
    </article>

    <article class="rounded-xl border border-slate-200 bg-white p-5">
      <h4 class="text-base font-semibold text-slate-900">Quick notes</h4>
      <div class="mt-3">
        <label class="block text-sm font-medium text-slate-700" for="runEventNotesInput">Notes (optional)</label>
        <textarea id="runEventNotesInput" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" rows="4" placeholder="Anything to remember? (What worked, what didn’t, vendor issues, attendance vibe)">${escapeHtml(runState.runEventNotes || "")}</textarea>
      </div>
      <div class="mt-3">
        <label class="block text-sm font-medium text-slate-700" for="runEventAttendanceInput">Attendance (optional)</label>
        <input id="runEventAttendanceInput" type="number" min="0" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" value="${runState.attendanceEstimate === null ? "" : String(runState.attendanceEstimate)}" />
        <p class="mt-1 text-xs text-slate-500">Rough estimate is fine.</p>
      </div>
    </article>
  `;

  const syncRunStateFields = () => {
    runStateTarget.runEventChecklist = runState.runEventChecklist;
    runStateTarget.runEventNotes = runState.runEventNotes;
    runStateTarget.attendanceEstimate = runState.attendanceEstimate;
    runStateTarget.runEventCompletedAt = runState.runEventCompletedAt;
  };

  const persistRunState = () => {
    syncRunStateFields();
    persistState();
    renderSidebarStepMenus();
  };

  const setChecklistValue = (key, checked) => {
    runState.runEventChecklist[key] = Boolean(checked);
    persistRunState();
    renderRunEventStep();
  };

  const completeRunEventAndAdvance = () => {
    runState.runEventCompletedAt = new Date().toISOString();
    if (bookedEvent && typeof bookedEvent === "object") {
      bookedEvent.status = "completed";
    }
    runEventUiState.confirmCompleteWithoutChecks = false;
    if (!Array.isArray(state.completedSetupSteps)) {
      state.completedSetupSteps = [];
    }
    if (!state.completedSetupSteps.includes(11)) {
      state.completedSetupSteps.push(11);
    }
    state.currentSetupStep = 12;
    state.eventWorkflowProcessStep = 12;
    persistState();
    renderSetupStepStates();
    renderSidebarStepMenus();
    updateSetupStepButtonStates();
    scrollSetupStepIntoView(12);
  };

  const vendorButton = document.getElementById("runEventOpenVendor");
  if (vendorButton && vendorUrl) {
    vendorButton.addEventListener("click", () => {
      openVendorUrl(vendorUrl, eventName);
    });
  }

  const vendorConfirmed = document.getElementById("runEventVendorConfirmed");
  const teamPrepared = document.getElementById("runEventTeamPrepared");
  const readyToRun = document.getElementById("runEventReadyToRun");
  if (vendorConfirmed) vendorConfirmed.addEventListener("change", () => setChecklistValue("vendorConfirmed", vendorConfirmed.checked));
  if (teamPrepared) teamPrepared.addEventListener("change", () => setChecklistValue("teamPrepared", teamPrepared.checked));
  if (readyToRun) readyToRun.addEventListener("change", () => setChecklistValue("readyToRun", readyToRun.checked));

  const notesInput = document.getElementById("runEventNotesInput");
  if (notesInput) {
    notesInput.addEventListener("input", () => {
      runState.runEventNotes = String(notesInput.value || "");
      if (runEventNotesDebounceTimeout) clearTimeout(runEventNotesDebounceTimeout);
      runEventNotesDebounceTimeout = setTimeout(() => {
        persistRunState();
      }, 350);
    });
  }

  const attendanceInput = document.getElementById("runEventAttendanceInput");
  if (attendanceInput) {
    const applyAttendanceValue = () => {
      const raw = String(attendanceInput.value || "").trim();
      if (!raw) {
        runState.attendanceEstimate = null;
      } else {
        const next = Number(raw);
        runState.attendanceEstimate = Number.isFinite(next) ? Math.max(0, Math.round(next)) : null;
      }
      persistRunState();
    };
    attendanceInput.addEventListener("change", applyAttendanceValue);
    attendanceInput.addEventListener("blur", applyAttendanceValue);
  }

  const markCompletedButton = document.getElementById("runEventMarkCompleted");
  if (markCompletedButton) {
    markCompletedButton.addEventListener("click", () => {
      const checksDone = Number(Boolean(runState.runEventChecklist.vendorConfirmed))
        + Number(Boolean(runState.runEventChecklist.teamPrepared))
        + Number(Boolean(runState.runEventChecklist.readyToRun));
      if (checksDone === 0 && !runEventUiState.confirmCompleteWithoutChecks) {
        runEventUiState.confirmCompleteWithoutChecks = true;
        renderRunEventStep();
        return;
      }
      completeRunEventAndAdvance();
    });
  }

  const confirmCompleteButton = document.getElementById("runEventConfirmComplete");
  if (confirmCompleteButton) {
    confirmCompleteButton.addEventListener("click", () => {
      completeRunEventAndAdvance();
    });
  }

  const cancelCompleteButton = document.getElementById("runEventCancelComplete");
  if (cancelCompleteButton) {
    cancelCompleteButton.addEventListener("click", () => {
      runEventUiState.confirmCompleteWithoutChecks = false;
      renderRunEventStep();
    });
  }
}

function renderCollectFeedbackStep() {
  const panel = document.getElementById("collectFeedbackPanel");
  if (!panel) return;

  const context = getCollectFeedbackContext();
  if (!context.canAccess) {
    panel.innerHTML = `
      <article class="rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-base font-semibold text-slate-900">Feedback unlocks after the event is completed.</h4>
        <div class="mt-3">
          <button id="feedbackGoToRunEvent" data-allow-locked="true" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Go to Run Event</button>
        </div>
      </article>
    `;
    const goButton = document.getElementById("feedbackGoToRunEvent");
    if (goButton) {
      goButton.addEventListener("click", () => {
        state.currentSetupStep = 11;
        persistState();
        renderSetupStepStates();
        renderSidebarStepMenus();
        scrollSetupStepIntoView(11);
      });
    }
    return;
  }

  const bookedEvent = context.bookedEvent;
  const feedbackTarget = bookedEvent && typeof bookedEvent === "object"
    ? bookedEvent
    : state.pollBuilder;

  if (!feedbackTarget.feedback || typeof feedbackTarget.feedback !== "object") {
    feedbackTarget.feedback = {};
  }

  const feedbackState = feedbackTarget.feedback;
  if (typeof feedbackState.feedbackDeadlineDateTime !== "string") feedbackState.feedbackDeadlineDateTime = "";
  if (typeof feedbackState.feedbackDeadlineTimeZone !== "string") feedbackState.feedbackDeadlineTimeZone = "";
  if (typeof feedbackState.feedbackShareLink !== "string") feedbackState.feedbackShareLink = "";
  if (typeof feedbackState.feedbackSent !== "boolean") feedbackState.feedbackSent = false;
  if (!(typeof feedbackState.feedbackClosedAt === "string" || feedbackState.feedbackClosedAt === null)) feedbackState.feedbackClosedAt = null;
  if (!Array.isArray(feedbackState.feedbackResponses)) feedbackState.feedbackResponses = [];

  const selectedTz = String(state.pollBuilder?.timeZone || state.timeZone || "Local").trim() || "Local";
  if (!feedbackState.feedbackDeadlineTimeZone) {
    feedbackState.feedbackDeadlineTimeZone = selectedTz;
  }

  if (!feedbackState.feedbackDeadlineDateTime) {
    const now = Date.now();
    const runCompletedDate = context.runCompletedAt ? new Date(context.runCompletedAt) : null;
    const isRunCompletedToday = runCompletedDate && !Number.isNaN(runCompletedDate.getTime())
      ? runCompletedDate.toDateString() === new Date().toDateString()
      : true;
    const defaultOffsetMs = (isRunCompletedToday ? 48 : 72) * 60 * 60 * 1000;
    const defaultDate = new Date(now + defaultOffsetMs);
    const yyyy = defaultDate.getFullYear();
    const mm = String(defaultDate.getMonth() + 1).padStart(2, "0");
    const dd = String(defaultDate.getDate()).padStart(2, "0");
    const hh = String(defaultDate.getHours()).padStart(2, "0");
    const mi = String(defaultDate.getMinutes()).padStart(2, "0");
    feedbackState.feedbackDeadlineDateTime = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  if (!feedbackState.feedbackShareLink) {
    const eventToken = String(bookedEvent?.id || context.bookingEventId || "event").trim() || "event";
    feedbackState.feedbackShareLink = `${window.location.origin}${window.location.pathname}#feedback-${eventToken}`;
  }

  feedbackTarget.feedbackDeadlineDateTime = feedbackState.feedbackDeadlineDateTime;
  feedbackTarget.feedbackDeadlineTimeZone = feedbackState.feedbackDeadlineTimeZone;
  feedbackTarget.feedbackShareLink = feedbackState.feedbackShareLink;
  feedbackTarget.feedbackSent = feedbackState.feedbackSent;
  feedbackTarget.feedbackClosedAt = feedbackState.feedbackClosedAt;
  feedbackTarget.feedbackResponses = feedbackState.feedbackResponses;

  const persistFeedback = () => {
    feedbackTarget.feedbackDeadlineDateTime = feedbackState.feedbackDeadlineDateTime;
    feedbackTarget.feedbackDeadlineTimeZone = feedbackState.feedbackDeadlineTimeZone;
    feedbackTarget.feedbackShareLink = feedbackState.feedbackShareLink;
    feedbackTarget.feedbackSent = feedbackState.feedbackSent;
    feedbackTarget.feedbackClosedAt = feedbackState.feedbackClosedAt;
    feedbackTarget.feedbackResponses = feedbackState.feedbackResponses;
    persistState();
  };

  const deadlineStatus = getFeedbackDeadlineStatus(feedbackState.feedbackDeadlineDateTime, feedbackState.feedbackClosedAt || "");
  const processStages = ["Prepare", "Collecting", "Closed"];
  const processIndex = feedbackState.feedbackClosedAt || deadlineStatus.isClosed
    ? 2
    : feedbackState.feedbackSent
      ? 1
      : 0;
  const processCompleted = processIndex === 0
    ? []
    : processIndex === 1
      ? [0]
      : [0, 1, 2];
  const processBarHtml = getHorizontalProcessBarHtml(processStages, processIndex, { completedIndexes: processCompleted });

  const deadlineDate = new Date(feedbackState.feedbackDeadlineDateTime);
  const deadlineLabel = Number.isNaN(deadlineDate.getTime())
    ? "TBD"
    : deadlineDate.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const shareLink = feedbackState.feedbackShareLink;

  const slackMessage = [
    "Quick feedback on yesterday’s team event",
    "Takes under a minute.",
    "Share what worked and what we should change next time.",
    `Submit by ${deadlineLabel}.`,
    shareLink
  ].join("\n");

  const emailSubject = "Quick feedback: team event";
  const emailMessage = [
    "Quick feedback on yesterday’s team event",
    "",
    "Takes under a minute.",
    "Share what worked and what we should change next time.",
    `Submit by ${deadlineLabel}.`,
    "",
    shareLink
  ].join("\n");

  const useEmail = feedbackUiState.channel === "email";
  const responses = Array.isArray(feedbackState.feedbackResponses) ? feedbackState.feedbackResponses : [];
  const responsesHtml = responses.length
    ? [...responses].sort((a, b) => new Date(b?.submittedAt || 0).getTime() - new Date(a?.submittedAt || 0).getTime()).map((response) => {
      const submitted = formatRelativeTime(response?.submittedAt);
      const ratingValue = Number(response?.rating || 0);
      const ratingText = ratingValue >= 1 && ratingValue <= 5 ? `${ratingValue}/5` : "No rating";
      const nameLine = String(response?.nameOrEmail || "").trim();
      return `
        <article class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs text-slate-500">Submitted ${escapeHtml(submitted)}</div>
          ${nameLine ? `<div class="mt-1 text-sm font-medium text-slate-700">${escapeHtml(nameLine)}</div>` : ""}
          <div class="mt-2 text-sm text-slate-700"><span class="font-medium text-slate-900">Rating:</span> ${escapeHtml(ratingText)}</div>
          <div class="mt-2 text-sm text-slate-700"><span class="font-medium text-slate-900">What worked?</span><br>${escapeHtml(String(response?.whatWorked || "")) || "—"}</div>
          <div class="mt-2 text-sm text-slate-700"><span class="font-medium text-slate-900">What should change next time?</span><br>${escapeHtml(String(response?.whatToChange || "")) || "—"}</div>
        </article>
      `;
    }).join("")
    : `<div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No responses yet.</div>`;

  panel.innerHTML = `
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">Collect Feedback</h3>
          <p class="mt-1 text-sm text-slate-600">Send one request, then review responses.</p>
        </div>
        <div class="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><span class="h-2 w-2 rounded-full ${deadlineStatus.dotClass}"></span><span>${deadlineStatus.isClosed ? "Feedback closed" : "Feedback open"}</span></div>
      </div>
    </div>

    <div class="mt-3">${processBarHtml}</div>

    ${feedbackState.feedbackClosedAt || deadlineStatus.isClosed ? `
      <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">✓ Feedback closed. Next: Review impact.</div>
    ` : ""}

    <article class="mt-4 rounded-xl border ${feedbackState.feedbackSent ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"} p-5">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-base font-semibold text-slate-900">Send feedback request</h4>
        ${feedbackState.feedbackSent ? `<span class="inline-flex h-6 items-center rounded-full border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600">✓ Sent</span>` : ""}
      </div>
      <p class="mt-2 text-sm text-slate-600">Share this with attendees to collect quick feedback while it’s fresh.</p>
      <p class="text-sm text-slate-600">Responses will appear below.</p>

      <div class="mt-3 flex items-center gap-2">
        <button id="feedbackChannelSlack" type="button" class="rounded-full px-3 py-1.5 text-sm font-medium ${useEmail ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white"}">Slack</button>
        <button id="feedbackChannelEmail" type="button" class="rounded-full px-3 py-1.5 text-sm font-medium ${useEmail ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}">Email</button>
      </div>

      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(260px,360px)_1fr] md:items-end">
        <label class="block">
          <span class="text-xs font-medium text-slate-600">Feedback deadline</span>
          <input id="feedbackDeadlineInput" type="datetime-local" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" value="${escapeHtml(feedbackState.feedbackDeadlineDateTime)}" />
        </label>
        <div class="text-xs text-slate-500">Timezone: ${escapeHtml(feedbackState.feedbackDeadlineTimeZone || selectedTz)}</div>
      </div>

      <div class="mt-2 text-xs text-slate-500">${escapeHtml(deadlineStatus.isClosed ? "Feedback closed" : deadlineStatus.text.replace("● ", ""))}</div>

      ${useEmail ? `
        <div class="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div class="text-sm text-slate-700"><span class="font-semibold">Subject:</span> ${escapeHtml(emailSubject)}</div>
          <button id="feedbackCopySubject" type="button" class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Copy subject</button>
        </div>
      ` : ""}

      <div class="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(useEmail ? emailMessage : slackMessage)}</div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <button id="feedbackCopyMessage" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Copy message</button>
        <button id="feedbackOpenSlack" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
        ${useEmail ? `<button id="feedbackOpenGmail" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Gmail</button>` : ""}
      </div>

      <div class="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
        <p class="text-xs text-slate-500 md:mr-3">Continue to view responses below.</p>
        <button id="feedbackSentContinue" type="button" class="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">I’ve sent the feedback request → Continue</button>
      </div>
    </article>

    <article id="feedbackResponsesCard" class="mt-4 rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-base font-semibold text-slate-900">Responses</h4>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-600">${escapeHtml(deadlineStatus.text)}</span>
          ${deadlineStatus.isClosed ? "" : `<button id="feedbackCloseButton" type="button" class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Close feedback</button>`}
        </div>
      </div>

      <div class="mt-2 text-sm text-slate-700">Total responses: ${responses.length}</div>
      <div class="mt-3 space-y-3">${responsesHtml}</div>
    </article>

    <div class="mt-4 flex justify-end">
      <button id="feedbackCompleteStep" type="button" class="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Mark feedback step complete →</button>
    </div>
  `;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
    } catch (error) {
      console.warn("Copy failed", error?.message || error);
    }
  };

  const channelSlack = document.getElementById("feedbackChannelSlack");
  const channelEmail = document.getElementById("feedbackChannelEmail");
  if (channelSlack) {
    channelSlack.addEventListener("click", () => {
      feedbackUiState.channel = "slack";
      renderCollectFeedbackStep();
    });
  }
  if (channelEmail) {
    channelEmail.addEventListener("click", () => {
      feedbackUiState.channel = "email";
      renderCollectFeedbackStep();
    });
  }

  const deadlineInput = document.getElementById("feedbackDeadlineInput");
  if (deadlineInput) {
    deadlineInput.addEventListener("change", () => {
      feedbackState.feedbackDeadlineDateTime = String(deadlineInput.value || "");
      persistFeedback();
      renderCollectFeedbackStep();
    });
  }

  const copyMessageButton = document.getElementById("feedbackCopyMessage");
  if (copyMessageButton) {
    copyMessageButton.addEventListener("click", () => {
      copyToClipboard(useEmail ? emailMessage : slackMessage);
    });
  }
  const copySubjectButton = document.getElementById("feedbackCopySubject");
  if (copySubjectButton) {
    copySubjectButton.addEventListener("click", () => {
      copyToClipboard(emailSubject);
    });
  }
  const openSlackButton = document.getElementById("feedbackOpenSlack");
  if (openSlackButton) {
    openSlackButton.addEventListener("click", () => {
      window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
    });
  }
  const openGmailButton = document.getElementById("feedbackOpenGmail");
  if (openGmailButton) {
    openGmailButton.addEventListener("click", () => {
      const subjectEncoded = encodeURIComponent(emailSubject);
      const bodyEncoded = encodeURIComponent(emailMessage);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subjectEncoded}&body=${bodyEncoded}`, "_blank", "noopener,noreferrer");
    });
  }

  const sentContinue = document.getElementById("feedbackSentContinue");
  if (sentContinue) {
    sentContinue.addEventListener("click", () => {
      feedbackState.feedbackSent = true;
      persistFeedback();
      const responseCard = document.getElementById("feedbackResponsesCard");
      if (responseCard) {
        responseCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      renderCollectFeedbackStep();
    });
  }

  const closeButton = document.getElementById("feedbackCloseButton");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      feedbackState.feedbackClosedAt = new Date().toISOString();
      persistFeedback();
      renderCollectFeedbackStep();
    });
  }

  const completeButton = document.getElementById("feedbackCompleteStep");
  if (completeButton) {
    completeButton.addEventListener("click", () => {
      if (!Array.isArray(state.completedSetupSteps)) state.completedSetupSteps = [];
      if (!state.completedSetupSteps.includes(12)) {
        state.completedSetupSteps.push(12);
      }
      state.currentSetupStep = 13;
      state.eventWorkflowProcessStep = 13;
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      updateSetupStepButtonStates();
      scrollSetupStepIntoView(13);
    });
  }
}

function renderReviewImpactStep() {
  const panel = document.getElementById("reviewImpactPanel");
  if (!panel) return;

  const bookedEvents = Array.isArray(state.eventsBooked) ? [...state.eventsBooked] : [];
  const totalBudget = Number(getBudgetTotal() || 0);
  const spent = Number(getTotalSpent() || 0);
  const remaining = totalBudget - spent;

  const parseEventDate = (eventItem) => {
    const datePart = String(eventItem?.date || "").trim();
    const timePart = String(eventItem?.time || "").trim();
    const joined = `${datePart} ${timePart}`.trim();
    if (joined) {
      const parsed = new Date(joined);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    if (datePart) {
      const parsed = new Date(datePart);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const now = Date.now();
  const normalizeStatus = (eventItem) => {
    const explicit = String(eventItem?.status || "").toLowerCase();
    const parsed = parseEventDate(eventItem);
    const isPast = parsed ? parsed.getTime() < now : false;
    if (explicit === "completed") return "completed";
    if (explicit === "upcoming") return "upcoming";
    if (isPast) return "completed";
    return "upcoming";
  };

  const eventsWithMeta = bookedEvents.map((eventItem) => {
    const parsedDate = parseEventDate(eventItem);
    const status = normalizeStatus(eventItem);
    return {
      event: eventItem,
      parsedDate,
      status,
      cost: Number(eventItem?.totalCost || 0)
    };
  });

  const upcomingEvents = eventsWithMeta
    .filter((row) => row.status === "upcoming")
    .sort((a, b) => {
      const left = a.parsedDate ? a.parsedDate.getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.parsedDate ? b.parsedDate.getTime() : Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  const completedEvents = eventsWithMeta
    .filter((row) => row.status === "completed")
    .sort((a, b) => {
      const left = a.parsedDate ? a.parsedDate.getTime() : 0;
      const right = b.parsedDate ? b.parsedDate.getTime() : 0;
      return right - left;
    });
  const orderedEvents = [...upcomingEvents, ...completedEvents];
  const upcomingTotal = upcomingEvents.reduce((sum, row) => sum + Number(row.cost || 0), 0);

  const budgetTableHtml = orderedEvents.length
    ? orderedEvents.map((row) => {
      const eventItem = row.event;
      const dateLabel = row.parsedDate
        ? row.parsedDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
        : (String(eventItem?.date || "").trim() || "—");
      const statusLabel = row.status === "completed" ? "Completed" : "Upcoming";
      return `
        <tr class="border-t border-slate-100">
          <td class="px-3 py-2 text-sm text-slate-900">${escapeHtml(String(eventItem?.name || "Untitled event"))}</td>
          <td class="px-3 py-2 text-sm text-slate-600">${escapeHtml(dateLabel)}</td>
          <td class="px-3 py-2 text-sm text-slate-900">${fmtMoney(Number(eventItem?.totalCost || 0))}</td>
          <td class="px-3 py-2 text-sm text-slate-600">${statusLabel}</td>
        </tr>
      `;
    }).join("")
    : `
      <tr>
        <td colspan="4" class="px-3 py-6 text-sm text-slate-500">No events booked yet. Once you book an event, it will show up here.</td>
      </tr>
    `;

  const completedEventsHtml = completedEvents.length
    ? completedEvents.map((row) => {
      const eventItem = row.event;
      const attendance = Number(eventItem?.attendance || eventItem?.attendanceEstimate || eventItem?.runEvent?.attendanceEstimate || 0);
      const rsvps = Number(eventItem?.rsvps || 0);
      const starRating = Number(eventItem?.feedback?.starRating || 0);
      const ratingText = starRating > 0 ? `${starRating.toFixed(1)} / 5` : "—";
      const costPerAttendee = attendance > 0 ? fmtMoney(Number(eventItem?.totalCost || 0) / attendance) : "—";
      const dateText = row.parsedDate
        ? row.parsedDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
        : (String(eventItem?.date || "").trim() || "—");
      const topNote = String(eventItem?.feedback?.whatWorked || eventItem?.runEventNotes || eventItem?.runEvent?.runEventNotes || "").trim();
      return `
        <article class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div class="text-sm font-semibold text-slate-900">${escapeHtml(String(eventItem?.name || "Untitled event"))}</div>
            <div class="text-xs text-slate-500">${escapeHtml(dateText)}</div>
          </div>
          <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5">Attendance: ${attendance > 0 ? attendance : "—"}</span>
            <span class="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5">RSVPs: ${rsvps > 0 ? rsvps : "—"}</span>
            <span class="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5">Avg rating: ${ratingText}</span>
            <span class="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5">Cost per attendee: ${costPerAttendee}</span>
          </div>
          ${topNote ? `<div class="mt-2 text-sm text-slate-600">${escapeHtml(topNote)}</div>` : ""}
        </article>
      `;
    }).join("")
    : `<div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No completed events yet. After your first event, results will show here.</div>`;

  const surveyAnswers = state.programSettings?.surveyAnswers && typeof state.programSettings.surveyAnswers === "object"
    ? state.programSettings.surveyAnswers
    : {};
  const hasSurveyAnswers = Object.keys(surveyAnswers).length > 0;
  const topInterests = Array.isArray(state.programSettings?.teamPreferenceEstimate)
    ? state.programSettings.teamPreferenceEstimate.slice(0, 5)
    : [];
  const bestDays = Array.isArray(state.landingDraft?.daysSelected) ? state.landingDraft.daysSelected.slice(0, 2) : [];
  const bestTimes = Array.isArray(state.landingDraft?.timesSelected) ? state.landingDraft.timesSelected.slice(0, 2) : [];
  const hasTeamPrefData = hasSurveyAnswers || topInterests.length > 0 || bestDays.length > 0 || bestTimes.length > 0;

  const formatCount = Number(completedEvents.filter((row) => String(row.event?.eventLocationType || state.pollBuilder?.eventLocationType || "virtual") === "in-person").length || 0);
  const virtualCount = Number(completedEvents.filter((row) => String(row.event?.eventLocationType || state.pollBuilder?.eventLocationType || "virtual") !== "in-person").length || 0);
  const totalFormatCount = formatCount + virtualCount;
  const inPersonPct = totalFormatCount > 0 ? Math.round((formatCount / totalFormatCount) * 100) : 0;
  const virtualPct = totalFormatCount > 0 ? Math.round((virtualCount / totalFormatCount) * 100) : 0;

  const topEventTypesHtml = topInterests.length
    ? `<ol class="mt-1 list-decimal space-y-1 pl-4 text-sm text-slate-700">${topInterests.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ol>`
    : `<div class="mt-1 text-sm text-slate-500">Not enough data yet.</div>`;

  const bestTimesText = `${bestDays.length ? bestDays.join(", ") : "—"} · ${bestTimes.length ? bestTimes.join(", ") : "—"}`;

  panel.innerHTML = `
    <article class="rounded-xl border border-slate-200 bg-white p-5">
      <h4 class="text-base font-semibold text-slate-900">Program Budget</h4>
      <p class="mt-1 text-sm text-slate-500">Track spend and outcomes across your events.</p>
      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs uppercase tracking-wide text-slate-500">Budget</div>
          <div class="mt-1 text-2xl font-semibold text-slate-900">${fmtMoney(totalBudget)}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs uppercase tracking-wide text-slate-500">Spent</div>
          <div class="mt-1 text-2xl font-semibold text-slate-900">${fmtMoney(spent)}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs uppercase tracking-wide text-slate-500">Remaining</div>
          <div class="mt-1 text-2xl font-semibold text-slate-900">${fmtMoney(remaining)}</div>
        </div>
      </div>
      <div class="mt-3 text-sm text-slate-500">Upcoming events total: ${fmtMoney(upcomingTotal)}</div>

      <div class="mt-4">
        <div class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Events</div>
        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="min-w-full border-collapse">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Event</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Cost</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>${budgetTableHtml}</tbody>
          </table>
        </div>
      </div>
    </article>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
      <article class="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
        <h4 class="text-base font-semibold text-slate-900">Event Performance</h4>
        <div class="mt-3 space-y-3">${completedEventsHtml}</div>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <h4 class="text-base font-semibold text-slate-900">Team Preferences</h4>
        ${hasTeamPrefData ? `
          <div class="mt-3 space-y-4">
            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">Formats</div>
              <div class="mt-1 text-sm text-slate-700">Virtual: ${virtualPct > 0 ? `${virtualPct}%` : "—"}</div>
              <div class="text-sm text-slate-700">In-person: ${inPersonPct > 0 ? `${inPersonPct}%` : "—"}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">Top Event Types</div>
              ${topEventTypesHtml}
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">Best Times</div>
              <div class="mt-1 text-sm text-slate-700">${escapeHtml(bestTimesText)}</div>
            </div>
          </div>
        ` : `
          <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No team preference data yet. After the first event, send the Team Preferences survey.</div>
        `}
      </article>
    </div>
  `;
}

function renderBookEventStep() {
  const panel = document.getElementById("bookEventPanel");
  if (!panel) return;

  const isDebugOverride = Boolean(state.debugMode) || isPollResponsesDebugMode();
  const isPollFinalized = Boolean(String(state.pollBuilder?.shareLink || "").trim());
  const canShowDashboard = isDebugOverride || isPollFinalized || state.completedSetupSteps.includes(8);

  if (!canShowDashboard) {
    panel.innerHTML = `
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">Book Event</h4>
        <p class="mt-2 text-sm text-slate-600">Complete Poll Team first, then continue here to track RSVP responses and finalize booking.</p>
        <p class="mt-2 text-xs text-slate-500">Debug override: set state.debugMode = true to preview this step early.</p>
      </div>
    `;
    return;
  }

  if (pollUiState.bookForceInitialPreClickReset) {
    state.pollBuilder.vendorLinkOpened = false;
    pollUiState.bookShowCollapsedDetails = false;
    pollUiState.bookForceInitialPreClickReset = false;
    persistState();
  }

  // ====== Data preparation ======
  const workflowKey = getWorkflowKey();
  const selectedEvents = getPollSelectedEvents();
  const pollOptionLabels = selectedEvents.length
    ? selectedEvents.slice(0, 3).map((eventItem, index) => (eventItem.defaultLabel || "").trim() || `Event ${index + 1}`)
    : ["Event 1", "Event 2", "Event 3"];
  const proposedDateTimes = Array.isArray(state.pollBuilder?.proposedDateTimes)
    ? state.pollBuilder.proposedDateTimes.filter((value) => String(value || "").trim().length > 0).slice(0, 3)
    : [];
  const proposedTimeLabels = proposedDateTimes.map((value) => formatPollDateTime(value) || "").filter(Boolean);
  const deadlineLabel = String(formatPollDateTime(String(state.pollBuilder?.voteDeadlineDateTime || "").trim()) || String(state.pollBuilder?.voteDeadlineDateTime || "").trim() || "");
  const deadlineTimeZone = String(state.pollBuilder?.voteDeadlineTimeZone || "").trim();
  const fullShareLink = resolvePollShareLinkUrl(state.pollBuilder?.shareLink);
  const effectiveView = getEffectivePollViewModel({
    eventLabels: pollOptionLabels,
    timeLabels: proposedTimeLabels,
    rawTimeValues: proposedDateTimes,
    baseDeadlineValue: state.pollBuilder?.voteDeadlineDateTime || "",
    baseDeadlineText: `${deadlineLabel}${deadlineTimeZone ? ` (${deadlineTimeZone})` : ""}`,
    timeZoneLabel: deadlineTimeZone,
    shareLink: fullShareLink
  });
  const resultsModel = effectiveView.model;

  const fallbackPollDeadlineRaw = String(effectiveView.effectiveDeadlineValue || state.pollBuilder?.voteDeadlineDateTime || "").trim();
  const fallbackPollDeadline = fallbackPollDeadlineRaw ? new Date(fallbackPollDeadlineRaw) : null;
  const fallbackRsvpDeadlineIso = fallbackPollDeadline && !Number.isNaN(fallbackPollDeadline.getTime())
    ? new Date(fallbackPollDeadline.getTime() + (48 * 60 * 60 * 1000)).toISOString()
    : "";
  const hasCustomRsvpDeadline = Boolean(
    String(pollUiState.rsvpDeadlineDate || "").trim()
    && String(pollUiState.rsvpDeadlineHour || "").trim()
    && String(pollUiState.rsvpDeadlineMinute || "").trim()
    && String(pollUiState.rsvpDeadlinePeriod || "").trim()
  );
  const activeRsvpDeadlineIso = hasCustomRsvpDeadline
    ? buildPollDateTimeValue(
      pollUiState.rsvpDeadlineDate,
      pollUiState.rsvpDeadlineHour,
      pollUiState.rsvpDeadlineMinute,
      pollUiState.rsvpDeadlinePeriod
    )
    : fallbackRsvpDeadlineIso;
  const rsvpStatus = getRsvpCloseCountdownStatus(activeRsvpDeadlineIso);

  // Process bar state
  const bookEventStages = ["Collecting RSVPs", "RSVP Closed", "Booked with Vendor", "Marked as Booked"];
  const isRsvpClosed = Boolean(rsvpStatus.isClosed);
  const hasVendorOpened = Boolean(state.pollBuilder?.vendorLinkOpened);
  const hasMarkedBooked = Boolean(state.pollBuilder?.markedBooked);
  const bookEventActiveStageIndex = (() => {
    if (hasMarkedBooked) return 3;
    if (hasVendorOpened) return 2;
    if (isRsvpClosed) return 1;
    return 0;
  })();
  const bookEventProgressBarHtml = getHorizontalProcessBarHtml(bookEventStages, bookEventActiveStageIndex);

  // RSVP counts
  const rawResponses = Array.isArray(state.pollBuilder?.responses) ? state.pollBuilder.responses : [];
  const toFirstName = (fullName) => String(fullName || "").trim().split(/\s+/).filter(Boolean)[0] || "";
  const uniqueResponseNames = Array.from(new Set(
    rawResponses
      .map((row) => String(row?.voterName || "").trim())
      .filter(Boolean)
  ));
  const uniqueResponseFirstNames = Array.from(new Set(
    uniqueResponseNames
      .map((name) => toFirstName(name))
      .filter(Boolean)
  )).sort((left, right) => left.localeCompare(right));
  const confirmedVoterNames = Array.from(new Set(
    (Array.isArray(resultsModel?.topEvent?.voters) ? resultsModel.topEvent.voters : [])
      .map((name) => String(name || "").trim())
      .filter(Boolean)
  )).sort((left, right) => left.localeCompare(right));
  const confirmedVoterFirstNames = Array.from(new Set(
    confirmedVoterNames
      .map((name) => toFirstName(name))
      .filter(Boolean)
  )).sort((left, right) => left.localeCompare(right));
  const displayNamesBase = confirmedVoterFirstNames.length
    ? confirmedVoterFirstNames
    : uniqueResponseFirstNames;
  const displayNames = Array.from(new Set(displayNamesBase))
    .sort((left, right) => left.localeCompare(right));
  const rowsPerCollapsedColumn = Math.max(1, Number(pollUiState.bookAttendingRows || 5));
  const maxCollapsedVisibleWithToggle = Math.max(1, rowsPerCollapsedColumn * 3 - 1);
  const maxCollapsedVisibleWithoutToggle = Math.max(1, rowsPerCollapsedColumn * 3);
  const collapsedVisibleCount = displayNames.length > maxCollapsedVisibleWithToggle
    ? maxCollapsedVisibleWithToggle
    : Math.min(displayNames.length, maxCollapsedVisibleWithoutToggle);
  const remainingAttendingCount = Math.max(0, displayNames.length - collapsedVisibleCount);
  const collapsedFirstColumnNames = displayNames.slice(0, rowsPerCollapsedColumn);
  const collapsedSecondColumnNames = displayNames.slice(rowsPerCollapsedColumn, rowsPerCollapsedColumn * 2);
  const collapsedThirdColumnNames = displayNames.slice(rowsPerCollapsedColumn * 2, collapsedVisibleCount);
  const expandedFirstColumnCount = Math.ceil(displayNames.length / 3);
  const expandedFirstColumnNames = displayNames.slice(0, expandedFirstColumnCount);
  const expandedSecondColumnNames = displayNames.slice(expandedFirstColumnCount, expandedFirstColumnCount * 2);
  const expandedThirdColumnNames = displayNames.slice(expandedFirstColumnCount * 2);
  const showExpandedAttendingList = Boolean(pollUiState.bookAttendingExpanded && remainingAttendingCount > 0);
  const attendingFirstColumnNames = showExpandedAttendingList ? expandedFirstColumnNames : collapsedFirstColumnNames;
  const attendingSecondColumnNames = showExpandedAttendingList ? expandedSecondColumnNames : collapsedSecondColumnNames;
  const attendingThirdColumnNames = showExpandedAttendingList ? expandedThirdColumnNames : collapsedThirdColumnNames;
  const attendingListContainerClass = showExpandedAttendingList
    ? "mt-3 pr-1 text-sm text-slate-700"
    : "mt-3 pr-1 text-sm text-slate-700";
  const yesCount = confirmedVoterNames.length || uniqueResponseNames.length;

  // Event details
  const topEventLabel = String(resultsModel?.topEvent?.label || "Team Cooking Class");
  const topTimeLabel = String(resultsModel?.topTime?.label || "March 15, 2026 at 3:00 PM");
  const eventLocationType = String(state.pollBuilder?.eventLocationType || "virtual");
  const locationPillClass = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700";
  const locationLabel = eventLocationType === "virtual" ? "Virtual" : eventLocationType === "in-person" ? "In-person" : "Hybrid";
  
  const eventDescription = "An interactive virtual cooking experience where the team learns to prepare a delicious meal together, guided by a professional chef.";
  const costPerPerson = Number(state.pollBuilder?.costPerPerson || 50);
  const finalHeadcount = yesCount;
  const estimatedTotalCost = finalHeadcount * costPerPerson;
  const monthlyBudget = Number(state.landingDraft?.totalBudget || 3000);
  const budgetRemaining = monthlyBudget - estimatedTotalCost;
  const budgetRemainingToneClass = budgetRemaining < 0 ? "text-amber-700" : "text-slate-700";
  const topTimeParts = String(topTimeLabel || "").split(" at ");
  const bookingDateLabel = String(topTimeParts[0] || topTimeLabel || "TBD").trim();
  const bookingTimeLabel = String(topTimeParts[1] || topTimeLabel || "TBD").trim();
  const bookingTimeZone = String(state.pollBuilder?.timeZone || pollUiState.rsvpDeadlineTimeZone || "CST").trim();
  const bookingTimeZoneLabel = bookingTimeZone === "CST" ? "Central" : (bookingTimeZone || "Central");
  const bookingTimeZoneShort = ({ Central: "CST", Eastern: "EST", Mountain: "MST", Pacific: "PST" }[bookingTimeZoneLabel] || bookingTimeZone || "CST");
  const existingBookingConfirmation = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
    ? state.pollBuilder.bookingConfirmation
    : null;
  const hasBookingSaved = Boolean(existingBookingConfirmation?.timestampBookedConfirmed);
  const expenseToolUrl = String(state.settings?.expenseToolUrl || "").trim();
  const expenseToolUrlIsValid = isValidHttpUrl(expenseToolUrl);
  const expenseToolUrlIsMissing = !expenseToolUrl;
  const showExpenseToolInvalidHint = !expenseToolUrlIsMissing && !expenseToolUrlIsValid;
  const expenseModalInputValue = String(
    pollUiState.bookExpenseToolInput || expenseToolUrl || ""
  );
  const expenseModalInputIsValid = isValidHttpUrl(expenseModalInputValue);
  const showConfirmBookingDetails = hasVendorOpened && !hasBookingSaved;
  const showWhatToEnterBooking = !hasVendorOpened && !hasBookingSaved;
  const isCollectingRsvpsStage = !isRsvpClosed && !hasVendorOpened && !hasMarkedBooked;
  const isRsvpClosedStage = isRsvpClosed && !hasVendorOpened && !hasMarkedBooked;
  const confirmedEventCardToneClass = isRsvpClosedStage
    ? "border-slate-300 bg-white shadow-sm"
    : "border-slate-200 bg-slate-50";
  const responsesCardToneClass = isCollectingRsvpsStage
    ? "border-slate-300 bg-white shadow-sm"
    : "border-slate-200 bg-slate-50";
  const isBookEventButtonDisabled = isCollectingRsvpsStage;
  const bookEventButtonDisabledAttr = isBookEventButtonDisabled ? "disabled" : "";
  const bookEventButtonClass = "rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300";
  const showCollapsedBookingSummary = showConfirmBookingDetails && !pollUiState.bookShowCollapsedDetails;
  const showBookEventCards = !showCollapsedBookingSummary;
  const confirmHeadcountValue = String(
    pollUiState.bookConfirmHeadcount
    || existingBookingConfirmation?.bookedHeadcount
    || finalHeadcount
  );
  const confirmDateValue = String(
    pollUiState.bookConfirmDate
    || existingBookingConfirmation?.bookedDate
    || bookingDateLabel
  );
  const parseBookEventDate = (label) => {
    const rawLabel = String(label || "").trim();
    if (!rawLabel) return null;
    const currentYear = new Date().getFullYear();
    const hasExplicitYear = /\b\d{4}\b/.test(rawLabel);
    const normalizedLabel = rawLabel
      .replace(/\s*@\s*/g, " ")
      .replace(/\s+at\s+/gi, " ")
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const withYear = hasExplicitYear ? normalizedLabel : `${normalizedLabel} ${currentYear}`;
    const parsedDate = new Date(withYear);
    if (Number.isNaN(parsedDate.getTime())) return null;
    return parsedDate;
  };
  const topTimeDateObj = parseBookEventDate(topTimeLabel);
  const toDateTimeLocalValue = (dateObj) => {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const defaultConfirmDateTimeLocalValue = toDateTimeLocalValue(topTimeDateObj);
  const confirmDateTimeLocalValue = String(
    pollUiState.bookConfirmDateTimeLocal
    || defaultConfirmDateTimeLocalValue
  );
  const parsedConfirmDateTimeLocal = confirmDateTimeLocalValue ? new Date(confirmDateTimeLocalValue) : null;
  const fallbackConfirmDateTimeObj = parsedConfirmDateTimeLocal && !Number.isNaN(parsedConfirmDateTimeLocal.getTime())
    ? parsedConfirmDateTimeLocal
    : (topTimeDateObj && !Number.isNaN(topTimeDateObj.getTime()) ? topTimeDateObj : new Date());
  const confirmPickerDateValue = `${fallbackConfirmDateTimeObj.getFullYear()}-${String(fallbackConfirmDateTimeObj.getMonth() + 1).padStart(2, "0")}-${String(fallbackConfirmDateTimeObj.getDate()).padStart(2, "0")}`;
  const confirmPickerHour24 = fallbackConfirmDateTimeObj.getHours();
  const confirmPickerHour12 = ((confirmPickerHour24 + 11) % 12) + 1;
  const confirmPickerMinute = String(fallbackConfirmDateTimeObj.getMinutes()).padStart(2, "0");
  const confirmPickerPeriod = confirmPickerHour24 >= 12 ? "PM" : "AM";
  const confirmHour12OptionsHtml = Array.from({ length: 12 }, (_, idx) => {
    const value = String(idx + 1);
    return `<option value="${value}" ${Number(value) === confirmPickerHour12 ? "selected" : ""}>${value}</option>`;
  }).join("");
  const confirmMinuteOptionsHtml = Array.from({ length: 60 }, (_, idx) => {
    const value = String(idx).padStart(2, "0");
    return `<option value="${value}" ${value === confirmPickerMinute ? "selected" : ""}>${value}</option>`;
  }).join("");
  const formatConfirmDateDisplay = (dateObj) => {
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const day = dateObj.toLocaleDateString("en-US", { day: "numeric" });
    const time = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${weekday} ${month} ${day} @ ${time} ${bookingTimeZoneShort}`;
  };
  const confirmDateDisplayValue = (() => {
    const parsed = confirmDateTimeLocalValue ? new Date(confirmDateTimeLocalValue) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) {
      return formatConfirmDateDisplay(parsed);
    }
    if (topTimeDateObj && !Number.isNaN(topTimeDateObj.getTime())) {
      return formatConfirmDateDisplay(topTimeDateObj);
    }
    return `${String(topTimeLabel || "").replace(" at ", " @ ")} ${bookingTimeZoneShort}`.trim();
  })();
  const defaultConfirmTimeValue = `${bookingTimeLabel || topTimeLabel} (${bookingTimeZoneLabel})`;
  const confirmTimeValue = String(
    pollUiState.bookConfirmTime
    || existingBookingConfirmation?.bookedTime
    || defaultConfirmTimeValue
  );
  const confirmTotalCostValue = String(
    pollUiState.bookConfirmTotalCost
    || (existingBookingConfirmation?.bookedTotalCost ? fmtMoney(existingBookingConfirmation.bookedTotalCost) : fmtMoney(estimatedTotalCost))
  );
  const shouldFreezeBookEventCardHeight = showExpandedAttendingList && Number(pollUiState.bookEventDefaultCardHeight) > 0;
  const bookEventCardInlineStyle = shouldFreezeBookEventCardHeight
    ? ` style="height:${Math.round(Number(pollUiState.bookEventDefaultCardHeight))}px;"`
    : "";

  // Time selection snapshot
  const topTimePercent = resultsModel?.topTime?.percent || 75;
  const secondTime = resultsModel?.times?.[1];
  const secondTimeLabel = secondTime?.label || "March 20, 2026 at 2:00 PM";
  const secondTimePercent = secondTime?.percent || 25;

  // Vendor URL
  const topEventDetailsUrl = "https://www.withconfetti.com/product/virtual-sherlocked-escape-quest";
  const compactSummaryText = `Event: ${topEventLabel || "Escape Room Experience"} • ${topTimeLabel} (${bookingTimeZoneLabel}) • ${yesCount} confirmed`;
  const confirmErrorMessage = String(pollUiState.bookConfirmErrorMessage || "").trim();
  const confirmBookingDetailsSectionHtml = showConfirmBookingDetails ? `
      <section class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="mb-3 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3">
          <h5 class="text-base font-semibold tracking-tight text-slate-900">Confirm booking details</h5>
          <p class="mt-1 text-xs text-slate-600">Save the final details to track budget and add this to your schedule.</p>
        </div>

        <div class="space-y-3">
          <label class="block">
            <span class="text-xs font-medium text-slate-600">Date</span>
            <div class="relative mt-1">
              <input id="bookConfirmDateTimeDisplay" type="text" readonly class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900" value="${escapeHtml(confirmDateDisplayValue)}">
              <input id="bookConfirmDateTimeRaw" type="datetime-local" class="sr-only" value="${escapeHtml(confirmDateTimeLocalValue)}" tabindex="-1" aria-hidden="true">
              <button id="bookConfirmDateTimeTrigger" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Open date and time picker">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4" aria-hidden="true">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
                </svg>
              </button>
              <div id="bookConfirmDateTimePopover" class="absolute left-0 top-full z-20 mt-2 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div class="space-y-3">
                  <label class="block">
                    <span class="text-xs font-medium text-slate-600">Date</span>
                    <input id="bookConfirmDateOnly" type="date" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value="${escapeHtml(confirmPickerDateValue)}">
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <label class="block">
                      <span class="text-xs font-medium text-slate-600">Hour</span>
                      <select id="bookConfirmHour12" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900">${confirmHour12OptionsHtml}</select>
                    </label>
                    <label class="block">
                      <span class="text-xs font-medium text-slate-600">Minute</span>
                      <select id="bookConfirmMinute" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900">${confirmMinuteOptionsHtml}</select>
                    </label>
                    <label class="block">
                      <span class="text-xs font-medium text-slate-600">AM/PM</span>
                      <select id="bookConfirmPeriod" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900">
                        <option value="AM" ${confirmPickerPeriod === "AM" ? "selected" : ""}>AM</option>
                        <option value="PM" ${confirmPickerPeriod === "PM" ? "selected" : ""}>PM</option>
                      </select>
                    </label>
                  </div>
                  <div class="flex justify-end">
                    <button id="bookConfirmDateTimeDone" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Done</button>
                  </div>
                </div>
              </div>
            </div>
          </label>
          <label class="block">
            <span class="text-xs font-medium text-slate-600">Headcount</span>
            <input id="bookConfirmHeadcount" type="number" min="0" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value="${escapeHtml(confirmHeadcountValue)}">
          </label>
          <label class="block">
            <span class="text-xs font-medium text-slate-600">Total cost</span>
            <input id="bookConfirmTotalCost" type="text" inputmode="decimal" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value="${escapeHtml(confirmTotalCostValue)}">
          </label>
        </div>

        <div class="mt-4">
          <button id="bookSaveBookingDetails" type="button" class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Save booking &amp; track budget</button>
        </div>
        ${confirmErrorMessage ? `<p class="mt-3 text-sm font-medium text-rose-700">${escapeHtml(confirmErrorMessage)}</p>` : ""}
      </section>
  ` : "";

  // ====== Main panel HTML ======
  panel.innerHTML = `
    <div class="space-y-6">
      
      <!-- Process Bar -->
      ${bookEventProgressBarHtml}

      ${showConfirmBookingDetails ? `
      <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div class="text-sm text-slate-700">${escapeHtml(compactSummaryText)}</div>
          <button id="bookToggleCollapsedDetails" type="button" class="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900">
            ${pollUiState.bookShowCollapsedDetails ? "Hide details" : "View details"}
          </button>
        </div>
      </div>
      ` : ""}

      <!-- 65/35 Layout -->
      ${showBookEventCards ? `
      <div class="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
        
        <!-- Left 65%: Confirmed Event Card -->
        <div class="order-2 lg:order-2 lg:col-span-3 lg:self-stretch">
          <article id="bookEventMainCard" class="flex h-full flex-col rounded-xl border p-5 ${confirmedEventCardToneClass}"${bookEventCardInlineStyle}>
            <div>
              <div class="mb-[20px] flex items-center gap-2 text-[8pt] text-slate-500">
                <span class="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">CONFIRMED EVENT</span>
                <span class="font-normal">Your team is confirming attendance before you book.</span>
              </div>
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="min-w-0 md:flex-1">
                  <h4 class="text-2xl font-semibold text-slate-900">${escapeHtml(topEventLabel || "Escape Room Experience")}</h4>

                  <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span class="font-semibold text-slate-900">${escapeHtml(topTimeLabel || "Thu, Mar 14 @ 5:00 PM (CST)")}</span>
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">${escapeHtml(locationLabel)}</span>
                  </div>

                  <p class="mt-3 text-sm font-normal text-slate-600">${escapeHtml(eventDescription)}</p>

                </div>
                <div class="md:shrink-0 md:w-44">
                  <img
                    src="assets/event-placeholder.svg"
                    alt="Recommended event placeholder"
                    class="ml-auto block rounded-lg border border-slate-200 object-cover"
                    style="width:149.6px;height:95.2px;"
                  />
                </div>
              </div>
            </div>

            ${`
            <section class="mt-auto pt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              ${showWhatToEnterBooking ? `
              <div class="-mx-4 -mt-4 mb-3 rounded-t-lg border-b border-slate-200 bg-slate-100 px-4 py-3">
                <h5 class="text-base font-semibold tracking-tight text-slate-900">What to enter when booking</h5>
              </div>

              <div class="space-y-2 text-sm">
                <div class="text-slate-600">
                  <span>Book for </span><span class="text-base font-semibold text-slate-900">${finalHeadcount}</span>
                </div>
                <div class="text-slate-600">
                  <span>When: </span><span class="font-semibold text-slate-900">${escapeHtml(topTimeLabel)} (${escapeHtml(bookingTimeZoneLabel)})</span>
                </div>
              </div>

              <p class="mt-6 flex items-start gap-2 text-xs text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v5" />
                  <circle cx="12" cy="7.8" r="0.7" fill="currentColor" stroke="none" />
                </svg>
                <span>Book with the vendor, then return to confirm details so we can track budget and notify your team.</span>
              </p>

              <div class="mt-4">
                <button id="bookEventOpenVendor" type="button" ${bookEventButtonDisabledAttr} class="${bookEventButtonClass}">
                  <span class="inline-flex items-center gap-2">
                    <span>Book Event</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5v5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 14 19 5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 13v5a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1h5" />
                    </svg>
                  </span>
                </button>
              </div>

              ` : ""}

              ${hasBookingSaved ? `
              <div class="-mx-4 -mt-4 mb-3 rounded-t-lg border-b border-slate-200 bg-slate-100 px-4 py-3">
                <h5 class="text-base font-semibold tracking-tight text-slate-900">Booked and saved</h5>
                <p class="mt-1 text-xs text-slate-600">Budget updated and event added to Upcoming events.</p>
              </div>

              <div class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                ${escapeHtml(String(existingBookingConfirmation?.bookedHeadcount || finalHeadcount))} • ${escapeHtml(String(existingBookingConfirmation?.bookedDate || bookingDateLabel))} • ${escapeHtml(String(existingBookingConfirmation?.bookedTime || defaultConfirmTimeValue))} • ${fmtMoney(Number(existingBookingConfirmation?.bookedTotalCost || estimatedTotalCost))}
              </div>

              <div class="mt-4">
                <button id="bookEventContinueWorkflow" type="button" class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Continue →</button>
                <button id="bookEventRedoFlow" type="button" class="ml-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Re-do booking flow</button>
              </div>

              <div class="mt-3 border-t border-slate-200 pt-3">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Optional</div>
                    <div class="mt-1 text-xs text-slate-600">Log this expense in your expense tool.</div>
                    ${showExpenseToolInvalidHint ? `<div class="mt-1 text-xs text-slate-600">Add a valid URL in Settings.</div>` : ""}
                  </div>
                  <button
                    id="bookEventExpenseToolAction"
                    type="button"
                    class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 ${showExpenseToolInvalidHint ? "opacity-60 cursor-not-allowed" : ""}"
                    ${showExpenseToolInvalidHint ? "disabled" : ""}
                  >
                    ${expenseToolUrlIsValid ? "Open expense tool" : "Set expense tool link"}
                  </button>
                </div>
              </div>

              ${pollUiState.bookExpenseModalOpen ? `
                <div id="bookExpenseToolModal" class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/30 p-4">
                  <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h6 class="text-base font-semibold text-slate-900">Expense tool link</h6>
                    <input
                      id="bookExpenseToolUrlInput"
                      type="url"
                      placeholder="https://..."
                      value="${escapeHtml(expenseModalInputValue)}"
                      class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                    />
                    <div id="bookExpenseToolUrlHint" class="mt-2 text-xs text-slate-600 ${expenseModalInputValue && !expenseModalInputIsValid ? "" : "hidden"}">Add a valid URL in Settings.</div>
                    <div class="mt-4 flex justify-end gap-2">
                      <button id="bookExpenseToolCancel" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button id="bookExpenseToolSave" type="button" class="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" ${expenseModalInputIsValid ? "" : "disabled"}>Save</button>
                    </div>
                  </div>
                </div>
              ` : ""}
              ` : ""}
            </section>
            `}
          </article>
        </div>

        <!-- Right 35%: RSVP Snapshot -->
        <div class="order-1 lg:order-1 lg:col-span-2">
          <div class="h-full">
            <div class="flex h-full flex-col overflow-hidden rounded-xl border ${responsesCardToneClass}">
              <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-[16px] font-semibold text-slate-900">Responses</h3>
                  <div class="flex items-center gap-2 text-[12px] font-medium text-slate-600">
                    <span class="inline-block h-2 w-2 rounded-full ${isRsvpClosed ? "bg-slate-600" : "bg-slate-400"}"></span>
                    <span>${isRsvpClosed ? "RSVP closed" : rsvpStatus.text}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-1 flex-col">
                <div class="shrink-0 border-b border-slate-200 px-6 py-5">
                  <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Confirmed RSVPs</div>
                  <div class="mt-2 text-5xl font-semibold leading-none text-slate-900">${yesCount}</div>
                </div>
                <div id="bookAttendingSection" class="flex-1 border-b border-slate-200 px-6 py-5">
                  <div id="bookAttendingLabel" class="text-xs font-medium uppercase tracking-wide text-slate-500">Attendees</div>
                  ${displayNames.length
                ? `<div class="${attendingListContainerClass}"><div class="grid grid-cols-3 gap-x-4"><div id="bookAttendingColOne" class="space-y-2">${attendingFirstColumnNames.map((name) => `<div class="attending-name-row truncate">${escapeHtml(name)}</div>`).join("")}${showExpandedAttendingList && remainingAttendingCount > 0 ? `<button id="bookAttendingExpandMore" type="button" class="block text-left text-xs font-medium text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-900">Show less</button>` : ""}</div><div class="space-y-2">${attendingSecondColumnNames.map((name) => `<div class="attending-name-row truncate">${escapeHtml(name)}</div>`).join("")}</div><div class="space-y-2">${attendingThirdColumnNames.map((name) => `<div class="attending-name-row truncate">${escapeHtml(name)}</div>`).join("")}${!showExpandedAttendingList && remainingAttendingCount > 0 ? `<button id="bookAttendingExpandMore" type="button" class="block text-left text-xs font-medium text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-900">+${remainingAttendingCount}</button>` : ""}</div></div></div>`
    : '<div class="mt-3 text-sm text-slate-500">No responses yet</div>'}
                </div>
                <div class="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Financial preview</div>
                  <div class="mt-3 space-y-2">
                    <div class="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-2">
                      <div class="text-sm font-semibold text-slate-800">Estimated total <span class="font-medium text-slate-600">(${finalHeadcount} × ${fmtMoney(costPerPerson)})</span></div>
                      <div class="text-xl font-bold text-slate-900">${fmtMoney(estimatedTotalCost)}</div>
                    </div>
                    <div class="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-2">
                      <div class="text-sm font-medium text-slate-700">Cost per person</div>
                      <div class="text-base font-semibold text-slate-800">${fmtMoney(costPerPerson)}</div>
                    </div>
                    <div class="flex items-baseline justify-between gap-4">
                      <div class="text-xs font-medium text-slate-600">Estimated budget remaining after booking</div>
                      <div class="text-sm font-medium ${budgetRemainingToneClass}">${fmtMoney(budgetRemaining)}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      ` : ""}

      ${confirmBookingDetailsSectionHtml}

    </div>
  `;

  // ====== Event Handlers ======

  const expandAttendingButton = document.getElementById("bookAttendingExpandMore");
  if (expandAttendingButton) {
    expandAttendingButton.onclick = () => {
      pollUiState.bookAttendingExpanded = !pollUiState.bookAttendingExpanded;
      renderBookEventStep();
    };
  }

  const toggleCollapsedDetailsButton = document.getElementById("bookToggleCollapsedDetails");
  if (toggleCollapsedDetailsButton) {
    toggleCollapsedDetailsButton.onclick = () => {
      pollUiState.bookShowCollapsedDetails = !pollUiState.bookShowCollapsedDetails;
      renderBookEventStep();
    };
  }

  const dateTimeInput = document.getElementById("bookConfirmDateTimeRaw");
  const dateTimeDisplayInput = document.getElementById("bookConfirmDateTimeDisplay");
  const dateTimeTrigger = document.getElementById("bookConfirmDateTimeTrigger");
  const dateTimePopover = document.getElementById("bookConfirmDateTimePopover");
  const dateOnlyInput = document.getElementById("bookConfirmDateOnly");
  const hour12Input = document.getElementById("bookConfirmHour12");
  const minuteInput = document.getElementById("bookConfirmMinute");
  const periodInput = document.getElementById("bookConfirmPeriod");
  const dateTimeDoneButton = document.getElementById("bookConfirmDateTimeDone");
  if (dateTimeInput && dateTimeTrigger && dateTimePopover && dateOnlyInput && hour12Input && minuteInput && periodInput) {
    const syncFromModalInputs = () => {
      const datePart = String(dateOnlyInput.value || "").trim();
      const hour12 = Number.parseInt(String(hour12Input.value || ""), 10);
      const minute = Number.parseInt(String(minuteInput.value || "0"), 10);
      const period = String(periodInput.value || "AM").toUpperCase() === "PM" ? "PM" : "AM";
      if (!datePart || !Number.isFinite(hour12) || hour12 < 1 || hour12 > 12) return;
      const normalizedMinute = Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0;
      const hour24 = (hour12 % 12) + (period === "PM" ? 12 : 0);
      const nextRaw = `${datePart}T${String(hour24).padStart(2, "0")}:${String(normalizedMinute).padStart(2, "0")}`;
      dateTimeInput.value = nextRaw;
      pollUiState.bookConfirmDateTimeLocal = nextRaw;
      const parsed = new Date(nextRaw);
      if (!Number.isNaN(parsed.getTime()) && dateTimeDisplayInput) {
        dateTimeDisplayInput.value = formatConfirmDateDisplay(parsed);
      }
    };

    const openModal = () => {
      dateTimePopover.classList.remove("hidden");
    };
    const closeModal = () => {
      dateTimePopover.classList.add("hidden");
    };

    dateTimeTrigger.onclick = openModal;
    if (dateTimeDisplayInput) {
      dateTimeDisplayInput.onclick = openModal;
    }
    dateOnlyInput.oninput = syncFromModalInputs;
    hour12Input.onchange = syncFromModalInputs;
    minuteInput.onchange = syncFromModalInputs;
    periodInput.onchange = syncFromModalInputs;
    if (dateTimeDoneButton) {
      dateTimeDoneButton.onclick = () => {
        syncFromModalInputs();
        closeModal();
      };
    }
  }

  if (!showExpandedAttendingList) {
    requestAnimationFrame(() => {
      const attendingSection = document.getElementById("bookAttendingSection");
      const attendingLabel = document.getElementById("bookAttendingLabel");
      const attendingColumnOne = document.getElementById("bookAttendingColOne");
      const sampleRow = attendingColumnOne?.querySelector(".attending-name-row");
      const bookEventMainCard = document.getElementById("bookEventMainCard");

      if (bookEventMainCard) {
        const measuredCardHeight = Math.round(bookEventMainCard.getBoundingClientRect().height);
        if (measuredCardHeight > 0) {
          pollUiState.bookEventDefaultCardHeight = measuredCardHeight;
        }
      }

      if (!attendingSection || !attendingLabel || !sampleRow) return;

      const sectionStyle = window.getComputedStyle(attendingSection);
      const labelStyle = window.getComputedStyle(attendingLabel);
      const paddingTop = Number.parseFloat(sectionStyle.paddingTop) || 0;
      const paddingBottom = Number.parseFloat(sectionStyle.paddingBottom) || 0;
      const labelHeight = attendingLabel.getBoundingClientRect().height;
      const labelMarginBottom = Number.parseFloat(labelStyle.marginBottom) || 0;
      const listTopSpacing = 12;
      const usableHeight = attendingSection.clientHeight - paddingTop - paddingBottom - labelHeight - labelMarginBottom - listTopSpacing;

      const sampleHeight = sampleRow.getBoundingClientRect().height;
      const rowGap = 8;
      const rowUnit = sampleHeight + rowGap;
      if (rowUnit <= 0 || usableHeight <= 0) return;

      const fittedRows = Math.max(1, Math.floor((usableHeight + rowGap) / rowUnit));
      if (fittedRows !== pollUiState.bookAttendingRows) {
        pollUiState.bookAttendingRows = fittedRows;
        renderBookEventStep();
      }
    });
  }

  // Book with vendor
  const openVendorBtn = document.getElementById("bookEventOpenVendor");
  if (openVendorBtn) {
    openVendorBtn.onclick = () => {
      state.pollBuilder.vendorLinkOpened = true;
      state.pollBuilder.bookingResetRequested = false;
      pollUiState.bookShowCollapsedDetails = false;
      if (!pollUiState.bookConfirmHeadcount) pollUiState.bookConfirmHeadcount = String(finalHeadcount);
      if (!pollUiState.bookConfirmDateTimeLocal) pollUiState.bookConfirmDateTimeLocal = defaultConfirmDateTimeLocalValue;
      if (!pollUiState.bookConfirmDate) pollUiState.bookConfirmDate = bookingDateLabel;
      if (!pollUiState.bookConfirmTime) pollUiState.bookConfirmTime = defaultConfirmTimeValue;
      if (!pollUiState.bookConfirmTotalCost) pollUiState.bookConfirmTotalCost = fmtMoney(estimatedTotalCost);
      pollUiState.bookConfirmErrorMessage = "";
      persistState();
      renderBookEventStep();
      if (topEventDetailsUrl) {
        window.open(topEventDetailsUrl, "_blank");
      }
    };
  }

  const saveBookingDetailsButton = document.getElementById("bookSaveBookingDetails");
  if (saveBookingDetailsButton) {
    saveBookingDetailsButton.onclick = () => {
      const headcountInput = document.getElementById("bookConfirmHeadcount");
      const dateTimeInput = document.getElementById("bookConfirmDateTimeRaw");
      const totalCostInput = document.getElementById("bookConfirmTotalCost");

      const parsedHeadcount = Number.parseInt(String(headcountInput?.value || "").trim(), 10);
      const bookedHeadcount = Number.isFinite(parsedHeadcount) && parsedHeadcount > 0 ? parsedHeadcount : 0;
      const selectedDateTimeLocal = String(dateTimeInput?.value || "").trim();
      const parsedBookedDateTime = selectedDateTimeLocal ? new Date(selectedDateTimeLocal) : null;
      const hasValidBookedDateTime = Boolean(parsedBookedDateTime && !Number.isNaN(parsedBookedDateTime.getTime()));
      const totalCostRaw = String(totalCostInput?.value || "").replace(/[^\d.-]/g, "");
      const parsedTotalCost = Number.parseFloat(totalCostRaw);
      const bookedTotalCost = Number.isFinite(parsedTotalCost) && parsedTotalCost >= 0 ? parsedTotalCost : NaN;

      if (!hasValidBookedDateTime || bookedHeadcount <= 0 || !Number.isFinite(bookedTotalCost)) {
        pollUiState.bookConfirmErrorMessage = "Add date/time, headcount, and total cost to save.";
        renderBookEventStep();
        return;
      }

      const bookedDate = parsedBookedDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const bookedTime = `${parsedBookedDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} (${bookingTimeZoneLabel})`;
      const timestampBookedConfirmed = new Date().toISOString();

      const safeClone = (value, fallback) => {
        try {
          return clone(value ?? fallback);
        } catch (error) {
          return clone(fallback);
        }
      };
      const atomicSnapshot = {
        eventsBooked: safeClone(Array.isArray(state.eventsBooked) ? state.eventsBooked : [], []),
        budgetTransactions: safeClone(Array.isArray(state.budgetTransactions) ? state.budgetTransactions : [], []),
        workflowStates: safeClone(state.workflowStates && typeof state.workflowStates === "object" ? state.workflowStates : {}, {}),
        activeEventId: state.activeEventId,
        completedSetupSteps: safeClone(Array.isArray(state.completedSetupSteps) ? state.completedSetupSteps : [], []),
        pollBuilder: safeClone(state.pollBuilder && typeof state.pollBuilder === "object" ? state.pollBuilder : {}, {}),
        pollUiState: {
          bookConfirmHeadcount: pollUiState.bookConfirmHeadcount,
          bookConfirmDateTimeLocal: pollUiState.bookConfirmDateTimeLocal,
          bookConfirmDate: pollUiState.bookConfirmDate,
          bookConfirmTime: pollUiState.bookConfirmTime,
          bookConfirmTotalCost: pollUiState.bookConfirmTotalCost,
          bookConfirmErrorMessage: pollUiState.bookConfirmErrorMessage
        }
      };

      let didSaveAtomically = false;
      try {
        const currentEventsBooked = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];
        const currentBudgetTransactions = Array.isArray(state.budgetTransactions) ? state.budgetTransactions : [];
        if (!state.workflowStates || typeof state.workflowStates !== "object") {
          state.workflowStates = {};
        }
        const chosenEvent = selectedEvents.find((eventItem) => String(eventItem?.defaultLabel || "").trim() === String(topEventLabel || "").trim())
          || selectedEvents[0]
          || null;
        const chosenEventMasterId = String(chosenEvent?.id || "").trim();
        const vendorUrl = String(topEventDetailsUrl || state.pollBuilder.vendorBookingUrl || "").trim();

        const existingBookedIndex = currentEventsBooked.findIndex((eventItem) => {
          const sameMasterId = chosenEventMasterId && String(eventItem?.event_master_id || "") === chosenEventMasterId;
          const sameName = String(eventItem?.name || "").trim() === String(topEventLabel || "").trim();
          const sameUrl = vendorUrl && String(eventItem?.url || "").trim() === vendorUrl;
          return sameMasterId || sameName || sameUrl;
        });
        const existingBookedEvent = existingBookedIndex >= 0 ? currentEventsBooked[existingBookedIndex] : null;
        const bookedEventId = existingBookedEvent?.id || uid();

        const bookedEventRecord = {
          ...(existingBookedEvent || {}),
          id: bookedEventId,
          event_master_id: chosenEventMasterId || existingBookedEvent?.event_master_id || "",
          name: String(topEventLabel || existingBookedEvent?.name || "Team Event"),
          url: vendorUrl || String(existingBookedEvent?.url || ""),
          date: bookedDate,
          time: bookedTime,
          startDateTime: selectedDateTimeLocal,
          headcount: bookedHeadcount,
          rsvps: bookedHeadcount,
          totalCost: bookedTotalCost,
          costPerPerson: bookedHeadcount > 0 ? Number((bookedTotalCost / bookedHeadcount).toFixed(2)) : Number(costPerPerson || 0),
          status: "Booked",
          bookedAt: timestampBookedConfirmed,
          attendance: Number(existingBookedEvent?.attendance || 0),
          workflow: clone(state.workflowStates[bookedEventId] || getWorkflowState()),
          feedback: existingBookedEvent?.feedback || null
        };

        const nextEventsBooked = existingBookedIndex >= 0
          ? currentEventsBooked.map((eventItem, index) => (index === existingBookedIndex ? bookedEventRecord : eventItem))
          : [bookedEventRecord, ...currentEventsBooked];

        const budgetLineItem = {
          id: uid(),
          type: "event",
          eventId: bookedEventId,
          amount: -bookedTotalCost,
          timestamp: timestampBookedConfirmed,
          occurredAt: timestampBookedConfirmed,
          description: `Booked: ${bookedEventRecord.name}`
        };
        const nextBudgetTransactions = [
          budgetLineItem,
          ...currentBudgetTransactions.filter((tx) => !(String(tx?.type || "") === "event" && String(tx?.eventId || "") === bookedEventId))
        ];

        const bookingPayload = {
          eventId: String(chosenEventMasterId || bookedEventId || state.currentEventId || "current-cycle"),
          workflowId: workflowKey,
          vendorUrl,
          bookedHeadcount,
          bookedDate,
          bookedTime,
          bookedTimeZone: bookingTimeZoneLabel,
          bookedTotalCost,
          timestampBookedConfirmed
        };

        const scheduleEntry = {
          id: `booking_${workflowKey}_${bookedDate}_${bookedTime}`.replace(/\s+/g, "_").toLowerCase(),
          workflowId: workflowKey,
          title: topEventLabel,
          date: bookedDate,
          time: bookedTime,
          timeZone: bookingTimeZoneLabel,
          headcount: bookedHeadcount,
          totalCost: bookedTotalCost,
          status: "Booked",
          vendorUrl,
          source: "book-event",
          createdAt: timestampBookedConfirmed
        };

        const existingSchedule = Array.isArray(state.pollBuilder.scheduleEntries) ? state.pollBuilder.scheduleEntries : [];

        state.eventsBooked = nextEventsBooked;
        state.budgetTransactions = nextBudgetTransactions;
        state.activeEventId = bookedEventId;
        state.workflowStates[bookedEventId] = clone(state.workflowStates[bookedEventId] || getWorkflowState());
        state.pollBuilder.scheduleEntries = [
          ...existingSchedule.filter((entry) => String(entry?.workflowId || "") !== workflowKey),
          scheduleEntry
        ];
        state.pollBuilder.bookingConfirmation = bookingPayload;
        state.pollBuilder.markedBooked = true;
        state.pollBuilder.bookingResetRequested = false;

        pollUiState.bookConfirmHeadcount = String(bookedHeadcount);
        pollUiState.bookConfirmDateTimeLocal = selectedDateTimeLocal;
        pollUiState.bookConfirmDate = bookedDate;
        pollUiState.bookConfirmTime = bookedTime;
        pollUiState.bookConfirmTotalCost = fmtMoney(bookedTotalCost);
        pollUiState.bookConfirmErrorMessage = "";

        if (!state.completedSetupSteps.includes(9)) {
          state.completedSetupSteps.push(9);
        }
        state.eventWorkflowProcessStep = Math.max(10, state.eventWorkflowProcessStep || 10);
        collapseSetupViewsForWorkflowStep();
        state.currentSetupStep = 10;
        scrollSetupStepIntoView(10, "smooth");

        persistState();
        didSaveAtomically = true;
      } catch (error) {
        console.error("book-save-atomic-failed", error);
        state.eventsBooked = atomicSnapshot.eventsBooked;
        state.budgetTransactions = atomicSnapshot.budgetTransactions;
        state.workflowStates = atomicSnapshot.workflowStates;
        state.activeEventId = atomicSnapshot.activeEventId;
        state.completedSetupSteps = atomicSnapshot.completedSetupSteps;
        state.pollBuilder = atomicSnapshot.pollBuilder;
        pollUiState.bookConfirmHeadcount = atomicSnapshot.pollUiState.bookConfirmHeadcount;
        pollUiState.bookConfirmDateTimeLocal = atomicSnapshot.pollUiState.bookConfirmDateTimeLocal;
        pollUiState.bookConfirmDate = atomicSnapshot.pollUiState.bookConfirmDate;
        pollUiState.bookConfirmTime = atomicSnapshot.pollUiState.bookConfirmTime;
        pollUiState.bookConfirmTotalCost = atomicSnapshot.pollUiState.bookConfirmTotalCost;
        pollUiState.bookConfirmErrorMessage = "Couldn’t save booking. Try again.";
        renderBookEventStep();
      }

      if (didSaveAtomically) {
        renderBookEventStep();
        try {
          renderSidebar();
          renderSetupMenuState();
          renderSetupStepStates();
          renderSidebarStepMenus();
        } catch (error) {
          console.error("book-save-post-render-failed", error);
        }
      }
    };
  }

  const continueWorkflowButton = document.getElementById("bookEventContinueWorkflow");
  if (continueWorkflowButton) {
    continueWorkflowButton.onclick = () => {
      if (!state.completedSetupSteps.includes(9)) {
        state.completedSetupSteps.push(9);
      }
      state.eventWorkflowProcessStep = Math.max(10, state.eventWorkflowProcessStep || 10);
      collapseSetupViewsForWorkflowStep();
      state.currentSetupStep = 10;
      persistState();
      renderSetupMenuState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      scrollSetupStepIntoView(10, "smooth");
    };
  }

  const expenseToolActionButton = document.getElementById("bookEventExpenseToolAction");
  if (expenseToolActionButton) {
    expenseToolActionButton.onclick = () => {
      const nextExpenseUrl = String(state.settings?.expenseToolUrl || "").trim();
      if (isValidHttpUrl(nextExpenseUrl)) {
        window.open(nextExpenseUrl, "_blank", "noopener,noreferrer");
        return;
      }
      pollUiState.bookExpenseToolInput = nextExpenseUrl;
      pollUiState.bookExpenseModalOpen = true;
      renderBookEventStep();
    };
  }

  const expenseToolCancelButton = document.getElementById("bookExpenseToolCancel");
  if (expenseToolCancelButton) {
    expenseToolCancelButton.onclick = () => {
      pollUiState.bookExpenseModalOpen = false;
      renderBookEventStep();
    };
  }

  const expenseToolUrlInput = document.getElementById("bookExpenseToolUrlInput");
  const expenseToolSaveButton = document.getElementById("bookExpenseToolSave");
  const expenseToolUrlHint = document.getElementById("bookExpenseToolUrlHint");
  if (expenseToolUrlInput && expenseToolSaveButton) {
    const syncExpenseModalValidity = () => {
      const draftUrl = String(expenseToolUrlInput.value || "").trim();
      pollUiState.bookExpenseToolInput = draftUrl;
      const valid = isValidHttpUrl(draftUrl);
      expenseToolSaveButton.disabled = !valid;
      if (expenseToolUrlHint) {
        expenseToolUrlHint.classList.toggle("hidden", !draftUrl || valid);
      }
    };
    expenseToolUrlInput.addEventListener("input", syncExpenseModalValidity);
    expenseToolSaveButton.onclick = () => {
      const draftUrl = String(expenseToolUrlInput.value || "").trim();
      if (!isValidHttpUrl(draftUrl)) {
        syncExpenseModalValidity();
        return;
      }
      if (!state.settings || typeof state.settings !== "object") {
        state.settings = { expenseToolUrl: "" };
      }
      state.settings.expenseToolUrl = draftUrl;
      pollUiState.bookExpenseModalOpen = false;
      pollUiState.bookExpenseToolInput = "";
      persistState();
      renderBookEventStep();
    };
  }

  const redoBookingFlowButton = document.getElementById("bookEventRedoFlow");
  if (redoBookingFlowButton) {
    redoBookingFlowButton.onclick = () => {
      const savedBooking = state.pollBuilder?.bookingConfirmation && typeof state.pollBuilder.bookingConfirmation === "object"
        ? state.pollBuilder.bookingConfirmation
        : null;
      const savedEventId = String(savedBooking?.eventId || "").trim();
      const savedVendorUrl = String(savedBooking?.vendorUrl || "").trim();
      const savedEventName = String(topEventLabel || "").trim();

      const matchedBookedEvent = (Array.isArray(state.eventsBooked) ? state.eventsBooked : []).find((eventItem) => {
        const matchesId = savedEventId && (String(eventItem?.id || "") === savedEventId || String(eventItem?.event_master_id || "") === savedEventId);
        const matchesUrl = savedVendorUrl && String(eventItem?.url || "").trim() === savedVendorUrl;
        const matchesName = savedEventName && String(eventItem?.name || "").trim() === savedEventName;
        return matchesId || matchesUrl || matchesName;
      });

      const matchedEventId = String(matchedBookedEvent?.id || "").trim();

      if (matchedEventId) {
        state.eventsBooked = (Array.isArray(state.eventsBooked) ? state.eventsBooked : []).filter((eventItem) => String(eventItem?.id || "") !== matchedEventId);
        state.budgetTransactions = (Array.isArray(state.budgetTransactions) ? state.budgetTransactions : []).filter((tx) => {
          const txEventId = String(tx?.eventId || "").trim();
          const txType = String(tx?.type || "").toLowerCase();
          return !(txEventId === matchedEventId && txType === "event");
        });
        if (state.activeEventId === matchedEventId) {
          state.activeEventId = null;
        }
      }

      state.pollBuilder.vendorLinkOpened = false;
      state.pollBuilder.markedBooked = false;
      state.pollBuilder.bookingResetRequested = true;
      state.pollBuilder.bookingConfirmation = null;
      state.pollBuilder.scheduleEntries = (Array.isArray(state.pollBuilder.scheduleEntries) ? state.pollBuilder.scheduleEntries : []).filter(
        (entry) => String(entry?.workflowId || "") !== workflowKey
      );

      pollUiState.bookShowCollapsedDetails = false;
      pollUiState.bookConfirmHeadcount = "";
      pollUiState.bookConfirmDateTimeLocal = "";
      pollUiState.bookConfirmDate = "";
      pollUiState.bookConfirmTime = "";
      pollUiState.bookConfirmTotalCost = "";
      pollUiState.bookConfirmErrorMessage = "";
      pollUiState.bookExpenseModalOpen = false;
      pollUiState.bookExpenseToolInput = "";

      persistState();
      renderAll();
    };
  }

}

function getPollBuilderValidity() {
  const selectedCount = Array.isArray(state.pollBuilder?.selectedEventIds) ? state.pollBuilder.selectedEventIds.length : 0;
  const hasDeadline = Boolean(String(state.pollBuilder?.voteDeadlineDateTime || "").trim());
  const dateTimes = Array.isArray(state.pollBuilder?.proposedDateTimes)
    ? state.pollBuilder.proposedDateTimes.filter((value) => String(value || "").trim().length > 0)
    : [];
  const timesCount = dateTimes.length;
  const hasValidTimes = timesCount >= 1;
  const hasValidEvents = selectedCount >= 2 && selectedCount <= 3;
  return {
    isValid: hasValidTimes && hasValidEvents,
    hasValidEvents,
    hasValidTimes,
    hasDeadline
  };
}

function syncPollClosedColumnsHeight() {
  const leftColumn = document.getElementById("recommendedPlanLeft");
  const rightColumn = document.getElementById("pollSnapshotRight");
  const eventCard = document.getElementById("recommendedEventBlock");
  const rsvpSetupPanel = document.getElementById("pollRsvpSetupPanel");

  if (!leftColumn || !rightColumn || !eventCard) return;

  eventCard.style.paddingBottom = "";

  if (window.innerWidth < 768) return;
  if (rsvpSetupPanel) return;

  const leftHeight = leftColumn.getBoundingClientRect().height;
  const rightHeight = rightColumn.getBoundingClientRect().height;
  const gap = Math.round(rightHeight - leftHeight);

  if (gap <= 0) return;

  const basePaddingBottom = Number.parseFloat(window.getComputedStyle(eventCard).paddingBottom) || 0;
  eventCard.style.paddingBottom = `${basePaddingBottom + gap}px`;
}

function renderPollBuilderStep() {
  const pollBuilderRoot = document.getElementById("pollBuilder");
  if (!pollBuilderRoot) return;
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") return;

  syncPollBuilderSelectionFromShortlist();

  const selectedEvents = getPollSelectedEvents();
  const introText = getDefaultPollIntro();
  const todayLocalIsoDate = getTodayLocalIsoDate();
  const minuteOptions = ["00", "30"];
  const hourOptions = Array.from({ length: 12 }, (_, idx) => String(idx + 1));
  const isFinalized = Boolean(String(state.pollBuilder.shareLink || "").trim());
  const fullShareLink = resolvePollShareLinkUrl(state.pollBuilder.shareLink);
  const deadlineLabel = String(formatPollDateTime(String(state.pollBuilder.voteDeadlineDateTime || "").trim()) || String(state.pollBuilder.voteDeadlineDateTime || "").trim() || "");
  const deadlineTimeZone = String(state.pollBuilder.voteDeadlineTimeZone || "").trim();
  const fullDeadlineText = `${deadlineLabel}${deadlineTimeZone ? ` (${deadlineTimeZone})` : ""}`;
  ensurePollResultsCountdownTicker();
  if (!isFinalized) {
    state.pollBuilder.showResultsPage = false;
    pollUiState.reminderPanelOpen = false;
    pollUiState.reminderChannel = "slack";
    pollUiState.reminderHelperVisible = false;
    pollUiState.reminderCopyBusy = false;
    pollUiState.reminderSubjectCopyBusy = false;
    pollUiState.rsvpSetupOpen = false;
    pollUiState.rsvpCollectionStarted = false;
    pollUiState.rsvpCopyBusy = false;
    pollUiState.rsvpShareStatus = "";
  }
  const showPollResultsPage = isFinalized
    && Boolean(state.pollBuilder.showResultsPage)
    && !Boolean(FORCE_POLL_PRE_SHARE_VIEW);
  const fixedPreviewColorHex = "oklch(70.8% 0 0)";
  const previewTextClass = isFinalized ? "" : "text-slate-400";
  const previewTextStyle = isFinalized ? ` style="color: ${fixedPreviewColorHex};"` : "";

  const pollBuilderIntroCard = document.getElementById("pollBuilderIntroCard");
  if (pollBuilderIntroCard) {
    pollBuilderIntroCard.style.display = isFinalized ? "none" : "block";
  }

  const previewTitle = pollBuilderRoot.querySelector("article > h4");
  if (previewTitle) {
    previewTitle.classList.toggle("text-slate-400", !isFinalized);
    previewTitle.classList.toggle("text-slate-700", isFinalized);
    previewTitle.style.color = isFinalized ? fixedPreviewColorHex : "";
  }

  [
    "pollDeadlineLabel",
    "pollEventsPromptPrimary",
    "pollEventsPromptSecondary",
    "pollTimesPromptPrimary",
    "pollTimesPromptSecondary",
    "pollTimesTimezoneHint"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("text-slate-400", !isFinalized);
    el.classList.toggle("text-slate-700", isFinalized);
    el.style.color = isFinalized ? fixedPreviewColorHex : "";
  });

  const introPreview = document.getElementById("pollIntroPreview");
  if (introPreview) {
    introPreview.textContent = introText;
    introPreview.classList.toggle("text-slate-400", !isFinalized);
    introPreview.classList.toggle("text-slate-700", isFinalized);
    introPreview.style.color = isFinalized ? fixedPreviewColorHex : "";
  }

  const deadlinePicker = document.getElementById("pollDeadlineDateTimePicker");
  if (deadlinePicker) {
    const committedDeadlineDateTime = String(state.pollBuilder.voteDeadlineDateTime || "").trim();
    const committedDeadlineTimeZone = String(state.pollBuilder.voteDeadlineTimeZone || "").trim();
    if (committedDeadlineDateTime && (!pollUiState.editingDeadline || isFinalized)) {
      const deadlineLabel = formatPollDateTime(committedDeadlineDateTime) || committedDeadlineDateTime;
      const timeZoneSuffix = committedDeadlineTimeZone ? ` (${committedDeadlineTimeZone})` : "";
      deadlinePicker.innerHTML = `
        <div class="flex items-center gap-2.5 ${previewTextClass}"${previewTextStyle}>
          <span class="text-sm">${deadlineLabel}${timeZoneSuffix}</span>
          ${isFinalized ? "" : `<button data-poll-deadline-edit type="button" aria-label="Edit deadline" class="h-5 w-5 rounded-full border border-slate-300 text-xs leading-none text-slate-400 hover:bg-slate-100">×</button>`}
        </div>
      `;
      const editDeadlineButton = deadlinePicker.querySelector("button[data-poll-deadline-edit]");
      if (editDeadlineButton) {
        editDeadlineButton.addEventListener("click", () => {
          pollUiState.editingDeadline = true;
          pollUiState.pendingDeadlineDate = "";
          pollUiState.pendingDeadlineHour = "";
          pollUiState.pendingDeadlineMinute = "";
          pollUiState.pendingDeadlinePeriod = "";
          pollUiState.pendingDeadlineTimeZone = "";
          renderPollBuilderStep();
        });
      }
    } else {
    const detectedTimeZone = String(state.timeZone || detectAppTimeZone() || "Pacific").trim();
    const pendingDate = String(pollUiState.pendingDeadlineDate || "");
    const pendingHour = String(pollUiState.pendingDeadlineHour || "");
    const pendingMinute = String(pollUiState.pendingDeadlineMinute || "");
    const pendingPeriod = String(pollUiState.pendingDeadlinePeriod || "");
    const pendingTimeZone = String(pollUiState.pendingDeadlineTimeZone || "");
    const selectedDeadlineTimeZone = ["Eastern", "Central", "Mountain", "Pacific"].includes(pendingTimeZone)
      ? pendingTimeZone
      : (String(state.pollBuilder.voteDeadlineTimeZone || "").trim() || String(state.pollBuilder.timeZone || "").trim() || detectedTimeZone || "Central");
    const selectedDeadlineHour = pendingHour || "4";
    const selectedDeadlineMinute = pendingMinute || "00";
    const selectedDeadlinePeriod = pendingPeriod || "PM";
    deadlinePicker.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="grid w-1/2 grid-cols-[1.275fr_0.4fr_0.4fr_auto] gap-2">
          <input id="pollDeadlineDate" type="date" min="${todayLocalIsoDate}" placeholder="mm/dd/yyyy" class="rounded-lg border border-slate-300 px-2.5 py-2 text-sm ${pendingDate ? "text-slate-900" : "text-slate-400"}" value="${pendingDate}" />
          <select id="pollDeadlineHour" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
            ${hourOptions.map((hour) => `<option value="${hour}" ${hour === selectedDeadlineHour ? "selected" : ""}>${hour}</option>`).join("")}
          </select>
          <select id="pollDeadlineMinute" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
            ${minuteOptions.map((minute) => `<option value="${minute}" ${minute === selectedDeadlineMinute ? "selected" : ""}>${minute}</option>`).join("")}
          </select>
          <select id="pollDeadlinePeriod" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
            <option value="AM" ${selectedDeadlinePeriod === "AM" ? "selected" : ""}>AM</option>
            <option value="PM" ${selectedDeadlinePeriod === "PM" ? "selected" : ""}>PM</option>
          </select>
        </div>
        <select id="pollDeadlineTimezone" class="w-[136px] rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-900">
          <option value="Eastern" ${selectedDeadlineTimeZone === "Eastern" ? "selected" : ""}>Eastern</option>
          <option value="Central" ${selectedDeadlineTimeZone === "Central" ? "selected" : ""}>Central</option>
          <option value="Mountain" ${selectedDeadlineTimeZone === "Mountain" ? "selected" : ""}>Mountain</option>
          <option value="Pacific" ${selectedDeadlineTimeZone === "Pacific" ? "selected" : ""}>Pacific</option>
        </select>
        <button id="pollDeadlineSubmit" type="button" class="rounded-lg border border-slate-300 bg-slate-300 px-3 py-2 text-xs font-medium text-slate-600 cursor-not-allowed hover:bg-slate-300">Submit</button>
      </div>
    `;

    const toggleDeadlineSubmitState = () => {
      const dateField = document.getElementById("pollDeadlineDate");
      const hourField = document.getElementById("pollDeadlineHour");
      const minuteField = document.getElementById("pollDeadlineMinute");
      const periodField = document.getElementById("pollDeadlinePeriod");
      const timezoneField = document.getElementById("pollDeadlineTimezone");
      const submitButton = document.getElementById("pollDeadlineSubmit");
      if (!dateField || !hourField || !minuteField || !periodField || !timezoneField || !submitButton) return;

      pollUiState.pendingDeadlineDate = dateField.value;
      pollUiState.pendingDeadlineHour = hourField.value;
      pollUiState.pendingDeadlineMinute = minuteField.value;
      pollUiState.pendingDeadlinePeriod = periodField.value;
      pollUiState.pendingDeadlineTimeZone = timezoneField.value;

      dateField.classList.toggle("text-slate-900", Boolean(dateField.value));
      dateField.classList.toggle("text-slate-400", !dateField.value);

      const allFilled = Boolean(
        dateField.value
        && hourField.value
        && minuteField.value
        && periodField.value
        && timezoneField.value
      );

      submitButton.disabled = !allFilled;
      submitButton.classList.toggle("opacity-50", !allFilled);
      submitButton.classList.toggle("cursor-not-allowed", !allFilled);
      submitButton.classList.toggle("bg-slate-300", !allFilled);
      submitButton.classList.toggle("text-slate-600", !allFilled);
      submitButton.classList.toggle("hover:bg-slate-300", !allFilled);
      submitButton.classList.toggle("bg-slate-800", allFilled);
      submitButton.classList.toggle("text-white", allFilled);
      submitButton.classList.toggle("hover:bg-slate-700", allFilled);
      submitButton.classList.toggle("border-slate-800", allFilled);
      submitButton.classList.toggle("border-slate-300", !allFilled);
    };

    ["pollDeadlineDate", "pollDeadlineHour", "pollDeadlineMinute", "pollDeadlinePeriod", "pollDeadlineTimezone"].forEach((id) => {
      const control = document.getElementById(id);
      if (!control) return;
      control.addEventListener("input", toggleDeadlineSubmitState);
      control.addEventListener("change", toggleDeadlineSubmitState);
    });

    const deadlineSubmit = document.getElementById("pollDeadlineSubmit");
    if (deadlineSubmit) {
      deadlineSubmit.addEventListener("click", () => {
        const dateField = document.getElementById("pollDeadlineDate");
        const hourField = document.getElementById("pollDeadlineHour");
        const minuteField = document.getElementById("pollDeadlineMinute");
        const periodField = document.getElementById("pollDeadlinePeriod");
        const timezoneField = document.getElementById("pollDeadlineTimezone");
        if (!dateField || !hourField || !minuteField || !periodField || !timezoneField) return;

        if (dateField.value && dateField.value < todayLocalIsoDate) {
          const validationEl = document.getElementById("pollDateTimesValidation");
          if (validationEl) {
            validationEl.textContent = "Please choose today or a future date.";
            validationEl.classList.remove("hidden");
          }
          return;
        }

        state.pollBuilder.voteDeadlineDateTime = buildPollDateTimeValue(
          dateField.value,
          hourField.value,
          minuteField.value,
          periodField.value
        );
        state.pollBuilder.voteDeadlineTimeZone = String(timezoneField.value || "").trim();
        pollUiState.editingDeadline = false;
        pollUiState.pendingDeadlineDate = "";
        pollUiState.pendingDeadlineHour = "";
        pollUiState.pendingDeadlineMinute = "";
        pollUiState.pendingDeadlinePeriod = "";
        pollUiState.pendingDeadlineTimeZone = "";
        persistState();
        renderPollBuilderStep();
      });
    }

    toggleDeadlineSubmitState();
    }
  }

  const eventPreviewList = document.getElementById("pollEventOptionsPreview");
  const pollOptionLabels = selectedEvents.length
    ? selectedEvents.slice(0, 3).map((eventItem, index) => (eventItem.defaultLabel || "").trim() || `Event ${index + 1}`)
    : ["Event 1", "Event 2", "Event 3"];
  if (eventPreviewList) {
    eventPreviewList.innerHTML = pollOptionLabels.map((label) => `
      <label class="flex items-center gap-2.5 ${previewTextClass}"${previewTextStyle}>
        <input type="checkbox" disabled class="h-4 w-4" />
        <span>${label}</span>
      </label>
    `).join("");
  }

  const timesPreviewList = document.getElementById("pollTimesPreview");
  const timesTimezoneHint = document.getElementById("pollTimesTimezoneHint");
  const detectedTimeZone = String(state.timeZone || detectAppTimeZone() || "Pacific").trim();
  const appliedTimeZone = String(state.pollBuilder?.timeZone || "").trim() || detectedTimeZone;
  if (timesTimezoneHint) {
    timesTimezoneHint.textContent = `All times ${appliedTimeZone}`;
  }
  const proposedDateTimes = Array.isArray(state.pollBuilder.proposedDateTimes)
    ? state.pollBuilder.proposedDateTimes.filter((value) => String(value || "").trim().length > 0).slice(0, 3)
    : [];
  const proposedTimeLabels = proposedDateTimes.map((value) => formatPollDateTime(value) || "").filter(Boolean);
  if (timesPreviewList) {
    const previewRows = proposedTimeLabels;
    timesPreviewList.innerHTML = previewRows.map((label, index) => `
      <li>
        <div class="flex items-center gap-2.5 ${previewTextClass}"${previewTextStyle}>
          ${isFinalized ? "" : `<button data-poll-time-remove="${index}" type="button" aria-label="Remove time option" class="h-5 w-5 rounded-full border border-slate-300 text-xs leading-none text-slate-400 hover:bg-slate-100">×</button>`}
          <label class="flex items-center gap-2.5">
            <input type="checkbox" disabled class="h-4 w-4" />
            <span>${label}</span>
          </label>
        </div>
      </li>
    `).join("");

    if (!isFinalized) {
      timesPreviewList.querySelectorAll("button[data-poll-time-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const removeIndex = Number.parseInt(button.getAttribute("data-poll-time-remove"), 10);
          if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= proposedDateTimes.length) return;
          const removedValue = proposedDateTimes[removeIndex] || "";
          state.pollBuilder.proposedDateTimes = proposedDateTimes.filter((_, index) => index !== removeIndex);
          const existingPending = Array.isArray(pollUiState.pendingDateTimes) ? pollUiState.pendingDateTimes.filter(Boolean) : [];
          pollUiState.pendingDateTimes = [removedValue, ...existingPending].slice(0, 3);
          persistState();
          renderPollBuilderStep();
        });
      });
    }
  }

  const dateTimeEntryCard = document.getElementById("pollDateTimeEntryCard");
  if (dateTimeEntryCard) {
    dateTimeEntryCard.classList.toggle("hidden", isFinalized);
  }

  const sharePanelCard = document.getElementById("pollSharePanelCard");
  if (sharePanelCard) {
    sharePanelCard.classList.toggle("hidden", !isFinalized);
  }

  const pollReadyBanner = document.getElementById("pollReadyBanner");
  if (pollReadyBanner) {
    pollReadyBanner.classList.toggle("hidden", !isFinalized || showPollResultsPage);
  }

  const pollCardsRow = document.getElementById("pollCardsRow");
  if (pollCardsRow) {
    pollCardsRow.classList.toggle("hidden", showPollResultsPage);
  }

  const pollReadyBannerLink = document.getElementById("pollReadyBannerLink");
  if (pollReadyBannerLink) {
    const bannerLink = isFinalized ? fullShareLink : "#";
    pollReadyBannerLink.textContent = bannerLink;
    pollReadyBannerLink.setAttribute("href", bannerLink);
    pollReadyBannerLink.onclick = (event) => {
      if (!isFinalized) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.open(bannerLink, "_blank", "noopener,noreferrer");
    };
  }

  const pollPreviewSubmitWrap = document.getElementById("pollPreviewSubmitWrap");
  if (pollPreviewSubmitWrap) {
    pollPreviewSubmitWrap.classList.toggle("hidden", !isFinalized);
  }

  const pollPreviewCard = document.getElementById("pollPreviewCard");
  if (pollPreviewCard) {
    if (isFinalized) {
      pollPreviewCard.classList.add("w-[375px]", "shrink-0");
      pollPreviewCard.style.width = "";
      pollPreviewCard.style.maxWidth = "";
      pollPreviewCard.style.flex = "";
    } else {
      pollPreviewCard.classList.remove("w-[375px]", "shrink-0");
      pollPreviewCard.style.width = "100%";
      pollPreviewCard.style.maxWidth = "none";
      pollPreviewCard.style.flex = "1 1 auto";
    }
  }

  const pollShareContinueRow = document.getElementById("pollShareContinueRow");
  if (pollShareContinueRow) {
    pollShareContinueRow.classList.toggle("hidden", !isFinalized || showPollResultsPage);
  }

  const pollResultsPage = document.getElementById("pollResultsPage");
  if (pollResultsPage) {
    pollResultsPage.classList.toggle("hidden", !showPollResultsPage);
    if (showPollResultsPage) {
      const shouldAutoSyncResults = (() => {
        if (pollUiState.resultsSyncBusy) return false;
        const lastAt = Number(pollUiState.resultsSyncLastAt || 0);
        if (!lastAt) return true;
        return (Date.now() - lastAt) > 30000;
      })();
      if (shouldAutoSyncResults) {
        pollUiState.resultsSyncBusy = true;
        syncPollResultsFromBackend()
          .then(() => {
            pollUiState.resultsSyncError = "";
          })
          .catch((error) => {
            pollUiState.resultsSyncError = String(error?.message || "Couldn’t refresh live poll votes.").trim();
          })
          .finally(() => {
            pollUiState.resultsSyncBusy = false;
            renderPollBuilderStep();
          });
      }
      const backendOptionLabels = Array.isArray(state.pollBuilder?.backendOptionLabels)
        ? state.pollBuilder.backendOptionLabels.filter((label) => String(label || "").trim().length > 0)
        : [];
      const backendTimeLabels = Array.isArray(state.pollBuilder?.backendTimeLabels)
        ? state.pollBuilder.backendTimeLabels.filter((label) => String(label || "").trim().length > 0)
        : [];
      const effectiveView = getEffectivePollViewModel({
        eventLabels: backendOptionLabels.length ? backendOptionLabels : pollOptionLabels,
        timeLabels: backendTimeLabels.length ? backendTimeLabels : proposedTimeLabels,
        rawTimeValues: proposedDateTimes,
        baseDeadlineValue: state.pollBuilder.voteDeadlineDateTime,
        baseDeadlineText: fullDeadlineText,
        timeZoneLabel: deadlineTimeZone,
        shareLink: fullShareLink
      });
      const resultsModel = effectiveView.model;
      const reminderMessage = effectiveView.reminderMessage;
      const effectiveDeadlineDate = effectiveView.effectiveDeadlineValue ? new Date(effectiveView.effectiveDeadlineValue) : null;
      const hasEffectiveDeadline = Boolean(effectiveDeadlineDate && !Number.isNaN(effectiveDeadlineDate.getTime()));
      const pollClosedAtText = hasEffectiveDeadline
        ? `Poll closed on ${formatPollDateTime(effectiveView.effectiveDeadlineValue) || "Poll closed"}`
        : "Poll closed";
      const rsvpDeadlineIso = hasEffectiveDeadline
        ? new Date(effectiveDeadlineDate.getTime() + (48 * 60 * 60 * 1000)).toISOString()
        : "";
      const rsvpDeadlineText = hasEffectiveDeadline
        ? (formatPollDateTime(rsvpDeadlineIso) || "Date/Time")
        : "Date/Time";
      const parseIsoToRsvpFields = (isoValue) => {
        const parsed = isoValue ? new Date(isoValue) : null;
        if (!parsed || Number.isNaN(parsed.getTime())) {
          return { date: "", hour: "12", minute: "00", period: "PM" };
        }
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");
        const hour24 = parsed.getHours();
        const minute = String(parsed.getMinutes()).padStart(2, "0");
        const period = hour24 >= 12 ? "PM" : "AM";
        const hour12 = hour24 % 12 || 12;
        return { date: `${year}-${month}-${day}`, hour: String(hour12), minute, period };
      };
      const fallbackRsvpFields = parseIsoToRsvpFields(rsvpDeadlineIso);
      const savedRsvpDeadlineIso = String(state.pollBuilder?.rsvpDeadlineDateTime || "").trim();
      const savedRsvpFields = parseIsoToRsvpFields(savedRsvpDeadlineIso);
      const defaultBusinessDate = getLocalIsoDatePlusBusinessDays(2);
      const defaultRsvpFields = {
        date: defaultBusinessDate,
        hour: "12",
        minute: "00",
        period: "PM"
      };
      if (!pollUiState.rsvpDeadlineDate) {
        pollUiState.rsvpDeadlineDate = savedRsvpFields.date || defaultRsvpFields.date;
      }
      if (!pollUiState.rsvpDeadlineHour) {
        pollUiState.rsvpDeadlineHour = savedRsvpFields.hour || defaultRsvpFields.hour;
      }
      if (!pollUiState.rsvpDeadlineMinute) {
        pollUiState.rsvpDeadlineMinute = savedRsvpFields.minute || defaultRsvpFields.minute;
      }
      if (!pollUiState.rsvpDeadlinePeriod) {
        pollUiState.rsvpDeadlinePeriod = savedRsvpFields.period || defaultRsvpFields.period;
      }
      const resolvedRsvpTimeZone = String(
        pollUiState.rsvpDeadlineTimeZone
        || deadlineTimeZone
        || state.pollBuilder.voteDeadlineTimeZone
        || state.pollBuilder.timeZone
        || state.timeZone
        || detectAppTimeZone()
        || "Central"
      );
      if (!pollUiState.rsvpDeadlineTimeZone) {
        pollUiState.rsvpDeadlineTimeZone = resolvedRsvpTimeZone;
      }
      const hasRsvpDeadlineDraft = Boolean(
        String(pollUiState.rsvpDeadlineDate || "").trim()
        && String(pollUiState.rsvpDeadlineHour || "").trim()
        && String(pollUiState.rsvpDeadlineMinute || "").trim()
        && String(pollUiState.rsvpDeadlinePeriod || "").trim()
      );
      const activeRsvpDeadlineIso = hasRsvpDeadlineDraft
        ? buildPollDateTimeValue(
          pollUiState.rsvpDeadlineDate,
          pollUiState.rsvpDeadlineHour,
          pollUiState.rsvpDeadlineMinute,
          pollUiState.rsvpDeadlinePeriod
        )
        : rsvpDeadlineIso;
      const hasRsvpDeadline = Boolean(savedRsvpDeadlineIso);
      if (typeof pollUiState.rsvpDeadlineEditing !== "boolean") {
        pollUiState.rsvpDeadlineEditing = !hasRsvpDeadline;
      }
      const isRsvpDeadlineSubmitted = Boolean(hasRsvpDeadline && pollUiState.rsvpDeadlineEditing === false);
      const rsvpDeadlineDisplayText = hasRsvpDeadline
        ? `${formatPollDateTime(savedRsvpDeadlineIso) || "Date/Time"}${resolvedRsvpTimeZone ? ` (${resolvedRsvpTimeZone})` : ""}`
        : "Date/Time";
      const topEventLabel = String(resultsModel?.topEvent?.label || "Selected event").trim() || "Selected event";
      const topTimeLabel = String(resultsModel?.topTime?.label || "Time TBD").trim() || "Time TBD";
      const topTimeParts = topTimeLabel.split(" at ");
      const bookingDateLabel = String(topTimeParts[0] || topTimeLabel || "TBD").trim() || "TBD";
      const bookingTimeLabel = String(topTimeParts[1] || topTimeLabel || "TBD").trim() || "TBD";
      const rsvpShareUrl = String(state.pollBuilder?.rsvpShareUrl || "").trim();
      const rsvpResults = state.pollBuilder?.rsvpResults && typeof state.pollBuilder.rsvpResults === "object"
        ? state.pollBuilder.rsvpResults
        : { yesCount: 0, noCount: 0, totalResponses: 0, responses: [] };
      const rsvpResponses = Array.isArray(rsvpResults.responses) ? rsvpResults.responses : [];
      const rsvpAttendingNames = rsvpResponses
        .filter((row) => String(row?.answer || "").trim().toLowerCase() === "yes")
        .map((row) => String(row?.name || "").trim())
        .filter(Boolean);
      const rsvpId = String(state.pollBuilder?.rsvpId || "").trim();
      const isRsvpTrackingView = Boolean(showPollResultsPage && pollUiState.rsvpSetupOpen && rsvpId);
      if (isRsvpTrackingView) {
        startRsvpResultsPolling(rsvpId);
      } else {
        stopRsvpResultsPolling();
      }
      const rsvpMessageSubject = `Confirm your spot — ${resultsModel.topEvent?.label || "Selected event"}`;
      const rsvpMessageBodyPlain = hasRsvpDeadline
        ? `We’re booking ${resultsModel.topEvent?.label || "this event"} on ${resultsModel.topTime?.label || "the selected time"}.\nPlease confirm if you’ll attend so we can finalize the headcount.\nRSVP by ${rsvpDeadlineDisplayText}.\nRSVP here: ${rsvpShareUrl || "[RSVP link]"}\n\nRSVP`
        : `We’re booking ${resultsModel.topEvent?.label || "this event"} on ${resultsModel.topTime?.label || "the selected time"}.\nPlease confirm if you’ll attend so we can finalize the headcount.\nRSVP here: ${rsvpShareUrl || "[RSVP link]"}\n\nRSVP`;
      const totalBudgetValue = Number(getBudgetTotal() || 0);
      const budgetSpentValue = Array.isArray(state.budgetTransactions)
        ? state.budgetTransactions.reduce((sum, tx) => sum + Math.max(0, Number(tx?.amount || 0)), 0)
        : 0;
      const monthlyBudgetRemaining = Math.max(0, totalBudgetValue - budgetSpentValue);
      const topEventDetailsUrl = selectedEvents.find((eventItem) => {
        const label = (eventItem.defaultLabel || "").trim();
        return label && label === String(resultsModel.topEvent?.label || "").trim();
      })?.url || "";
      pollResultsPage.innerHTML = getPollResponsesPageHtml(resultsModel, {
        reminderPanelOpen: pollUiState.reminderPanelOpen,
        isPollClosed: effectiveView.countdownStatus.isClosed,
        isDebugMode: effectiveView.isDebugMode,
        debugPreviewPanelOpen: pollUiState.debugPreviewPanelOpen,
        debugResponsesPreset: pollUiState.pollPreviewResponsesPreset,
        debugDeadlinePreset: pollUiState.pollPreviewDeadlinePreset,
        pollClosedAtText,
        rsvpDeadlineText,
        rsvpSetupOpen: pollUiState.rsvpSetupOpen,
        rsvpCollectionStarted: pollUiState.rsvpCollectionStarted,
        pollCreated: Boolean(String(state.pollBuilder.shareLink || "").trim()),
        pollLive: Boolean(state.pollBuilder.showResultsPage),
        pollClosed: Boolean(effectiveView.countdownStatus.isClosed),
        pollRsvpSent: Boolean(state.pollBuilder.rsvpSent),
        rsvpDeadlineDate: pollUiState.rsvpDeadlineDate,
        rsvpDeadlineHour: pollUiState.rsvpDeadlineHour || fallbackRsvpFields.hour,
        rsvpDeadlineMinute: pollUiState.rsvpDeadlineMinute || fallbackRsvpFields.minute,
        rsvpDeadlinePeriod: pollUiState.rsvpDeadlinePeriod || fallbackRsvpFields.period,
        rsvpDeadlineTimeZone: resolvedRsvpTimeZone,
        rsvpDeadlineEditing: pollUiState.rsvpDeadlineEditing,
        rsvpDeadlineDisplayText,
        defaultTimeZone: resolvedRsvpTimeZone,
        rsvpShareDisabled: !isRsvpDeadlineSubmitted,
        rsvpContinueDisabled: !isRsvpDeadlineSubmitted,
        rsvpCreateBusy: pollUiState.rsvpCreateBusy,
        rsvpCreateError: pollUiState.rsvpCreateError,
        rsvpCopyBusy: pollUiState.rsvpCopyBusy,
        rsvpShareStatus: pollUiState.rsvpShareStatus,
        rsvpResultsError: pollUiState.rsvpResultsError,
        rsvpId,
        rsvpSharedConfirmed: Boolean(state.pollBuilder?.rsvpSharedConfirmed),
        rsvpAttendeesExpanded: Boolean(state.pollBuilder?.rsvpAttendeesExpanded),
        rsvpYesCount: Number(rsvpResults?.yesCount || 0),
        rsvpNoCount: Number(rsvpResults?.noCount || 0),
        rsvpTotalResponses: Number(rsvpResults?.totalResponses || 0),
        rsvpEmployeeCount: Number(state.programSettings?.employeeCount || 0),
        rsvpAttendingNames,
        rsvpMessageSubject,
        rsvpMessageBodyPlain,
        monthlyBudgetRemaining,
        estimatedAttendees: Math.max(1, Number(resultsModel.topEvent?.count || resultsModel.totalVotes || 14)),
        estimatedCostPerPerson: 35,
        locationType: "In-person",
        eventDetailsUrl: topEventDetailsUrl,
        reminderChannel: pollUiState.reminderChannel,
        reminderHelperVisible: pollUiState.reminderHelperVisible,
        reminderCopyBusy: pollUiState.reminderCopyBusy,
        reminderSubjectCopyBusy: pollUiState.reminderSubjectCopyBusy,
        reminderSubject: reminderMessage.subject,
        reminderBodyPlain: reminderMessage.bodyPlain,
        countdownText: effectiveView.countdownStatus.text,
        countdownDotClass: effectiveView.countdownStatus.dotClass
      });

      if (effectiveView.isDebugMode) {
        const previewToggleButton = document.getElementById("pollDebugPreviewToggle");
        if (previewToggleButton) {
          previewToggleButton.onclick = () => {
            pollUiState.debugPreviewPanelOpen = !pollUiState.debugPreviewPanelOpen;
            renderPollBuilderStep();
          };
        }

        const applyResponsesPreset = (preset) => {
          pollUiState.pollPreviewResponsesPreset = preset;
          pollUiState.pollPreviewOverrides.responses = getDebugResponsesPreset(preset, pollOptionLabels, proposedTimeLabels);
          renderPollBuilderStep();
        };

        const responsesPresetMap = {
          pollDebugResponsesNone: "none",
          pollDebugResponsesSome: "some",
          pollDebugResponsesMany: "many"
        };
        Object.entries(responsesPresetMap).forEach(([id, preset]) => {
          const button = document.getElementById(id);
          if (!button) return;
          button.onclick = () => applyResponsesPreset(preset);
        });

        const applyDeadlinePreset = (preset) => {
          pollUiState.pollPreviewDeadlinePreset = preset;
          pollUiState.pollPreviewOverrides.deadline = getDebugDeadlinePresetValue(preset);
          pollUiState.pollPreviewOverrides.pollStatus = preset === "closed" ? "closed" : "open";
          renderPollBuilderStep();
        };

        const deadlinePresetMap = {
          pollDebugDeadline7d: "7d",
          pollDebugDeadline18h: "18h",
          pollDebugDeadline45m: "45m",
          pollDebugDeadlineClosed: "closed"
        };
        Object.entries(deadlinePresetMap).forEach(([id, preset]) => {
          const button = document.getElementById(id);
          if (!button) return;
          button.onclick = () => applyDeadlinePreset(preset);
        });
      }

      const reminderToggleButton = document.getElementById("pollReminderToggle");
      if (reminderToggleButton) {
        reminderToggleButton.onclick = () => {
          pollUiState.reminderPanelOpen = !pollUiState.reminderPanelOpen;
          renderPollBuilderStep();
        };
      }

      const reminderCloseButton = document.getElementById("pollReminderClose");
      if (reminderCloseButton) {
        reminderCloseButton.onclick = () => {
          pollUiState.reminderPanelOpen = false;
          pollUiState.reminderHelperVisible = false;
          renderPollBuilderStep();
        };
      }

      const reminderChannelSlackButton = document.getElementById("pollReminderChannelSlack");
      if (reminderChannelSlackButton) {
        reminderChannelSlackButton.onclick = () => {
          pollUiState.reminderChannel = "slack";
          pollUiState.reminderHelperVisible = false;
          pollUiState.reminderSubjectCopyBusy = false;
          renderPollBuilderStep();
        };
      }

      const reminderChannelEmailButton = document.getElementById("pollReminderChannelEmail");
      if (reminderChannelEmailButton) {
        reminderChannelEmailButton.onclick = () => {
          pollUiState.reminderChannel = "email";
          pollUiState.reminderHelperVisible = false;
          renderPollBuilderStep();
        };
      }

      const reminderCopyButton = document.getElementById("pollReminderCopyMessage");
      if (reminderCopyButton) {
        reminderCopyButton.onclick = async () => {
          if (pollUiState.reminderCopyBusy) return;
          try {
            await navigator.clipboard.writeText(reminderMessage.bodyPlain);
            pollUiState.reminderCopyBusy = true;
            renderPollBuilderStep();
            if (pollReminderStatusTimeout) clearTimeout(pollReminderStatusTimeout);
            pollReminderStatusTimeout = setTimeout(() => {
              pollUiState.reminderCopyBusy = false;
              renderPollBuilderStep();
              pollReminderStatusTimeout = null;
            }, 1500);
          } catch (_error) {
            pollUiState.reminderCopyBusy = false;
          }
        };
      }

      const reminderCopySubjectButton = document.getElementById("pollReminderCopySubject");
      if (reminderCopySubjectButton) {
        reminderCopySubjectButton.onclick = async () => {
          if (pollUiState.reminderSubjectCopyBusy) return;
          try {
            await navigator.clipboard.writeText(reminderMessage.subject);
            pollUiState.reminderSubjectCopyBusy = true;
            renderPollBuilderStep();
            if (pollReminderSubjectStatusTimeout) clearTimeout(pollReminderSubjectStatusTimeout);
            pollReminderSubjectStatusTimeout = setTimeout(() => {
              pollUiState.reminderSubjectCopyBusy = false;
              renderPollBuilderStep();
              pollReminderSubjectStatusTimeout = null;
            }, 1500);
          } catch (_error) {
            pollUiState.reminderSubjectCopyBusy = false;
          }
        };
      }

      const reminderHelperToggleButton = document.getElementById("pollReminderHelperToggle");
      if (reminderHelperToggleButton) {
        reminderHelperToggleButton.onclick = () => {
          pollUiState.reminderHelperVisible = !pollUiState.reminderHelperVisible;
          renderPollBuilderStep();
        };
      }

      const reminderSlackButton = document.getElementById("pollReminderOpenSlack");
      if (reminderSlackButton) {
        reminderSlackButton.onclick = () => {
          window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
        };
      }

      const reminderGmailButton = document.getElementById("pollReminderOpenGmail");
      if (reminderGmailButton) {
        reminderGmailButton.onclick = () => {
          const subjectEncoded = encodeURIComponent(reminderMessage.subject);
          const bodyEncoded = encodeURIComponent(reminderMessage.bodyPlain);
          window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subjectEncoded}&body=${bodyEncoded}`, "_blank", "noopener,noreferrer");
        };
      }

      const openRsvpSetupButton = document.getElementById("pollClosedGetRsvpLink");
      if (openRsvpSetupButton) {
        openRsvpSetupButton.onclick = async () => {
          if (pollUiState.rsvpCreateBusy) return;
          pollUiState.rsvpCreateBusy = true;
          pollUiState.rsvpCreateError = "";
          renderPollBuilderStep();

          if (!pollUiState.rsvpDeadlineDate) {
            pollUiState.rsvpDeadlineDate = defaultRsvpFields.date;
            pollUiState.rsvpDeadlineHour = defaultRsvpFields.hour;
            pollUiState.rsvpDeadlineMinute = defaultRsvpFields.minute;
            pollUiState.rsvpDeadlinePeriod = defaultRsvpFields.period;
          }

          const locationType = String(state.pollBuilder?.eventLocationType || "").trim().toLowerCase();
          const locationLabel = locationType === "virtual"
            ? "Virtual"
            : (locationType === "in_person" || locationType === "in-person" ? "In-person" : null);

          try {
            const created = await createRsvpInBackend({
              companyId: String(state.accountId || "anon").trim() || "anon",
              publicBaseUrl: "https://eeoswork.github.io/eeos",
              eventName: topEventLabel,
              eventDate: bookingDateLabel,
              eventTime: bookingTimeLabel,
              deadlineIso: activeRsvpDeadlineIso,
              locationLabel,
              vendorUrl: state.pollBuilder?.vendorBookingUrl,
              costPerPerson: state.pollBuilder?.costPerPerson
            });
            state.pollBuilder.rsvpId = created.rsvpId;
            state.pollBuilder.rsvpShareUrl = created.shareUrl;
            state.pollBuilder.rsvpSharedConfirmed = false;
            state.pollBuilder.rsvpAttendeesExpanded = false;
            await refreshRsvpResultsFromBackend(created.rsvpId, { render: false });
            persistState();
          } catch (error) {
            pollUiState.rsvpCreateError = String(error?.message || "Couldn’t create RSVP.").trim();
            pollUiState.rsvpCreateBusy = false;
            renderPollBuilderStep();
            showMiniToast(pollUiState.rsvpCreateError || "Couldn’t create RSVP.");
            return;
          }

          pollUiState.rsvpCreateBusy = false;
          pollUiState.rsvpDeadlineEditing = true;
          pollUiState.rsvpSetupOpen = true;
          pollUiState.rsvpCollectionStarted = false;
          state.pollBuilder.rsvpSent = false;
          state.pollBuilder.vendorLinkOpened = false;
          state.pollBuilder.markedBooked = false;
          pollUiState.rsvpScrollPending = true;
          pollUiState.rsvpShareStatus = "";
          pollUiState.rsvpResultsError = "";
          persistState();
          renderPollBuilderStep();
        };
      }

      const continueRsvpFlowButton = document.getElementById("pollRsvpContinueCollecting");
      if (continueRsvpFlowButton) {
        const continueToRsvpReview = () => {
          if (!isRsvpDeadlineSubmitted) {
            showMiniToast("Submit the RSVP deadline first.");
            return;
          }
          if (!state.pollBuilder?.rsvpSharedConfirmed) {
            showMiniToast("Confirm you shared the RSVP first.");
            return;
          }
          const statusBlock = document.getElementById("pollRsvpStatusBlock");
          if (statusBlock) {
            statusBlock.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            try { statusBlock.focus({ preventScroll: true }); } catch (_error) { statusBlock.focus(); }
            return;
          }
          const canAdvanceToBookEvent = Boolean(effectiveView?.countdownStatus?.isClosed)
            || Boolean(state.debugModeOn)
            || isPollResponsesDebugMode();
          if (!canAdvanceToBookEvent) {
            state.pollBuilder.showResultsPage = true;
            pollUiState.rsvpSetupOpen = false;
            pollUiState.rsvpCollectionStarted = false;
            persistState();
            renderPollBuilderStep();
            showMiniToast("Poll is still open. Continue after the deadline.");
            return;
          }
          pollUiState.rsvpSetupOpen = false;
          pollUiState.rsvpCollectionStarted = true;
          state.pollBuilder.rsvpSent = true;
          state.pollBuilder.vendorLinkOpened = false;
          state.pollBuilder.markedBooked = false;
          if (!state.completedSetupSteps.includes(8)) {
            state.completedSetupSteps.push(8);
          }
          state.eventWorkflowProcessStep = 9;
          collapseSetupViewsForWorkflowStep();
          state.currentSetupStep = 9;
          persistState();
          renderSetupMenuState();
          renderSetupStepStates();
          renderSidebarStepMenus();
          scrollSetupStepIntoView(9, "smooth");
        };

        continueRsvpFlowButton.onclick = () => {
          if (!isRsvpDeadlineSubmitted) {
            showMiniToast("Submit the RSVP deadline first.");
            return;
          }
          if (!state.pollBuilder?.rsvpSharedConfirmed) {
            showMiniToast("Confirm you shared the RSVP first.");
            return;
          }
          if (!getAuthToken()) {
            setPendingPostAuthAction("reviewRsvpResponses", () => {
              continueToRsvpReview();
            });
            openAuthGateWithContext("rsvp_review");
            return;
          }
          continueToRsvpReview();
        };
      }

      const rsvpDeadlineDateInput = document.getElementById("pollRsvpDeadlineDate");
      if (rsvpDeadlineDateInput) {
        rsvpDeadlineDateInput.addEventListener("change", () => {
          pollUiState.rsvpDeadlineDate = String(rsvpDeadlineDateInput.value || "").trim();
          pollUiState.rsvpDeadlineEditing = true;
          renderPollBuilderStep();
        });
      }

      const rsvpDeadlineHourInput = document.getElementById("pollRsvpDeadlineHour");
      if (rsvpDeadlineHourInput) {
        rsvpDeadlineHourInput.addEventListener("change", () => {
          pollUiState.rsvpDeadlineHour = String(rsvpDeadlineHourInput.value || "").trim();
          pollUiState.rsvpDeadlineEditing = true;
          renderPollBuilderStep();
        });
      }

      const rsvpDeadlineMinuteInput = document.getElementById("pollRsvpDeadlineMinute");
      if (rsvpDeadlineMinuteInput) {
        rsvpDeadlineMinuteInput.addEventListener("change", () => {
          pollUiState.rsvpDeadlineMinute = String(rsvpDeadlineMinuteInput.value || "").trim();
          pollUiState.rsvpDeadlineEditing = true;
          renderPollBuilderStep();
        });
      }

      const rsvpDeadlinePeriodInput = document.getElementById("pollRsvpDeadlinePeriod");
      if (rsvpDeadlinePeriodInput) {
        rsvpDeadlinePeriodInput.addEventListener("change", () => {
          pollUiState.rsvpDeadlinePeriod = String(rsvpDeadlinePeriodInput.value || "").trim();
          pollUiState.rsvpDeadlineEditing = true;
          renderPollBuilderStep();
        });
      }

      const rsvpDeadlineSubmitButton = document.getElementById("pollRsvpDeadlineSubmit");
      if (rsvpDeadlineSubmitButton) {
        rsvpDeadlineSubmitButton.onclick = () => {
          if (!hasRsvpDeadlineDraft || !activeRsvpDeadlineIso) {
            showMiniToast("Set a valid RSVP date and time first.");
            return;
          }
          state.pollBuilder.rsvpDeadlineDateTime = activeRsvpDeadlineIso;
          pollUiState.rsvpDeadlineEditing = false;
          persistState();
          renderPollBuilderStep();
        };
      }

      const rsvpDeadlineEditButton = document.getElementById("pollRsvpDeadlineEdit");
      if (rsvpDeadlineEditButton) {
        rsvpDeadlineEditButton.onclick = () => {
          pollUiState.rsvpDeadlineEditing = true;
          renderPollBuilderStep();
        };
      }

      const rsvpSharedConfirmedInput = document.getElementById("pollRsvpSharedConfirmed");
      if (rsvpSharedConfirmedInput) {
        rsvpSharedConfirmedInput.onchange = () => {
          state.pollBuilder.rsvpSharedConfirmed = Boolean(rsvpSharedConfirmedInput.checked);
          persistState();
          renderPollBuilderStep();
        };
      }

      const rsvpToggleAttendeesButton = document.getElementById("pollRsvpToggleAttendees");
      if (rsvpToggleAttendeesButton) {
        rsvpToggleAttendeesButton.onclick = () => {
          state.pollBuilder.rsvpAttendeesExpanded = !Boolean(state.pollBuilder?.rsvpAttendeesExpanded);
          persistState();
          renderPollBuilderStep();
        };
      }

      const rsvpCopyButton = document.getElementById("pollRsvpCopyMessage");
      if (rsvpCopyButton) {
        rsvpCopyButton.onclick = async () => {
          if (pollUiState.rsvpCopyBusy || !isRsvpDeadlineSubmitted) return;
          try {
            await navigator.clipboard.writeText(`${rsvpMessageSubject}\n\n${rsvpMessageBodyPlain}`);
            pollUiState.rsvpCopyBusy = true;
            pollUiState.rsvpShareStatus = "Copied to clipboard.";
            renderPollBuilderStep();
            if (pollRsvpCopyTimeout) clearTimeout(pollRsvpCopyTimeout);
            pollRsvpCopyTimeout = setTimeout(() => {
              pollUiState.rsvpCopyBusy = false;
              renderPollBuilderStep();
              pollRsvpCopyTimeout = null;
            }, 2000);
            if (pollRsvpStatusTimeout) clearTimeout(pollRsvpStatusTimeout);
            pollRsvpStatusTimeout = setTimeout(() => {
              pollUiState.rsvpShareStatus = "";
              renderPollBuilderStep();
              pollRsvpStatusTimeout = null;
            }, 2400);
          } catch (_error) {
            pollUiState.rsvpCopyBusy = false;
          }
        };
      }

      const rsvpSlackButton = document.getElementById("pollRsvpOpenSlack");
      if (rsvpSlackButton) {
        rsvpSlackButton.onclick = () => {
          if (!isRsvpDeadlineSubmitted) return;
          window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
        };
      }

      const rsvpGmailButton = document.getElementById("pollRsvpOpenGmail");
      if (rsvpGmailButton) {
        rsvpGmailButton.onclick = () => {
          if (!isRsvpDeadlineSubmitted) return;
          const subjectEncoded = encodeURIComponent(rsvpMessageSubject);
          const bodyEncoded = encodeURIComponent(rsvpMessageBodyPlain);
          window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subjectEncoded}&body=${bodyEncoded}`, "_blank", "noopener,noreferrer");
        };
      }

      if (pollUiState.rsvpSetupOpen && pollUiState.rsvpScrollPending) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const panel = document.getElementById("pollRsvpSetupPanel");
            if (!panel) return;
            const scrollHost = document.querySelector(".eeos-main");
            if (scrollHost) {
              const hostRect = scrollHost.getBoundingClientRect();
              const panelRect = panel.getBoundingClientRect();
              const targetTop = scrollHost.scrollTop + (panelRect.top - hostRect.top) - 120;
              scrollHost.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
            } else {
              panel.style.scrollMarginTop = "120px";
              panel.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            }
            pollUiState.rsvpScrollPending = false;
          });
        });
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncPollClosedColumnsHeight();
        });
      });
    } else {
      stopRsvpResultsPolling();
      pollResultsPage.innerHTML = "";
    }
  }

  const finalizeShareCards = document.getElementById("pollFinalizeShareCards");
  if (finalizeShareCards) {
    if (!isFinalized || showPollResultsPage) {
      finalizeShareCards.classList.add("hidden");
      finalizeShareCards.innerHTML = "";
    } else {
      const defaultMessage = getDefaultPollInviteMessage(fullDeadlineText, fullShareLink, pollOptionLabels);
      const activeMessage = defaultMessage;
      const copyButtonLabel = pollUiState.copyMessageBusy ? "Copied ✓" : "Copy message";

      finalizeShareCards.classList.remove("hidden");
      finalizeShareCards.innerHTML = `
        <div class="space-y-3">
          <div style="margin: 0; padding: 12px 16px; background: transparent; border: none; border-radius: 0; box-shadow: none; outline: none;">
            <div style="display: flex; width: 100%; align-items: center; gap: 12px; min-width: 0;">
              <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.35;">
                <span style="font-weight: 700;">➔ Send this to your team</span><br>
                <span style="font-weight: 400;">Responses will appear here as they come in</span>
              </p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white px-8 py-16">
            <div id="pollMessageText" class="text-sm text-slate-900" style="white-space: pre-line;"></div>
          </div>
          <div class="mt-3 flex flex-col gap-3 md:flex-row">
            <button id="pollActionCopyMessage" type="button" ${pollUiState.copyMessageBusy ? "disabled" : ""} class="w-full md:w-auto ${pollUiState.copyMessageBusy ? "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white opacity-90" : "h-11 rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700 active:bg-slate-800"}">${copyButtonLabel}</button>
            <button id="pollActionOpenSlack" type="button" class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto">Open Slack</button>
            <button id="pollActionOpenGmail" type="button" class="h-11 w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 md:w-auto">Open Gmail</button>
          </div>
          <div id="pollMessageActionStatus" class="mt-2 hidden text-xs font-normal"></div>
          <div class="mt-2 grid grid-cols-1 md:grid-cols-3">
            <div class="md:col-start-2 md:col-span-2">
              <div class="text-xs text-slate-500">
                <button id="pollHelperTools" type="button" class="underline hover:text-slate-700">Using a different workspace or email?</button>
              </div>
              <div id="pollHelperInfoBox" class="${pollUiState.helperInfoVisible ? "" : "hidden"} mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Just paste the message anywhere — Teams, email, SMS all work. Later, you can save your preferred tools in Settings for future events.</div>
            </div>
          </div>
        </div>
      `;

      const messageTextEl = document.getElementById("pollMessageText");
      if (messageTextEl) {
        const firstLine = "We’re planning our next team event and would love your input.";
        const quickLine = "Which of these events would you join?";
        const separator = "\u00A0\u00A0/\u00A0\u00A0";
        const eventsLine = pollOptionLabels.join(separator);
        const italicLine = `Please vote by ${fullDeadlineText || "[deadline]"} so we can lock it in.`;
        const voteHerePrefix = "👉 Vote here:";
        messageTextEl.innerHTML = String(activeMessage || "")
          .split("\n")
          .map((line) => {
            if (line.trim() === firstLine) {
              return `<span style="font-weight: 700;">${escapeHtml(line)}</span>`;
            }
            if (line.trim() === quickLine) {
              return `<span style="font-weight: 400;">${escapeHtml(line)}</span>`;
            }
            if (line.trim() === eventsLine.trim()) {
              const separator = '<span style="display:inline-block;font-size:1em;line-height:1;font-weight:400;">/</span>';
              const segments = pollOptionLabels
                .map((label) => `<span style="font-weight: 700;">${escapeHtml(label)}</span>`)
                .join(`&nbsp;&nbsp;${separator}&nbsp;&nbsp;`);
              return segments;
            }
            const safeLine = escapeHtml(line);
            if (line.trim() === italicLine.trim()) {
              return `<span style="font-style: italic;">${safeLine}</span>`;
            }
            if (line.trim().startsWith(voteHerePrefix)) {
              const suffix = line.slice(voteHerePrefix.length);
              return `👉 <span style="font-weight: 700;">Vote here:</span><span style="font-weight: 400;">${escapeHtml(suffix)}</span>`;
            }
            return safeLine;
          })
          .join("<br>");
      }

      const actionStatusEl = document.getElementById("pollMessageActionStatus");
      if (actionStatusEl) {
        const statusText = String(pollUiState.copyMessageStatusText || "").trim();
        actionStatusEl.textContent = statusText;
        actionStatusEl.classList.toggle("hidden", !statusText);
        actionStatusEl.classList.toggle("text-emerald-600", pollUiState.copyMessageStatusTone === "success");
        actionStatusEl.classList.toggle("text-rose-600", pollUiState.copyMessageStatusTone === "error");
      }

      const copyActionButton = document.getElementById("pollActionCopyMessage");
      if (copyActionButton) {
        copyActionButton.onclick = async () => {
          if (pollUiState.copyMessageBusy) return;
          const text = activeMessage;
          if (!text) return;

          try {
            await navigator.clipboard.writeText(text);

            if (pollCopyBusyTimeout) clearTimeout(pollCopyBusyTimeout);
            if (pollCopyStatusTimeout) clearTimeout(pollCopyStatusTimeout);

            pollUiState.copyMessageBusy = true;
            pollUiState.copyMessageStatusText = "Copied to clipboard.";
            pollUiState.copyMessageStatusTone = "success";
            renderPollBuilderStep();

            pollCopyBusyTimeout = setTimeout(() => {
              pollUiState.copyMessageBusy = false;
              renderPollBuilderStep();
            }, 1200);

            pollCopyStatusTimeout = setTimeout(() => {
              pollUiState.copyMessageStatusText = "";
              pollUiState.copyMessageStatusTone = "";
              renderPollBuilderStep();
            }, 2000);
          } catch (_error) {
            if (pollCopyStatusTimeout) clearTimeout(pollCopyStatusTimeout);
            pollUiState.copyMessageBusy = false;
            pollUiState.copyMessageStatusText = "Copy failed — select and copy manually";
            pollUiState.copyMessageStatusTone = "error";
            renderPollBuilderStep();

            pollCopyStatusTimeout = setTimeout(() => {
              pollUiState.copyMessageStatusText = "";
              pollUiState.copyMessageStatusTone = "";
              renderPollBuilderStep();
            }, 2200);
          }
        };
      }

      const openSlackButton = document.getElementById("pollActionOpenSlack");
      if (openSlackButton) {
        openSlackButton.onclick = () => {
          window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
        };
      }

      const openGmailButton = document.getElementById("pollActionOpenGmail");
      if (openGmailButton) {
        openGmailButton.onclick = () => {
          window.open("https://mail.google.com/", "_blank", "noopener,noreferrer");
        };
      }

      const showHelperInfo = () => {
        if (pollHelperInfoTimeout) clearTimeout(pollHelperInfoTimeout);
        if (pollUiState.helperInfoVisible) {
          pollUiState.helperInfoVisible = false;
          renderPollBuilderStep();
          return;
        }
        pollUiState.helperInfoVisible = true;
        renderPollBuilderStep();
        pollHelperInfoTimeout = setTimeout(() => {
          pollUiState.helperInfoVisible = false;
          renderPollBuilderStep();
          pollHelperInfoTimeout = null;
        }, 10000);
      };

      const helperToolsButton = document.getElementById("pollHelperTools");
      if (helperToolsButton) {
        helperToolsButton.onclick = showHelperInfo;
      }

      const pollSharedConfirmedInput = document.getElementById("pollSharedConfirmed");
      const pollShareContinueButton = document.getElementById("pollShareContinue");
      const isPollSharedConfirmed = Boolean(state.pollBuilder?.pollSharedConfirmed);
      if (pollSharedConfirmedInput) {
        pollSharedConfirmedInput.checked = isPollSharedConfirmed;
        pollSharedConfirmedInput.onchange = () => {
          state.pollBuilder.pollSharedConfirmed = Boolean(pollSharedConfirmedInput.checked);
          persistState();
          renderPollBuilderStep();
        };
      }
      if (pollShareContinueButton) {
        pollShareContinueButton.disabled = !isPollSharedConfirmed;
        const continueToPollResponses = async () => {
          if (pollUiState.resultsSyncBusy) return;
          state.setupShortlistMode = "poll";
          state.pollBuilder.showResultsPage = true;
          state.eventWorkflowProcessStep = 8;
          state.currentSetupStep = 8;
          pollUiState.rsvpSetupOpen = false;
          pollUiState.rsvpCollectionStarted = false;
          pollUiState.resultsSyncBusy = true;
          pollUiState.resultsSyncError = "";
          persistState();
          renderSetupMenuState();
          renderSetupStepStates();
          renderSidebarStepMenus();
          scrollSetupStepIntoView(8, "smooth");
          renderPollBuilderStep();

          try {
            await syncPollResultsFromBackend();
            pollUiState.resultsSyncError = "";
          } catch (error) {
            pollUiState.resultsSyncError = String(error?.message || "Couldn’t refresh live poll votes.").trim();
            showMiniToast("Couldn’t refresh live votes. Showing latest saved results.");
          } finally {
            pollUiState.resultsSyncBusy = false;
            renderPollBuilderStep();
          }
        };

        pollShareContinueButton.onclick = async () => {
          if (!state.pollBuilder?.pollSharedConfirmed) {
            showMiniToast("Confirm you shared the poll first.");
            return;
          }
          if (!getAuthToken()) {
            setPendingPostAuthAction("reviewPollResponses", () => {
              continueToPollResponses().catch(() => {});
            });
            openAuthGateWithContext("poll_review");
            return;
          }
          await continueToPollResponses();
        };
      }
    }
  }

  const dateTimeInputs = document.getElementById("pollDateTimesInputs");
  if (dateTimeInputs && !isFinalized) {
    const remainingSlots = Math.max(0, 3 - proposedDateTimes.length);
    const rowValues = Array.from({ length: remainingSlots }, () => "");
    if (!Array.isArray(pollUiState.pendingDateTimes)) {
      pollUiState.pendingDateTimes = [];
    }
    if (typeof pollUiState.pendingTimeZone !== "string") {
      pollUiState.pendingTimeZone = "";
    }

    const committedTimeZone = String(state.pollBuilder?.timeZone || "").trim();
    const effectiveTimeZone = String(pollUiState.pendingTimeZone || committedTimeZone).trim();
    const displayTimeZone = effectiveTimeZone || detectedTimeZone;

    dateTimeInputs.innerHTML = rowValues.map((value, index) => {
      const optionNumber = proposedDateTimes.length + index + 1;
      const pendingValue = typeof pollUiState.pendingDateTimes[index] === "string"
        ? pollUiState.pendingDateTimes[index]
        : value;
      const pendingParts = parsePollDateTimeValue(pendingValue);
      const selectedHour = pendingParts.hour12 || "5";
      const isDirty = pendingValue.length > 0 || (optionNumber === 1 && !committedTimeZone && effectiveTimeZone !== committedTimeZone);
      const selectedTimeZone = ["Eastern", "Central", "Mountain", "Pacific"].includes(displayTimeZone)
        ? displayTimeZone
        : "Central";
      return `
      <div>
        <label class="block text-xs text-slate-500 mb-1">Option ${optionNumber}</label>
        <div class="flex items-center gap-2">
          <div class="grid w-1/2 grid-cols-[1.5fr_0.4fr_0.4fr_auto] gap-2">
            <input data-poll-date-index="${index}" type="date" min="${todayLocalIsoDate}" class="rounded-lg border border-slate-300 px-2.5 py-2 text-sm ${pendingParts.date ? "text-slate-900" : "text-slate-400"}" value="${pendingParts.date}" />
            <select data-poll-hour-index="${index}" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
              ${hourOptions.map((hour) => `<option value="${hour}" ${hour === selectedHour ? "selected" : ""}>${hour}</option>`).join("")}
            </select>
            <select data-poll-minute-index="${index}" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
              ${minuteOptions.map((minute) => `<option value="${minute}" ${minute === pendingParts.minute ? "selected" : ""}>${minute}</option>`).join("")}
            </select>
            <select data-poll-period-index="${index}" class="rounded-lg border border-slate-300 px-2 py-2 text-sm text-slate-900">
              <option value="AM" ${pendingParts.period === "AM" ? "selected" : ""}>AM</option>
              <option value="PM" ${pendingParts.period === "PM" ? "selected" : ""}>PM</option>
            </select>
          </div>
          ${optionNumber === 1
            ? `<select data-poll-timezone-select class="w-[136px] rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-900">
                <option value="Eastern" ${selectedTimeZone === "Eastern" ? "selected" : ""}>Eastern</option>
                <option value="Central" ${selectedTimeZone === "Central" ? "selected" : ""}>Central</option>
                <option value="Mountain" ${selectedTimeZone === "Mountain" ? "selected" : ""}>Mountain</option>
                <option value="Pacific" ${selectedTimeZone === "Pacific" ? "selected" : ""}>Pacific</option>
              </select>`
            : ``}
          <button data-poll-datetime-submit="${index}" type="button" ${isDirty ? "" : "disabled"} class="rounded-lg px-3 py-2 text-xs font-medium ${isDirty ? "border border-slate-800 bg-slate-800 text-white hover:bg-slate-700" : "border border-slate-300 bg-slate-300 text-slate-600 opacity-50 cursor-not-allowed hover:bg-slate-300"}">Submit</button>
        </div>
      </div>
    `;
    }).join("");

    const timezoneSelect = dateTimeInputs.querySelector("select[data-poll-timezone-select]");
    if (timezoneSelect) {
      const syncTimezone = () => {
        const selected = timezoneSelect.value.trim();
        pollUiState.pendingTimeZone = selected || "";
        const firstSubmit = dateTimeInputs.querySelector('button[data-poll-datetime-submit="0"]');
        if (firstSubmit) {
          const pendingValue = pollUiState.pendingDateTimes[0] || "";
          const hasTimezoneDelta = pollUiState.pendingTimeZone !== committedTimeZone;
          const canSubmit = pendingValue.length > 0 || hasTimezoneDelta;
          firstSubmit.disabled = !canSubmit;
          firstSubmit.classList.toggle("border-slate-800", canSubmit);
          firstSubmit.classList.toggle("bg-slate-800", canSubmit);
          firstSubmit.classList.toggle("text-white", canSubmit);
          firstSubmit.classList.toggle("hover:bg-slate-700", canSubmit);
          firstSubmit.classList.toggle("border-slate-300", !canSubmit);
          firstSubmit.classList.toggle("bg-slate-300", !canSubmit);
          firstSubmit.classList.toggle("text-slate-600", !canSubmit);
          firstSubmit.classList.toggle("opacity-50", !canSubmit);
          firstSubmit.classList.toggle("cursor-not-allowed", !canSubmit);
          firstSubmit.classList.toggle("hover:bg-slate-300", !canSubmit);
        }
      };
      timezoneSelect.addEventListener("input", syncTimezone);
      timezoneSelect.addEventListener("change", syncTimezone);
    }

    const updatePendingDateTimeFromControls = (index) => {
      const dateField = dateTimeInputs.querySelector(`input[data-poll-date-index="${index}"]`);
      const hourField = dateTimeInputs.querySelector(`select[data-poll-hour-index="${index}"]`);
      const minuteField = dateTimeInputs.querySelector(`select[data-poll-minute-index="${index}"]`);
      const periodField = dateTimeInputs.querySelector(`select[data-poll-period-index="${index}"]`);
      if (!dateField || !hourField || !minuteField || !periodField) return;

      const pendingValue = buildPollDateTimeValue(
        dateField.value,
        hourField.value,
        minuteField.value,
        periodField.value
      );
      pollUiState.pendingDateTimes[index] = pendingValue;

      dateField.classList.toggle("text-slate-900", Boolean(dateField.value));
      dateField.classList.toggle("text-slate-400", !dateField.value);
      hourField.classList.toggle("text-slate-900", Boolean(hourField.value));
      hourField.classList.toggle("text-slate-400", !hourField.value);

      const committedValue = rowValues[index] || "";
      const submitButton = dateTimeInputs.querySelector(`button[data-poll-datetime-submit="${index}"]`);
      if (submitButton) {
        const timezoneSelectEl = dateTimeInputs.querySelector("select[data-poll-timezone-select]");
        const hasTimezoneDelta = index === 0
          && timezoneSelectEl
          && String((timezoneSelectEl.value || "").trim()) !== committedTimeZone;
        const canSubmit = pendingValue !== committedValue || hasTimezoneDelta;
        submitButton.disabled = !canSubmit;
        submitButton.classList.toggle("border-slate-800", canSubmit);
        submitButton.classList.toggle("bg-slate-800", canSubmit);
        submitButton.classList.toggle("text-white", canSubmit);
        submitButton.classList.toggle("hover:bg-slate-700", canSubmit);
        submitButton.classList.toggle("border-slate-300", !canSubmit);
        submitButton.classList.toggle("bg-slate-300", !canSubmit);
        submitButton.classList.toggle("text-slate-600", !canSubmit);
        submitButton.classList.toggle("opacity-50", !canSubmit);
        submitButton.classList.toggle("cursor-not-allowed", !canSubmit);
        submitButton.classList.toggle("hover:bg-slate-300", !canSubmit);
      }
    };

    ["input[data-poll-date-index]", "select[data-poll-hour-index]", "select[data-poll-minute-index]", "select[data-poll-period-index]"]
      .forEach((selector) => {
        dateTimeInputs.querySelectorAll(selector).forEach((control) => {
          control.addEventListener("input", () => {
            const attrName = selector.includes("date")
              ? "data-poll-date-index"
              : selector.includes("hour")
              ? "data-poll-hour-index"
              : selector.includes("minute")
              ? "data-poll-minute-index"
              : "data-poll-period-index";
            const index = Number.parseInt(control.getAttribute(attrName), 10);
            if (!Number.isInteger(index)) return;
            updatePendingDateTimeFromControls(index);
          });
          control.addEventListener("change", () => {
            const attrName = selector.includes("date")
              ? "data-poll-date-index"
              : selector.includes("hour")
              ? "data-poll-hour-index"
              : selector.includes("minute")
              ? "data-poll-minute-index"
              : "data-poll-period-index";
            const index = Number.parseInt(control.getAttribute(attrName), 10);
            if (!Number.isInteger(index)) return;
            updatePendingDateTimeFromControls(index);
          });
        });
      });

    dateTimeInputs.querySelectorAll("button[data-poll-datetime-submit]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number.parseInt(button.getAttribute("data-poll-datetime-submit"), 10);
        if (!Number.isInteger(index)) return;
        const dateField = dateTimeInputs.querySelector(`input[data-poll-date-index="${index}"]`);
        const hourField = dateTimeInputs.querySelector(`select[data-poll-hour-index="${index}"]`);
        const minuteField = dateTimeInputs.querySelector(`select[data-poll-minute-index="${index}"]`);
        const periodField = dateTimeInputs.querySelector(`select[data-poll-period-index="${index}"]`);
        if (!dateField || !hourField || !minuteField || !periodField) return;

        const previousTimeZone = String(state.pollBuilder.timeZone || "").trim();
        const activeTimezoneSelect = dateTimeInputs.querySelector("select[data-poll-timezone-select]");
        const timeZoneValue = String(
          activeTimezoneSelect
            ? (activeTimezoneSelect.value || "Central")
            : (pollUiState.pendingTimeZone || state.pollBuilder.timeZone || detectedTimeZone || "Central")
        ).trim();
        if (timeZoneValue) {
          state.pollBuilder.timeZone = timeZoneValue;
        }

        const nextValue = buildPollDateTimeValue(dateField.value, hourField.value, minuteField.value, periodField.value);
        const timeZoneChanged = timeZoneValue && timeZoneValue !== previousTimeZone;
        if (!nextValue) {
          if (timeZoneChanged) {
            pollUiState.pendingTimeZone = timeZoneValue;
            persistState();
            renderPollBuilderStep();
          }
          return;
        }

        if (dateField.value && dateField.value < todayLocalIsoDate) {
          const validationEl = document.getElementById("pollDateTimesValidation");
          if (validationEl) {
            validationEl.textContent = "Please choose today or a future date.";
            validationEl.classList.remove("hidden");
          }
          return;
        }

        const existingValues = Array.isArray(state.pollBuilder.proposedDateTimes)
          ? state.pollBuilder.proposedDateTimes.filter((value) => String(value || "").trim().length > 0)
          : [];
        if (existingValues.includes(nextValue)) {
          const validationEl = document.getElementById("pollDateTimesValidation");
          if (validationEl) {
            validationEl.textContent = "That date and time is already added. Please choose a different option.";
            validationEl.classList.remove("hidden");
          }
          return;
        }
        state.pollBuilder.proposedDateTimes = [...existingValues, nextValue].slice(0, 3);
        pollUiState.pendingDateTimes = [];
        pollUiState.pendingTimeZone = state.pollBuilder.timeZone || "";
        persistState();
        renderPollBuilderStep();
      });
    });
  }

  const calendarWrap = document.getElementById("pollAvailabilityWrap");
  const calendarOpenLink = document.getElementById("pollAvailabilityLink");
  const calendarChevronButton = document.getElementById("pollAvailabilityChevron");
  const calendarPopover = document.getElementById("pollAvailabilityPopover");

  if (calendarWrap && calendarOpenLink && calendarChevronButton && calendarPopover) {
    const closePopover = () => calendarPopover.classList.add("hidden");
    const togglePopover = () => calendarPopover.classList.toggle("hidden");

    if (calendarOpenLink.dataset.bound !== "true") {
      calendarOpenLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePopover();
      });
      calendarOpenLink.dataset.bound = "true";
    }

    if (calendarChevronButton.dataset.bound !== "true") {
      calendarChevronButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePopover();
      });
      calendarChevronButton.dataset.bound = "true";
    }

    calendarPopover.querySelectorAll("button[data-poll-calendar-provider]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const provider = String(button.getAttribute("data-poll-calendar-provider") || "").trim().toLowerCase();
        if (provider !== "google" && provider !== "outlook" && provider !== "icloud") return;
        setStoredCalendarProvider(provider);
        closePopover();
        openCalendarProvider(provider);
      });
      button.dataset.bound = "true";
    });
  }

  const validity = getPollBuilderValidity();
  const createButton = document.getElementById("pollCreateShareLink");
  const createPollBusy = Boolean(pollUiState.createPollBusy);
  const createPollError = String(pollUiState.createPollError || "").trim();
  const canCreatePoll = validity.hasValidEvents && validity.hasValidTimes && !createPollBusy;
  if (createButton) {
    createButton.classList.toggle("hidden", isFinalized);
    if (!createButton.dataset.defaultLabel) {
      createButton.dataset.defaultLabel = String(createButton.textContent || "").trim() || "Finalize poll → Generate link";
    }
    createButton.disabled = !canCreatePoll;
    if (createPollBusy) {
      createButton.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.3"></circle><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg><span>Creating poll…</span></span>';
    } else {
      createButton.textContent = createButton.dataset.defaultLabel;
    }
    createButton.classList.toggle("opacity-50", !canCreatePoll);
    createButton.classList.toggle("cursor-not-allowed", !canCreatePoll);
    createButton.classList.toggle("bg-slate-300", !canCreatePoll);
    createButton.classList.toggle("text-slate-600", !canCreatePoll);
    createButton.classList.toggle("hover:bg-slate-300", !canCreatePoll);
    createButton.classList.toggle("bg-slate-800", canCreatePoll);
    createButton.classList.toggle("text-white", canCreatePoll);
    createButton.classList.toggle("hover:bg-slate-700", canCreatePoll);
  }

  const validationEl = document.getElementById("pollDateTimesValidation");
  if (validationEl) {
    if (createPollError) {
      validationEl.textContent = createPollError;
      validationEl.classList.remove("hidden");
    } else {
      validationEl.classList.add("hidden");
    }
  }

  const shareWrap = document.getElementById("pollShareLinkWrap");
  const shareOutput = document.getElementById("pollShareLinkOutput");
  if (shareWrap) shareWrap.classList.toggle("hidden", !state.pollBuilder.shareLink || isFinalized);
  if (shareOutput) shareOutput.value = state.pollBuilder.shareLink || "";
}

function initializePollBuilderInteractions() {
  const introToggle = document.getElementById("pollEditIntroToggle");
  if (introToggle && introToggle.dataset.bound !== "true") {
    introToggle.addEventListener("click", () => {
      pollUiState.editingIntro = !pollUiState.editingIntro;
      renderPollBuilderStep();
    });
    introToggle.dataset.bound = "true";
  }

  const introInput = document.getElementById("pollIntroInput");
  if (introInput && introInput.dataset.bound !== "true") {
    introInput.addEventListener("input", (event) => {
      state.pollBuilder.introMessageOverride = event.target.value;
      persistState();
      renderPollBuilderStep();
    });
    introInput.dataset.bound = "true";
  }

  const editEventsToggle = document.getElementById("pollEditEventsToggle");
  if (editEventsToggle && editEventsToggle.dataset.bound !== "true") {
    editEventsToggle.addEventListener("click", () => {
      pollUiState.editingEventLabels = !pollUiState.editingEventLabels;
      renderPollBuilderStep();
    });
    editEventsToggle.dataset.bound = "true";
  }

  const chooseDifferentEvents = document.getElementById("pollChooseDifferentEvents");
  if (chooseDifferentEvents && chooseDifferentEvents.dataset.bound !== "true") {
    chooseDifferentEvents.addEventListener("click", () => {
      state.currentSetupStep = 7;
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
    });
    chooseDifferentEvents.dataset.bound = "true";
  }

  const openCalendarButton = document.getElementById("pollOpenCalendar");
  if (openCalendarButton && openCalendarButton.dataset.bound !== "true") {
    openCalendarButton.addEventListener("click", () => {
      window.open("https://calendar.google.com", "_blank", "noopener,noreferrer");
    });
    openCalendarButton.dataset.bound = "true";
  }

  const createShareLinkButton = document.getElementById("pollCreateShareLink");
  if (createShareLinkButton && createShareLinkButton.dataset.bound !== "true") {
    createShareLinkButton.addEventListener("click", async () => {
      if (pollUiState.createPollBusy) return;
      const validity = getPollBuilderValidity();
      if (!validity.isValid) {
        const validationEl = document.getElementById("pollDateTimesValidation");
        if (validationEl) {
          validationEl.textContent = !validity.hasValidEvents
            ? "Select at least 2 events before creating the poll."
            : "Add at least 1 proposed time before creating the poll.";
          validationEl.classList.remove("hidden");
        }
        return;
      }

      if (!validity.hasValidEvents) {
        const validationEl = document.getElementById("pollDateTimesValidation");
        if (validationEl) {
          validationEl.textContent = "Select 2–3 events before creating the poll.";
          validationEl.classList.remove("hidden");
        }
        return;
      }

      const payload = buildCreatePollPayload();
      if (!Array.isArray(payload.options) || payload.options.length < 2 || payload.options.length > 3) {
        pollUiState.createPollError = "Select 2–3 events before creating the poll.";
        renderPollBuilderStep();
        return;
      }
      if (!Array.isArray(payload.times) || payload.times.length < 1 || payload.times.length > 3) {
        pollUiState.createPollError = "Add 1–3 proposed times before creating the poll.";
        renderPollBuilderStep();
        return;
      }

      pollUiState.createPollError = "";
      pollUiState.createPollBusy = true;
      renderPollBuilderStep();

      try {
        const apiResponse = await createPollInBackend(payload);
        state.pollBuilder.pollId = apiResponse.pollId;
        state.pollBuilder.createdAt = new Date().toISOString();
        state.pollBuilder.shareLink = apiResponse.shareUrl;
        state.pollBuilder.pollSharedConfirmed = false;
        state.pollBuilder.showResultsPage = false;
        state.pollBuilder.backendOptionLabels = [];
        state.pollBuilder.backendTimeLabels = [];
        pollUiState.editingDeadline = false;
        pollUiState.createPollError = "";
        pollUiState.createPollBusy = false;
        persistState();
        renderPollBuilderStep();
      } catch (error) {
        pollUiState.createPollBusy = false;
        pollUiState.createPollError = String(error?.message || "We couldn’t create the poll right now. Please try again.").trim();
        renderPollBuilderStep();
      }
    });
    createShareLinkButton.dataset.bound = "true";
  }

  const copyShareLinkButton = document.getElementById("pollCopyShareLink");
  if (copyShareLinkButton && copyShareLinkButton.dataset.bound !== "true") {
    copyShareLinkButton.addEventListener("click", () => {
      const link = state.pollBuilder?.shareLink || "";
      if (!link) return;
      copyText(link, "pollLinkSuccess");
    });
    copyShareLinkButton.dataset.bound = "true";
  }

  renderPollBuilderStep();
}

// Generate recommended events based on user setup preferences
// TODO: Replace this with actual backend API call when available
function generateRecommendedEvents() {
  state.programSettings.goals = Array.isArray(state.landingDraft.goals) ? [...state.landingDraft.goals] : [];
  state.programSettings.preferredSchedule = Array.isArray(state.landingDraft.schedule) ? [...state.landingDraft.schedule] : [];
  state.programSettings.cadence = state.landingDraft.cadence || state.programSettings.cadence;
  state.programSettings.teamPreferenceEstimate = Array.isArray(state.landingDraft.teamPreferenceEstimate)
    ? [...state.landingDraft.teamPreferenceEstimate]
    : [];
  state.programSettings.admin_preference_weight = state.programSettings.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
  state.eventsRecommended = generateRecommendations(state.programSettings);

  // Hide the overlay message
  const overlay = document.getElementById("eventsShortlistOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
  
  // Remove the events-locked class to stop blur/fade effect
  const container = document.getElementById("eventsShortlistCards");
  if (container) {
    container.classList.remove("events-locked");
  }
  
  // Populate placeholder events
  const eventCards = document.querySelectorAll(".event-card");
  eventCards.forEach((card, index) => {
    const eventNumber = index + 1;
    const eventTitle = card.querySelector(".event-title");
    const eventWhy = card.querySelector(".event-why");
    const eventDescription = card.querySelector(".event-description");
    const eventFooter = card.querySelector(".event-footer");
    
    if (eventTitle) {
      eventTitle.textContent = `Event ${eventNumber}`;
    }
    if (eventWhy) {
      eventWhy.textContent = "";
    }
    if (eventDescription) {
      eventDescription.textContent = "";
    }
    if (eventFooter) {
      eventFooter.innerHTML = "";
    }
  });
  
  // Clear the fade-away-vertical classes since we're showing real content
  document.querySelectorAll(".fade-away-vertical").forEach(el => {
    el.classList.remove("fade-away-vertical");
    el.style.removeProperty("--i");
    el.style.removeProperty("--total");
  });
  
  // Show the poll button container
  const buttonContainer = document.getElementById("eventsPollButtonContainer");
  if (buttonContainer) {
    buttonContainer.classList.remove("hidden");
  }

  // Show the selection hint above personalized recommendations
  const selectionHint = document.getElementById("eventsSelectionHint");
  if (selectionHint) {
    selectionHint.classList.remove("hidden");
    selectionHint.style.display = "flex";
  }

  initializeEventsShortlistInteractions();
  updateEventsShortlistModeUI();
  
  // Mark events as generated and persist
  state.setupEventsGenerated = true;
  persistState();
}

bootstrap();








