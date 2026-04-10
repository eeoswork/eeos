// --- Sidebar Setup Collapse/Expand Logic ---
function updateSidebarSetupCollapseUI() {
  const heading = document.getElementById("sidebarSetupHeading");
  const check = document.getElementById("sidebarSetupCheck");
  const editPrefs = document.getElementById("sidebarSetupEditPrefs");
  const collapseWrap = document.getElementById("sidebarSetupMenuCollapse");
  const headingText = document.getElementById("sidebarSetupLabel");
  const expanded = !!state.sidebarSetupExpanded;
  const headingLabel = headingText || (heading ? heading.querySelector("div > span") : null);
  const headingColor = headingLabel
    ? window.getComputedStyle(headingLabel).color
    : (heading ? window.getComputedStyle(heading).color : "");

  if (check) {
    check.style.display = "none";
  }
  if (editPrefs) {
    editPrefs.style.display = "none";
  }
  if (collapseWrap) {
    collapseWrap.style.maxHeight = expanded ? "500px" : "0px";
    collapseWrap.style.overflow = expanded ? "visible" : "hidden";
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
    if (nextExpanded) {
      setSidebarActiveSection("setup");
    }
    persistState();
    renderSetupMenuState();
    updateSidebarSetupCollapseUI();
    updateSidebarEventWorkflowCollapseUI();
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

  // Preserve the currently active step. Navigation is sidebar-driven.
  void headersOnly;
}

function isAllCoreSetupComplete() {
  return [1, 2, 3, 4, 5, 6].every((stepNum) => state.completedSetupSteps.includes(stepNum));
}

function normalizeSidebarAccordionState() {
  if (!isAllCoreSetupComplete()) {
    state.sidebarActiveSection = "setup";
    state.sidebarSetupExpanded = false;
    state.setupMenuExpanded = false;
    state.sidebarEventWorkflowExpanded = false;
    return;
  }

  const activeSection = String(state.sidebarActiveSection || "").trim();
  state.sidebarActiveSection = ["setup", "event-workflow"].includes(activeSection)
    ? activeSection
    : "event-workflow";
  state.sidebarSetupExpanded = state.sidebarActiveSection === "setup";
  state.setupMenuExpanded = state.sidebarSetupExpanded;
  state.sidebarEventWorkflowExpanded = state.sidebarActiveSection === "event-workflow";
}

function setSidebarActiveSection(section) {
  const targetSection = String(section || "").trim();
  if (!["setup", "event-workflow"].includes(targetSection)) return;
  state.sidebarActiveSection = targetSection;
  normalizeSidebarAccordionState();
}

function updateSidebarEventWorkflowCollapseUI() {
  const collapseWrap = document.getElementById("sidebarEventWorkflowMenuCollapse");
  if (!collapseWrap) return;
  const expanded = !!state.sidebarEventWorkflowExpanded;
  collapseWrap.style.maxHeight = expanded ? "500px" : "0px";
  collapseWrap.style.overflow = expanded ? "visible" : "hidden";
  const toggleBtn = document.getElementById("sidebarEventWorkflowToggle");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    toggleBtn.classList.toggle("is-expanded", expanded);
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
"Strengthen team connection",
"Improve employee performance",
"Boost morale",
"Support employee wellbeing"
];

const EVENT_WORKFLOW_TYPES = {
  POLL: "poll",
  RSVP: "rsvp",
  STRAIGHT_TO_PROMOTE: "straight-to-promote"
};

const EVENT_WORKFLOW_STEPS = {
  SHORTLIST: 7,
  POLL: 8,
  RSVP: 9,
  BOOK: 10,
  PROMOTE: 11,
  RUN: 12,
  FEEDBACK: 13,
  REVIEW: 14
};

const EVENT_WORKFLOW_STEP_SEQUENCE = [
  EVENT_WORKFLOW_STEPS.SHORTLIST,
  EVENT_WORKFLOW_STEPS.POLL,
  EVENT_WORKFLOW_STEPS.RSVP,
  EVENT_WORKFLOW_STEPS.BOOK,
  EVENT_WORKFLOW_STEPS.PROMOTE,
  EVENT_WORKFLOW_STEPS.RUN,
  EVENT_WORKFLOW_STEPS.FEEDBACK,
  EVENT_WORKFLOW_STEPS.REVIEW
];

const SIDEBAR_WORKFLOW_STEP_CONFIG = {
  [EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE]: [
    { menuKey: "events-shortlist", stepNum: EVENT_WORKFLOW_STEPS.SHORTLIST, label: "Launch Event" },
    { menuKey: "run-event", stepNum: EVENT_WORKFLOW_STEPS.RUN, label: "Run Event" },
    { menuKey: "review-impact", stepNum: EVENT_WORKFLOW_STEPS.REVIEW, label: "Review Impact" }
  ]
};

function getSidebarWorkflowStepConfig(workflowType = getActiveWorkflowType()) {
  const resolvedType = String(workflowType || "").trim().toLowerCase();
  const configured = SIDEBAR_WORKFLOW_STEP_CONFIG[resolvedType];
  if (Array.isArray(configured) && configured.length) return configured;
  return SIDEBAR_WORKFLOW_STEP_CONFIG[EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE];
}

function getEventWorkflowConfig(eventLike = {}) {
  const templateId = String(eventLike?.templateId || eventLike?.id || "").trim().toLowerCase();
  const title = String(eventLike?.title || eventLike?.name || "").trim().toLowerCase();
  if (isRevelryLabsReadOnlyMagicLink() && (templateId === "march-madness" || title === "march madness bracket challenge")) {
    return {
      workflowType: EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE,
      allowDirectBookOverride: Boolean(eventLike?.allowDirectBookOverride),
      pollVariant: String(eventLike?.pollVariant || "event-and-datetime").trim() || "event-and-datetime",
      hasPoll: false,
      hasRsvp: true
    };
  }
  const explicitWorkflowType = String(eventLike?.workflowType || "").trim().toLowerCase();
  const legacyType = String(eventLike?.type || "").trim().toLowerCase();
  const requestedWorkflowType = explicitWorkflowType || (legacyType === "poll"
    ? EVENT_WORKFLOW_TYPES.POLL
    : EVENT_WORKFLOW_TYPES.RSVP);
  const workflowType = requestedWorkflowType === EVENT_WORKFLOW_TYPES.POLL
    ? EVENT_WORKFLOW_TYPES.POLL
    : (requestedWorkflowType === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE
        ? EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE
        : EVENT_WORKFLOW_TYPES.RSVP);
  const allowDirectBookOverride = Boolean(eventLike?.allowDirectBookOverride);
  const pollVariant = String(eventLike?.pollVariant || "event-and-datetime").trim() || "event-and-datetime";
  const hasPoll = workflowType === EVENT_WORKFLOW_TYPES.POLL;
  const hasRsvp = true;
  return { workflowType, allowDirectBookOverride, pollVariant, hasPoll, hasRsvp };
}

function getWorkflowTypeLabel(eventLike = {}) {
  const config = getEventWorkflowConfig(eventLike);
  if (config.workflowType === EVENT_WORKFLOW_TYPES.RSVP) return "RSVP";
  if (config.workflowType === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE) {
    const templateId = String(eventLike?.templateId || eventLike?.id || "").trim().toLowerCase();
    const title = String(eventLike?.title || eventLike?.name || "").trim().toLowerCase();
    const isMarchMadness = templateId === "march-madness"
      || title === "march madness bracket challenge"
      || title === "march madness brackets challenge"
      || title === "company-wide march madness challenge";
    if (isRevelryBracketsMagicContext() && isMarchMadness) {
      return "Runs from March 19 to April 7.  Your total admin time during the challenge: under 30 minutes.";
    }
    return "Promote";
  }
  return "Poll → RSVP";
}

function getEventWorkflowStepSequence(workflowType = getActiveWorkflowType()) {
  let sequence;
  if (workflowType === EVENT_WORKFLOW_TYPES.RSVP) {
    sequence = EVENT_WORKFLOW_STEP_SEQUENCE.filter((stepNum) => stepNum !== EVENT_WORKFLOW_STEPS.POLL && stepNum !== EVENT_WORKFLOW_STEPS.BOOK);
  } else if (workflowType === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE) {
    sequence = EVENT_WORKFLOW_STEP_SEQUENCE.filter((stepNum) => stepNum !== EVENT_WORKFLOW_STEPS.POLL && stepNum !== EVENT_WORKFLOW_STEPS.RSVP && stepNum !== EVENT_WORKFLOW_STEPS.BOOK);
  } else {
    sequence = [...EVENT_WORKFLOW_STEP_SEQUENCE];
  }

  // Revelry read-only magic link is intentionally capped at Run Event for now.
  if (isRevelryLabsReadOnlyMagicLink()) {
    return sequence.filter((stepNum) => stepNum <= EVENT_WORKFLOW_STEPS.RUN);
  }

  return sequence;
}

function isWorkflowStepSkipped(stepNum, workflowType = getActiveWorkflowType()) {
  return !getEventWorkflowStepSequence(workflowType).includes(stepNum);
}

const ENERGY_RESET_LAUNCH_STEPS = [
  {
    key: "day_0",
    title: "Day 0 - Kickoff",
    plainMessage: `🌻 Our 5-Day Energy Reset Challenge begins next week.

  Each day here in Slack, you’ll get a simple, science-backed practice designed to support your focus, mood, and overall well-being.  You can fit each mini-challenge in whenever you like — each takes just a few minutes.

  A few small resets — a walk, a stretch, a posture check — can make your whole week feel easier.

  We start next week. Drop an emoji if you're in!`,
    htmlMessage: `🌻 <b>Our 5-Day Energy Reset Challenge begins next week.</b><br><br>Each day here in Slack, you’ll get a simple, science-backed practice designed to support your focus, mood, and overall well-being. You can fit each mini-challenge in whenever you like — <b>each takes just a few minutes</b>.<br><br>A few small resets — a walk, a stretch, a posture check — can make your whole week feel easier.<br><br>We start next week. <b>Drop an emoji if you're in!</b>`
  },
  {
    key: "day_1",
    title: "Day 1 - Take a Breath",
    plainMessage: `Day 1 of our 5-Day Energy Reset Challenge:

Take a Breath 🌬️
👉 Try this: Inhale through the nose for 4 sec → hold 2 sec → exhale through the mouth for 6 sec. Repeat 5 times.

Why this works
Long exhales activate your parasympathetic nervous system. Studies show this breathing pattern can lower stress and stabilize heart rate in under a minute.

Did it help?
Write a word or two that describes how you feel after completing the breathing reset.`,
  htmlMessage: `<u>Day 1 of our 5-Day Energy Reset Challenge:</u><br><br><b>Take a Breath</b> 🌬️<br>👉 Try this: Inhale through the nose for 4 sec → hold 2 sec → exhale through the mouth for 6 sec. Repeat 5 times.<br><br><b>Why this works</b><br>Long exhales activate your parasympathetic nervous system. Studies show this breathing pattern can lower stress and stabilize heart rate in under a minute.<br><br><b>Did it help?</b><br>Write a word or two that describes how you feel after completing the breathing reset.`
  },
  {
    key: "day_2",
    title: "Day 2 - Stretch Break",
    plainMessage: `Welcome to Day 2 of our 5-Day Energy Reset Challenge

Stretch Break 🧘‍♂️
Today’s micro-challenge:
👉 Stand and perform this active chest opener stretch below for 1 minute.

Why this works
Sitting hunched forward tightens your chest muscles and rounds your shoulders, which can strain your upper back and neck. A chest opener stretch helps reverse this posture, opens the chest, improves shoulder mobility, and reduces tension in the upper body — helping you breathe easier and feel better.

Have a favorite stretch?
Share a GIF of it with us!


https://eeos.work/active_chest_opener_stretch.gif`,
  htmlMessage: `<u>Welcome to Day 2 of our 5-Day Energy Reset Challenge</u><br><br><b>Stretch Break</b> 🧘‍♂️<br>Today’s micro-challenge:<br>👉 Stand and perform this active chest opener stretch below for 1 minute.<br><br><b>Why this works</b><br>Sitting hunched forward tightens your chest muscles and rounds your shoulders, which can strain your upper back and neck. A chest opener stretch helps reverse this posture, opens the chest, improves shoulder mobility, and reduces tension in the upper body — helping you breathe easier and feel better.<br><br><b>Have a favorite stretch?</b><br>Share a GIF of it with us!<br><br><br><a href="https://eeos.work/active_chest_opener_stretch.gif" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">https://eeos.work/active_chest_opener_stretch.gif</a>`,
  },
  {
    key: "day_3",
    title: "Day 3 - Posture Reset",
    plainMessage: `Day 3 of the 5-Day Energy Reset Challenge:

Posture Reset 🖥️
Today’s micro-challenge:
👉 Sit tall, stack your ribcage over your pelvis, keep your ears above your shoulders, then gently roll your shoulders back and relax!

Why this works
Slouched posture compresses the diaphragm and reduces oxygen intake, lowering energy and increasing fatigue. Research shows that “expansive” posture boosts alertness and stress resilience.

Posture score
Look at the posture image below — how many of the 8 posture points are you currently doing correctly at your desk? Drop your score out of 8 in the thread and share one thing you’ll adjust today to improve!


https://eeos.work/good_posture.jpg`,
  htmlMessage: `<u>Day 3 of the 5-Day Energy Reset Challenge:</u><br><br><b>Posture Reset 🖥️</b><br>Today’s micro-challenge:<br>👉 Sit tall, stack your ribcage over your pelvis, keep your ears above your shoulders, then gently roll your shoulders back and relax!<br><br><b>Why this works</b><br>Slouched posture compresses the diaphragm and reduces oxygen intake, lowering energy and increasing fatigue. Research shows that “expansive” posture boosts alertness and stress resilience.<br><br><b>Posture score</b><br>Look at the posture image below — how many of the 8 posture points are you currently doing correctly at your desk? Drop your score out of 8 in the thread and share one thing you’ll adjust today to improve!<br><br><br><a href="https://eeos.work/good_posture.jpg" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">https://eeos.work/good_posture.jpg</a>`
  },
  {
    key: "day_4",
    title: "Day 4 - Hydration Boost",
    plainMessage: `Day 4 of the 5-Day Energy Reset Challenge:

Hydration Boost 💧
Today’s micro-challenge:
👉 Drink a full glass of water right now, and aim for one small glass every hour.

Why this matters
On average, adults lose about 80 oz of water each day through urine, sweat, breathing, and digestion. Everyone’s different — exercise, heat, or illness can increase needs, and about 20% of water comes from food. Even a 1–2% loss of body weight can affect mood, focus, and energy.

Tip swap
Share one trick you use to remember to drink enough water during the day.`,
    htmlMessage: `<u>Day 4 of the 5-Day Energy Reset Challenge:</u><br><br><b>Hydration Boost</b> 💧<br>Today’s micro-challenge:<br>👉 Drink a full glass of water right now, and aim for one small glass every hour.<br><br><b>Why this matters</b><br>On average, adults lose about 80 oz of water each day through urine, sweat, breathing, and digestion. Everyone’s different — exercise, heat, or illness can increase needs, and about 20% of water comes from food. Even a 1–2% loss of body weight can affect mood, focus, and energy.<br><br><b>Tip swap</b><br>Share one trick you use to remember to drink enough water during the day.`
  },
  {
    key: "day_5",
    title: "Day 5 - Walk it Out",
    plainMessage: `Final day of our 5-Day Energy Reset Challenge:

Walk It Out 🚶
Today’s micro-challenge:
👉 Take a 5–10 minute walk — outdoors if possible, but anywhere is fine.

Why this works
Stanford researchers found that walking boosts creativity by up to 60% and improves mood by increasing blood flow to the brain. Even brief walks reduce stress hormones like cortisol.

Walk the walk
Snap a photo of something interesting from your walk and drop it in the thread!`,
    htmlMessage: `<u>Final day of our 5-Day Energy Reset Challenge:</u><br><br><b>Walk It Out</b> 🚶<br>Today’s micro-challenge:<br>👉 Take a 5–10 minute walk — outdoors if possible, but anywhere is fine.<br><br><b>Why this works</b><br>Stanford researchers found that walking boosts creativity by up to 60% and improves mood by increasing blood flow to the brain. Even brief walks reduce stress hormones like cortisol.<br><br><b>Walk the walk</b><br>Snap a photo of something interesting from your walk and drop it in the thread!`
  },
  {
    key: "day_6",
    title: "Day 6 - Wrap Up",
    plainMessage: `🌟 Day 6: Energy Reset Mini-Circuit!
Celebrate completing the 5-Day Challenge with a quick, energizing flow:

1️⃣ Breathe: 5 slow breaths (inhale 4 sec → hold 2 sec → exhale 6 sec)
2️⃣ Walk: ~5 minutes wherever you can move, preferably outdoors
3️⃣ Hydrate: Drink a full glass of water
4️⃣ Stretch: Open your chest (clasp hands behind your back, puff out your chest, squeeze shoulder blades together — hold for a minute)
5️⃣ Posture Check: Sit tall, shoulders back and relaxed, ears over shoulders, ribcage stacked over pelvis, thighs about parallel to the ground, feet flat on the floor

Keep this as a reference — you can repeat this mini-circuit anytime for a quick reset.`,
    htmlMessage: `<u>🌟 <b>Day 6: Energy Reset Mini-Circuit!</b></u><br>Celebrate completing the 5-Day Challenge with a quick, energizing flow:<br><br>1️⃣ <b>Breathe:</b> 5 slow breaths (inhale 4 sec → hold 2 sec → exhale 6 sec)<br>2️⃣ <b>Walk:</b> ~5 minutes wherever you can move, preferably outdoors<br>3️⃣ <b>Hydrate:</b> Drink a full glass of water<br>4️⃣ <b>Stretch:</b> Open your chest (clasp hands behind your back, puff out your chest, squeeze shoulder blades together — hold for a minute)<br>5️⃣ <b>Posture Check:</b> Sit tall, shoulders back and relaxed, ears over shoulders, ribcage stacked over pelvis, thighs about parallel to the ground, feet flat on the floor<br><br>Keep this as a reference — you can repeat this mini-circuit anytime for a quick reset.`
  }
];

function createDefaultEnergyResetLaunchState() {
  return {
    activeStepKey: ENERGY_RESET_LAUNCH_STEPS[0].key,
    completedStepKeys: [],
    challengeStartedAt: null,
    reviewUnlockAt: null
  };
}

function normalizeEnergyResetLaunchState(target = state.pollBuilder) {
  if (!target || typeof target !== "object") {
    return createDefaultEnergyResetLaunchState();
  }

  if (!target.energyResetLaunch || typeof target.energyResetLaunch !== "object") {
    target.energyResetLaunch = createDefaultEnergyResetLaunchState();
  }

  const launchState = target.energyResetLaunch;
  const validKeys = new Set(ENERGY_RESET_LAUNCH_STEPS.map((step) => step.key));
  launchState.completedStepKeys = Array.isArray(launchState.completedStepKeys)
    ? Array.from(new Set(launchState.completedStepKeys.map((key) => String(key || "")).filter((key) => validKeys.has(key))))
    : [];
  if (!(typeof launchState.challengeStartedAt === "string" || launchState.challengeStartedAt === null)) {
    launchState.challengeStartedAt = null;
  }
  if (!(typeof launchState.reviewUnlockAt === "string" || launchState.reviewUnlockAt === null)) {
    launchState.reviewUnlockAt = null;
  }

  const activeStepKey = String(launchState.activeStepKey || "");
  if (!validKeys.has(activeStepKey) || launchState.completedStepKeys.includes(activeStepKey)) {
    const firstIncomplete = ENERGY_RESET_LAUNCH_STEPS.find((step) => !launchState.completedStepKeys.includes(step.key));
    launchState.activeStepKey = firstIncomplete
      ? firstIncomplete.key
      : ENERGY_RESET_LAUNCH_STEPS[ENERGY_RESET_LAUNCH_STEPS.length - 1].key;
  }

  return launchState;
}

function getEnergyResetReviewUnlockAt(startedAtIso = "") {
  const startedAt = new Date(String(startedAtIso || "").trim());
  if (Number.isNaN(startedAt.getTime())) return "";

  const launchWeekday = startedAt.getDay();
  const offsetDays = launchWeekday >= 1 && launchWeekday <= 3
    ? 9
    : (launchWeekday === 4
      ? 12
      : (launchWeekday === 5 ? 11 : 9));

  const unlockAt = new Date(startedAt);
  unlockAt.setDate(unlockAt.getDate() + offsetDays);
  unlockAt.setHours(9, 0, 0, 0);
  return unlockAt.toISOString();
}

function syncRsvpStepLabels(isEnergyResetLaunch) {
  const label = isEnergyResetLaunch ? "Launch Event" : "RSVP";
  const stepHeader = document.querySelector('.setup-step[data-step="9"] .setup-step-header h3');
  if (stepHeader) stepHeader.textContent = label;
  document.querySelectorAll('[data-event-workflow-menu-item="rsvp"]').forEach((item) => {
    item.textContent = label;
  });
}

function getPreviousWorkflowStep(stepNum, workflowType = getActiveWorkflowType()) {
  const sequence = getEventWorkflowStepSequence(workflowType);
  const stepIndex = sequence.indexOf(stepNum);
  if (stepIndex <= 0) return null;
  return sequence[stepIndex - 1];
}

function getNextWorkflowStep(stepNum, workflowType = getActiveWorkflowType()) {
  const sequence = getEventWorkflowStepSequence(workflowType);
  const stepIndex = sequence.indexOf(stepNum);
  if (stepIndex < 0 || stepIndex >= sequence.length - 1) return null;
  return sequence[stepIndex + 1];
}

function createEmptyEventLaunchContext() {
  return {
    templateId: "",
    title: "",
    workflowType: "",
    pollVariant: "",
    allowDirectBookOverride: false,
    url: "",
    costPerPerson: 0,
    locationType: "virtual"
  };
}

function normalizeEventLaunchContext() {
  if (!state.eventLaunchContext || typeof state.eventLaunchContext !== "object") {
    state.eventLaunchContext = createEmptyEventLaunchContext();
  }
  const next = state.eventLaunchContext;
  if (typeof next.templateId !== "string") next.templateId = "";
  if (typeof next.title !== "string") next.title = "";
  if (typeof next.workflowType !== "string") next.workflowType = "";
  if (typeof next.pollVariant !== "string") next.pollVariant = "";
  if (typeof next.allowDirectBookOverride !== "boolean") next.allowDirectBookOverride = false;
  if (typeof next.url !== "string") next.url = "";
  if (typeof next.costPerPerson !== "number") next.costPerPerson = 0;
  if (typeof next.locationType !== "string") next.locationType = "virtual";
}

function setEventLaunchContextFromTemplate(template = {}) {
  const config = getEventWorkflowConfig(template);
  state.eventLaunchContext = {
    templateId: String(template?.id || template?.templateId || "").trim(),
    title: String(template?.title || template?.name || "").trim(),
    workflowType: config.workflowType,
    pollVariant: config.pollVariant,
    allowDirectBookOverride: config.allowDirectBookOverride,
    url: String(template?.url || "").trim(),
    costPerPerson: Number(template?.costPerPerson ?? template?.estimatedCost ?? 0),
    locationType: String(template?.eventLocationType || template?.locationType || "virtual").trim() || "virtual"
  };
}

function ensureCompletedSetupStep(stepNum) {
  if (!Array.isArray(state.completedSetupSteps)) {
    state.completedSetupSteps = [];
  }
  if (!state.completedSetupSteps.includes(stepNum)) {
    state.completedSetupSteps.push(stepNum);
  }
}

function goToEventWorkflowStep(stepNum, options = {}) {
  const processStep = Number.isInteger(options.processStep) ? options.processStep : stepNum;
  const shouldRenderPoll = options.renderPoll === true;
  const shouldRenderRsvp = options.renderRsvp === true;
  collapseSetupViewsForWorkflowStep();
  state.currentSetupStep = stepNum;
  state.eventWorkflowProcessStep = processStep;
  persistState();
  renderSetupStepStates();
  renderSidebarStepMenus();
  updateSetupStepButtonStates();
  renderFourMonthProgram();
  if (shouldRenderPoll) renderPollBuilderStep();
  if (shouldRenderRsvp) renderRsvpStep();
  setTimeout(() => scrollSetupStepIntoView(stepNum, "smooth"), 100);
}

function getActiveWorkflowType() {
  const explicit = String(state.eventLaunchContext?.workflowType || "").trim().toLowerCase();
  if (explicit === EVENT_WORKFLOW_TYPES.RSVP) return EVENT_WORKFLOW_TYPES.RSVP;
  if (explicit === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE) return EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE;
  const programEvents = Array.isArray(state.fourMonthProgram?.events) ? state.fourMonthProgram.events : [];
  const firstConcreteEvent = programEvents.find((eventItem) =>
    eventItem && typeof eventItem === "object" && !eventItem.isConfettiMonth
  );
  if (firstConcreteEvent) {
    const fallbackConfig = getEventWorkflowConfig(firstConcreteEvent);
    if (fallbackConfig.workflowType === EVENT_WORKFLOW_TYPES.RSVP) return EVENT_WORKFLOW_TYPES.RSVP;
    if (fallbackConfig.workflowType === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE) return EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE;
  }
  return EVENT_WORKFLOW_TYPES.POLL;
}

function migrateEventWorkflowStepsIfNeeded() {
  if (state.meta?.eventWorkflowSchemaVersion === 2) return;
  const shiftStep = (stepNum) => {
    if (!Number.isInteger(stepNum)) return stepNum;
    if (stepNum >= 9 && stepNum <= 13) return stepNum + 1;
    return stepNum;
  };
  state.currentSetupStep = shiftStep(Number.isInteger(state.currentSetupStep) ? state.currentSetupStep : state.currentSetupStep);
  state.eventWorkflowProcessStep = shiftStep(Number.isInteger(state.eventWorkflowProcessStep) ? state.eventWorkflowProcessStep : state.eventWorkflowProcessStep);
  if (Array.isArray(state.completedSetupSteps)) {
    state.completedSetupSteps = Array.from(new Set(state.completedSetupSteps.map((stepNum) => shiftStep(stepNum))));
  }
  if (state.workflowStates && typeof state.workflowStates === "object") {
    Object.values(state.workflowStates).forEach((workflowState) => {
      if (!workflowState || typeof workflowState !== "object") return;
      if (Number.isInteger(workflowState.currentStep)) {
        workflowState.currentStep = workflowState.currentStep >= 3 ? workflowState.currentStep + 1 : workflowState.currentStep;
      }
      if (Array.isArray(workflowState.completed)) {
        workflowState.completed = Array.from(new Set(workflowState.completed.map((stepNum) => (stepNum >= 3 ? stepNum + 1 : stepNum))));
      }
    });
  }
  if (!state.meta || typeof state.meta !== "object") state.meta = { lastUpdated: null };
  state.meta.eventWorkflowSchemaVersion = 2;
}


const GOAL_DESCRIPTIONS = {
  "Strengthen team connection": "Build stronger relationships and shared culture across teams",
  "Improve employee performance": "Boost focus, energy, and effectiveness across your team",
  "Boost morale": "Increase positivity, loyalty, and day-to-day engagement",
  "Support employee wellbeing": "Support mental health, balance, and employee appreciation"
};

const INTEREST_OPTIONS = [
  "Games & competitions",
  "Food & drinks",
  "Volunteering",
  "Learning events",
  "Social meetups"
];

const INTEREST_DESCRIPTIONS = {
  "Games & competitions": "Playful team challenges and friendly competition",
  "Food & drinks": "Shared tasting, cooking, and hosted culinary moments",
  "Volunteering": "Purpose-driven experiences that support local communities",
  "Learning events": "Sessions focused on skills, growth, and practical learning",
  "Social meetups": "Connection-focused social time across teams"
};




const CADENCE_OPTIONS = ["Monthly", "Every 2 months", "Quarterly"];
const SCHEDULE_OPTIONS = [
  { value: "Hybrid", label: "Both virtual and in-person" },
  { value: "Remote", label: "Virtual only" }
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

const FORCE_POLL_CLOSED_ADMIN_VIEW = false;
const FORCE_POLL_OPEN_ADMIN_VIEW = false;
const FORCE_POLL_PRE_SHARE_VIEW = false;
const APP_CONFIG = window.__EEOS_CONFIG__ || {};
const POLL_API_BASE = String(APP_CONFIG.apiBaseUrl || "https://esos-polls.ajolly2.workers.dev/api").replace(/\/+$/, "");
const POLL_PUBLIC_BASE_URL = "https://eeoswork.github.io/eeos";
const EVENT_PAGE_LOCKS_CONFIG = (APP_CONFIG.eventPageLocks && typeof APP_CONFIG.eventPageLocks === "object")
  ? APP_CONFIG.eventPageLocks
  : {};
const EVENT_PAGE_LOCK_RULES = (EVENT_PAGE_LOCKS_CONFIG.rules && typeof EVENT_PAGE_LOCKS_CONFIG.rules === "object")
  ? EVENT_PAGE_LOCKS_CONFIG.rules
  : {};
const EVENT_PAGE_LOCK_DEFAULT_DURATION_HOURS = Number.isFinite(Number(EVENT_PAGE_LOCKS_CONFIG.defaultDurationHours))
  ? Number(EVENT_PAGE_LOCKS_CONFIG.defaultDurationHours)
  : 0;
const MAGIC_LINK_HOST_DEFAULTS = {
  "revelrylabs.eeos.work": {
    companyName: "Revelry Labs",
    adminName: "Jennifer Baldwin"
  },
  "testing.eeos.work": {
    companyName: "Revelry Labs (Testing)",
    adminName: "Jennifer Baldwin"
  },
  ...((APP_CONFIG.magicLinks && APP_CONFIG.magicLinks.hostDefaults) || {})
};
const MAGIC_LINK_SETUP_DEFAULTS = {
  "revelrylabs.eeos.work/rlabs2026a1b2c3d4": {
    totalBudget: 390,
    employeeCount: 39,
    perEmployee: 15,
    localCity: "New Orleans"
  },
  "susco.eeos.work/susco2026a7d4k9m2": {
    localCity: "New Orleans",
    forceLocalCity: true
  },
  "testing.eeos.work/rlabs2026testa1b2c3d4": {
    totalBudget: 390,
    employeeCount: 39,
    perEmployee: 15,
    localCity: "New Orleans"
  }
};
const MAGIC_LINK_WORKFLOW_DEFAULTS = {
  "revelrylabs.eeos.work/rlabs2026a1b2c3d4": EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE,
  "testing.eeos.work/rlabs2026testa1b2c3d4": EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE
};
const MAGIC_LINK_AUTH_DEFAULTS = {
  "revelrylabs.eeos.work/rlabs2026a1b2c3d4": {
    companyName: "Revelry Labs",
    email: "jennifer.baldwin@revelry.co"
  },
  "testing.eeos.work/rlabs2026testa1b2c3d4": {
    companyName: "Revelry Labs (Testing)",
    email: "jennifer.baldwin+testing@revelry.co"
  }
};
const MAGIC_LINK_PAGE_TITLES = {
  "revelrylabs.eeos.work/rlabs2026a1b2c3d4": "EEOS | Revelry Labs",
  "testing.eeos.work/rlabs2026testa1b2c3d4": "EEOS | Revelry Labs (Testing)"
};
const TESTING_MAGIC_LINK_KEYS = new Set([
  "testing.eeos.work/rlabs2026testa1b2c3d4"
]);
const REVELRY_BRACKETS_MAGIC_LINK_KEYS = new Set([
  "revelrylabs.eeos.work/rlabs2026a1b2c3d4",
  "testing.eeos.work/rlabs2026testa1b2c3d4"
]);
const REVELRY_GOAL_PRIORITY_ORDER = [
  "Support employee wellbeing",
  "Strengthen team connection",
  "Improve employee performance",
  "Boost morale"
];
const REVELRY_GOAL_EVENT_MAP_HIGH_BUDGET = {
  "Support employee wellbeing": {
    templateId: "revelry-goal-wellbeing",
    title: "Elixir Making Class",
    description: "A guided wellness-focused team experience centered on creating restorative elixirs together.",
    url: "https://www.withconfetti.com/product/virtual-wellness-elixir-making-class",
    imageUrl: "https://ucarecdn.com/6c9ffa95-6119-4a02-8b89-ff6b6b363116/-/preview/580x326/-/quality/lighter/",
    pills: ["Wellbeing", "Creative Skill"]
  },
  "Strengthen team connection": {
    templateId: "revelry-goal-team-connection",
    title: "Virtual Funnel Cake Class",
    description: "A shared food experience designed to spark connection and fun across the team.",
    url: "https://www.withconfetti.com/product/virtual-funnel-cake-class",
    imageUrl: "https://ucarecdn.com/a5cf1674-5669-4c6a-a1c2-f92054051848/-/preview/580x326/-/quality/lighter/",
    pills: ["Food & Drink", "Creative Skill"]
  },
  "Improve employee performance": {
    templateId: "revelry-goal-performance",
    title: "Champion Mindset for Professionals",
    description: "A practical session focused on mindset habits that improve individual and team performance.",
    url: "https://www.withconfetti.com/product/virtual-champion-mindset-for-professionals",
    imageUrl: "https://ucarecdn.com/f1ceef12-77da-4e6f-a953-9d6acd5ffcc0/-/preview/580x326/-/quality/lighter/",
    pills: ["Productivity", "Pro Dev"]
  },
  "Boost morale": {
    templateId: "revelry-goal-retention",
    title: "Virtual Murder Mystery Party",
    description: "A social, high-energy event that drives participation and team engagement.",
    url: "https://www.withconfetti.com/product/virtual-murder-mystery-party",
    imageUrl: "https://ucarecdn.com/f788f0a4-781c-4e6f-b7f7-bb36b78b11b9/-/preview/580x326/-/quality/lighter/",
    pills: ["Fun/Social", "Team Connection"]
  }
};

function getNestedValueByPath(source, path) {
  if (!source || typeof source !== "object") return undefined;
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath) return undefined;
  return normalizedPath.split(".").reduce((cursor, part) => {
    if (cursor === null || cursor === undefined) return undefined;
    return cursor[part];
  }, source);
}

function getCurrentEventTemplateIdForLocks() {
  const fromLaunchContext = String(state?.eventLaunchContext?.templateId || "").trim();
  if (fromLaunchContext) return fromLaunchContext;
  return String(state?.pollBuilder?.chosenEventId || "").trim();
}

function getEventPageLockRule(templateId = "", pageKey = "") {
  const normalizedTemplateId = String(templateId || "").trim();
  const normalizedPageKey = String(pageKey || "").trim();
  if (!normalizedPageKey) return null;

  const exactKey = normalizedTemplateId ? `${normalizedTemplateId}:${normalizedPageKey}` : "";
  const wildcardKey = `*:${normalizedPageKey}`;

  const candidate = (exactKey && EVENT_PAGE_LOCK_RULES[exactKey]) || EVENT_PAGE_LOCK_RULES[wildcardKey] || null;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate;
}

function getEventPageLockDurationMs(rule = null, fallbackMs = 0) {
  if (!rule || typeof rule !== "object") {
    return Number.isFinite(Number(fallbackMs)) ? Number(fallbackMs) : 0;
  }

  const explicitMinutes = Number(rule.durationMinutes);
  if (Number.isFinite(explicitMinutes) && explicitMinutes > 0) {
    return Math.round(explicitMinutes * 60 * 1000);
  }

  const explicitHours = Number(rule.durationHours);
  if (Number.isFinite(explicitHours) && explicitHours > 0) {
    return Math.round(explicitHours * 60 * 60 * 1000);
  }

  if (EVENT_PAGE_LOCK_DEFAULT_DURATION_HOURS > 0) {
    return Math.round(EVENT_PAGE_LOCK_DEFAULT_DURATION_HOURS * 60 * 60 * 1000);
  }

  return Number.isFinite(Number(fallbackMs)) ? Number(fallbackMs) : 0;
}

function resolveEventPageLockAnchorIso(rule = null, explicitAnchorIso = "") {
  const direct = String(explicitAnchorIso || "").trim();
  if (direct) return direct;
  if (!rule || typeof rule !== "object") return "";

  const anchorPath = String(rule.anchorPath || "").trim();
  if (!anchorPath) return "";
  const anchoredValue = getNestedValueByPath(state, anchorPath);
  return String(anchoredValue || "").trim();
}

function evaluateEventPageLock(options = {}) {
  const templateId = String(options.templateId || getCurrentEventTemplateIdForLocks() || "").trim();
  const pageKey = String(options.pageKey || "").trim();
  const fallbackMs = Number.isFinite(Number(options.fallbackDurationMs)) ? Number(options.fallbackDurationMs) : 0;
  const fallbackAnchorIso = String(options.anchorAt || "").trim();

  const rule = getEventPageLockRule(templateId, pageKey);
  const anchorIso = resolveEventPageLockAnchorIso(rule, fallbackAnchorIso);
  const anchorDate = anchorIso ? new Date(anchorIso) : null;
  const hasValidAnchor = !!anchorDate && !Number.isNaN(anchorDate.getTime());
  if (!hasValidAnchor) {
    return {
      configured: Boolean(rule),
      locked: false,
      templateId,
      pageKey,
      anchorAt: "",
      lockEndsAt: "",
      remainingMs: 0,
      reason: "missing_anchor"
    };
  }

  const durationMs = getEventPageLockDurationMs(rule, fallbackMs);
  if (!(durationMs > 0)) {
    return {
      configured: Boolean(rule),
      locked: false,
      templateId,
      pageKey,
      anchorAt: anchorDate.toISOString(),
      lockEndsAt: anchorDate.toISOString(),
      remainingMs: 0,
      reason: "no_duration"
    };
  }

  const lockEndsDate = new Date(anchorDate.getTime() + durationMs);
  const now = Date.now();
  const remainingMs = Math.max(0, lockEndsDate.getTime() - now);

  return {
    configured: Boolean(rule),
    locked: remainingMs > 0,
    templateId,
    pageKey,
    anchorAt: anchorDate.toISOString(),
    lockEndsAt: lockEndsDate.toISOString(),
    remainingMs,
    reason: "ok"
  };
}

function formatLockDateLabel(lockEndsAtIso = "") {
  const iso = String(lockEndsAtIso || "").trim();
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getRuleDrivenStepLockMeta(stepKey = "", options = {}) {
  const normalizedStepKey = String(stepKey || "").trim();
  if (!normalizedStepKey) {
    return { locked: false, dateLabel: "", configured: false, pageKey: "", lockEndsAt: "" };
  }

  const pageScope = String(options.pageScope || "").trim();
  const alreadyDone = Boolean(options.alreadyDone);
  const pageKey = pageScope ? `${pageScope}_${normalizedStepKey}` : normalizedStepKey;
  const lockResult = evaluateEventPageLock({ pageKey });
  const dateLabel = formatLockDateLabel(lockResult.lockEndsAt);

  return {
    locked: Boolean(lockResult.configured && lockResult.locked && !alreadyDone),
    dateLabel,
    configured: Boolean(lockResult.configured),
    pageKey,
    lockEndsAt: String(lockResult.lockEndsAt || "")
  };
}

const REVELRY_GOAL_EVENT_MAP_MID_BUDGET = {
  "Support employee wellbeing": {
    templateId: "revelry-goal-wellbeing-mid",
    title: "Virtual Bucket List Workshop",
    description: "A collaborative workshop designed to spark motivation, reflection, and personal growth across the team.",
    url: "https://www.withconfetti.com/product/virtual-bucket-list-workshop",
    imageUrl: "https://ucarecdn.com/5d0ca8d4-e22e-4de3-9295-ae18234d02d3/-/preview/580x326/-/quality/lighter/",
    pills: ["Team Connection", "Wellbeing"]
  },
  "Strengthen team connection": {
    templateId: "revelry-goal-team-connection-mid",
    title: "Virtual Live City Tours",
    description: "A shared guided experience that brings teams together through live exploration and conversation.",
    url: "https://www.withconfetti.com/product/virtual-live-city-tours",
    imageUrl: "https://ucarecdn.com/ca73a96d-5712-4e31-94c6-752e7e64ad73/-/preview/580x326/-/quality/lighter/",
    pills: ["Team Connection", "Engagement"]
  },
  "Improve employee performance": {
    templateId: "revelry-goal-performance-mid",
    title: "Culture Club: Self-Doubt to Confidence",
    description: "A practical session focused on confidence-building tools that support stronger day-to-day performance.",
    url: "https://www.withconfetti.com/product/virtual-culture-club-self-doubt-to-confidence",
    imageUrl: "https://ucarecdn.com/80daf2a8-fe7c-41c7-ac4c-3d8d246b6cd9/-/preview/580x326/-/quality/lighter/",
    pills: ["Productivity", "Wellbeing"]
  },
  "Boost morale": {
    templateId: "revelry-goal-retention-mid",
    title: "Virtual Office Olympics",
    description: "A high-energy team activity that encourages participation, connection, and ongoing engagement.",
    url: "https://www.withconfetti.com/product/virtual-office-olympics",
    imageUrl: "https://ucarecdn.com/0d565892-6577-4379-9826-82cd10798264/-/preview/580x326/-/quality/lighter/",
    pills: ["Engagement", "Fun/Social"]
  }
};

function getRevelryMonthlyBudgetInput() {
  const draftMode = String(state?.landingDraft?.budgetMode || "").trim();
  const draftTotal = Number(state?.landingDraft?.totalBudget || 0);
  const draftPerEmployee = Number(state?.landingDraft?.perEmployee || 0);
  const draftEmployees = Number(state?.landingDraft?.employeeCount || 0);
  const hasDraftBudget = Boolean(state?.landingDraft?.budgetConfigured);

  if (hasDraftBudget) {
    if (draftMode === "perEmployee") {
      const computedDraftTotal = draftPerEmployee * draftEmployees;
      if (computedDraftTotal > 0) return computedDraftTotal;
    }
    if (draftTotal > 0) return draftTotal;
  }

  const programMode = String(state?.programSettings?.budgetMode || "").trim();
  const programTotal = Number(state?.programSettings?.totalBudget || 0);
  const programPerEmployee = Number(state?.programSettings?.perEmployeeBudget || 0);
  const programEmployees = Number(state?.programSettings?.employeeCount || 0);

  if (programMode === "perEmployee") {
    const computedProgramTotal = programPerEmployee * programEmployees;
    if (computedProgramTotal > 0) return computedProgramTotal;
  }
  if (programTotal > 0) return programTotal;

  return 0;
}

function getRevelryGoalEventMapForBudget(monthlyBudget = 0) {
  const normalizedBudget = Number(monthlyBudget || 0);
  if (normalizedBudget >= 1170) {
    return REVELRY_GOAL_EVENT_MAP_HIGH_BUDGET;
  }
  if (normalizedBudget >= 585 && normalizedBudget <= 1169) {
    return REVELRY_GOAL_EVENT_MAP_MID_BUDGET;
  }
  // For budgets below the specified ranges, default to the mid-budget set.
  return REVELRY_GOAL_EVENT_MAP_MID_BUDGET;
}

function getSeededFreeEventTemplates() {
  return [
    {
      id: "5_day_energy_reset_challenge",
      templateId: "5_day_energy_reset_challenge",
      title: "5-Day Energy Reset Challenge",
      description: "A lightweight async Slack challenge to reset team energy with daily prompts.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "coffee_meetup",
      templateId: "coffee_meetup",
      title: "Coffee Meetup",
      description: "A casual team coffee chat to spark connection and conversation.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "clarity_week",
      templateId: "clarity_week",
      title: "Clarity Week",
      description: "An async Slack focus week with short prompts to improve clarity and momentum.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "lunch_and_listen",
      templateId: "lunch_and_listen",
      title: "Lunch & Listen",
      description: "A free remote lunch session where teammates share updates and stories.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "focus_thread",
      templateId: "focus_thread",
      title: "Focus Thread",
      description: "An async Slack thread designed to protect focus and celebrate deep-work wins.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "wind_down",
      templateId: "wind_down",
      title: "Wind Down",
      description: "A free remote end-of-week check-in to celebrate progress together.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    },
    {
      id: "ama_teammate_edition",
      templateId: "ama_teammate_edition",
      title: "AMA: Teammate Edition",
      description: "An async Slack AMA that helps teammates connect through shared questions.",
      type: "rsvp",
      workflowType: "rsvp",
      costPerPerson: 0,
      estimatedCost: 0,
      url: "",
      eventLocationType: "virtual"
    }
  ];
}

function getSeededFreeEventTemplateById(templateId = "") {
  const normalizedTemplateId = String(templateId || "").trim();
  if (!normalizedTemplateId) return null;
  const seeded = getSeededFreeEventTemplates();
  return seeded.find((item) => String(item.templateId || item.id || "").trim() === normalizedTemplateId) || null;
}

function hasFixedProgramWeekLayout(program) {
  return Boolean(program && Array.isArray(program.weeks) && program.weeks.length > 0);
}

function seedFirstMonthFreeEvents(program) {
  if (!program || typeof program !== "object") return program;
  if (hasFixedProgramWeekLayout(program)) return program;
  const seededEvents = getSeededFreeEventTemplates();
  const existingEvents = Array.isArray(program.events) ? [...program.events] : [];
  const firstSeed = seededEvents[0];

  const monthOneSeedCard = {
    month: 1,
    isSeededFreeMonth: true,
    title: firstSeed.title,
    description: firstSeed.description,
    templateId: firstSeed.templateId,
    type: firstSeed.type,
    workflowType: firstSeed.workflowType,
    estimatedCost: 0,
    goals: ["Strengthen team connection"],
    seededEvents: seededEvents.map((item) => ({
      templateId: item.templateId,
      title: item.title,
      description: item.description,
      type: item.type,
      workflowType: item.workflowType,
      estimatedCost: 0,
      url: item.url,
      costPerPerson: 0,
      eventLocationType: item.eventLocationType
    })),
    launchReadyTemplateId: firstSeed.templateId
  };

  if (existingEvents.length > 0) {
    existingEvents[0] = monthOneSeedCard;
  } else {
    existingEvents.push(monthOneSeedCard);
  }

  const totalEstimatedCost = existingEvents.reduce((sum, eventItem) => {
    const cost = Number(eventItem?.estimatedCost || 0);
    return cost > 0 ? sum + cost : sum;
  }, 0);

  return {
    ...program,
    events: existingEvents,
    totalEstimatedCost,
    remainingBudget: Math.max(0, Number(program.totalBudget || 0) - totalEstimatedCost)
  };
}

const TESTING_MAGIC_QUERY_PROFILES = {
  "revelry-test": {
    companyName: "Revelry Labs (Testing)",
    adminName: "Jennifer Baldwin",
    companyIdHint: "revelry-labs-testing",
    setupDefaults: {
      totalBudget: 390,
      employeeCount: 39,
      perEmployee: 15,
      localCity: "New Orleans"
    },
    workflowDefault: EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE,
    pageTitle: "EEOS | Revelry Labs (Testing)"
  }
};

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
const MAGIC_LINK_AUTH_STAGE_PREFIX = "eeos.magicLink.authStage::";

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
  totalBudgetRange: "",
  perEmployeeBudget: 75,
  perEmployeeBudgetRange: "",
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
mainView: "dashboard",
browserTabs: [],
activeBrowserTabId: null,
landingIdentityMode: "generic",
landingIdentityCommitted: false,
appIdentityCommitted: false,
landingBuilderStarted: false,
landingFirstEventLaunched: false,
programLaunchMonday: null,
setupCompleted: true,
setupMenuExpanded: false,
sidebarSetupAutoCollapsed: false, // triggers one-time auto-collapse after final setup step
sidebarActiveSection: "setup",
sidebarEventWorkflowExpanded: false,
devBypassSetupEditAuth: true,
debugModeOn: false,
currentSetupStep: 1,
completedSetupSteps: [],
setupEventsGenerated: false,
setupShortlistMode: "poll",
mainSetupExpandAll: false,
eventWorkflowProcessStep: 7,
eventLaunchContext: createEmptyEventLaunchContext(),
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
  chosenEventLabel: "",
  eventLocationType: "virtual",
  costPerPerson: 50,
  rsvpDeadlineDateTime: "",
  vendorBookingUrl: "",
  bookingConfirmation: null,
  scheduleEntries: [],
  energyResetLaunch: null
},
promoteEvent: {
  activeStep: "calendar",
  announcementLockedAfterContinue: false,
  reminderWeekLockedAfterContinue: false,
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
  budgetConfigured: false,
  budgetMode: "total",
  totalBudget: 3000,
  totalBudgetRange: "",
  employeeCount: 0,
  perEmployee: 0,
  perEmployeeBudgetRange: "",
  cadence: "Monthly",
  goals: [],
  teamPreferenceEstimate: [],
  schedule: [],
  daysSelected: ["Th", "Sa"],
  timesSelected: ["After 5p"],
  localCity: "",
  workEmail: "",
  surveyAnswers: {}
},
fourMonthProgram: null,
landingTypeformComplete: false
};




let supabaseClient = null;
let identityEditMode = false;
let isSidebarHydrating = false;
let cloudSaveDebounceTimer = null;
let d1WorkflowSyncDebounceTimer = null;
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

async function resetTestingWorkspace() {
  return apiRequest("/testing/reset-workspace", {
    method: "POST",
    body: {}
  });
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

async function authSignup(email, password, companyName, magicLink = null) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: {
      email,
      password,
      companyName,
      magicLink: magicLink && typeof magicLink === "object" ? {
        host: String(magicLink.host || "").trim().toLowerCase(),
        tokenId: String(magicLink.tokenId || "").trim()
      } : null
    }
  });
}

async function authLogin(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });
}

async function authMagicLinkRequest(email) {
  return apiRequest("/auth/magic-link/request", {
    method: "POST",
    body: { email }
  });
}

async function authMagicLinkRedeem(token) {
  return apiRequest("/auth/magic-link/redeem", {
    method: "POST",
    body: { token }
  });
}

async function onboardingEmailSave(payload) {
  return apiRequest("/onboarding/email-save", {
    method: "POST",
    body: payload
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

function parseMagicLinkFromHostPath() {
  const host = String(window.location.hostname || "").trim().toLowerCase();
  const path = String(window.location.pathname || "").trim();
  if (!host || host === "eeos.work" || host === "www.eeos.work" || host === "localhost") {
    return null;
  }

  const hostDefaultTokenMap = {
    "testing.eeos.work": "rlabs2026testa1b2c3d4"
  };

  const firstSegment = path.replace(/^\/+/, "").split("/")[0] || "";
  let tokenId = String(firstSegment || "").trim();
  const isValidToken = /^[A-Za-z0-9_-]{8,128}$/.test(tokenId);
  if (!isValidToken) {
    tokenId = String(hostDefaultTokenMap[host] || "").trim();
  }
  if (!tokenId || !/^[A-Za-z0-9_-]{8,128}$/.test(tokenId)) {
    return null;
  }

  return { host, tokenId };
}

function isRevelryLabsReadOnlyMagicLink() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return false;
  return parsed.host === "revelrylabs.eeos.work" && parsed.tokenId === "rlabs2026a1b2c3d4";
}

function isRevelryLeaderboardLockEnabled() {
  return isRevelryLabsReadOnlyMagicLink();
}

function getMagicLinkAuthStageKey(parsedMagicLink = null) {
  const host = String(parsedMagicLink?.host || "").trim().toLowerCase();
  const tokenId = String(parsedMagicLink?.tokenId || "").trim();
  if (!host || !tokenId) return "";
  return `${MAGIC_LINK_AUTH_STAGE_PREFIX}${host}/${tokenId}`;
}

function getMagicLinkAuthStage(parsedMagicLink = null) {
  const key = getMagicLinkAuthStageKey(parsedMagicLink);
  if (!key) return "";
  try {
    return String(localStorage.getItem(key) || "").trim().toLowerCase();
  } catch (_error) {
    return "";
  }
}

function setMagicLinkAuthStage(parsedMagicLink = null, stage = "") {
  const key = getMagicLinkAuthStageKey(parsedMagicLink);
  if (!key) return;
  const normalized = String(stage || "").trim().toLowerCase();
  try {
    if (normalized === "signin") {
      localStorage.setItem(key, "signin");
    } else if (!normalized) {
      localStorage.removeItem(key);
    }
  } catch (_error) {
    // Non-fatal storage failure; default modal behavior will remain available.
  }
}

function applyResolvedMagicIdentity(identity = {}) {
  const company = String(identity.companyNameDefault || identity.companyName || "").trim();
  const admin = String(identity.adminNameDefault || identity.adminName || "").trim();
  if (!company && !admin) return;

  state.landingIdentityMode = "magic";
  if (company && !String(state.companyName || "").trim()) {
    state.companyName = company;
  }
  if (admin && !String(state.adminName || "").trim()) {
    state.adminName = admin;
  }
}

function applyMagicLinkSetupDefaults(parsedMagicLink = null) {
  const host = String(parsedMagicLink?.host || "").trim().toLowerCase();
  const tokenId = String(parsedMagicLink?.tokenId || "").trim();
  if (!host || !tokenId) return;

  const defaults = MAGIC_LINK_SETUP_DEFAULTS[`${host}/${tokenId}`];
  if (!defaults || typeof defaults !== "object") return;

  const currentLocalCity = String(state?.landingDraft?.localCity || "").trim();

  const shouldSetCity = defaults.forceLocalCity === true || !currentLocalCity;

  if (shouldSetCity) {
    state.landingDraft.localCity = String(defaults.localCity || "").trim();
  }

  const workflowDefault = MAGIC_LINK_WORKFLOW_DEFAULTS[`${host}/${tokenId}`];
  if (workflowDefault) {
    normalizeEventLaunchContext();
    const hasExplicitLaunchContext = String(state.eventLaunchContext?.templateId || "").trim().length > 0;
    const preLaunchPhase = Number(state.currentSetupStep || 1) <= EVENT_WORKFLOW_STEPS.SHORTLIST;
    if (!hasExplicitLaunchContext || preLaunchPhase) {
      state.eventLaunchContext.workflowType = workflowDefault;
    }
  }
}

function getMagicLinkSetupDefaultsForCurrentPath() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return null;
  return MAGIC_LINK_SETUP_DEFAULTS[`${parsed.host}/${parsed.tokenId}`] || null;
}

function getMagicLinkContextKey(parsedMagicLink = null) {
  const parsed = parsedMagicLink || parseMagicLinkFromHostPath();
  if (!parsed) return "";
  const host = String(parsed.host || "").trim().toLowerCase();
  const tokenId = String(parsed.tokenId || "").trim();
  if (!host || !tokenId) return "";
  return `${host}/${tokenId}`;
}

function isGenericLandingMirrorMagicContext() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return false;
  const key = getMagicLinkContextKey(parsed);
  if (!key) return false;
  if (isRevelryLabsReadOnlyMagicLink()) return false;
  if (REVELRY_BRACKETS_MAGIC_LINK_KEYS.has(key)) return false;
  return true;
}

function toPossessiveLabel(name = "") {
  const base = String(name || "").trim();
  if (!base) return "";
  return /s$/i.test(base) ? `${base}'` : `${base}'s`;
}

function applyMagicLandingHeaderBranding() {
  const landingHeaderSignIn = $("landingHeaderSignIn");
  const ltfStartBtn = $("ltfStartBtn");
  if (!landingHeaderSignIn) return;

  if (isGenericLandingMirrorMagicContext()) {
    const parsed = parseMagicLinkFromHostPath();
    const host = String(parsed?.host || "").trim().toLowerCase();
    const slug = host.split(".")[0] || "";
    const fallbackName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Your Company";
    const companyName = String(state.companyName || MAGIC_LINK_HOST_DEFAULTS[host]?.companyName || fallbackName).trim() || fallbackName;
    const possessive = toPossessiveLabel(companyName) || "Your Company's";
    if (ltfStartBtn) ltfStartBtn.textContent = `Build ${possessive} People Plan \u2192`;
  } else {
    if (ltfStartBtn) ltfStartBtn.textContent = "Build Your People Plan \u2192";
  }

  landingHeaderSignIn.textContent = "Log in";
  landingHeaderSignIn.style.display = "";
  landingHeaderSignIn.style.fontWeight = "";
  landingHeaderSignIn.style.cursor = "";
  landingHeaderSignIn.setAttribute("onclick", "openAuthGateWithContext('signin')");
  landingHeaderSignIn.removeAttribute("aria-disabled");
}

function enforceGenericLandingMagicMode() {
  if (!isGenericLandingMirrorMagicContext()) return;
  state.landingBuilderStarted = false;
  state.landingTypeformComplete = false;
  state.setupEventsGenerated = false;
  state.currentSetupStep = 1;
  state.completedSetupSteps = [];
}

function getMagicLinkAuthDefaultsForCurrentPath() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return null;
  return MAGIC_LINK_AUTH_DEFAULTS[`${parsed.host}/${parsed.tokenId}`] || null;
}

function applyMagicLinkPageTitleFromCurrentPath() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) {
    const params = new URLSearchParams(window.location.search || "");
    const profileKey = String(params.get("magicProfile") || "").trim().toLowerCase();
    const profile = TESTING_MAGIC_QUERY_PROFILES[profileKey] || null;
    document.title = profile?.pageTitle || "EEOS";
    return;
  }
  const key = `${parsed.host}/${parsed.tokenId}`;
  document.title = MAGIC_LINK_PAGE_TITLES[key] || "EEOS";
}

function getTestingMagicQueryProfile() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const profileKey = String(params.get("magicProfile") || "").trim().toLowerCase();
    if (!profileKey) return null;
    const profile = TESTING_MAGIC_QUERY_PROFILES[profileKey] || null;
    if (!profile) return null;
    return { profileKey, profile };
  } catch (_error) {
    return null;
  }
}

function isRevelryBracketsMagicContext() {
  if (isRevelryLabsReadOnlyMagicLink()) return true;

  const parsed = parseMagicLinkFromHostPath();
  if (parsed) {
    const key = `${parsed.host}/${parsed.tokenId}`;
    if (REVELRY_BRACKETS_MAGIC_LINK_KEYS.has(key)) return true;
  }

  const queryProfile = getTestingMagicQueryProfile();
  return String(queryProfile?.profileKey || "") === "revelry-test";
}

function getRevelryGoalBasedRecommendations(rawGoals = []) {
  // Parse selected goals
  const selectedGoals = Array.isArray(rawGoals)
    ? rawGoals.map((goal) => String(goal || "").trim()).filter(Boolean)
    : [];
  const selectedGoalSet = new Set(selectedGoals);

  if (selectedGoalSet.size === 0) return [];

  // Get budget and team info from current program settings
  const monthlyBudget = getRevelryMonthlyBudgetInput();
  const teamSize = Number(state?.programSettings?.employeeCount || 1);

  // Safety checks
  if (!(monthlyBudget > 0) || !(teamSize > 0)) return [];

  // Get offerings catalog
  const offerings = Array.isArray(window.EVENT_OFFERINGS) ? window.EVENT_OFFERINGS : [];
  if (offerings.length === 0) return [];

  // Filter offerings: match goals AND fit within budget
  const budgetFitOfferings = offerings
    .filter((offering) => {
      // Check if this offering matches any of the selected goals
      const offeringGoalKeys = Array.isArray(offering.goalKeys)
        ? offering.goalKeys.map((k) => String(k || "").trim().toLowerCase())
        : [];
      if (offeringGoalKeys.length === 0) return false;

      const hasGoalMatch = offeringGoalKeys.some((goalKey) => {
        // Compare normalized
        return selectedGoalSet.has(goalKey) || selectedGoalSet.has(goalKey.replace(/_/g, " "));
      });
      return hasGoalMatch;
    })
    .filter((offering) => {
      // Check if cost fits within budget
      const costPerPerson = Number(offering.costPerPerson || 0);
      const totalEventCost = costPerPerson * teamSize;
      // Be conservative: a single event should not exceed the monthly budget
      return totalEventCost <= monthlyBudget;
    })
    .map((offering) => {
      const costPerPerson = Number(offering.costPerPerson || 0);
      const totalEventCost = costPerPerson * teamSize;
      return {
        id: offering.id,
        templateId: offering.id,
        name: offering.title,
        title: offering.title,
        description: offering.description,
        url: offering.registrationLink || offering.vendorUrl || "",
        imageUrl: "",
        type: "external",
        cost_per_person: costPerPerson,
        estimatedCost: totalEventCost,
        goals: Array.isArray(offering.goalKeys) ? [...offering.goalKeys] : [],
        recommendationPills: []
      };
    })
    .slice(0, 3);

  return budgetFitOfferings;
}

function getActiveTestingMagicContext() {
  const queryProfile = getTestingMagicQueryProfile();
  if (queryProfile) {
    return {
      mode: "query-profile",
      profileKey: queryProfile.profileKey,
      profile: queryProfile.profile,
      companyIdHint: String(queryProfile.profile?.companyIdHint || "").trim()
    };
  }

  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return null;
  const key = `${parsed.host}/${parsed.tokenId}`;
  if (!TESTING_MAGIC_LINK_KEYS.has(key)) return null;

  return {
    mode: "magic-link",
    profileKey: "",
    profile: null,
    companyIdHint: "revelry-labs-testing"
  };
}

function clearTestingLocalState(context = null) {
  const resolvedContext = context || getActiveTestingMagicContext();
  const profileCompanyIdHint = String(resolvedContext?.companyIdHint || "").trim();
  const accountIdsToClear = ["anon"];
  if (profileCompanyIdHint) accountIdsToClear.push(profileCompanyIdHint);

  accountIdsToClear.forEach((accountId) => {
    localStorage.removeItem(getStorageKey(accountId));
    localStorage.removeItem(getSidebarSnapshotKey(accountId));
    localStorage.removeItem(getGlobalToAccountMigrationKey(accountId));
  });

  const parsed = parseMagicLinkFromHostPath();
  if (parsed?.host && parsed?.tokenId) {
    const stageKey = getMagicLinkAuthStageKey(parsed);
    if (stageKey) localStorage.removeItem(stageKey);
  }

  if (profileCompanyIdHint && String(getAuthCompanyId() || "").trim() === profileCompanyIdHint) {
    clearAuthSession();
  }
}

async function resetTestingWorkspaceFromUi() {
  const context = getActiveTestingMagicContext();
  if (!context) return;

  const confirmed = window.confirm("Reset testing workspace data and reload? This will not affect production Revelry data.");
  if (!confirmed) return;

  let backendResetAttempted = false;
  let backendResetSucceeded = false;
  const authToken = getAuthToken();
  const authCompanyId = String(getAuthCompanyId() || "").trim();
  const contextCompanyId = String(context.companyIdHint || "").trim();
  const shouldAttemptBackendReset = Boolean(authToken) && Boolean(contextCompanyId) && authCompanyId === contextCompanyId;

  if (shouldAttemptBackendReset) {
    backendResetAttempted = true;
    try {
      await resetTestingWorkspace();
      backendResetSucceeded = true;
    } catch (error) {
      console.warn("Testing backend reset failed", error?.message || error);
    }
  }

  clearTestingLocalState(context);

  if (backendResetAttempted && !backendResetSucceeded) {
    window.alert("Local testing data was reset. Backend testing reset did not complete (you can run npm run cf:d1:reset:revelry-test). Reloading now.");
  }

  window.location.reload();
}

function applyTestingMagicProfileFromQuery() {
  const resolved = getTestingMagicQueryProfile();
  if (!resolved) return;

  const { profile } = resolved;
  state.landingIdentityMode = "magic";
  if (!String(state.companyName || "").trim()) state.companyName = String(profile.companyName || "").trim();
  if (!String(state.adminName || "").trim()) state.adminName = String(profile.adminName || "").trim();

  const defaults = profile.setupDefaults && typeof profile.setupDefaults === "object"
    ? profile.setupDefaults
    : null;
  if (defaults) {
    const currentLocalCity = String(state?.landingDraft?.localCity || "").trim();

    if (!currentLocalCity) {
      state.landingDraft.localCity = String(defaults.localCity || "").trim();
    }
  }

  if (profile.workflowDefault) {
    normalizeEventLaunchContext();
    const hasExplicitLaunchContext = String(state.eventLaunchContext?.templateId || "").trim().length > 0;
    const preLaunchPhase = Number(state.currentSetupStep || 1) <= EVENT_WORKFLOW_STEPS.SHORTLIST;
    if (!hasExplicitLaunchContext || preLaunchPhase) {
      state.eventLaunchContext.workflowType = profile.workflowDefault;
    }
  }
}

function applyTestingResetFromQueryBeforeLoad() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const shouldReset = String(params.get("resetTestingData") || "").trim() === "1";
    if (!shouldReset) return;
    clearTestingLocalState();
  } catch (error) {
    console.warn("Failed to apply testing reset from query", error);
  }
}

async function applyLandingIdentityFromMagicLinkHostPath() {
  const parsed = parseMagicLinkFromHostPath();
  if (!parsed) return;

  const fallbackIdentity = MAGIC_LINK_HOST_DEFAULTS[parsed.host] || {};
  try {
    const response = await apiRequest("/magic-links/resolve", {
      method: "POST",
      body: {
        host: parsed.host,
        tokenId: parsed.tokenId,
        client: {
          appVersion: "web-2026.03",
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        }
      }
    });
    const root = (response?.data && typeof response.data === "object") ? response.data : response;
    applyResolvedMagicIdentity(root?.workspace || fallbackIdentity);
    applyMagicLinkSetupDefaults(parsed);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const isInvalidLink = message.includes("not found")
      || message.includes("invalid")
      || message.includes("expired")
      || message.includes("inactive")
      || message.includes("magic link");

    // Invalid links should fall back to generic mode; network failures may still use safe host defaults.
    if (isInvalidLink) {
      state.landingIdentityMode = "generic";
    } else {
      applyResolvedMagicIdentity(fallbackIdentity);
      applyMagicLinkSetupDefaults(parsed);
    }
    console.warn("Magic link resolve failed", error?.message || error);
  }

  applyPinnedIdentity();
}

function readStoredStateByAccountId(accountId = "") {
  try {
    const raw = localStorage.getItem(getStorageKey(accountId));
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function buildDraftPayload(sourceState = null) {
  if (!sourceState || typeof sourceState !== "object") return null;
  const landingDraft = sourceState.landingDraft && typeof sourceState.landingDraft === "object"
    ? clone(sourceState.landingDraft)
    : null;
  const programSettings = sourceState.programSettings && typeof sourceState.programSettings === "object"
    ? clone(sourceState.programSettings)
    : null;
  if (!landingDraft && !programSettings) return null;

  return {
    landingDraft,
    programSettings,
    completedSetupSteps: Array.isArray(sourceState.completedSetupSteps) ? [...sourceState.completedSetupSteps] : [],
    setupCompleted: Boolean(sourceState.setupCompleted),
    clientDraftUpdatedAt: String(sourceState?.meta?.lastUpdated || "").trim() || new Date().toISOString()
  };
}

function getAnonymousDraftPayload() {
  const storedAnon = buildDraftPayload(readStoredStateByAccountId("anon"));
  if (storedAnon) return storedAnon;
  if (getEffectiveStorageAccountId() === "anon") {
    return buildDraftPayload(state);
  }
  return null;
}

function applyDraftPayloadToState(draftPayload) {
  if (!draftPayload || typeof draftPayload !== "object") return;
  if (draftPayload.landingDraft && typeof draftPayload.landingDraft === "object") {
    state.landingDraft = {
      ...state.landingDraft,
      ...clone(draftPayload.landingDraft)
    };
  }
  if (draftPayload.programSettings && typeof draftPayload.programSettings === "object") {
    state.programSettings = {
      ...state.programSettings,
      ...clone(draftPayload.programSettings)
    };
  }
  if (Array.isArray(draftPayload.completedSetupSteps)) {
    state.completedSetupSteps = [...new Set(draftPayload.completedSetupSteps.map((step) => Number(step || 0)).filter(Boolean))];
  }
  if (typeof draftPayload.setupCompleted === "boolean") {
    state.setupCompleted = draftPayload.setupCompleted;
  }
}

function clearAnonymousDraftStorage() {
  try {
    localStorage.removeItem(getStorageKey("anon"));
    localStorage.removeItem(getSidebarSnapshotKey("anon"));
    localStorage.removeItem(getGlobalToAccountMigrationKey("anon"));
  } catch (error) {
    console.warn("Failed to clear anonymous draft storage", error);
  }
}

async function syncSignupDraftToCloud(companyId, draftPayload, identity = {}) {
  const resolvedCompanyId = String(companyId || "").trim();
  if (!resolvedCompanyId) return false;

  const normalizedIdentity = {
    companyName: String(identity.companyName || state.companyName || "").trim(),
    adminName: String(identity.adminName || state.adminName || "").trim()
  };

  try {
    if (draftPayload) {
      const response = await apiRequest("/onboarding/migrate-draft", {
        method: "POST",
        body: {
          companyId: resolvedCompanyId,
          identity: normalizedIdentity,
          draft: {
            ...draftPayload,
            mergeMode: "if-empty-or-newer"
          },
          mergeMode: "if-empty-or-newer",
          clientDraftUpdatedAt: draftPayload.clientDraftUpdatedAt || new Date().toISOString()
        }
      });
      const root = (response?.data && typeof response.data === "object") ? response.data : response;
      if (root?.stateBlob && typeof root.stateBlob === "object") {
        const mergedState = mergeServerStateIntoLocal(clone(state), root.stateBlob, "");
        Object.keys(state).forEach((key) => delete state[key]);
        Object.assign(state, mergedState);
      } else {
        applyDraftPayloadToState(draftPayload);
      }
    }

    if (!String(state.companyName || "").trim() && normalizedIdentity.companyName) {
      state.companyName = normalizedIdentity.companyName;
    }
    if (!String(state.adminName || "").trim() && normalizedIdentity.adminName) {
      state.adminName = normalizedIdentity.adminName;
    }

    await saveCloudState(clone(state));
    clearAnonymousDraftStorage();
    persistState();
    return true;
  } catch (error) {
    console.warn("Signup draft migration API failed", error?.message || error);
  }

  try {
    if (draftPayload) {
      applyDraftPayloadToState(draftPayload);
    }
    if (!String(state.companyName || "").trim() && normalizedIdentity.companyName) {
      state.companyName = normalizedIdentity.companyName;
    }
    if (!String(state.adminName || "").trim() && normalizedIdentity.adminName) {
      state.adminName = normalizedIdentity.adminName;
    }
    await saveCloudState(clone(state));
    clearAnonymousDraftStorage();
    persistState();
    return true;
  } catch (error) {
    console.warn("Signup draft fallback sync failed", error?.message || error);
    return false;
  }
}

function normalizeRecommendedEvent(rawEvent, index = 0) {
  if (!rawEvent || typeof rawEvent !== "object") return null;
  return {
    id: String(rawEvent.id || rawEvent.event_id || `evt-${index + 1}`).trim(),
    name: String(rawEvent.name || rawEvent.event_name || `Event ${index + 1}`).trim(),
    description: String(rawEvent.description || "").trim(),
    url: String(rawEvent.url || "").trim(),
    cost_per_person: Number(rawEvent.cost_per_person ?? rawEvent.costPerPerson ?? 0),
    goals: Array.isArray(rawEvent.goals) ? [...rawEvent.goals] : [],
    schedules: Array.isArray(rawEvent.schedules) ? [...rawEvent.schedules] : [],
    type: String(rawEvent.type || "paid").trim(),
    score: Number(rawEvent.score || 0),
    rank: Number(rawEvent.rank || (index + 1))
  };
}

function buildProgramWeekSummary(program = state.fourMonthProgram) {
  if (!program || typeof program !== "object") return [];

  if (Array.isArray(program.weeks) && program.weeks.length) {
    return program.weeks.map((item, index) => ({
      week: Number(item?.week || (index + 1)),
      id: String(item?.templateId || item?.id || "").trim(),
      eventName: String(item?.title || item?.name || "").trim()
    }));
  }

  if (Array.isArray(program.events) && program.events.length) {
    return program.events.map((item, index) => ({
      week: Number(index + 1),
      id: String(item?.templateId || item?.id || "").trim(),
      eventName: String(item?.title || item?.name || "").trim()
    }));
  }

  return [];
}

async function redeemMagicLoginFromQueryIfPresent() {
  const params = new URLSearchParams(window.location.search || "");
  const oneTimeToken = String(params.get("magicLoginToken") || "").trim();
  if (!oneTimeToken) return null;

  try {
    const response = await authMagicLinkRedeem(oneTimeToken);
    const root = (response?.data && typeof response.data === "object") ? response.data : response;
    const token = String(root?.token || "").trim();
    const companyId = String(root?.companyId || "").trim();
    if (!token || !companyId) return null;

    setAuthSession(token, companyId);
    state.accountId = companyId;
    await hydrateCloudStateForSession(companyId);

    params.delete("magicLoginToken");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
    window.history.replaceState({}, "", nextUrl);
    showMiniToast("Logged in with magic link.");
    return companyId;
  } catch (error) {
    console.warn("Magic login redeem failed", error?.message || error);
    return null;
  }
}

async function syncWorkflowStateToDraft() {
  const resolvedCompanyId = String(state.accountId || "").trim();
  if (!resolvedCompanyId) return false;

  try {
    const draftPayload = {
      companyName: String(state.companyName || "").trim(),
      adminName: String(state.adminName || "").trim(),
      budgetMode: String(state.programSettings.budgetMode || "").trim(),
      totalBudget: Number(state.programSettings.totalBudget || 0),
      perEmployeeBudget: Number(state.programSettings.perEmployeeBudget || 0),
      employeeCount: Number(state.programSettings.employeeCount || 0),
      goals: Array.isArray(state.programSettings.goals) ? [...state.programSettings.goals] : [],
      cadence: String(state.programSettings.cadence || "").trim(),
      preferredSchedule: String(state.programSettings.preferredSchedule || "").trim(),
      daysSelected: Array.isArray(state.programSettings.daysSelected) ? [...state.programSettings.daysSelected] : [],
      timesSelected: Array.isArray(state.programSettings.timesSelected) ? [...state.programSettings.timesSelected] : [],
      localCity: String(state.programSettings.localCity || "").trim(),
      surveyAnswers: state.programSettings.surveyAnswers && typeof state.programSettings.surveyAnswers === "object" ? state.programSettings.surveyAnswers : {},
      setupCompleted: Boolean(state.setupCompleted),
      setupEventsGenerated: Boolean(state.setupEventsGenerated),
      currentSetupStep: Number(state.currentSetupStep || 0),
      completedSetupSteps: Array.isArray(state.completedSetupSteps) ? [...state.completedSetupSteps] : []
    };

    const response = await apiRequest("/onboarding/migrate-draft", {
      method: "POST",
      body: {
        companyId: resolvedCompanyId,
        draft: draftPayload,
        identity: {
          companyName: String(state.companyName || "").trim(),
          adminName: String(state.adminName || "").trim()
        },
        mergeMode: "if-empty-or-newer"
      }
    });

    if (response?.data?.migration?.applied) {
      console.log("Workflow state synced to D1");
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Failed to sync workflow state to D1", error?.message || error);
    return false;
  }
}

async function syncCloudRecommendations(companyId) {
  const resolvedCompanyId = String(companyId || state.accountId || "").trim();
  if (!resolvedCompanyId) return false;

  try {
    const response = await apiRequest("/recommendations/generate", {
      method: "POST",
      body: {
        companyId: resolvedCompanyId,
        context: {
          trigger: "post-signup-setup",
          cycleId: "current-cycle"
        },
        inputOverride: {
          programSettings: null
        }
      }
    });
    const root = (response?.data && typeof response.data === "object") ? response.data : response;
    const normalized = Array.isArray(root?.recommendations)
      ? root.recommendations.map((item, index) => normalizeRecommendedEvent(item, index)).filter(Boolean)
      : [];
    if (!normalized.length) return false;
    state.eventsRecommended = normalized;
    state.setupEventsGenerated = true;
    persistState();
    return true;
  } catch (error) {
    console.warn("Cloud recommendations unavailable", error?.message || error);
    return false;
  }
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
  const signInButton = $("authSignIn");
  const primaryActions = $("authPrimaryActions");
  const passwordHint = $("authPasswordHint");
  const statusEl = $("authStatus");
  const parsedMagicLink = parseMagicLinkFromHostPath();
  const isMagicLink = Boolean(parsedMagicLink?.host && parsedMagicLink?.tokenId);
  const magicAuthStage = isMagicLink ? getMagicLinkAuthStage(parsedMagicLink) : "";
  const showCreateOnly = isMagicLink && magicAuthStage !== "signin";
  const showSignInOnly = isMagicLink && magicAuthStage === "signin";
  const mode = String(context || "save").trim();
  const isSigninMode = mode === "signin";
  if (titleEl) {
    titleEl.textContent = isSigninMode
      ? "Log in"
      : mode === "poll_review"
      ? "Save your poll and responses"
      : mode === "rsvp_review"
      ? "Save your RSVP and responses"
      : "Save your progress";
  }
  if (subtitleEl) {
    if (isSigninMode) {
      subtitleEl.textContent = "";
      subtitleEl.classList.add("hidden");
    } else {
      subtitleEl.textContent = mode === "poll_review"
        ? "You’ve shared this poll with your team. Create an account so you can come back later and keep your links and results safe."
        : mode === "rsvp_review"
        ? "You’ve shared this RSVP with your team. Create an account so your event data and responses stay safe across browsers and devices."
        : "Create an account to keep your workspace across browsers and devices.";
      subtitleEl.classList.remove("hidden");
    }
  }
  if (createAccountButton) {
    createAccountButton.textContent = "Create account";
    createAccountButton.classList.toggle("hidden", showSignInOnly || isSigninMode);
  }
  if (signInButton) {
    signInButton.classList.toggle("hidden", showCreateOnly);
    signInButton.classList.add("w-full");
  }
  if (primaryActions) {
    primaryActions.classList.toggle("sm:flex-row", !isSigninMode);
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
  const companyInput = $("authCompanyName");
  const passwordConfirmRow = $("authPasswordConfirmRow");
  const authDefaults = getMagicLinkAuthDefaultsForCurrentPath();
  if (authDefaults && companyInput && !String(companyInput.value || "").trim()) {
    companyInput.value = String(authDefaults.companyName || "").trim();
  }
  if (authDefaults && emailInput && !String(emailInput.value || "").trim()) {
    emailInput.value = String(authDefaults.email || "").trim();
  }
  if (companyInput) {
    companyInput.closest("label")?.classList.toggle("hidden", showSignInOnly || isSigninMode);
  }
  if (passwordConfirmRow) {
    const hideConfirm = showSignInOnly || isSigninMode;
    passwordConfirmRow.classList.toggle("hidden", hideConfirm);
  }
  if (passwordHint) {
    passwordHint.classList.toggle("hidden", isSigninMode);
  }
  if (emailInput && isSigninMode) {
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

const INVESTMENT_RANGE_OPTIONS = {
  total: [
    { key: "total_under_500", label: "Less than $500", min: 1, max: 499, representative: 500 },
    { key: "total_500_2k", label: "$500 - $2K", min: 500, max: 2000, representative: 2000 },
    { key: "total_2k_5k", label: "$2K - $5K", min: 2001, max: 5000, representative: 5000 },
    { key: "total_5k_10k", label: "$5K - $10K", min: 5001, max: 10000, representative: 7500 }
  ],
  perEmployee: [
    { key: "per_up_40", label: "Up to $40", min: 1, max: 40, representative: 40 },
    { key: "per_up_75", label: "Up to $75", min: 41, max: 75, representative: 75 },
    { key: "per_up_150", label: "Up to $150", min: 76, max: 150, representative: 150 }
  ]
};

const PLATFORM_FEE_BY_TOTAL_RANGE = {
  total_under_500: 125,
  total_500_2k: 250,
  total_2k_5k: 500,
  total_5k_10k: 750
};

const LEGACY_BUDGET_RANGE_KEY_MAP = {
  total_under_500: "total_under_500",
  total_up_2k: "total_500_2k",
  total_up_5k: "total_2k_5k",
  total_up_10k: "total_5k_10k",
  total_1k_3k: "total_500_2k",
  total_3k_5k: "total_2k_5k",
  total_5k_plus: "total_5k_10k",
  total_5k_10k: "total_5k_10k",
  per_25_50: "per_up_40",
  per_50_75: "per_up_75",
  per_75_plus: "per_up_150"
};

function getBudgetRangeOptions(mode = "total") {
  return mode === "perEmployee"
    ? INVESTMENT_RANGE_OPTIONS.perEmployee
    : INVESTMENT_RANGE_OPTIONS.total;
}

function getBudgetRangeByKey(mode = "total", key = "") {
  const options = getBudgetRangeOptions(mode);
  const normalizedKey = String(key || "").trim();
  const mappedKey = LEGACY_BUDGET_RANGE_KEY_MAP[normalizedKey] || normalizedKey;
  return options.find((item) => item.key === mappedKey) || null;
}

function getBudgetRangeKeyFromValue(mode = "total", value = 0) {
  const amount = Number(value || 0);
  if (!(amount > 0)) return "";
  const options = getBudgetRangeOptions(mode);
  const matched = options.find((item) => amount >= Number(item.min || 0) && amount <= Number(item.max || 0));
  return matched ? matched.key : "";
}

function getBudgetRangeHighEnd(mode = "total", rangeKey = "", fallbackValue = 0) {
  const matchedRange = getBudgetRangeByKey(mode, rangeKey);
  if (matchedRange && Number.isFinite(Number(matchedRange.representative)) && Number(matchedRange.representative) > 0) {
    return Math.round(Number(matchedRange.representative));
  }
  if (matchedRange && Number.isFinite(Number(matchedRange.max)) && Number(matchedRange.max) > 0) {
    return Math.round(Number(matchedRange.max));
  }
  const fallback = Number(fallbackValue || 0);
  return fallback > 0 ? Math.round(fallback) : 0;
}

function resolveTotalBudgetRangeKey(totalValue = 0, preferredRangeKey = "") {
  const roundedTotal = Math.round(Number(totalValue || 0));
  const normalizedPreferredKey = String(preferredRangeKey || "").trim();
  const preferredRange = getBudgetRangeByKey("total", normalizedPreferredKey);
  if (preferredRange && roundedTotal > 0) {
    const preferredRepresentative = getBudgetRangeHighEnd("total", String(preferredRange.key || ""), Number(preferredRange.max || 0));
    if (preferredRepresentative === roundedTotal) {
      return String(preferredRange.key || "");
    }
  }
  return getBudgetRangeKeyFromValue("total", roundedTotal);
}

function getPlatformFeeForTotalBudgetRange(rangeKey = "", fallbackTotal = 0) {
  const normalizedRangeKey = String(rangeKey || "").trim();
  const fallbackAmount = Number(fallbackTotal || 0);
  if (Math.round(fallbackAmount) === 500) {
    if (!normalizedRangeKey || normalizedRangeKey === "total_under_500" || normalizedRangeKey === "total_500_2k") {
      return Number(PLATFORM_FEE_BY_TOTAL_RANGE.total_under_500 || 0);
    }
  }
  const resolvedKey = normalizedRangeKey || getBudgetRangeKeyFromValue("total", fallbackAmount);
  const mappedFee = Number(PLATFORM_FEE_BY_TOTAL_RANGE[resolvedKey] || 0);
  return mappedFee > 0 ? mappedFee : 0;
}

const PROMOTE_STEP_ORDER = ["calendar", "announcement", "reminder_week", "reminder_dayof", "reminder_dayof_2"];

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
  if (typeof promote.announcementLockedAfterContinue !== "boolean") {
    promote.announcementLockedAfterContinue = false;
  }
  if (typeof promote.reminderWeekLockedAfterContinue !== "boolean") {
    promote.reminderWeekLockedAfterContinue = false;
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
  ensureStepStatus("reminderDayOf2");
  ensureStepStatus("finalWinner");

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

function enforceRevelryLeaderboardLockState() {
  if (getActiveTestingMagicContext()) return false;
  if (!isRevelryBracketsMagicContext()) return false;

  const forceWeeklyLeaderboardUpdateOne = isRevelryLabsReadOnlyMagicLink();
  const completedSteps = Array.isArray(state.completedSetupSteps) ? state.completedSetupSteps : [];
  const promoteState = state.promoteEvent && typeof state.promoteEvent === "object" ? state.promoteEvent : {};
  const hasReachedLeaderboard = forceWeeklyLeaderboardUpdateOne
    || Boolean(state.revelryLeaderboardLockArmed)
    || String(promoteState.activeStep || "") === "reminder_dayof"
    || String(promoteState.activeStep || "") === "reminder_dayof_2"
    || Boolean(promoteState.reminderWeekLockedAfterContinue)
    || Boolean(promoteState.reminderDayOf?.done)
    || Boolean(promoteState.reminderDayOf2?.done)
    || Number(state.currentSetupStep || 0) > EVENT_WORKFLOW_STEPS.RUN
    || Number(state.eventWorkflowProcessStep || 0) > EVENT_WORKFLOW_STEPS.RUN
    || completedSteps.some((stepNum) => Number(stepNum || 0) > EVENT_WORKFLOW_STEPS.RUN);

  if (!hasReachedLeaderboard) {
    return false;
  }

  let changed = false;
  if (state.revelryLeaderboardLockArmed !== true) {
    state.revelryLeaderboardLockArmed = true;
    changed = true;
  }
  const normalizedCompleted = Array.from(new Set(
    completedSteps
      .map((stepNum) => Number(stepNum || 0))
      .filter((stepNum) => Number.isInteger(stepNum) && stepNum >= 1 && stepNum <= EVENT_WORKFLOW_STEPS.RUN)
  ));
  if (!Array.isArray(state.completedSetupSteps) || normalizedCompleted.length !== state.completedSetupSteps.length || normalizedCompleted.some((stepNum, idx) => stepNum !== state.completedSetupSteps[idx])) {
    state.completedSetupSteps = normalizedCompleted;
    changed = true;
  }

  if (forceWeeklyLeaderboardUpdateOne) {
    const requiredCompletedSteps = [
      1,
      2,
      3,
      4,
      5,
      6,
      EVENT_WORKFLOW_STEPS.SHORTLIST,
      EVENT_WORKFLOW_STEPS.PROMOTE
    ];
    requiredCompletedSteps.forEach((stepNum) => {
      if (!state.completedSetupSteps.includes(stepNum)) {
        state.completedSetupSteps.push(stepNum);
        changed = true;
      }
    });
    if (state.setupCompleted !== true) {
      state.setupCompleted = true;
      changed = true;
    }
    if (state.setupEventsGenerated !== true) {
      state.setupEventsGenerated = true;
      changed = true;
    }
    if (state.landingBuilderStarted !== true) {
      state.landingBuilderStarted = true;
      changed = true;
    }
    if (state.sidebarActiveSection !== "event-workflow") {
      state.sidebarActiveSection = "event-workflow";
      changed = true;
    }
  }

  if (state.currentSetupStep !== EVENT_WORKFLOW_STEPS.RUN) {
    state.currentSetupStep = EVENT_WORKFLOW_STEPS.RUN;
    changed = true;
  }
  if (state.eventWorkflowProcessStep !== EVENT_WORKFLOW_STEPS.RUN) {
    state.eventWorkflowProcessStep = EVENT_WORKFLOW_STEPS.RUN;
    changed = true;
  }
  if (!state.completedSetupSteps.includes(EVENT_WORKFLOW_STEPS.PROMOTE)) {
    state.completedSetupSteps.push(EVENT_WORKFLOW_STEPS.PROMOTE);
    changed = true;
  }

  normalizePromoteEventState();
  const promote = state.promoteEvent;
  const targetLeaderboardStep = forceWeeklyLeaderboardUpdateOne
    ? "reminder_dayof"
    : (promote.reminderDayOf?.done
    ? (promote.reminderDayOf2?.done ? "final_winner" : "reminder_dayof_2")
    : "reminder_dayof");
  if (promote.activeStep !== targetLeaderboardStep) {
    promote.activeStep = targetLeaderboardStep;
    changed = true;
  }
  if (forceWeeklyLeaderboardUpdateOne) {
    if (promote.reminderDayOf.done !== false) {
      promote.reminderDayOf.done = false;
      promote.reminderDayOf.doneAt = "";
      changed = true;
    }
    if (promote.reminderDayOf2.done !== false) {
      promote.reminderDayOf2.done = false;
      promote.reminderDayOf2.doneAt = "";
      changed = true;
    }
    if (promote.finalWinner?.done) {
      promote.finalWinner.done = false;
      promote.finalWinner.doneAt = "";
      changed = true;
    }
  }
  if (promote.collapsedStep !== "") {
    promote.collapsedStep = "";
    changed = true;
  }
  if (promote.announcement.done !== true) {
    promote.announcement.done = true;
    if (!promote.announcement.doneAt) promote.announcement.doneAt = new Date().toISOString();
    changed = true;
  }
  if (promote.reminderWeek.done !== true) {
    promote.reminderWeek.done = true;
    if (!promote.reminderWeek.doneAt) promote.reminderWeek.doneAt = new Date().toISOString();
    changed = true;
  }
  if (promote.announcementLockedAfterContinue !== true) {
    promote.announcementLockedAfterContinue = true;
    changed = true;
  }
  if (promote.reminderWeekLockedAfterContinue !== true) {
    promote.reminderWeekLockedAfterContinue = true;
    changed = true;
  }

  return changed;
}

function enforceRevelryRunEventViewHardLock() {
  if (!isRevelryLabsReadOnlyMagicLink()) return false;

  let changed = enforceRevelryLeaderboardLockState();
  if (state.currentSetupStep !== EVENT_WORKFLOW_STEPS.RUN) {
    state.currentSetupStep = EVENT_WORKFLOW_STEPS.RUN;
    changed = true;
  }
  if (state.eventWorkflowProcessStep !== EVENT_WORKFLOW_STEPS.RUN) {
    state.eventWorkflowProcessStep = EVENT_WORKFLOW_STEPS.RUN;
    changed = true;
  }
  if (state.sidebarActiveSection !== "event-workflow") {
    state.sidebarActiveSection = "event-workflow";
    changed = true;
  }
  if (state.sidebarSetupExpanded !== false) {
    state.sidebarSetupExpanded = false;
    changed = true;
  }
  if (state.setupMenuExpanded !== false) {
    state.setupMenuExpanded = false;
    changed = true;
  }
  if (state.sidebarEventWorkflowExpanded !== true) {
    state.sidebarEventWorkflowExpanded = true;
    changed = true;
  }
  if (state.setupCompleted !== true) {
    state.setupCompleted = true;
    changed = true;
  }

  return changed;
}

function getPromoteStepDone(stepKey) {
  normalizePromoteEventState();
  if (stepKey === "calendar") return Boolean(state.promoteEvent.calendar.done);
  if (stepKey === "announcement") return Boolean(state.promoteEvent.announcement.done);
  if (stepKey === "reminder_week") return Boolean(state.promoteEvent.reminderWeek.done);
  if (stepKey === "reminder_dayof") return Boolean(state.promoteEvent.reminderDayOf.done);
  if (stepKey === "reminder_dayof_2") return Boolean(state.promoteEvent.reminderDayOf2.done);
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

function getLiveBudgetSnapshot() {
const landingView = $("landingView");
const isLandingActive = landingView && !landingView.classList.contains("hidden");
const draftMode = String(state.landingDraft?.budgetMode || "").trim();
const draftTotal = Number(state.landingDraft?.totalBudget || 0);
const draftEmployees = Number(state.landingDraft?.employeeCount || 0);
const draftPerEmployee = Number(state.landingDraft?.perEmployee || 0);
const draftComputedTotal = draftMode === "perEmployee"
  ? Math.round(draftEmployees * draftPerEmployee)
  : draftTotal;
const liveDraftTotal = draftComputedTotal > 0 ? draftComputedTotal : draftTotal;

const programMode = String(state.programSettings?.budgetMode || "").trim();
const programEmployees = Number(state.programSettings?.employeeCount || 0);
const programPerEmployee = Number(state.programSettings?.perEmployeeBudget || 0);
const programComputedTotal = programMode === "perEmployee"
  ? Math.round(programEmployees * programPerEmployee)
  : getBudgetTotal();
const liveProgramTotal = programComputedTotal > 0 ? programComputedTotal : getBudgetTotal();

// Gate on the explicit flag set by saveBudgetState; avoids showing placeholder defaults.
const budgetEnabled = Boolean(state.landingDraft?.budgetConfigured);
const total = !budgetEnabled
  ? 0
  : (isLandingActive
      ? (liveDraftTotal > 0 ? liveDraftTotal : liveProgramTotal)
      : (liveProgramTotal > 0 ? liveProgramTotal : liveDraftTotal));
const spent = budgetEnabled ? getTotalSpent() : 0;
const remaining = total - spent;
return { total, spent, remaining };
}

function syncBudgetDisplaySurfaces() {
const { total, spent, remaining } = getLiveBudgetSnapshot();

const totalLabel = $("budgetTotalLabel");
const spentLabel = $("budgetSpentLabel");
const remainingLabel = $("budgetRemainingLabel");
if (totalLabel) totalLabel.textContent = `Total: ${fmtMoney(total)}`;
if (spentLabel) spentLabel.textContent = `Spent: ${fmtMoney(spent)}`;
if (remainingLabel) remainingLabel.textContent = `Remaining: ${fmtMoney(remaining)}`;

const progTotal = $("progBudgetTotal");
const progEstimated = $("progBudgetEstimated");
const progRemaining = $("progBudgetRemaining");
const progMonthlyBudgetNote = $("progMonthlyBudgetNote");
if (progTotal) progTotal.textContent = fmtMoney(total);
if (progEstimated) progEstimated.textContent = fmtMoney(spent);
if (progRemaining) progRemaining.textContent = fmtMoney(remaining);
if (progMonthlyBudgetNote) {
  const mode = String(state.landingDraft?.budgetMode || state.programSettings?.budgetMode || "total").trim();
  const employeeCount = Number(state.landingDraft?.employeeCount || state.programSettings?.employeeCount || 0);
  const totalBudget = Number(state.landingDraft?.totalBudget || state.programSettings?.totalBudget || 0);
  const perEmployee = Number(state.landingDraft?.perEmployee || state.programSettings?.perEmployeeBudget || 0);
  const totalRangeKey = String(state.landingDraft?.totalBudgetRange || state.programSettings?.totalBudgetRange || "").trim();
  const perRangeKey = String(state.landingDraft?.perEmployeeBudgetRange || state.programSettings?.perEmployeeBudgetRange || "").trim();
  const monthlyBudgetCap = mode === "perEmployee"
    ? getBudgetRangeHighEnd("perEmployee", perRangeKey, perEmployee) * Math.max(1, employeeCount || 0)
    : getBudgetRangeHighEnd("total", totalRangeKey, totalBudget);

  const effectiveMonthly = monthlyBudgetCap > 0 ? monthlyBudgetCap : total;
  const effectiveEmployees = Math.max(0, Number(employeeCount || 0));
  const pepm = effectiveMonthly > 0 && effectiveEmployees > 0
    ? Math.round(effectiveMonthly / effectiveEmployees)
    : 0;
  const averageSpend = state.fourMonthProgram?.monthlyBudget
    ? Math.round(Number(state.fourMonthProgram.monthlyBudget || 0))
    : Math.round(effectiveMonthly || 0);

  if (effectiveMonthly > 0) {
    progMonthlyBudgetNote.textContent = `Monthly budget: ~${fmtMoney(effectiveMonthly)}${pepm > 0 ? ` (~${fmtMoney(pepm)} per employee)` : ""}. Average monthly spend: ~${fmtMoney(averageSpend)}. Unused budget rolls over to support higher-quality events.`;
  } else {
    progMonthlyBudgetNote.textContent = "Unused budget rolls over to support higher-quality events.";
  }
}
}

function getDateWithinCurrentQuarter(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
  const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 1);
  return parsed >= quarterStart && parsed < quarterEnd ? parsed : null;
}

function getIdentityKeyFromRow(row, prefix, index) {
  const fingerprint = String(row?.fingerprint || row?.voter_fingerprint || row?.voterFingerprint || "").trim().toLowerCase();
  if (fingerprint) return `fp:${fingerprint}`;
  const email = String(row?.email || "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = String(row?.name || row?.voterName || "").trim().toLowerCase();
  if (name) return `name:${name}`;
  return `${prefix}:${index}`;
}

function calculateEngagementMetrics() {
  const employeeCount = Math.max(0, Number(state.programSettings?.employeeCount || state.landingDraft?.employeeCount || 0));
  const pollResponses = Array.isArray(state.pollBuilder?.responses) ? state.pollBuilder.responses : [];
  const pollParticipants = new Set();
  pollResponses.forEach((row, index) => {
    pollParticipants.add(getIdentityKeyFromRow(row, "poll", index));
  });

  const rsvpResults = state.pollBuilder?.rsvpResults && typeof state.pollBuilder.rsvpResults === "object"
    ? state.pollBuilder.rsvpResults
    : null;
  const rsvpRows = Array.isArray(rsvpResults?.responses) ? rsvpResults.responses : [];
  const rsvpParticipants = new Set();
  rsvpRows.forEach((row, index) => {
    rsvpParticipants.add(getIdentityKeyFromRow(row, "rsvp", index));
  });

  const yesFromRows = rsvpRows.filter((row) => String(row?.answer || "").trim().toLowerCase() === "yes").length;
  const yesCount = Number.isFinite(Number(rsvpResults?.yesCount))
    ? Math.max(0, Number(rsvpResults.yesCount))
    : yesFromRows;

  const bookedEvents = Array.isArray(state.eventsBooked) ? state.eventsBooked : [];
  const bookedThisQuarter = bookedEvents.filter((eventItem) => {
    const parsed = getDateWithinCurrentQuarter(eventItem?.date);
    // Include undated entries in MVP so we do not hide valid legacy records.
    if (!String(eventItem?.date || "").trim()) return true;
    return Boolean(parsed);
  });
  const fallbackRsvpCount = bookedThisQuarter.reduce((sum, eventItem) => sum + Math.max(0, Number(eventItem?.rsvps || 0)), 0);
  const pollParticipantCount = pollParticipants.size;
  const rsvpParticipantCount = rsvpParticipants.size || fallbackRsvpCount;
  const expectedAttendanceCount = yesCount || fallbackRsvpCount;
  const eventsRunCount = bookedThisQuarter.filter((eventItem) => Number(eventItem?.attendance || 0) > 0).length;

  const pollParticipationPercent = employeeCount > 0
    ? Math.max(0, Math.min(100, Math.round((pollParticipantCount / employeeCount) * 100)))
    : 0;
  const rsvpParticipationPercent = employeeCount > 0
    ? Math.max(0, Math.min(100, Math.round((rsvpParticipantCount / employeeCount) * 100)))
    : 0;

  const pollsCreated = String(state.pollBuilder?.pollId || "").trim() ? 1 : 0;
  const rsvpsCreated = String(state.pollBuilder?.rsvpId || "").trim() ? 1 : 0;

  return {
    employeeCount,
    pollParticipantCount,
    rsvpParticipantCount,
    expectedAttendanceCount,
    eventsRunCount,
    pollParticipationPercent,
    rsvpParticipationPercent,
    pollsCreated,
    rsvpsCreated,
    planningActivityCount: pollsCreated + rsvpsCreated
  };
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
  const workflowType = getActiveWorkflowType();
  const sequence = getEventWorkflowStepSequence(workflowType);
  for (const step of sequence) {
    const treatAsCompleted = completed.includes(step);
    if (!treatAsCompleted) {
      return step;
    }
  }
  return sequence[sequence.length - 1] || EVENT_WORKFLOW_STEPS.REVIEW;
}

function getEventWorkflowProcessStep() {
  const sequence = getEventWorkflowStepSequence(getActiveWorkflowType());
  if (
    Number.isInteger(state.eventWorkflowProcessStep)
    && state.eventWorkflowProcessStep >= EVENT_WORKFLOW_STEPS.SHORTLIST
    && state.eventWorkflowProcessStep <= EVENT_WORKFLOW_STEPS.REVIEW
    && sequence.includes(state.eventWorkflowProcessStep)
  ) {
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
  return !isWorkflowStepSkipped(EVENT_WORKFLOW_STEPS.RUN);
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
    if (enforceRevelryLeaderboardLockState()) {
      shouldPersistDetectedTimeZone = true;
    }
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
  normalizeEventLaunchContext();
  migrateEventWorkflowStepsIfNeeded();
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
      totalBudgetRange: "",
      perEmployeeBudget: 75,
      perEmployeeBudgetRange: "",
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
  if (typeof state.programSettings?.totalBudgetRange !== "string") {
    state.programSettings.totalBudgetRange = "";
  }
  if (typeof state.programSettings?.perEmployeeBudgetRange !== "string") {
    state.programSettings.perEmployeeBudgetRange = "";
  }
  if (typeof state.landingDraft?.budgetConfigured !== "boolean") {
    state.landingDraft.budgetConfigured = false;
  }
  if (typeof state.landingDraft?.totalBudgetRange !== "string") {
    state.landingDraft.totalBudgetRange = "";
  }
  if (typeof state.landingDraft?.perEmployeeBudgetRange !== "string") {
    state.landingDraft.perEmployeeBudgetRange = "";
  }
  if (typeof state.landingDraft?.workEmail !== "string") {
    state.landingDraft.workEmail = "";
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
      voteDeadlineTimeZone: "",
      energyResetLaunch: null
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
  if (typeof state.pollBuilder.chosenEventLabel !== "string") state.pollBuilder.chosenEventLabel = "";
  if (typeof state.pollBuilder.eventLocationType !== "string") state.pollBuilder.eventLocationType = "virtual";
  if (typeof state.pollBuilder.costPerPerson !== "number") state.pollBuilder.costPerPerson = 50;
  if (typeof state.pollBuilder.rsvpDeadlineDateTime !== "string") state.pollBuilder.rsvpDeadlineDateTime = "";
  if (typeof state.pollBuilder.vendorBookingUrl !== "string") state.pollBuilder.vendorBookingUrl = "";
  if (!state.pollBuilder.bookingConfirmation || typeof state.pollBuilder.bookingConfirmation !== "object") state.pollBuilder.bookingConfirmation = null;
  if (!Array.isArray(state.pollBuilder.scheduleEntries)) state.pollBuilder.scheduleEntries = [];
  if (state.pollBuilder.energyResetLaunch !== null && typeof state.pollBuilder.energyResetLaunch !== "object") state.pollBuilder.energyResetLaunch = null;
  normalizePromoteEventState();
  if (enforceRevelryLeaderboardLockState()) {
    shouldPersistDetectedTimeZone = true;
  }

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


 if (company || admin) {
   state.landingIdentityMode = "magic";
 } else if (state.landingIdentityMode !== "magic") {
   state.landingIdentityMode = "generic";
 }


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
const testingResetBtn = $("appTestingReset");
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

if (testingResetBtn) {
  const testingContext = getActiveTestingMagicContext();
  testingResetBtn.style.display = (shouldShowStatic && testingContext) ? "inline-flex" : "none";
}
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

if (d1WorkflowSyncDebounceTimer) {
  clearTimeout(d1WorkflowSyncDebounceTimer);
}
d1WorkflowSyncDebounceTimer = setTimeout(() => {
  d1WorkflowSyncDebounceTimer = null;
  const token = getAuthToken();
  if (!token || !state.accountId) return;
  syncWorkflowStateToDraft().catch((error) => {
    console.warn("D1 workflow sync skipped", error?.message || error);
  });
}, 1500);
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
  const programSurveyAnswers = (p.survey_answers && typeof p.survey_answers === "object") ? p.survey_answers : {};
  const programTotalBudget = Number(p.total_budget || 0);
  const programPerEmployeeBudget = Number(p.per_employee_budget || 0);
  const programPersistedTotalRange = String(programSurveyAnswers.totalBudgetRange || "").trim();
  state.programSettings = {
    budgetMode: p.budget_mode || "total",
    totalBudget: programTotalBudget,
    totalBudgetRange: resolveTotalBudgetRangeKey(programTotalBudget, programPersistedTotalRange),
    perEmployeeBudget: programPerEmployeeBudget,
    perEmployeeBudgetRange: String(programSurveyAnswers.perEmployeeBudgetRange || getBudgetRangeKeyFromValue("perEmployee", programPerEmployeeBudget) || "").trim(),
    employeeCount: Number(p.employee_count || 0),
    goals: p.goals || [],
    teamPreferenceEstimate: Array.isArray(p.team_preference_estimate) ? p.team_preference_estimate : [],
    admin_preference_weight: { boost: 0.22, first_cycle_only: true },
    cadence: p.cadence || "Monthly",
    preferredSchedule: p.preferred_schedule || [],
    surveyAnswers: programSurveyAnswers
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
  const draftSurveyAnswers = (d.survey_answers && typeof d.survey_answers === "object") ? d.survey_answers : {};
  const draftTotalBudget = Number(d.total_budget || 0);
  const draftPerEmployeeBudget = Number(d.per_employee_budget || 0);
  const draftPersistedTotalRange = String(draftSurveyAnswers.totalBudgetRange || "").trim();
  state.landingDraft = {
    budgetMode: d.budget_mode || "total",
    totalBudget: draftTotalBudget,
    totalBudgetRange: resolveTotalBudgetRangeKey(draftTotalBudget, draftPersistedTotalRange),
    perEmployee: draftPerEmployeeBudget,
    perEmployeeBudgetRange: String(draftSurveyAnswers.perEmployeeBudgetRange || getBudgetRangeKeyFromValue("perEmployee", draftPerEmployeeBudget) || "").trim(),
    employeeCount: Number(d.employee_count || 0),
    goals: d.goals || [],
    teamPreferenceEstimate: Array.isArray(d.team_preference_estimate) ? d.team_preference_estimate : [],
    cadence: d.cadence || "Monthly",
    schedule: d.preferred_schedule || [],
    daysSelected: d.days_selected || [],
    timesSelected: d.times_selected || [],
    localCity: d.local_city || "",
    surveyAnswers: draftSurveyAnswers
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

const landingSurveyAnswers = {
  ...(state.landingDraft.surveyAnswers && typeof state.landingDraft.surveyAnswers === "object" ? state.landingDraft.surveyAnswers : {}),
  totalBudgetRange: String(state.landingDraft.totalBudgetRange || "").trim(),
  perEmployeeBudgetRange: String(state.landingDraft.perEmployeeBudgetRange || "").trim()
};

const programSurveyAnswers = {
  ...(state.programSettings.surveyAnswers && typeof state.programSettings.surveyAnswers === "object" ? state.programSettings.surveyAnswers : {}),
  totalBudgetRange: String(state.programSettings.totalBudgetRange || "").trim(),
  perEmployeeBudgetRange: String(state.programSettings.perEmployeeBudgetRange || "").trim()
};

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
  survey_answers: landingSurveyAnswers,
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
  survey_answers: programSurveyAnswers,
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
    "games & competitions": ["game", "competition", "trivia", "escape", "challenge", "olympics", "tournament"],
    "food & drinks": ["food", "drink", "cocktail", "cooking", "tasting", "culinary"],
    "volunteering": ["volunteer", "community", "service", "nonprofit", "impact"],
    "learning events": ["workshop", "learning", "skills", "coaching", "development", "training"],
    "social meetups": ["social", "team", "bond", "network", "meetup", "connection"],
    "fun / social event": ["fun", "social", "team", "trivia", "escape", "game", "bond"],
    "professional development": ["workshop", "learning", "skills", "coaching", "development"],
    "wellness / health focused": ["wellness", "mindful", "health", "fitness", "workout"],
    "food / drinks experience": ["food", "drink", "cocktail", "cooking", "tasting"],
    "learn a new creative skill": ["creative", "build", "craft", "making", "skill"]
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
  const goalLabel = goal === "Boost morale" ? "Boost morale and retention" : goal;
  const id = `${containerId}-${goal}`.replace(/[^a-zA-Z0-9]/g, "-");
  const checked = selectedValues.includes(goal);
  const wrapper = document.createElement("label");
  wrapper.className = "goal-pill";
  wrapper.innerHTML = `
    <input id="${id}" type="checkbox" ${checked ? "checked" : ""} />
    <span>
      <div class="goal-title">${goalLabel}</div>
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
  const wrapper = document.createElement("label");
  wrapper.className = "goal-pill";
  wrapper.innerHTML = `
    <input id="${id}" type="checkbox" ${checked ? "checked" : ""} />
    <span>
      <div class="goal-title">${interest}</div>
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
SCHEDULE_OPTIONS.forEach((optionConfig) => {
  const optionValue = String(optionConfig?.value || "");
  const optionLabel = String(optionConfig?.label || optionValue);
  const id = `${containerId}-${optionValue}`.replace(/[^a-zA-Z0-9]/g, "-");
  const checked = selected[0] === optionValue;
  const label = document.createElement("label");
  label.className = "group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 transition-all";
  label.innerHTML = `
    <input id="${id}" name="${containerId}-radio" type="radio" value="${optionValue}" ${checked ? "checked" : ""} class="h-4 w-4 accent-slate-900" />
    <span class="text-sm font-medium text-slate-900">${optionLabel}</span>
  `;
  label.querySelector("input").addEventListener("change", () => onToggle(optionValue));
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
  state.landingDraft.schedule = [option];
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
  state.mainView = "browser";
  renderBrowserPanel();
  applySidebarSetupPhaseState();
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




syncBudgetDisplaySurfaces();




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
  normalizeSidebarAccordionState();
  const activeWorkflowType = getActiveWorkflowType();
  if (state.currentSetupStep >= EVENT_WORKFLOW_STEPS.SHORTLIST && activeWorkflowType === EVENT_WORKFLOW_TYPES.STRAIGHT_TO_PROMOTE) {
    state.sidebarEventWorkflowExpanded = true;
  }
  updateSidebarSetupCollapseUI();
  updateSidebarEventWorkflowCollapseUI();
const setupItems = document.querySelectorAll("[data-setup-menu-item]");
const workflowItems = document.querySelectorAll("[data-workflow-menu-step]");
const eventWorkflowItems = document.querySelectorAll("[data-event-workflow-menu-item]");
const eventWorkflowSection = $("sidebarEventWorkflowSection");
const landingView = $("landingView");
const isLandingActive = landingView && !landingView.classList.contains("hidden");
const allCoreSetupComplete = isAllCoreSetupComplete();
const activeSidebarStepBg = "#EEF3FF";
const activeSidebarStepText = "#3478F6";
const allowTestingStepNavigation = Boolean(getActiveTestingMagicContext());
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
const hasEnteredEventWorkflow = allCoreSetupComplete && (
  Number(state.currentSetupStep || 0) >= EVENT_WORKFLOW_STEPS.SHORTLIST
  || Number(state.eventWorkflowProcessStep || 0) >= EVENT_WORKFLOW_STEPS.SHORTLIST
  || state.completedSetupSteps.includes(EVENT_WORKFLOW_STEPS.SHORTLIST)
);


// Add click handler for sidebar setup steps
setupItems.forEach((item) => {
  const stepNum = SETUP_MENU_ITEM_TO_STEP[item.dataset.setupMenuItem];
  const isActive = state.currentSetupStep === stepNum;
  const isProcessCurrent = stepNum === setupProcessCurrentStep;
  const isCompleted = state.completedSetupSteps.includes(stepNum);
  const isFutureStep = !isCompleted && Number.isInteger(setupProcessCurrentStep) && stepNum > setupProcessCurrentStep;
  const isLockedFutureStep = isFutureStep && !allowTestingStepNavigation;
  const isSetupLocked = !allCoreSetupComplete || isLockedFutureStep;
  const iconStateClass = isCompleted ? "sidebar-step-completed" : (isProcessCurrent ? "sidebar-step-current" : "sidebar-step-future");
  item.classList.remove("sidebar-step-current", "sidebar-step-completed", "sidebar-step-future", "sidebar-step-process-current");
  item.classList.add(iconStateClass);
  item.classList.toggle("sidebar-step-process-current", isProcessCurrent);
  item.classList.toggle("sidebar-step-locked", isSetupLocked && !isActive);
  item.style.background = allCoreSetupComplete && isActive ? activeSidebarStepBg : "transparent";
  item.style.borderColor = allCoreSetupComplete && isActive ? activeSidebarStepBg : "transparent";
  item.style.color = allCoreSetupComplete
    ? (isActive ? activeSidebarStepText : (isCompleted ? "#64748b" : "#1e293b"))
    : "#94a3b8";
  item.style.opacity = isSetupLocked ? "0.58" : "1";
  item.style.cursor = isSetupLocked ? "not-allowed" : "pointer";
  item.onclick = () => {
    if (!allCoreSetupComplete || isLockedFutureStep) return;
    if (stepNum) {
      setSidebarActiveSection("setup");
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
  const isOnProgramRevealPage = state.currentSetupStep === EVENT_WORKFLOW_STEPS.SHORTLIST && !hasLandingFirstEventLaunchStarted();
  eventWorkflowSection.style.display = isOnProgramRevealPage ? "none" : "block";

  const sidebarNavWorkflowEventSubtitle = document.getElementById("sidebarNavWorkflowEventSubtitle");
  if (sidebarNavWorkflowEventSubtitle) {
    const _navEventName = getSidebarWorkflowEventName();
    sidebarNavWorkflowEventSubtitle.textContent = _navEventName;
      const shouldShowNavEventName = allCoreSetupComplete && _navEventName;
      sidebarNavWorkflowEventSubtitle.style.display = shouldShowNavEventName ? "block" : "none";
      if (shouldShowNavEventName) {
        sidebarNavWorkflowEventSubtitle.style.maxWidth = "100%";
        sidebarNavWorkflowEventSubtitle.style.padding = "0";
        sidebarNavWorkflowEventSubtitle.style.borderRadius = "0";
        sidebarNavWorkflowEventSubtitle.style.border = "none";
        sidebarNavWorkflowEventSubtitle.style.background = "transparent";
        sidebarNavWorkflowEventSubtitle.style.fontSize = "13px";
        sidebarNavWorkflowEventSubtitle.style.fontWeight = "600";
        sidebarNavWorkflowEventSubtitle.style.lineHeight = "1.35";
        sidebarNavWorkflowEventSubtitle.style.color = "#334155";
        sidebarNavWorkflowEventSubtitle.style.margin = "2px 2px 10px";
        sidebarNavWorkflowEventSubtitle.style.whiteSpace = "normal";
        sidebarNavWorkflowEventSubtitle.style.overflow = "visible";
        sidebarNavWorkflowEventSubtitle.style.textOverflow = "clip";
        sidebarNavWorkflowEventSubtitle.style.overflowWrap = "anywhere";
      }
  }
}

eventWorkflowItems.forEach((item) => {
  const sidebarStepConfig = getSidebarWorkflowStepConfig(activeWorkflowType);
  const sidebarSequence = sidebarStepConfig.map((entry) => entry.stepNum);
  const stepKeyToNum = sidebarStepConfig.reduce((acc, entry) => {
    acc[entry.menuKey] = entry.stepNum;
    return acc;
  }, {});
  const configForItem = sidebarStepConfig.find((entry) => entry.menuKey === item.dataset.eventWorkflowMenuItem);
  const labelEl = item.querySelector(".sidebar-workflow-item-label");
  if (labelEl && configForItem?.label) {
    labelEl.textContent = configForItem.label;
  }
  const isOnProgramRevealPage = state.currentSetupStep === EVENT_WORKFLOW_STEPS.SHORTLIST && !hasLandingFirstEventLaunchStarted();
  if (isOnProgramRevealPage) {
    item.style.display = "none";
    return;
  }
  const revelryVisibleSidebarSteps = new Set([
    EVENT_WORKFLOW_STEPS.SHORTLIST,
    EVENT_WORKFLOW_STEPS.PROMOTE,
    EVENT_WORKFLOW_STEPS.RUN,
    EVENT_WORKFLOW_STEPS.FEEDBACK,
    EVENT_WORKFLOW_STEPS.REVIEW
  ]);
  const stepNum = stepKeyToNum[item.dataset.eventWorkflowMenuItem];
  const forceRevelrySidebarSet = hasEnteredEventWorkflow && isRevelryLabsReadOnlyMagicLink();
  if (forceRevelrySidebarSet && !revelryVisibleSidebarSteps.has(stepNum)) {
    item.style.display = "none";
    return;
  }
  const isSkippedByWorkflowType = isWorkflowStepSkipped(stepNum, activeWorkflowType);
  if (isSkippedByWorkflowType && !hasEnteredEventWorkflow) {
    item.style.display = "none";
    return;
  }
  item.style.display = "";
  const processCurrentStep = getEventWorkflowProcessStep();
  const currentSetupStepNum = Number(state.currentSetupStep || 0);
  const nearestSidebarStepFor = (sourceStep) => {
    const source = Number(sourceStep || 0);
    if (!sidebarSequence.length) return null;
    if (sidebarSequence.includes(source)) return source;
    const previousVisible = sidebarSequence.filter((candidate) => candidate <= source);
    if (previousVisible.length) return previousVisible[previousVisible.length - 1];
    return sidebarSequence[0];
  };
  const activeSidebarStep = nearestSidebarStepFor(currentSetupStepNum);
  const activeProcessSidebarStep = nearestSidebarStepFor(processCurrentStep);
  const shouldIgnoreWorkflowSkipForSidebar = forceRevelrySidebarSet && revelryVisibleSidebarSteps.has(stepNum);
  const isConceptualInactive = !shouldIgnoreWorkflowSkipForSidebar && isSkippedByWorkflowType && hasEnteredEventWorkflow;
  const isActive = !isConceptualInactive && stepNum === activeSidebarStep;
  const isProcessCurrent = !isConceptualInactive && stepNum === activeProcessSidebarStep;
  const isCompleted = !isConceptualInactive && state.completedSetupSteps.includes(stepNum) && stepNum < processCurrentStep;
  const isFutureStep = isConceptualInactive || (!isCompleted && stepNum > processCurrentStep);
  const isLockedCompletedWorkflowStep = isCompleted && stepNum < processCurrentStep;
  const stepSequenceIndex = sidebarSequence.indexOf(stepNum);
  const previousStep = stepSequenceIndex > 0 ? sidebarSequence[stepSequenceIndex - 1] : null;
  const isLocked = isConceptualInactive || !allCoreSetupComplete || (!allowTestingStepNavigation && (
    isLockedCompletedWorkflowStep
    || isFutureStep
    || (!isCompleted && stepNum > EVENT_WORKFLOW_STEPS.SHORTLIST && previousStep !== null && !state.completedSetupSteps.includes(previousStep))
  ));
  const iconStateClass = isCompleted ? "sidebar-step-completed" : (isProcessCurrent ? "sidebar-step-current" : "sidebar-step-future");
  item.classList.remove("sidebar-step-current", "sidebar-step-completed", "sidebar-step-future", "sidebar-step-process-current", "sidebar-step-active", "sidebar-step-in-progress", "sidebar-step-not-started");
  item.classList.add(iconStateClass);
  item.classList.toggle("sidebar-step-active", isActive);
  item.classList.toggle("sidebar-step-in-progress", isProcessCurrent);
  item.classList.toggle("sidebar-step-not-started", !isCompleted && !isProcessCurrent);
  item.classList.toggle("sidebar-step-process-current", isProcessCurrent);
  item.classList.toggle("sidebar-step-locked", isLocked && !isActive);
  item.style.background = allCoreSetupComplete && isActive ? activeSidebarStepBg : "transparent";
  item.style.borderColor = "transparent";
  item.style.borderLeftColor = allCoreSetupComplete && isActive ? activeSidebarStepText : "transparent";
  item.style.color = allCoreSetupComplete
    ? (isActive ? activeSidebarStepText : (isLockedCompletedWorkflowStep ? "#94a3b8" : (isCompleted ? "#64748b" : "#1e293b")))
    : "#94a3b8";
  item.style.opacity = isLocked && !isActive ? "0.58" : "1";
  item.style.cursor = isLocked ? "not-allowed" : "pointer";
  item.tabIndex = isLocked ? -1 : 0;
  item.onclick = () => {
    if (!allCoreSetupComplete || !stepNum) return;
    if (isLocked) return;
    setSidebarActiveSection("event-workflow");
    collapseSetupViewsForWorkflowStep();
    state.currentSetupStep = stepNum;
    persistState();
    renderSetupMenuState();
    renderSetupStepStates();
    renderSidebarStepMenus();
    forceExpandSetupStep(stepNum);
    scrollSetupStepIntoView(stepNum, "smooth", true);
  };
  item.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      item.click();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const visibleItems = Array.from(document.querySelectorAll("[data-event-workflow-menu-item]"))
      .filter((workflowItem) => workflowItem.style.display !== "none");
    const currentIndex = visibleItems.indexOf(item);
    if (currentIndex < 0) return;
    const nextIndex = e.key === "ArrowDown"
      ? Math.min(visibleItems.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    const nextItem = visibleItems[nextIndex];
    if (nextItem) nextItem.focus();
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

  renderSidebarProgram();
  applySidebarSetupPhaseState();
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
  state.programSettings.preferredSchedule = [option];
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

function renderEngagementCard() {
  const card = $("teamEngagementCard");
  if (!card) return;
  const metrics = calculateEngagementMetrics();
  const usingPercentages = metrics.employeeCount > 0;
  const pollValue = usingPercentages
    ? `${metrics.pollParticipationPercent}%`
    : `${metrics.pollParticipantCount}`;
  const rsvpValue = usingPercentages
    ? `${metrics.rsvpParticipationPercent}%`
    : `${metrics.rsvpParticipantCount}`;
  const pollDetail = usingPercentages
    ? `${metrics.pollParticipantCount} of ${metrics.employeeCount} employees`
    : "Responders";
  const rsvpDetail = usingPercentages
    ? `${metrics.rsvpParticipantCount} of ${metrics.employeeCount} employees`
    : "Responders";

  card.innerHTML = `
    <h2 class="text-base font-semibold mb-3">Team Engagement</h2>
    <div class="space-y-2 text-sm">
      <div class="metric-row"><span>Poll participation</span><strong>${pollValue}</strong></div>
      <div class="text-[11px] text-slate-500 -mt-1">${pollDetail}</div>
      <div class="metric-row"><span>RSVP participation</span><strong>${rsvpValue}</strong></div>
      <div class="text-[11px] text-slate-500 -mt-1">${rsvpDetail}</div>
      <div class="metric-row"><span>Expected attendance</span><strong>${metrics.expectedAttendanceCount} employees</strong></div>
      <div class="metric-row"><span>Events run this quarter</span><strong>${metrics.eventsRunCount}</strong></div>
    </div>
    <p class="mt-3 text-[11px] text-slate-500">Engagement improves when teams participate in events.</p>
    <p class="mt-1 text-[11px] text-slate-500">Planning activity: ${metrics.planningActivityCount} (${metrics.pollsCreated} poll${metrics.pollsCreated === 1 ? "" : "s"}, ${metrics.rsvpsCreated} RSVP${metrics.rsvpsCreated === 1 ? "" : "s"})</p>
  `;
}




function getFourMonthCategoryPills() {
  // Magic link specific overrides
  const parsedMagicLink = parseMagicLinkFromHostPath();
  if (parsedMagicLink?.host === "revelrylabs.eeos.work" && parsedMagicLink?.tokenId === "rlabs2026a1b2c3d4") {
    return [
      "Budget-friendly: team engagement",
      "Premium group experience",
      "Quick and easy team bonding",
      "Morale-boosting group outing"
    ];
  }
  // Default generic pills
  return [
    "Budget-friendly: team event",
    "Celebration moment",
    "Easy team bonding",
    "Team building activity"
  ];
}

function getLaunchEventLocationPillFromOffering(offering = null) {
  if (!offering || typeof offering !== "object") return "";

  const mode = String(offering.formatCapability || offering.deliveryMode || "").trim().toLowerCase();
  if (offering.inPersonOnly === true || mode === "in_person_only" || mode === "in-person") {
    return "In-person";
  }
  if (mode === "hybrid") return "Hybrid";
  if (mode === "remote_only" || mode === "remote" || mode === "virtual" || mode === "async_slack") {
    return "Remote";
  }
  return "";
}

function getLaunchEventLocationPill(monthEvent = {}) {
  try {
    const offerings = Array.isArray(window.EVENT_OFFERINGS) ? window.EVENT_OFFERINGS : [];
    const templates = Array.isArray(window.EVENT_TEMPLATES) ? window.EVENT_TEMPLATES : [];
    const byId = new Map();

    offerings.forEach((item) => {
      const id = String(item?.id || "").trim();
      if (id) byId.set(id, item);
    });
    templates.forEach((item) => {
      const id = String(item?.id || "").trim();
      if (id && !byId.has(id)) byId.set(id, item);
    });

    const labels = new Set();
    const addLabelForId = (templateId) => {
      const id = String(templateId || "").trim();
      if (!id) return;
      const entry = byId.get(id);
      const label = getLaunchEventLocationPillFromOffering(entry);
      if (label) labels.add(label);
    };

    if (monthEvent?.isConfettiMonth && Array.isArray(monthEvent.confettiOptions)) {
      monthEvent.confettiOptions.forEach((option) => addLabelForId(option?.templateId || option?.id));
    } else {
      addLabelForId(monthEvent?.templateId || monthEvent?.id);
    }

    if (labels.size <= 1) return labels.values().next().value || "";
    return "Mixed";
  } catch (_error) {
    return "";
  }
}

function getRevelryMonthFooterText(monthName = "") {
  if (!isRevelryBracketsMagicContext()) return "";
  const label = String(monthName || "").trim();
  if (label === "April") return "Event duration: 60 minutes.  Your admin time for the month: under 45 minutes.";
  if (label === "May") return "Event duration: 15-45 minutes.  Your admin time for the month: under 30 minutes.";
  if (label === "June") return "Event duration: 9a - 2p.  Your admin time for the month: under 30 minutes.";
  return "";
}

function getMagicLinkFourMonthOverride() {
  const parsedMagicLink = parseMagicLinkFromHostPath();
  if (!parsedMagicLink) return null;
  
  const magicKey = `${parsedMagicLink.host}/${parsedMagicLink.tokenId}`;
  
  // Override for revelrylabs.eeos.work
  if (magicKey === "revelrylabs.eeos.work/rlabs2026a1b2c3d4") {
    return {
      events: [
        {
          month: 1,
          templateId: "march-madness",
          title: "Company-wide March Madness challenge",
          description: "Run a friendly NCAA tournament bracket challenge. Employees submit their picks and compete throughout the tournament for bragging rights.",
          type: "poll",
          workflowType: "straight-to-promote",
          estimatedCost: 0,
          goals: ["Team Connection & Culture"],
          score: 1.0
        },
        {
          month: 2,
          isConfettiMonth: true,
          confettiOptions: [
            {
              templateId: "confetti-large-group",
              title: "Large Group Event",
              description: "Premium virtual or in-person experience for high-engagement celebration.",
              type: "rsvp",
              workflowType: "rsvp",
              estimatedCost: 0,
              goals: ["Team Connection & Culture"],
              score: 1.0
            }
          ],
          estimatedCost: 0
        },
        {
          month: 3,
          templateId: "coffee-meetup",
          title: "Coffee Meetup",
          description: "Casual, quick team connection over coffee locally or virtually.",
          type: "rsvp",
          workflowType: "rsvp",
          estimatedCost: 0,
          goals: ["Team Connection & Culture"],
          score: 1.0
        },
        {
          month: 4,
          templateId: "volunteering-lower9",
          title: "Volunteering: Lower 9th Ward Food Pantry",
          description: "Team volunteering opportunity supporting community at food pantry.",
          type: "rsvp",
          workflowType: "rsvp",
          estimatedCost: 0,
          goals: ["Volunteering"],
          score: 1.0
        }
      ],
      totalBudget: 0,
      totalEstimatedCost: 0,
      remainingBudget: 0
    };
  }
  
  return null;
}

function applyMagicLinkFourMonthOverride(program) {
  if (hasFixedProgramWeekLayout(program)) return program;
  const override = getMagicLinkFourMonthOverride();
  if (!override) return program;
  
  // Merge override events into program, preserving budget calcs from original
  return {
    ...program,
    events: override.events,
    totalEstimatedCost: override.totalEstimatedCost,
    remainingBudget: program.remainingBudget || 0
  };
}

function normalizeRevelryMarchCardCopy(program) {
  if (hasFixedProgramWeekLayout(program)) return program;
  if (!isRevelryBracketsMagicContext()) return program;
  if (!program || typeof program !== "object") return program;
  if (!Array.isArray(program.events)) return program;

  const normalizedEvents = program.events.map((event) => {
    if (!event || typeof event !== "object") return event;
    const templateId = String(event.templateId || event.id || "").trim().toLowerCase();
    const title = String(event.title || "").trim().toLowerCase();
    const isMarchMadness = templateId === "march-madness"
      || title === "sports competition"
      || title === "march madness bracket challenge"
      || title === "march madness brackets challenge"
      || title === "company-wide march madness challenge";
    if (!isMarchMadness) return event;

    return {
      ...event,
      title: "Company-wide March Madness challenge",
      description: "Run a friendly NCAA tournament bracket challenge. Employees submit their picks and compete throughout the tournament for bragging rights."
    };
  });

  return {
    ...program,
    events: normalizedEvents
  };
}

function getSidebarWorkflowEventName() {
  const normalizeWorkflowEventName = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (isRevelryLabsReadOnlyMagicLink() && trimmed === "March Madness Brackets Challenge") {
      return "March Madness Bracket Challenge";
    }
    return trimmed;
  };

  // Only show after the event has been launched (step 7 completed)
  if (!state.completedSetupSteps.includes(EVENT_WORKFLOW_STEPS.SHORTLIST)) return "";
  if (String(state.eventLaunchContext?.title || "").trim()) {
    return normalizeWorkflowEventName(state.eventLaunchContext.title || "");
  }
  if (!state.fourMonthProgram || !Array.isArray(state.fourMonthProgram.events)) return "";
  const events = state.fourMonthProgram.events;
  const nextIndex = events.findIndex((e) => !e?.completed && !e?.created);
  const monthIndex = nextIndex >= 0 ? nextIndex : 0;
  const event = events[monthIndex];
  if (!event) return "";
  if (event.isConfettiMonth) {
    const selectedIds = Array.isArray(state.pollBuilder?.selectedEventIds) ? state.pollBuilder.selectedEventIds : [];
    const overrides = state.pollBuilder?.eventLabelOverrides || {};
    if (selectedIds.length === 1 && overrides[selectedIds[0]]) return normalizeWorkflowEventName(overrides[selectedIds[0]]);
    const booking = state.pollBuilder?.bookingConfirmation;
    if (booking?.eventName) return normalizeWorkflowEventName(booking.eventName);
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return monthNames[(new Date().getMonth() + monthIndex) % 12] + " Event";
  }
  return normalizeWorkflowEventName(event.title || "");
}

function getFourMonthShortlistState() {
  if (!state.fourMonthProgram || typeof state.fourMonthProgram !== "object") {
    return { mode: "poll", selectedTemplateIds: [] };
  }
  if (!state.fourMonthProgram.shortlist || typeof state.fourMonthProgram.shortlist !== "object") {
    state.fourMonthProgram.shortlist = { mode: "poll", selectedTemplateIds: [] };
  }
  const shortlist = state.fourMonthProgram.shortlist;
  const mode = shortlist.mode === "book" ? "book" : "poll";
  const selectedTemplateIds = Array.isArray(shortlist.selectedTemplateIds)
    ? shortlist.selectedTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  shortlist.mode = mode;
  shortlist.selectedTemplateIds = selectedTemplateIds;
  return shortlist;
}

function getFourMonthShortlistCandidates(monthEvent = {}) {
  if (isRevelryBracketsMagicContext()) {
    const selectedGoals = Array.isArray(state.landingDraft?.goals) && state.landingDraft.goals.length
      ? [...state.landingDraft.goals]
      : (Array.isArray(state.programSettings?.goals) ? [...state.programSettings.goals] : []);
    return getRevelryGoalBasedRecommendations(selectedGoals).map((item) => ({
      templateId: item.templateId,
      title: item.title,
      description: item.description,
      estimatedCost: Number(item.estimatedCost || 0),
      url: item.url,
      imageUrl: String(item.imageUrl || "").trim(),
      type: item.type,
      recommendationPills: Array.isArray(item.recommendationPills) ? [...item.recommendationPills] : []
    }));
  }

  const picked = [];
  const seen = new Set();

  const confettiOptions = Array.isArray(monthEvent.confettiOptions) ? monthEvent.confettiOptions : [];
  confettiOptions.forEach((option) => {
    const templateId = String(option?.templateId || option?.id || "").trim();
    if (!templateId || seen.has(templateId)) return;
    picked.push({
      templateId,
      title: String(option?.title || "").trim(),
      description: String(option?.description || "").trim(),
      estimatedCost: Number(option?.estimatedCost ?? 0),
      url: String(option?.url || "").trim(),
      type: String(option?.type || "poll").trim().toLowerCase()
    });
    seen.add(templateId);
  });

  const fallbackTemplates = templates.filter((template) => {
    const templateId = String(template?.id || "").trim();
    if (!templateId || seen.has(templateId)) return false;
    const type = String(template?.type || "").trim().toLowerCase();
    return type === "poll" || type === "rsvp" || type === "external";
  });

  fallbackTemplates.forEach((template) => {
    if (picked.length >= 4) return;
    const templateId = String(template.id || "").trim();
    picked.push({
      templateId,
      title: String(template.title || "").trim(),
      description: String(template.description || "").trim(),
      estimatedCost: Number(template.estimatedCost || 0),
      url: String(template.url || "").trim(),
      type: String(template.type || "").trim().toLowerCase()
    });
    seen.add(templateId);
  });

  return picked.slice(0, 4);
}

function renderWeeklyProgramCards(weeks, options) {
  const isInitialRender = options.isInitialRender !== false;
  const expandedCardIds = options.expandedCardIds instanceof Set ? options.expandedCardIds : new Set();
  const quarterLabel = Number(options.quarterLabel || 1);
  const weekItems = Array.isArray(weeks) ? weeks : [];

  if (!weekItems.length) return "";

  const calendarIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 text-slate-500" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 2.25v2.25m7.5-2.25v2.25M3.75 8.25h16.5M4.5 4.5h15a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25A.75.75 0 014.5 4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 12h.008v.008H8.25V12zm3.75 0h.008v.008H12V12zm3.75 0h.008v.008h-.008V12zM8.25 15h.008v.008H8.25V15zm3.75 0h.008v.008H12V15zm3.75 0h.008v.008h-.008V15z" /></svg>`;

  const buildSectionHeaderHtml = (label, isPrimary) => {
    const sectionColor = isPrimary ? "#0074ff" : "#94a3b8";
    const lineColor = isPrimary ? "#0074ff" : "#e2e8f0";
    return `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;${isPrimary ? "" : " margin-top: 22px;"}">
      <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${sectionColor}; white-space: nowrap;">${label}</span>
      <div style="flex: 1; height: 1px; background: ${lineColor};"></div>
    </div>`;
  };

  function resolveProgramRevealDescription(templateId, fallbackDescription) {
    return String(fallbackDescription || "").trim();
  }

  const primaryEvent = weekItems[0];
  const remainingEvents = weekItems.slice(1);
  const primaryWeekNum = Number(primaryEvent.week || 1);
  const primaryWeekLabel = `Week ${primaryWeekNum}`;
  const primaryCardId = `week-card-${primaryWeekNum}`;
  const primaryIsExpanded = isInitialRender ? true : expandedCardIds.has(primaryCardId);
  const primaryIsLaunchReady = primaryEvent.isLaunchReady === true;
  const primaryCostDisplay = primaryEvent.estimatedCost > 0
    ? `Est. cost: ${fmtMoney(primaryEvent.estimatedCost)}`
    : "Free";
  const primaryEventUrl = String(primaryEvent.url || "").trim();
  const primaryLaunchButtonHtml = primaryIsLaunchReady
    ? `<button class="rounded-lg px-4 py-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700" data-action="create-event" data-template-id="${escapeHtml(primaryEvent.templateId || "")}" data-month="1">Launch this Event →</button>`
    : (primaryEventUrl
        ? `<a href="${escapeHtml(primaryEventUrl)}" target="_blank" rel="noopener noreferrer" class="rounded-lg px-4 py-2 text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 inline-block" style="text-decoration: none;">Preview ↗</a>`
        : `<span class="text-xs text-slate-400 italic">Available after kickoff</span>`);

  const primaryCostPillsHtml = primaryCostDisplay === "Free"
    ? `<span style="display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;">performance</span><span style="display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;">async</span>`
    : "";

  const kickoffHeaderHtml = buildSectionHeaderHtml("KICKOFF", true);
  const primaryTemplateId = String(primaryEvent.templateId || primaryEvent.id || "");
  const primaryDisplayTitle = String(primaryEvent.title || "").trim();
  const primaryDisplayDescription = primaryTemplateId === "5_day_energy_reset_challenge"
    ? "Recharge with our 5-day challenge featuring quick, science-backed habits to boost focus and energy. A low-pressure, free kickoff to build program momentum for bigger, premium events to come. Admin load: Schedule 7 daily Slack posts (~5 min total)."
    : resolveProgramRevealDescription(primaryTemplateId, primaryEvent.description || "");
  const primaryCardHtml = `
    <div id="${primaryCardId}" style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.10); background: white; overflow: hidden;" class="four-month-card" data-expanded="${primaryIsExpanded ? "true" : "false"}">
      <div style="padding: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="display: inline-flex; align-items: center; gap: 6px;">
                ${calendarIconSvg}
                <h3 class="text-sm font-semibold text-slate-500">${escapeHtml(primaryWeekLabel)}</h3>
              </div>
            </div>
            <p class="text-base font-semibold text-slate-900" style="margin: 0;">${escapeHtml(primaryDisplayTitle)}</p>
          </div>
        </div>
      </div>
      <div class="four-month-content" style="display: block; padding: 16px; border-top: 1px solid #e2e8f0;">
        <p class="text-sm text-slate-600">${escapeHtml(primaryDisplayDescription)}</p>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; gap: 16px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(primaryCostDisplay)}${primaryCostPillsHtml}</div>
          ${primaryLaunchButtonHtml}
        </div>
      </div>
    </div>
  `;

  // Calculate the actual calendar quarter for the "next quarter" label.
  // Week 2 starts on the Monday after the launch week — use that date's quarter.
  const _launchMon = state.programLaunchMonday
    ? new Date(state.programLaunchMonday)
    : getProgramLaunchMonday();
  const _week2Date = new Date(_launchMon);
  _week2Date.setDate(_launchMon.getDate() + 7);
  const nextQuarterNum = Math.floor(_week2Date.getMonth() / 3) + 1;
  const totalEmployees = Math.max(0, Number(state?.fourMonthProgram?.teamSize || state?.programSettings?.employeeCount || 0));

  const ADMIN_LOAD_MAP = {
    one_slack_post:       { time: "~2 min",  task: "Schedule 1 Slack post" },
    week_of_slack_posts:  { time: "~5 min",  task: "Schedule 5 daily Slack posts" },
    rsvp_and_book:        { time: "<10 min", task: "Schedule 2 Slack posts; book event" },
    rsvp_only:            { time: "~2 min",  task: "Schedule 2 Slack posts" }
  };

  const offeringById = (() => {
    const map = new Map();
    const pool = Array.isArray(window.EVENT_OFFERINGS) ? window.EVENT_OFFERINGS : [];
    pool.forEach((item) => {
      const id = String(item?.id || "").trim();
      if (id) map.set(id, item);
    });
    return map;
  })();

  function buildAdminLoadHtml(adminLoadKey) {
    const entry = ADMIN_LOAD_MAP[String(adminLoadKey || "").trim()];
    if (!entry) return "";
    return `<span style="font-weight: 700; color: #475569;">${escapeHtml(entry.time)}</span><span style="color: #475569; margin: 0 5px;">·</span><span style="color: #475569;">${escapeHtml(entry.task)}</span>`;
  }

  function getDeliveryModePillLabel(weekEvent) {
    const mode = String(weekEvent?.deliveryMode || "").trim().toLowerCase();
    if (mode === "async_slack") return "async";
    if (mode === "in_person") return "in-person";
    if (mode === "remote") return "remote";
    return "";
  }

  function getGoalPillLabel(roiPrimary) {
    const key = String(roiPrimary || "").trim().toLowerCase();
    if (key === "employee_performance") return "performance";
    if (key === "team_connection") return "connection";
    if (key === "morale") return "morale";
    if (key === "wellbeing") return "wellbeing";
    return "";
  }

  function buildDescriptionPillsHtml(weekEvent) {
    const pills = [];
    const goalLabel = getGoalPillLabel(weekEvent?.roiPrimary);
    if (goalLabel) {
      pills.push({
        label: goalLabel,
        style: "display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
      });
    }
    const deliveryModeLabel = getDeliveryModePillLabel(weekEvent);
    if (deliveryModeLabel) {
      pills.push({
        label: deliveryModeLabel,
        style: "display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
      });
    }
    const mode = String(weekEvent?.deliveryMode || "").trim().toLowerCase();
    const durationMinutes = Number(weekEvent?.durationMinutes || 0);
    if (mode !== "async_slack" && Number.isFinite(durationMinutes) && durationMinutes > 0) {
      pills.push({
        label: `${Math.round(durationMinutes)} min`,
        style: "display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
      });
    }
    if (!pills.length) return "";
    return `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">${pills.map((pill) => `<span style="${pill.style}">${escapeHtml(pill.label)}</span>`).join("")}</div>`;
  }

  function buildHardcodedRangeCostDisplay(maxPerPerson) {
    const rawUpperBound = Math.max(0, Number(maxPerPerson || 0) * (0.45 * totalEmployees));
    const roundedUpperBound = Math.round(rawUpperBound / 100) * 100;
    const upperBoundLabel = fmtMoney(roundedUpperBound).replace(/^\$/, "");
    return `$0-${upperBoundLabel}`;
  }

  function getTriviaNightVendorNameByAvailability() {
    const candidateDays = Array.isArray(state?.landingDraft?.daysSelected) && state.landingDraft.daysSelected.length
      ? state.landingDraft.daysSelected
      : (Array.isArray(state?.programSettings?.daysSelected) ? state.programSettings.daysSelected : []);
    const weekdayDays = candidateDays
      .map((day) => String(day || "").trim())
      .filter((day) => ["M", "T", "W", "Th", "F"].includes(day));

    // If multiple days are selected, default to Thursday's vendor.
    if (weekdayDays.length !== 1) return "Port Orleans";

    const day = weekdayDays[0];
    if (day === "M") return "Second Line Brewing";
    if (day === "T") return "Urban South";
    if (day === "W") return "MCYC";
    if (day === "Th") return "Port Orleans";
    return "Port Orleans";
  }

  function buildRow(weekEvent, isLast, extraStyle) {
    const weekNum = Number(weekEvent.week || 0);
    const weekLabel = `Week ${weekNum}`;
    const templateId = String(weekEvent.templateId || weekEvent.id || "");
    const offeringMeta = offeringById.get(templateId) || null;
    const displayTitle = String(weekEvent.title || "").trim();
    const displayDescription = resolveProgramRevealDescription(templateId, weekEvent.description || "");
    const isPremium = [4, 8, 12].includes(weekNum);
    const rowBg = isPremium ? "background: #fffbeb;" : "";
    const weekLabelColor = isPremium ? "#b45309" : "#64748b";
    const isTriviaNight = /^trivia_/i.test(templateId);
    const isWednesdayAtTheSquare = /^wednesday at the square$/i.test(displayTitle);
    const isTriviaNightByTitle = /\btrivia night\b/i.test(displayTitle);
    const resolvedVendorName = isWednesdayAtTheSquare
      ? "YLC"
      : ((isTriviaNight || isTriviaNightByTitle)
        ? getTriviaNightVendorNameByAvailability()
        : String(weekEvent.vendorName || offeringMeta?.vendorName || "").trim());
    const resolvedAdminLoad = String(weekEvent.adminLoad || offeringMeta?.adminLoad || "").trim();
    const resolvedDeliveryMode = String(weekEvent.deliveryMode || offeringMeta?.deliveryMode || "").trim();
    const resolvedDurationMinutes = Number(weekEvent.durationMinutes || offeringMeta?.durationMinutes || 0);
    const resolvedCostDisplay = templateId === "wats_may6"
      ? buildHardcodedRangeCostDisplay(20)
      : isTriviaNight
        ? buildHardcodedRangeCostDisplay(25)
      : (weekEvent.estimatedCost > 0 ? escapeHtml(fmtMoney(weekEvent.estimatedCost)) : "Free");
    const resolvedRoiPrimary = String(
      weekEvent.roiPrimary
      || (Array.isArray(weekEvent.goalKeys) && weekEvent.goalKeys.length ? weekEvent.goalKeys[0] : "")
      || offeringMeta?.roiPrimary
      || (Array.isArray(offeringMeta?.goalKeys) && offeringMeta.goalKeys.length ? offeringMeta.goalKeys[0] : "")
      || ""
    ).trim();
    const adminLoadHtml = buildAdminLoadHtml(resolvedAdminLoad);
    const descriptionPillsHtml = buildDescriptionPillsHtml({
      deliveryMode: resolvedDeliveryMode,
      durationMinutes: resolvedDurationMinutes,
      roiPrimary: resolvedRoiPrimary
    });
    const vendorNameHtml = resolvedVendorName
      ? `<div style="margin-top: 2px; font-size: 12px; font-weight: 500; color: #94a3b8; line-height: 1.2;">${escapeHtml(resolvedVendorName)}</div>`
      : "";
    const style = extraStyle || "";
    return `
      <tr style="${style}">
        <td style="${rowBg}padding: 12px 30px 12px 0; border-bottom: ${isLast ? "none" : "1px solid #e2e8f0"}; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; color: ${weekLabelColor}; white-space: nowrap; vertical-align: top;">${escapeHtml(weekLabel)}</td>
        <td style="${rowBg}padding: 12px 30px 12px 0; border-bottom: ${isLast ? "none" : "1px solid #e2e8f0"}; font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.25; vertical-align: top; min-width: 180px; white-space: nowrap;">${escapeHtml(displayTitle)}${vendorNameHtml}</td>
        <td style="${rowBg}padding: 12px 30px 12px 0; border-bottom: ${isLast ? "none" : "1px solid #e2e8f0"}; font-size: 13px; color: #475569; line-height: 1.35; vertical-align: top;">${descriptionPillsHtml}${escapeHtml(displayDescription)}</td>
        <td style="${rowBg}padding: 12px 30px 12px 0; border-bottom: ${isLast ? "none" : "1px solid #e2e8f0"}; font-size: 12px; line-height: 1.35; vertical-align: top; white-space: nowrap;">${adminLoadHtml}</td>
        <td style="${rowBg}padding: 12px 0; border-bottom: ${isLast ? "none" : "1px solid #e2e8f0"}; font-size: 12px; color: #475569; text-align: center; white-space: nowrap; vertical-align: top;">${resolvedCostDisplay}</td>
      </tr>`;
  }

  // Split remaining events into weeks 2-6 (visible) and weeks 7-12 (hidden behind toggle)
  const visibleEvents = remainingEvents.filter((e) => Number(e.week || 0) <= 6);
  const hiddenEvents = remainingEvents.filter((e) => Number(e.week || 0) > 6);

  const visibleRowsHtml = visibleEvents.map((weekEvent, index) => {
    const isLast = index === visibleEvents.length - 1 && hiddenEvents.length === 0;
    return buildRow(weekEvent, isLast, "");
  }).join("");

  const hiddenRowsHtml = hiddenEvents.map((weekEvent, index) => {
    const isLast = index === hiddenEvents.length - 1;
    return buildRow(weekEvent, isLast, "display: none;").replace("<tr style=\"display: none;\">", "<tr class=\"programRevealHiddenRow\" style=\"display: none;\">");
  }).join("");

  const toggleRowHtml = hiddenEvents.length
    ? `<tr id="programRevealToggleRow">
        <td colspan="5" style="padding: 14px 0; text-align: center; border-top: 1px solid #e2e8f0;">
          <button id="programRevealToggleBtn" onclick="(function(){
            var rows = document.querySelectorAll('.programRevealHiddenRow');
            var btn = document.getElementById('programRevealToggleBtn');
            if (!rows.length || !btn) return;
            var hidden = rows[0].style.display === 'none';
            rows.forEach(function(row){ row.style.display = hidden ? '' : 'none'; });
            btn.textContent = hidden ? 'Hide weeks 7–12 ▲' : 'See weeks 7–12 ▼';
          })()" style="background: none; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: background 0.15s;">See weeks 7–12 ▼</button>
        </td>
      </tr>
      ${hiddenRowsHtml}`
    : "";

  // const nextQuarterHeaderHtml = remainingEvents.length
  //   ? `<div style="margin-top: 22px;">${buildSectionHeaderHtml("COMING UP", false)}</div>`
  //   : "";
  const nextQuarterHeaderHtml = "";

  const timelineHtml = remainingEvents.length
    ? `<div style="margin-top: 14px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding-left: 16px; padding-right: 16px;">
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
          <col style="width: 80px;">
          <col style="width: 190px;">
          <col>
          <col style="width: 220px;">
          <col style="width: 90px;">
        </colgroup>
        <thead>
          <tr>
            <th style="padding: 10px 30px 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; text-align: left; white-space: nowrap;">Week</th>
            <th style="padding: 10px 30px 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; text-align: left; white-space: nowrap; min-width: 180px;">Event</th>
            <th style="padding: 10px 30px 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; text-align: left; white-space: nowrap;">Description</th>
            <th style="padding: 10px 30px 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; text-align: left; white-space: nowrap;">Admin time to launch event</th>
            <th style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; text-transform: uppercase; text-align: center; white-space: nowrap;">Est. Cost</th>
          </tr>
        </thead>
        <tbody>
          ${visibleRowsHtml}
          ${toggleRowHtml}
        </tbody>
      </table>
    </div>`
    : "";

  return `${kickoffHeaderHtml}${primaryCardHtml}${nextQuarterHeaderHtml}${timelineHtml}`;
}

function renderFourMonthProgram() {
  const container = $("monthlyEvents");
  if (!container || !state.fourMonthProgram) return;

  if (!hasFixedProgramWeekLayout(state.fourMonthProgram)) {
    state.fourMonthProgram = seedFirstMonthFreeEvents(state.fourMonthProgram);
    state.fourMonthProgram = normalizeRevelryMarchCardCopy(state.fourMonthProgram);
  }

  const existingCards = Array.from(container.querySelectorAll(".four-month-card"));
  const isInitialRender = existingCards.length === 0;
  const expandedCardIds = new Set(
    existingCards
      .filter((card) => card.dataset.expanded === "true")
      .map((card) => card.id)
  );

  const program = state.fourMonthProgram;
  const teamSize = Math.max(0, Number(program?.teamSize || state.programSettings?.employeeCount || 0));
  const overviewEmployees = $("progOverviewEmployees");
  const overviewMonthlyBudget = $("progOverviewMonthlyBudget");
  const overviewGoals = $("progOverviewGoals");
  const overviewSetting = $("progOverviewSetting");

  const monthlyBudgetValue = Math.max(0, Number(program?.monthlyBudget || state?.programSettings?.totalBudget || state?.programSettings?.monthlyBudget || 0));
  const selectedGoals = Array.isArray(state?.programSettings?.goals)
    ? state.programSettings.goals.map((goal) => String(goal || "").trim()).filter(Boolean)
    : [];
  const mappedGoalLabels = selectedGoals.map((goal) => {
    const key = String(goal || "").trim().toLowerCase();
    if (key === "strengthen team connection") return "Connection";
    if (key === "improve employee performance") return "Performance";
    if (key === "boost morale and retention" || key === "boost morale") return "Morale";
    if (key === "support employee wellbeing") return "Wellbeing";
    return goal;
  });
  const rawScheduleSetting = Array.isArray(state?.programSettings?.preferredSchedule)
    ? String(state.programSettings.preferredSchedule[0] || "").trim().toLowerCase()
    : String(state?.programSettings?.preferredSchedule || "").trim().toLowerCase();
  const settingLabelHtml = rawScheduleSetting === "remote"
    ? "Virtual"
    : "Virtual<br>In-person";

  if (overviewEmployees) {
    overviewEmployees.textContent = teamSize > 0 ? Number(teamSize).toLocaleString("en-US") : "-";
  }
  if (overviewMonthlyBudget) {
    overviewMonthlyBudget.textContent = monthlyBudgetValue > 0 ? fmtMoney(monthlyBudgetValue) : "-";
  }
  if (overviewGoals) {
    const hasFourGoals = mappedGoalLabels.length >= 4;
    overviewGoals.style.fontSize = hasFourGoals ? "14px" : "24px";
    overviewGoals.style.lineHeight = hasFourGoals ? "1.25" : "1";
    overviewGoals.innerHTML = mappedGoalLabels.length
      ? mappedGoalLabels.map((goal) => `<div>${escapeHtml(goal)}</div>`).join("")
      : "-";
  }
  if (overviewSetting) {
    overviewSetting.innerHTML = settingLabelHtml;
    const selectedTotalRangeKey = String(state?.landingDraft?.totalBudgetRange || state?.programSettings?.totalBudgetRange || "").trim();
    const fallbackTotalBudget = Number(monthlyBudgetValue || state?.programSettings?.totalBudget || 0);
    const platformFeeAmount = getPlatformFeeForTotalBudgetRange(selectedTotalRangeKey, fallbackTotalBudget);
    const feeBadge = $("progPlatformFee");
    if (feeBadge) {
      feeBadge.textContent = `$${platformFeeAmount.toLocaleString()}`;
    }

  }
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Get current month (0-11)
  const currentMonth = new Date().getMonth();
  const categoryPills = getFourMonthCategoryPills();
  const nextEventIndex = (program.events || []).findIndex((eventItem) => !eventItem?.completed && !eventItem?.created);
  const highlightedIndex = nextEventIndex >= 0 ? nextEventIndex : 0;

  syncBudgetDisplaySurfaces();

  // If the generator produced a weeks array, render per-week cards; otherwise fall back to monthly cards.
  const hasWeeks = Array.isArray(program.weeks) && program.weeks.length > 0;
  if (hasWeeks) {
    const fallbackQuarter = Math.floor(((currentMonth + 1) % 12) / 3) + 1;
    container.innerHTML = renderWeeklyProgramCards(program.weeks, {
      isInitialRender,
      expandedCardIds,
      quarterLabel: Number(program?.nextQuarter || fallbackQuarter)
    });
  } else {
  // Render 4 months (stacked vertically, collapsed by default)
  container.innerHTML = (program.events || []).map((monthEvent, index) => {
    const monthIndex = (currentMonth + index) % 12;
    const monthName = monthNames[monthIndex];
    const isRevelryLockedFollowOnMonth = isRevelryBracketsMagicContext()
      && (monthName === "April" || monthName === "May" || monthName === "June");
    const revelryMonthFooterText = getRevelryMonthFooterText(monthName);
    const cardId = `month-card-${index + 1}`;
    const isExpanded = isInitialRender ? index === highlightedIndex : expandedCardIds.has(cardId);
    const categoryPill = categoryPills[index] || "Event";
    const locationPill = getLaunchEventLocationPill(monthEvent);
    const locationPillHtml = locationPill
      ? `<span style="display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; white-space: nowrap;">${escapeHtml(locationPill)}</span>`
      : "";
    const isNextEvent = index === highlightedIndex;
    const fallbackQuarter = Math.floor(((currentMonth + 1) % 12) / 3) + 1;
    const quarterLabel = Number(program?.nextQuarter || fallbackQuarter);
    const _sectionLabels = ["KICKOFF", `YOUR NEXT QUARTER (Q${quarterLabel})`, null, null];
    const _sectionLabel = _sectionLabels[index] || null;
    const _isFirstSection = index === 0;
    const _sectionColor = _isFirstSection ? "#0074ff" : "#94a3b8";
    const _lineColor = _isFirstSection ? "#0074ff" : "#e2e8f0";
    const sectionHeaderHtml = _sectionLabel
      ? `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;${index > 0 ? ' margin-top: 38px;' : ''}">
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: ${_sectionColor}; white-space: nowrap;">${_sectionLabel}</span>
          <div style="flex: 1; height: 1px; background: ${_lineColor};"></div>
        </div>`
      : "";
    // const nextEventBadge = isNextEvent
    //   ? '<span style="display: inline-block; background: #dfe8ff; color: #1f2939; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 400; white-space: nowrap;">Next event</span>'
    //   : "";
    const nextEventBadge = "";
    const cardBorderStyle = "1px solid #e2e8f0";
    const cardShadowStyle = isNextEvent ? "0 6px 18px rgba(15, 23, 42, 0.10)" : "0 1px 2px rgba(15, 23, 42, 0.04)";
    const headerBackgroundStyle = isNextEvent ? "#f1f5f9" : "#f8fafc";

    if (monthEvent.isSeededFreeMonth && Array.isArray(monthEvent.seededEvents)) {
      const seededEvents = monthEvent.seededEvents.filter((item) => item && typeof item === "object");
      const thisWeekEvent = seededEvents[0] || null;
      const nextWeekEvent = seededEvents[1] || null;
      const laterEvents = seededEvents.slice(2);
      const launchTemplateId = String(monthEvent.launchReadyTemplateId || thisWeekEvent?.templateId || "").trim();

      return sectionHeaderHtml + `
        <div id="${cardId}" style="border-radius: 12px; border: ${cardBorderStyle}; box-shadow: ${cardShadowStyle}; background: white; overflow: hidden;" class="four-month-card" data-expanded="${isExpanded ? "true" : "false"}" ${isNextEvent ? 'aria-label="Next event"' : ""}>
          <div style="padding: 16px; background: ${headerBackgroundStyle}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px;" class="four-month-header">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 text-slate-500" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 2.25v2.25m7.5-2.25v2.25M3.75 8.25h16.5M4.5 4.5h15a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25A.75.75 0 014.5 4.5z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 12h.008v.008H8.25V12zm3.75 0h.008v.008H12V12zm3.75 0h.008v.008h-.008V12zM8.25 15h.008v.008H8.25V15zm3.75 0h.008v.008H12V15zm3.75 0h.008v.008h-.008V15z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-slate-500">${escapeHtml(monthName)}</h3>
                  </div>
                  <span style="display: inline-block; background: #ecfeff; color: #0f766e; border: 1px solid #99f6e4; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; white-space: nowrap;">Kickoff</span>
                </div>
                <p class="text-base font-semibold text-slate-900" style="margin: 0;">Start light to build momentum</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
              ${nextEventBadge}
              <span class="four-month-arrow" style="font-size: 18px; color: #64748b; flex-shrink: 0; line-height: 1;">${isExpanded ? "▾" : "▸"}</span>
            </div>
          </div>
          <div class="four-month-content" style="display: ${isExpanded ? "block" : "none"}; padding: 16px; border-top: 1px solid #e2e8f0;">
            <div style="display: grid; gap: 12px;">
              ${thisWeekEvent ? `
                <article style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; background: #f8fafc;">
                  <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #0369a1; margin-bottom: 6px;">THIS WEEK</div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${escapeHtml(thisWeekEvent.title || "")}</h4>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;">${escapeHtml(thisWeekEvent.description || "")}</p>
                  <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <span style="font-size: 12px; color: #0f766e; font-weight: 600;">Free</span>
                    <button class="rounded-lg px-4 py-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700" data-action="create-event" data-template-id="${escapeHtml(launchTemplateId)}" data-month="${index + 1}">Launch this Event</button>
                  </div>
                </article>
              ` : ""}
              ${nextWeekEvent ? `
                <article style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #ffffff;">
                  <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px;">NEXT WEEK</div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${escapeHtml(nextWeekEvent.title || "")}</h4>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;">${escapeHtml(nextWeekEvent.description || "")}</p>
                  <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <span style="font-size: 12px; color: #0f766e; font-weight: 600;">Free</span>
                    <span style="font-size: 11px; color: #64748b; border: 1px solid #e2e8f0; background: #f8fafc; padding: 5px 8px; border-radius: 999px;">Not ready yet</span>
                  </div>
                </article>
              ` : ""}
              ${laterEvents.length ? `
                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                  <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 600;">Coming up after next week</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${laterEvents.map((item) => `<span style="font-size: 11px; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 999px; padding: 4px 8px;">${escapeHtml(item.title || "")}</span>`).join("")}
                  </div>
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      `;
    }

    // Month 2: Confetti options
    if (monthEvent.isConfettiMonth && Array.isArray(monthEvent.confettiOptions)) {
      const shortlistState = getFourMonthShortlistState();
      const candidates = getFourMonthShortlistCandidates(monthEvent);
      const candidateIds = new Set(candidates.map((item) => item.templateId));
      const selectedIds = Array.isArray(shortlistState.selectedTemplateIds)
        ? shortlistState.selectedTemplateIds.filter((id) => candidateIds.has(id))
        : [];
      shortlistState.selectedTemplateIds = selectedIds;
      const selectedSet = new Set(selectedIds);
      const isBookMode = shortlistState.mode === "book";
      const canContinue = isBookMode
        ? selectedIds.length === 1
        : selectedIds.length >= 2 && selectedIds.length <= 3;
      const helperPrimaryText = isRevelryLockedFollowOnMonth
        ? "These event options were chosen from your Setup inputs. We'll create a quick poll that you'll share with your team. We'll manage votes, RSVPs, and setup for the winning event."
        : (isBookMode
        ? "Choose an event to book."
        : "Teams that vote on events usually see higher attendance and engagement.");
      const helperSecondaryText = isRevelryLockedFollowOnMonth
        ? ""
        : (isBookMode
        ? ""
        : "Choose up to 3 events for your team to vote on.");
      const modePromptText = isBookMode
        ? "Prefer a team vote?"
        : "Prefer to choose the event yourself?";
      const modeToggleLabel = isBookMode ? "Generate a poll" : "Skip poll → Book now";
      const confettiHeaderTitle = isRevelryBracketsMagicContext() && monthName === "April"
        ? "Team-Selected Event"
        : "Choose Event";
      const confettiHeaderTitleStyle = isRevelryBracketsMagicContext() && monthName === "April"
        ? "margin: 0; font-style: italic;"
        : "margin: 0;";
      return sectionHeaderHtml + `
        <div id="${cardId}" style="border-radius: 12px; border: ${cardBorderStyle}; box-shadow: ${cardShadowStyle}; background: white; overflow: hidden;" class="four-month-card" data-expanded="${isExpanded ? "true" : "false"}" ${isNextEvent ? 'aria-label="Next event"' : ""}>
          <div style="padding: 16px; background: ${headerBackgroundStyle}; border-bottom: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px;" class="four-month-header">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 text-slate-500" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 2.25v2.25m7.5-2.25v2.25M3.75 8.25h16.5M4.5 4.5h15a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25A.75.75 0 014.5 4.5z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 12h.008v.008H8.25V12zm3.75 0h.008v.008H12V12zm3.75 0h.008v.008h-.008V12zM8.25 15h.008v.008H8.25V15zm3.75 0h.008v.008H12V15zm3.75 0h.008v.008h-.008V15z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-slate-500">${escapeHtml(monthName)}</h3>
                  </div>
                  <span style="display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; white-space: nowrap;">${escapeHtml(categoryPill)}</span>
                  ${locationPillHtml}
                </div>
                <p class="text-base font-semibold text-slate-900" style="${confettiHeaderTitleStyle}">${escapeHtml(confettiHeaderTitle)}</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
              ${nextEventBadge}
              <span class="four-month-arrow" style="font-size: 18px; color: #64748b; flex-shrink: 0; line-height: 1;">${isExpanded ? "▾" : "▸"}</span>
            </div>
          </div>
          <div class="four-month-content" style="display: ${isExpanded ? "block" : "none"}; padding: 16px;">
            <div style="margin-bottom: 12px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div style="font-size: 12px; color: #475569; line-height: 1.4;">
                <div style="font-weight: ${isBookMode ? "700" : "400"}; color: #1e293b;">${escapeHtml(helperPrimaryText)}</div>
                ${helperSecondaryText ? `<div>${escapeHtml(helperSecondaryText)}</div>` : ""}
              </div>
              ${isRevelryLockedFollowOnMonth ? "" : `<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                <span style="font-size: 12px; color: #64748b;">${escapeHtml(modePromptText)}</span>
                <button class="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50" data-action="four-month-shortlist-toggle-mode">${escapeHtml(modeToggleLabel)}</button>
              </div>`}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              ${candidates.map((candidate) => {
                const isSelected = selectedSet.has(candidate.templateId);
                const isAprilMonth = monthName === "April";
                const showEventFooter = monthName !== "April";
                const grayPills = Array.isArray(candidate.recommendationPills)
                  ? candidate.recommendationPills.filter(Boolean)
                  : [];
                const eventCardStyle = `${isRevelryLockedFollowOnMonth ? "default" : "pointer"}; ${isAprilMonth ? "height: auto;" : ""}`;
                return `
                <article class="event-card ${isSelected ? "selected" : ""}" ${isRevelryLockedFollowOnMonth ? "" : `data-action="four-month-shortlist-toggle" data-template-id="${escapeHtml(candidate.templateId)}"`} style="cursor: ${eventCardStyle}">
                  <span class="event-circle ${isSelected ? "selected" : "empty"}">${isSelected ? "" : "○"}</span>
                  <div class="event-preview">
                    ${isAprilMonth && candidate.imageUrl ? `<div style="margin-bottom: 10px; text-align: left;"><img src="${escapeHtml(candidate.imageUrl)}" alt="${escapeHtml(candidate.title || "Event image")}" style="width: 75px; height: auto; display: block; border-radius: 8px;" loading="lazy" /></div>` : ""}
                    <h4 class="event-title">${escapeHtml(candidate.title || "")}</h4>
                    ${isAprilMonth && grayPills.length
                      ? `<div class="event-gray-pills">${grayPills.map((pill) => `<span class="event-gray-pill">${escapeHtml(pill)}</span>`).join("")}</div>`
                      : `<p class="event-why">${candidate.type === "free" ? "Free event option" : "Team bonding opportunity"}</p>`}
                    <p class="event-description">${escapeHtml(candidate.description || "")}</p>
                    ${showEventFooter ? `<div class="event-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto;">
                      <span>Est. cost: <strong>${fmtMoney(candidate.estimatedCost || 0)}</strong></span>
                      ${isRevelryLockedFollowOnMonth
                        ? '<span style="color: #334155;">View Event</span>'
                        : `<a href="${escapeHtml(candidate.url || "#")}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #334155;">View Event</a>`}
                    </div>` : ""}
                  </div>
                </article>
              `;
              }).join("")}
            </div>
            ${revelryMonthFooterText ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${escapeHtml(revelryMonthFooterText)}</div>` : ""}
          </div>
        </div>
      `;
    }

    // Regular months with single event
    const event = monthEvent;
    const inCardHeading = isRevelryBracketsMagicContext()
      ? "How it Works"
      : String(event.title || "");
    const generatedEvents = Array.isArray(event.generatedEvents)
      ? event.generatedEvents.filter((item) => item && typeof item === "object")
      : [];
    const monthSubtitle = String(event.subtitle || "").trim();
    const typeLabel = getWorkflowTypeLabel(event);
    const monthBudgetValue = Math.max(0, Number(event.monthBudget || 0));
    const cardFooterText = revelryMonthFooterText || (monthBudgetValue > 0 ? `Budget: ~${fmtMoney(monthBudgetValue)}` : typeLabel);
    const launchButtonHtml = isRevelryLockedFollowOnMonth
      ? ""
      : `<button class="rounded-lg px-4 py-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700" data-action="create-event" data-template-id="${escapeHtml(event.templateId || event.id || "")}" data-month="${index + 1}">Launch ${escapeHtml(monthName)} Event →</button>`;
    return sectionHeaderHtml + `
      <div id="${cardId}" style="border-radius: 12px; border: ${cardBorderStyle}; box-shadow: ${cardShadowStyle}; background: white; overflow: hidden;" class="four-month-card" data-expanded="${isExpanded ? "true" : "false"}" ${isNextEvent ? 'aria-label="Next event"' : ""}>
        <div style="padding: 16px; background: ${headerBackgroundStyle}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px;" class="four-month-header">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="display: inline-flex; align-items: center; gap: 6px;">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 text-slate-500" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 2.25v2.25m7.5-2.25v2.25M3.75 8.25h16.5M4.5 4.5h15a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25A.75.75 0 014.5 4.5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 12h.008v.008H8.25V12zm3.75 0h.008v.008H12V12zm3.75 0h.008v.008h-.008V12zM8.25 15h.008v.008H8.25V15zm3.75 0h.008v.008H12V15zm3.75 0h.008v.008h-.008V15z" />
                  </svg>
                  <h3 class="text-sm font-semibold text-slate-500">${escapeHtml(monthName)}</h3>
                </div>
                <span style="display: inline-block; background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; white-space: nowrap;">${escapeHtml(categoryPill)}</span>
                ${locationPillHtml}
              </div>
              <p class="text-base font-semibold text-slate-900" style="margin: 0;">${escapeHtml(event.title || "")}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
            ${nextEventBadge}
            <span class="four-month-arrow" style="font-size: 18px; color: #64748b; flex-shrink: 0; line-height: 1;">${isExpanded ? "▾" : "▸"}</span>
          </div>
        </div>
        <div class="four-month-content" style="display: ${isExpanded ? "block" : "none"}; padding: 16px; border-top: 1px solid #e2e8f0;">
          <h4 class="text-sm font-semibold text-slate-900">${escapeHtml(inCardHeading)}</h4>
          ${monthSubtitle ? `<p class="text-xs text-slate-500 mt-1">${escapeHtml(monthSubtitle)}</p>` : ""}
          <p class="text-sm text-slate-600 mt-2">${escapeHtml(event.description || "")}</p>
          ${generatedEvents.length ? `<div style="margin-top: 10px; display: grid; gap: 6px;">${generatedEvents.map((item) => `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #334155;"><span>${escapeHtml(String(item.name || "Event"))}</span><span style="font-weight: 600;">${Number(item.cost || 0) > 0 ? fmtMoney(Number(item.cost || 0)) : "Free"}</span></div>`).join("")}</div>` : ""}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; gap: 16px; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #64748b;">
              <div>${escapeHtml(cardFooterText)}</div>
              <div style="margin-top: 4px; font-weight: 600; color: #0f172a;">Est. cost: ${fmtMoney(event.estimatedCost || 0)}</div>
            </div>
            ${launchButtonHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");
  } // end monthly view

  // Add click handlers for expand/collapse
  setTimeout(() => {
    document.querySelectorAll(".four-month-header").forEach((header) => {
      header.addEventListener("click", () => {
        const card = header.closest(".four-month-card");
        const content = card.querySelector(".four-month-content");
        const arrow = header.querySelector(".four-month-arrow");
        const isExpanded = card.dataset.expanded === "true";

        if (isExpanded) {
          content.style.display = "none";
          arrow.textContent = "▸";
          card.dataset.expanded = "false";
        } else {
          content.style.display = "block";
          arrow.textContent = "▾";
          card.dataset.expanded = "true";
        }
      });
    });
  }, 0);
}

function renderBrowserPanel() {
const panel = $("browserPanel");
const tabs = $("browserTabs");
const host = $("browserHost");
const placeholder = $("browserPlaceholder");

if (state.mainView !== "browser") {
  panel.classList.add("hidden");
  applySidebarSetupPhaseState();
  return;
}




if (!isElectron() || !state.browserTabs.length) {
  state.mainView = "dashboard";
  panel.classList.add("hidden");
  if (host.querySelector("webview")) {
    host.querySelector("webview").remove();
  }
  applySidebarSetupPhaseState();
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
applySidebarSetupPhaseState();
}

function openDashboardMainView(options = {}) {
  state.mainView = "dashboard";
  const browserPanel = $("browserPanel");
  if (browserPanel) browserPanel.classList.add("hidden");
  showLanding();
  // Navigate to the program overview (step 7) so the 12-week grid is shown,
  // not whichever event workflow step the user was just on.
  if (isAllCoreSetupComplete() && hasLandingFirstEventLaunchStarted()) {
    state.currentSetupStep = EVENT_WORKFLOW_STEPS.SHORTLIST;
    renderSetupStepStates();
    forceExpandSetupStep(EVENT_WORKFLOW_STEPS.SHORTLIST);
    renderSidebarStepMenus();
  }
  applySidebarSetupPhaseState();
  persistState();
  if (options.scroll !== false) {
    const mainEl = document.querySelector(".eeos-main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: options.behavior || "smooth" });
    }
  }
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
syncWorkflowStateToDraft().catch((error) => {
  console.warn("Setup sync to D1 failed", error?.message || error);
});
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
  await writeClipboardMessage(text);
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

function convertClipboardTextToHtml(text) {
  const rawText = String(text || "");
  const escape = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const linkifyInlineUrls = (line) => line.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const safeUrl = escape(url);
    return `<a href="${safeUrl}">${safeUrl}</a>`;
  });

  return rawText
    .split(/\r?\n/)
    .map((line) => {
      const labeledLink = line.match(/^([^:\n]+):\s*(https?:\/\/\S+)$/i);
      if (labeledLink) {
        const label = escape(labeledLink[1].trim());
        const url = escape(labeledLink[2].trim());
        return `<a href="${url}">${label}</a>`;
      }

      const safeLine = escape(line)
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
      return linkifyInlineUrls(safeLine);
    })
    .join("<br>");
}

function convertHtmlToSlackPlainText(html) {
  const root = document.createElement("div");
  root.innerHTML = String(html || "");

  const walk = (node) => {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = String(node.tagName || "").toUpperCase();
    if (tag === "BR") return "\n";
    if (tag === "IMG") return "";

    const childrenText = Array.from(node.childNodes || []).map(walk).join("");

    if (tag === "B" || tag === "STRONG" || tag === "U") {
      const trimmed = childrenText.trim();
      return trimmed ? `*${trimmed}*` : "";
    }
    if (tag === "I" || tag === "EM") {
      const trimmed = childrenText.trim();
      return trimmed ? `_${trimmed}_` : "";
    }

    return childrenText;
  };

  return walk(root)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function copyWithExecCommand(plainText, htmlText) {
  return new Promise((resolve, reject) => {
    const onCopy = (event) => {
      event.preventDefault();
      if (!event.clipboardData) return;
      event.clipboardData.setData("text/plain", plainText);
      event.clipboardData.setData("text/html", htmlText);
    };

    document.addEventListener("copy", onCopy);
    const copied = document.execCommand("copy");
    document.removeEventListener("copy", onCopy);

    if (copied) {
      resolve();
      return;
    }
    reject(new Error("Legacy copy failed"));
  });
}

async function writeClipboardMessage(text, options = {}) {
  const hasHtmlOverride = typeof options.html === "string" && options.html.trim().length > 0;
  const htmlText = String(hasHtmlOverride ? options.html : convertClipboardTextToHtml(String(text || "")));
  const plainText = hasHtmlOverride
    ? String(options.plainText || convertHtmlToSlackPlainText(htmlText))
    : String(text || "");

  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([plainText], { type: "text/plain" }),
        "text/html": new Blob([htmlText], { type: "text/html" })
      })
    ]);
    return;
  }

  if (typeof document.execCommand === "function") {
    try {
      await copyWithExecCommand(plainText, htmlText);
      return;
    } catch (_error) {
      // Fall through to plain text clipboard path.
    }
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(plainText);
    return;
  }

  throw new Error("Clipboard API unavailable");
}

function showSaveNudge() {
  if (getAuthToken()) return;
  const el = $("saveNudge");
  if (!el) return;
  if (showSaveNudge._timer) clearTimeout(showSaveNudge._timer);
  el.innerHTML = `<div class="flex items-start justify-between gap-3 rounded-r-xl border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3 shadow-sm text-[13px] text-indigo-900">
    <div class="leading-snug"><span class="font-semibold">Save your progress.</span> Your work is stored locally right now &mdash; <button class="font-semibold underline underline-offset-2 hover:text-indigo-700" onclick="openAuthGateWithContext('save')">create a free account</button> to keep it across devices.</div>
    <button class="flex-shrink-0 text-indigo-400 hover:text-indigo-600 text-base leading-none mt-0.5 ml-2" onclick="document.getElementById('saveNudge').classList.add('hidden')" aria-label="Dismiss">&times;</button>
  </div>`;
  el.classList.remove("hidden");
  showSaveNudge._timer = setTimeout(() => {
    if (el) el.classList.add("hidden");
  }, 8000);
}

function showMiniToast(message = "") {
  const text = String(message || "").trim();
  if (!text) return;

  let toast = document.getElementById("miniToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "miniToast";
    toast.style.position = "fixed";
    toast.style.right = "16px";
    toast.style.bottom = "16px";
    toast.style.zIndex = "9999";
    toast.style.maxWidth = "320px";
    toast.style.padding = "10px 12px";
    toast.style.borderRadius = "10px";
    toast.style.background = "rgba(15, 23, 42, 0.92)";
    toast.style.color = "#f8fafc";
    toast.style.fontSize = "13px";
    toast.style.lineHeight = "1.35";
    toast.style.boxShadow = "0 8px 22px rgba(15, 23, 42, 0.25)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "opacity 160ms ease, transform 160ms ease";
    document.body.appendChild(toast);
  }

  toast.textContent = text;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  if (showMiniToast._timer) {
    clearTimeout(showMiniToast._timer);
  }
  showMiniToast._timer = setTimeout(() => {
    const current = document.getElementById("miniToast");
    if (!current) return;
    current.style.opacity = "0";
    current.style.transform = "translateY(8px)";
  }, 2200);
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

if (action === "open-program-budget-info") {
  showProgramBudgetInfoModal();
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

if (action === "four-month-shortlist-toggle-mode") {
  if (!state.fourMonthProgram || typeof state.fourMonthProgram !== "object") {
    showMiniToast("Program not available yet");
    return;
  }
  const shortlist = getFourMonthShortlistState();
  shortlist.mode = shortlist.mode === "book" ? "poll" : "book";
  if (shortlist.mode === "book" && shortlist.selectedTemplateIds.length > 1) {
    shortlist.selectedTemplateIds = [shortlist.selectedTemplateIds[0]];
  }
  persistState();
  renderFourMonthProgram();
  return;
}

if (action === "four-month-shortlist-toggle") {
  if (event.target && typeof event.target.closest === "function" && event.target.closest("a")) {
    return;
  }
  const templateId = String(actionTarget.dataset.templateId || "").trim();
  if (!templateId) return;
  if (!state.fourMonthProgram || typeof state.fourMonthProgram !== "object") {
    showMiniToast("Program not available yet");
    return;
  }
  const shortlist = getFourMonthShortlistState();
  const selected = new Set(Array.isArray(shortlist.selectedTemplateIds) ? shortlist.selectedTemplateIds : []);
  if (shortlist.mode === "book") {
    shortlist.selectedTemplateIds = selected.has(templateId) ? [] : [templateId];
  } else {
    if (selected.has(templateId)) {
      selected.delete(templateId);
    } else if (selected.size < 3) {
      selected.add(templateId);
    }
    shortlist.selectedTemplateIds = Array.from(selected);
  }
  persistState();
  renderFourMonthProgram();
  return;
}

if (action === "four-month-shortlist-primary") {
  if (!state.fourMonthProgram || typeof state.fourMonthProgram !== "object") {
    showMiniToast("Program not available yet");
    return;
  }
  const shortlist = getFourMonthShortlistState();
  const selectedTemplateIds = Array.isArray(shortlist.selectedTemplateIds)
    ? shortlist.selectedTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  const templates = Array.isArray(window.EVENT_TEMPLATES) ? window.EVENT_TEMPLATES : [];
  const selectedTemplates = selectedTemplateIds
    .map((id) => templates.find((template) => String(template.id || "") === id))
    .filter(Boolean);

  if (shortlist.mode === "book") {
    if (selectedTemplates.length !== 1) {
      showMiniToast("Select exactly 1 event to book");
      return;
    }
    const selectedTemplate = selectedTemplates[0];
    state.setupShortlistMode = "book";
    state.setupBookSelectedEventIndex = 0;
    if (!state.completedSetupSteps.includes(7)) state.completedSetupSteps.push(7);
    if (!state.completedSetupSteps.includes(8)) state.completedSetupSteps.push(8);
    collapseSetupViewsForWorkflowStep();
    state.currentSetupStep = 9;
    state.eventWorkflowProcessStep = 9;
    persistState();
    renderSetupStepStates();
    renderSidebarStepMenus();
    updateSetupStepButtonStates();
    renderFourMonthProgram();
    if (selectedTemplate.url) {
      openVendorUrl(selectedTemplate.url, selectedTemplate.title || "Book Event");
    } else {
      showMiniToast("Selected event has no booking link");
    }
    return;
  }

  if (selectedTemplates.length < 2 || selectedTemplates.length > 3) {
    showMiniToast("Select 2-3 events to generate poll");
    return;
  }

  state.setupShortlistMode = "poll";
  state.setupPollSelectedEventIndexes = selectedTemplates.map((_, idx) => idx);
  if (!state.pollBuilder || typeof state.pollBuilder !== "object") {
    state.pollBuilder = {};
  }
  state.pollBuilder.selectedEventIds = selectedTemplates.map((template) => String(template.id || ""));
  const labelOverrides = {};
  selectedTemplates.forEach((template) => {
    const templateId = String(template.id || "");
    if (!templateId) return;
    labelOverrides[templateId] = String(template.title || template.name || templateId);
  });
  state.pollBuilder.eventLabelOverrides = labelOverrides;
  resetPollBuilderDraftFields();
  if (!state.completedSetupSteps.includes(7)) state.completedSetupSteps.push(7);
  collapseSetupViewsForWorkflowStep();
  state.currentSetupStep = 8;
  state.eventWorkflowProcessStep = 8;
  persistState();
  renderSetupStepStates();
  renderSidebarStepMenus();
  updateSetupStepButtonStates();
  renderFourMonthProgram();
  renderPollBuilderStep();
  showMiniToast("Poll options ready in Step 8");
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




if (action === "select-confetti") {
  const templateId = actionTarget.dataset.templateId;
  if (window.updateConfettiSelection && typeof window.updateConfettiSelection === "function" && state.fourMonthProgram) {
    state.fourMonthProgram = window.updateConfettiSelection(state.fourMonthProgram, templateId);
    persistState();
    renderFourMonthProgram();
  }
  return;
}




if (action === "create-event") {
  const templateId = actionTarget.dataset.templateId;
  const template = (state.fourMonthProgram?.events || []).find((e) => String(e.templateId || e.id || "") === String(templateId))
    || (Array.isArray(window.EVENT_TEMPLATES) ? window.EVENT_TEMPLATES : []).find((t) => String(t.id) === String(templateId))
    || getSeededFreeEventTemplateById(templateId);

  if (!template) {
    showMiniToast("Event template not found");
    return;
  }

  const workflowConfig = getEventWorkflowConfig(template);
  setEventLaunchContextFromTemplate(template);
  state.landingFirstEventLaunched = true;
  if (!state.programLaunchMonday) {
    state.programLaunchMonday = getProgramLaunchMonday().toISOString();
  }

  if (!state.pollBuilder || typeof state.pollBuilder !== "object") state.pollBuilder = {};
  if (!state.pollBuilder.eventLabelOverrides) state.pollBuilder.eventLabelOverrides = {};
  state.pollBuilder.selectedEventIds = [templateId];
  state.pollBuilder.eventLabelOverrides[templateId] = template.title || templateId;
  state.pollBuilder.chosenEventId = String(templateId || "");
  state.pollBuilder.chosenEventLabel = String(template.title || templateId || "");
  state.pollBuilder.vendorBookingUrl = String(template.url || "").trim();
  state.pollBuilder.costPerPerson = Number(template.costPerPerson ?? template.estimatedCost ?? 0);
  state.pollBuilder.eventLocationType = String(template.eventLocationType || template.locationType || "virtual").trim() || "virtual";
  state.pollBuilder.energyResetLaunch = templateId === "5_day_energy_reset_challenge"
    ? createDefaultEnergyResetLaunchState()
    : null;

  ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.SHORTLIST);

  if (workflowConfig.workflowType === EVENT_WORKFLOW_TYPES.POLL) {
    resetPollBuilderDraftFields();
    state.setupShortlistMode = "poll";
    goToEventWorkflowStep(EVENT_WORKFLOW_STEPS.POLL, { renderPoll: true });
  } else if (workflowConfig.workflowType === EVENT_WORKFLOW_TYPES.RSVP) {
    ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.POLL);
    state.setupShortlistMode = "rsvp";
    state.pollBuilder.showResultsPage = false;
    goToEventWorkflowStep(EVENT_WORKFLOW_STEPS.RSVP, { renderRsvp: true });
  } else {
    ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.POLL);
    ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.RSVP);
    ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.BOOK);
    state.setupShortlistMode = "rsvp";
    state.pollBuilder.showResultsPage = false;
    goToEventWorkflowStep(EVENT_WORKFLOW_STEPS.PROMOTE);
  }

  persistState();
  syncWorkflowStateToDraft().catch((error) => {
    console.warn("Launch event sync to D1 failed", error?.message || error);
  });
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
enforceRevelryRunEventViewHardLock();
renderProgramSetupForm();
renderSetupStepStates();
renderSidebar();
renderWorkflowStepper();
renderImpact();
renderEngagementCard();
renderFourMonthProgram();
renderBrowserPanel();




const active = getActiveEvent();
if (active && state.workflowStates[active.id]) {
  active.workflow = clone(state.workflowStates[active.id]);
}
}




function showLanding() {
if (isRevelryLabsReadOnlyMagicLink()) {
  showApp();
  return;
}
$("landingView").classList.remove("hidden");
$("appView").classList.add("hidden");
renderLandingIdentityView();
renderAppIdentityView();
}




function showApp() {
enforceRevelryRunEventViewHardLock();
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
    const passwordConfirm = String($("authPasswordConfirm")?.value || "").trim();
    const companyName = String($("authCompanyName")?.value || "").trim();

    if (!email || !password) {
      setAuthStatus("Enter email and password.", true);
      return;
    }
    if (mode === "signup" && !companyName) {
      setAuthStatus("Enter company name to create account.", true);
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setAuthStatus("Password must be at least 8 characters", true);
      return;
    }
    if (mode === "signup" && password !== passwordConfirm) {
      setAuthStatus("Passwords do not match", true);
      return;
    }

    authRequestBusy = true;
    const anonymousDraftPayload = mode === "signup" ? getAnonymousDraftPayload() : null;
    signupButton.disabled = true;
    signinButton.disabled = true;
    setAuthStatus(mode === "signup" ? "Creating account..." : "Signing in...");

    try {
      const magicLinkContext = mode === "signup" ? parseMagicLinkFromHostPath() : null;
      const response = mode === "signup"
        ? await authSignup(email, password, companyName, magicLinkContext)
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

      if (mode === "signup") {
        if (magicLinkContext) {
          setMagicLinkAuthStage(magicLinkContext, "signin");
        }
        const synced = await syncSignupDraftToCloud(companyId, anonymousDraftPayload, {
          companyName: companyName || state.companyName,
          adminName: state.adminName
        });
        if (!synced) {
          throw new Error("Account created, but setup sync failed. Please try saving again.");
        }

        const recommendedFromCloud = await syncCloudRecommendations(companyId);
        if (!recommendedFromCloud) {
          generateRecommendedEvents();
          await saveCloudState(clone(state));
        }
      }

      hideAuthGate();
      showLanding();
      renderAll();
      setAuthStatus("");
      if (mode === "signup") {
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

function showProgramBudgetInfoModal() {
  const modal = $("programBudgetInfoModal");
  if (!modal) return;
  modal.classList.remove("hidden");
}

function hideProgramBudgetInfoModal() {
  const modal = $("programBudgetInfoModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function isCompletedStepEditBlocked(stepNum) {
  return state.completedSetupSteps.includes(stepNum) && !state.user && !state.devBypassSetupEditAuth;
}

function inferLandingBuilderStartedState() {
  if (typeof state.landingBuilderStarted === "boolean") return;
  const hasProgress =
    (Array.isArray(state.completedSetupSteps) && state.completedSetupSteps.length > 0)
    || Boolean(state.setupEventsGenerated)
    || (Number.isInteger(state.currentSetupStep) && state.currentSetupStep > 1)
    || (Array.isArray(state.landingDraft?.goals) && state.landingDraft.goals.length > 0)
    || (Array.isArray(state.landingDraft?.teamPreferenceEstimate) && state.landingDraft.teamPreferenceEstimate.length > 0);
  state.landingBuilderStarted = hasProgress;
}

function shouldShowLandingHome() {
  const hasAuthSession = Boolean(getAuthToken());
  return !state.landingBuilderStarted && !state.appIdentityCommitted && !hasAuthSession;
}

function hasLandingFirstEventLaunchStarted() {
  if (state.landingFirstEventLaunched) return true;
  if (String(state.eventLaunchContext?.templateId || "").trim()) return true;
  if (Number.isInteger(state.currentSetupStep) && state.currentSetupStep >= EVENT_WORKFLOW_STEPS.POLL) return true;
  return Array.isArray(state.completedSetupSteps)
    && state.completedSetupSteps.some((stepNum) => Number(stepNum || 0) >= EVENT_WORKFLOW_STEPS.POLL);
}

function getLandingProgressStage() {
  if (shouldShowLandingHome()) return 0;
  if (hasLandingFirstEventLaunchStarted()) return 3;
  if (isAllCoreSetupComplete()) return 2;
  return 1;
}

function renderLandingProgressBar() {
  const progressCard = $("landingProgressCard");
  if (!progressCard) return;

  const stage = getLandingProgressStage();
  progressCard.classList.toggle("hidden", stage === 0 || stage >= 3);
  if (stage === 0 || stage >= 3) return;

  document.querySelectorAll("[data-landing-progress-step]").forEach((stepEl) => {
    const stepNum = Number(stepEl.getAttribute("data-landing-progress-step") || 0);
    let status = "upcoming";
    if (stepNum < stage) {
      status = "complete";
    } else if (stepNum === stage) {
      status = "current";
    }
    stepEl.setAttribute("data-status", status);
  });

  document.querySelectorAll("[data-landing-progress-connector]").forEach((connectorEl) => {
    const connectorNum = Number(connectorEl.getAttribute("data-landing-progress-connector") || 0);
    connectorEl.setAttribute("data-status", connectorNum < stage ? "complete" : "upcoming");
  });
}

function getProgramLaunchMonday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

const SIDEBAR_EVENT_DISPLAY_NAMES = {
  throwback_thursday: "#TBT",
  virtual_escape_quest: "Escape Quest",
  wednesday_at_the_square: "WATS",
  ama_teammate_edition: "AMA",
  green_light_new_orleans: "Green Light",
  "5_day_energy_reset_challenge": "Energy Reset Challenge"
};

function renderSidebarProgram() {
  const section = document.getElementById("sidebarProgramSection");
  const tableEl = document.getElementById("sidebarProgramTable");
  if (!section || !tableEl) return;

  const weeks = state.fourMonthProgram?.weeks;
  if (!state.landingFirstEventLaunched || !Array.isArray(weeks) || weeks.length === 0) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");

  const launchMonday = state.programLaunchMonday
    ? new Date(state.programLaunchMonday)
    : getProgramLaunchMonday();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLaunch = Math.max(0, Math.floor((today - launchMonday) / 86400000));
  const currentWeekIndex = Math.min(weeks.length - 1, Math.floor(daysSinceLaunch / 7));

  const headerHtml = `<div style="display:flex;gap:2px;align-items:center;padding:2px 8px 5px;margin-bottom:2px;border-bottom:1px solid #e2e8f0;">
    <span style="flex:0 0 40px;font-size:8px;font-weight:400;color:#94a3b8;white-space:nowrap;">WK. OF</span>
    <span style="flex:1;font-size:8px;font-weight:400;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;">Event</span>
  </div>`;

  const rowsHtml = weeks.map((week, i) => {
    const weekNum = Number(week.week || 0);
    const weekMonday = new Date(launchMonday);
    weekMonday.setDate(launchMonday.getDate() + i * 7);
    const dateLabel = `${weekMonday.getMonth() + 1}/${weekMonday.getDate()}`;
    const isCurrent = i === currentWeekIndex;
    const isPast = i < currentWeekIndex;
    const isPremiumWeek = [4, 8, 12].includes(weekNum);
    const rowBg = isCurrent ? "background:#EFF6FF;border-radius:5px;" : "";
    const dateColor = isCurrent ? "color:#1d4ed8;font-weight:700;" : isPast ? "color:#cbd5e1;" : "color:#64748b;font-weight:500;";
    const titleColor = isCurrent ? "color:#1e293b;font-weight:700;" : isPast ? "color:#cbd5e1;" : "color:#475569;";
    const premiumWeight = isPremiumWeek ? "font-weight:700;" : "";
    const displayName = SIDEBAR_EVENT_DISPLAY_NAMES[String(week.templateId || "")] || (week.title || "");
    return `<div style="display:flex;gap:2px;align-items:flex-start;padding:3px 8px;${rowBg}">
      <span style="flex:0 0 40px;font-size:11px;font-variant-numeric:tabular-nums;${dateColor}${premiumWeight}">${dateLabel}</span>
      <span style="flex:1;font-size:11px;line-height:1.4;${titleColor}${premiumWeight}">${escapeHtml(displayName)}</span>
    </div>`;
  }).join("");

  tableEl.innerHTML = headerHtml + rowsHtml;
}

function applySidebarSetupPhaseState() {
  const allCoreSetupComplete = isAllCoreSetupComplete();
  const dashboardSection = $("sidebarDashboardSection");
  const setupHeading = $("sidebarSetupHeading");
  const eventWorkflowHeading = $("sidebarEventWorkflowHeading");
  const eventWorkflowSection = $("sidebarEventWorkflowSection");
  const setupMenuCollapse = $("sidebarSetupMenuCollapse");
  const eventWorkflowMenuCollapse = $("sidebarEventWorkflowMenuCollapse");

  if (dashboardSection) {
    dashboardSection.classList.add("sidebar-nav--home-locked");
    dashboardSection.classList.remove("sidebar-top-nav-item--active");
    dashboardSection.setAttribute("aria-disabled", "true");
    dashboardSection.tabIndex = -1;
    dashboardSection.style.cursor = "default";
  }

  if (setupHeading) {
    setupHeading.classList.toggle("sidebar-nav--home-locked", !allCoreSetupComplete);
    setupHeading.style.cursor = allCoreSetupComplete ? "pointer" : "default";
  }

  if (eventWorkflowHeading) {
    eventWorkflowHeading.style.cursor = "default";
  }

  if (eventWorkflowSection) {
    eventWorkflowSection.style.display = "block";
    eventWorkflowSection.classList.toggle("sidebar-nav--home-locked", !allCoreSetupComplete);
  }

  if (!allCoreSetupComplete) {
    if (setupMenuCollapse) {
      setupMenuCollapse.style.maxHeight = "0px";
      setupMenuCollapse.style.overflow = "hidden";
    }
    if (eventWorkflowMenuCollapse) {
      eventWorkflowMenuCollapse.style.maxHeight = "0px";
      eventWorkflowMenuCollapse.style.overflow = "hidden";
    }
  }
}

function updateLandingHomeView() {
  const hero = $("landingHeroCopy");
  const heroBrandLogoWrap = $("landingHeroBrandLogoWrap");
  const landingTopHeader = $("landingTopHeader");
  const landingView = $("landingView");
  const setupSteps = $("setupStepsContainer");
  const startActions = $("landingStartActions");
  const showHome = shouldShowLandingHome();
  const isMagicLinkContext = Boolean(parseMagicLinkFromHostPath());
  const useGenericLandingFlow = isGenericLandingMirrorMagicContext();
  const showSidebar = (!useGenericLandingFlow && isMagicLinkContext)
    || (!useGenericLandingFlow && Number(state.currentSetupStep || 1) >= 7);
  const showGenericLandingHeader = !showSidebar;
  if (landingTopHeader) {
    landingTopHeader.classList.toggle("hidden", !showGenericLandingHeader);
    landingTopHeader.classList.toggle("flex", showGenericLandingHeader);
  }
  if (landingView) {
    landingView.style.paddingTop = showGenericLandingHeader ? "84px" : "";
  }
  // Show the typeform for generic landing contexts (including Susco magic link) when not yet complete.
  const typeformRoot = $("landingTypeformRoot");
  const showTypeform = (!isMagicLinkContext || useGenericLandingFlow) && !state.landingTypeformComplete && !state.landingBuilderStarted;
  if (typeformRoot) typeformRoot.style.display = showTypeform ? "" : "none";

  // The original hero card is only shown for magic-link contexts that need it
  if (hero) hero.style.display = (showHome && !showTypeform) ? "" : "none";
  if (heroBrandLogoWrap) {
    heroBrandLogoWrap.classList.toggle("hidden", !(showHome && !showTypeform && isRevelryLabsReadOnlyMagicLink()));
  }
  // Hide setup accordion steps while typeform is active
  if (setupSteps) setupSteps.classList.toggle("hidden", showHome || showTypeform);
  if (startActions) startActions.style.display = (showHome && !showTypeform) ? "block" : "none";
  renderLandingProgressBar();
  applySidebarSetupPhaseState();
}

function markLandingBuilderStarted() {
  if (state.landingBuilderStarted) return;
  state.landingBuilderStarted = true;
  persistState();
  updateLandingHomeView();
}

function startLandingBuilder() {
  if (!state.landingBuilderStarted) {
    state.landingBuilderStarted = true;
  }
  if (!Number.isInteger(state.currentSetupStep) || state.currentSetupStep < 1 || state.currentSetupStep > 6) {
    state.currentSetupStep = 1;
  }
  persistState();
  renderSetupStepStates();
  updateLandingHomeView();
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

  const allCoreSetupComplete = isAllCoreSetupComplete();
  if (!allCoreSetupComplete && (state.currentSetupStep === null || state.currentSetupStep > 6)) {
    state.currentSetupStep = 1;
  }
  if (allCoreSetupComplete) {
    const workflowProcessStep = getEventWorkflowProcessStep();
    state.setupMenuExpanded = false;
    state.sidebarSetupExpanded = false;
    state.sidebarEventWorkflowExpanded = true;
    state.sidebarActiveSection = "event-workflow";
    state.sidebarSetupAutoCollapsed = true;
    if (!Number.isInteger(state.currentSetupStep) || state.currentSetupStep <= 6) {
      state.currentSetupStep = Number.isInteger(workflowProcessStep)
        ? workflowProcessStep
        : EVENT_WORKFLOW_STEPS.SHORTLIST;
    }
  } else {
    state.setupMenuExpanded = false;
    state.sidebarSetupExpanded = false;
    state.sidebarEventWorkflowExpanded = false;
  }
  persistState();
  renderSetupMenuState();
  renderSidebarStepMenus();

  // Populate step 1: Goals
  if (Array.isArray(state.landingDraft.goals) && state.landingDraft.goals.length > 4) {
    state.landingDraft.goals = state.landingDraft.goals.slice(0, 4);
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
    } else if (state.landingDraft.goals.length < 4) {
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
    scheduleContainer.innerHTML = SCHEDULE_OPTIONS.map((optionConfig) => {
      const optionValue = String(optionConfig?.value || "");
      const optionLabel = String(optionConfig?.label || optionValue);
      const id = `setupSchedule-${optionValue.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      const isSelected = state.landingDraft.schedule[0] === optionValue;
      return `
        <label class="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 transition-all">
          <input id="${id}" name="setupSchedule-radio" type="radio" value="${optionValue}" ${isSelected ? 'checked' : ''} class="h-4 w-4 accent-slate-900" />
          <span class="text-sm font-medium text-slate-900">${optionLabel}</span>
        </label>
      `;
    }).join('');

    const localCityRow = $("setupLocalCityRow");
    const localCityInput = $("setupLocalCity");
    const magicSetupDefaults = getMagicLinkSetupDefaultsForCurrentPath();
    const localCityTriggers = new Set(["In-person", "Hybrid"]);
    
    const updateLocalCityVisibility = () => {
      if (!localCityRow) return;
      const selectedOption = state.landingDraft.schedule[0] || "";
      const shouldShow = localCityTriggers.has(selectedOption);
      localCityRow.classList.toggle("hidden", !shouldShow);
    };

    scheduleContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        const option = input.value;
        if (isCompletedStepEditBlocked(4)) {
          input.checked = false;
          showSetupSignUpPopup();
          return;
        }
        state.landingDraft.schedule = [option];
        updateLocalCityVisibility();
        persistState();
        validateAndUpdateStep4();
      });
    });

    if (localCityInput) {
      const magicLocalCity = String(magicSetupDefaults?.localCity || "").trim();
      localCityInput.placeholder = magicLocalCity
        ? `e.g. ${magicLocalCity}`
        : "e.g. New Orleans, Minneapolis, Boston";
      localCityInput.value = String(state.landingDraft.localCity || "").trim();
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
    const weekdayOptions = ["M", "T", "W", "Th", "F"];
    const supportedDayOptions = [...weekdayOptions, "Sa"];
    const supportedTimeOptions = ["Before 9a", "12-1p", "After 5p"];
    const enforceSaturdayAvailability = (days = []) => {
      const weekdays = Array.isArray(days)
        ? days.filter((day) => weekdayOptions.includes(day))
        : [];
      return [...weekdays, "Sa"];
    };
    const dayButtons = Array.from(setupStepContent5.querySelectorAll('[data-availability-day]'));
    const timeButtons = Array.from(setupStepContent5.querySelectorAll('[data-availability-time]'));
    const saturdayToggle = $("setupSaturdayToggle");
    const saturdayLabel = $("setupSaturdayLabel");
    const saturdaySwitch = $("setupSaturdaySwitch");
    const saturdaySwitchKnob = $("setupSaturdaySwitchKnob");
    const summaryDays = $("setupAvailabilitySummaryDays");
    const summarySaturday = $("setupAvailabilitySummarySaturday");
    const summaryTimes = $("setupAvailabilitySummaryTimes");
    const summarySatEnabled = $("setupAvailabilitySummarySatEnabled");
    const selectedDays = Array.isArray(state.landingDraft.daysSelected)
      ? state.landingDraft.daysSelected.filter((day) => supportedDayOptions.includes(day))
      : [];
    const selectedTimes = Array.isArray(state.landingDraft.timesSelected)
      ? state.landingDraft.timesSelected.filter((time) => supportedTimeOptions.includes(time))
      : [];
    const step5Completed = Array.isArray(state.completedSetupSteps) && state.completedSetupSteps.includes(5);
    const looksLikeLegacyDefault = selectedDays.length === 1 && selectedDays[0] === "Sa" && selectedTimes.length === 0 && !step5Completed;
    const looksLikePreviousDefault = selectedDays.length === 2
      && selectedDays.includes("W")
      && selectedDays.includes("Th")
      && selectedTimes.length === 1
      && selectedTimes[0] === "12-1p"
      && !step5Completed;

    let normalizedDays = selectedDays;
    let normalizedTimes = selectedTimes;

    if (selectedDays.length === 0 || looksLikeLegacyDefault || looksLikePreviousDefault) {
      normalizedDays = ["Th", "Sa"];
    } else {
      normalizedDays = enforceSaturdayAvailability(selectedDays);
    }
    if (normalizedTimes.length === 0 || looksLikeLegacyDefault || looksLikePreviousDefault) {
      normalizedTimes = ["After 5p"];
    }

    const daysChanged = JSON.stringify(normalizedDays) !== JSON.stringify(state.landingDraft.daysSelected || []);
    const timesChanged = JSON.stringify(normalizedTimes) !== JSON.stringify(state.landingDraft.timesSelected || []);
    if (daysChanged || timesChanged) {
      state.landingDraft.daysSelected = normalizedDays;
      state.landingDraft.timesSelected = normalizedTimes;
      persistState();
    }

    const renderAvailabilityState = () => {
      const activeDays = Array.isArray(state.landingDraft.daysSelected) ? state.landingDraft.daysSelected : [];
      const activeTimes = Array.isArray(state.landingDraft.timesSelected) ? state.landingDraft.timesSelected : [];
      const saturdayOn = activeDays.includes("Sa");
      const activeWeekdays = activeDays.filter((day) => weekdayOptions.includes(day));

      dayButtons.forEach((button) => {
        const value = button.dataset.availabilityDay;
        const selected = activeWeekdays.includes(value);
        button.classList.toggle("border-slate-800", selected);
        button.classList.toggle("bg-slate-800", selected);
        button.classList.toggle("text-white", selected);
        button.classList.toggle("border-slate-200", !selected);
        button.classList.toggle("bg-white", !selected);
        button.classList.toggle("text-slate-400", !selected);
      });

      timeButtons.forEach((button) => {
        const value = button.dataset.availabilityTime;
        const selected = activeTimes.includes(value);
        button.classList.toggle("border-slate-800", selected);
        button.classList.toggle("bg-slate-800", selected);
        button.classList.toggle("text-white", selected);
        button.classList.toggle("bg-white", !selected);
        button.classList.toggle("border-transparent", !selected);
        button.classList.toggle("text-slate-500", !selected);
      });

      if (saturdayToggle) {
        saturdayToggle.classList.toggle("border-blue-600", saturdayOn);
        saturdayToggle.classList.toggle("border-slate-200", !saturdayOn);
      }
      if (saturdayLabel) {
        saturdayLabel.classList.toggle("text-slate-900", saturdayOn);
        saturdayLabel.classList.toggle("text-slate-700", !saturdayOn);
      }
      if (saturdaySwitch) {
        saturdaySwitch.classList.toggle("bg-blue-600", saturdayOn);
        saturdaySwitch.classList.toggle("bg-slate-300", !saturdayOn);
      }
      if (saturdaySwitchKnob) {
        saturdaySwitchKnob.classList.toggle("left-6", saturdayOn);
        saturdaySwitchKnob.classList.toggle("left-1", !saturdayOn);
      }

      if (summaryDays) {
        summaryDays.textContent = activeWeekdays.length ? activeWeekdays.join(", ") : "-";
      }
      if (summarySaturday) {
        summarySaturday.classList.toggle("hidden", !saturdayOn);
      }
      if (summaryTimes) {
        summaryTimes.textContent = activeTimes.length ? activeTimes.join(" / ") : "-";
      }
      if (summarySatEnabled) {
        summarySatEnabled.textContent = saturdayOn ? "YES" : "NO";
      }
    };

    const commitAvailabilityState = () => {
      state.landingDraft.daysSelected = enforceSaturdayAvailability(state.landingDraft.daysSelected);
      persistState();
      renderAvailabilityState();
      validateAndUpdateStep5();
    };

    dayButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (isCompletedStepEditBlocked(5)) {
          showSetupSignUpPopup();
          renderAvailabilityState();
          return;
        }
        const value = button.dataset.availabilityDay;
        const current = Array.isArray(state.landingDraft.daysSelected) ? state.landingDraft.daysSelected.filter((day) => supportedDayOptions.includes(day)) : [];
        const weekdays = current.filter((day) => weekdayOptions.includes(day));
        state.landingDraft.daysSelected = weekdays.includes(value)
          ? [...weekdays.filter((day) => day !== value), "Sa"]
          : [...weekdays, value, "Sa"];
        commitAvailabilityState();
      });
    });

    timeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (isCompletedStepEditBlocked(5)) {
          showSetupSignUpPopup();
          renderAvailabilityState();
          return;
        }
        const value = button.dataset.availabilityTime;
        const current = Array.isArray(state.landingDraft.timesSelected) ? state.landingDraft.timesSelected.filter((time) => supportedTimeOptions.includes(time)) : [];
        state.landingDraft.timesSelected = current.includes(value)
          ? current.filter((time) => time !== value)
          : [...current, value];
        commitAvailabilityState();
      });
    });

    if (saturdayToggle) {
      saturdayToggle.disabled = true;
      saturdayToggle.setAttribute("aria-disabled", "true");
      saturdayToggle.classList.add("cursor-not-allowed", "opacity-90");
    }

    renderAvailabilityState();
  }

  // Populate step 6: Interests
  if (!Array.isArray(state.landingDraft.teamPreferenceEstimate)) {
    state.landingDraft.teamPreferenceEstimate = [];
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
    } else {
      state.landingDraft.teamPreferenceEstimate.push(interest);
      changed = true;
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
  const setupTotalRangeOptions = $("setupTotalRangeOptions");
  const modeTotalBtn = $("setupModeTotal");
  const modePerEmployeeBtn = $("setupModePerEmployee");
  const totalBudgetPanel = $("setupTotalBudgetPanel");
  const perEmployeePanel = $("setupPerEmployeePanel");
  const budgetInputLabel = $("setupBudgetInputLabel");
  const budgetHelper = $("setupBudgetHelper");
  const setupPlatformFeeCopy = $("setupPlatformFeeCopy");
  const budgetRangeExplainer = $("setupBudgetRangeExplainer");
  const annualTotalEl = $("setupAnnualTotal");
  const budgetGuidanceToggle = $("setupBudgetGuidanceToggle");
  const budgetGuidanceOptions = $("setupBudgetGuidanceOptions");
  const magicBudgetDefaults = getMagicLinkSetupDefaultsForCurrentPath();
  const isRevelryMagicBudgetContext = isRevelryLabsReadOnlyMagicLink();
  const revelryMinTotalMonthly = 585;
  const revelryMinPerEmployeeMonthly = 15;
  let budgetMode = "total";

  const fmtWholeMoney = (value) => {
    const n = Math.round(Number(value || 0));
    return `$${n.toLocaleString("en-US")}`;
  };

  const hasEnteredTeamSize = () => Number(employeeCountInput?.value || 0) > 0;

  let budgetValidationMessageEl = null;
  if (budgetHelper?.parentElement) {
    budgetValidationMessageEl = document.createElement("div");
    budgetValidationMessageEl.id = "setupBudgetValidationMessage";
    budgetValidationMessageEl.className = "mt-2 hidden text-xs text-rose-600";
    budgetHelper.parentElement.appendChild(budgetValidationMessageEl);
  }

  const setBudgetValidationMessage = (message = "") => {
    if (!budgetValidationMessageEl) return;
    const nextMessage = String(message || "").trim();
    budgetValidationMessageEl.textContent = nextMessage;
    budgetValidationMessageEl.classList.toggle("hidden", !nextMessage);
  };

  const enforceRevelryBudgetMinimums = (warnOnly = false) => {
    if (!isRevelryMagicBudgetContext) return;
    const totalRaw = Number(totalBudgetInput?.value || 0);
    const totalDigits = String(totalBudgetInput?.value || "").replace(/\D/g, "").length;
    const employeeRaw = Number(employeeCountInput?.value || 0);

    if (budgetMode === "total" && totalRaw > 0 && totalRaw < revelryMinTotalMonthly) {
      if (!warnOnly) {
        if (totalBudgetInput) totalBudgetInput.value = String(revelryMinTotalMonthly);
        if (employeeRaw > 0 && perEmployeeInput) {
          perEmployeeInput.value = String(Math.round(revelryMinTotalMonthly / employeeRaw));
        }
      } else if (totalDigits < 3) {
        // Not enough digits typed yet — suppress warning while editing
        setBudgetValidationMessage("");
        return;
      }
      setBudgetValidationMessage("Based on company size, the minimum is $585.");
      return;
    }

    setBudgetValidationMessage("");
  };

  const applyFundingGateState = () => {
    const unlocked = hasEnteredTeamSize();

    if (modeTotalBtn) {
      modeTotalBtn.disabled = !unlocked;
      modeTotalBtn.classList.toggle("opacity-50", !unlocked);
      modeTotalBtn.classList.toggle("cursor-not-allowed", !unlocked);
    }
    if (modePerEmployeeBtn) {
      modePerEmployeeBtn.disabled = !unlocked;
      modePerEmployeeBtn.classList.toggle("opacity-50", !unlocked);
      modePerEmployeeBtn.classList.toggle("cursor-not-allowed", !unlocked);
    }
    if (totalBudgetInput) {
      totalBudgetInput.disabled = !unlocked;
      totalBudgetInput.classList.toggle("opacity-60", !unlocked);
      totalBudgetInput.classList.toggle("cursor-not-allowed", !unlocked);
    }
    if (perEmployeeInput) {
      perEmployeeInput.disabled = !unlocked;
      perEmployeeInput.classList.toggle("opacity-60", !unlocked);
      perEmployeeInput.classList.toggle("cursor-not-allowed", !unlocked);
    }
    if (setupTotalRangeOptions) {
      setupTotalRangeOptions.querySelectorAll("[data-setup-budget-range-key]").forEach((node) => {
        const button = node;
        button.disabled = !unlocked;
        button.classList.toggle("opacity-50", !unlocked);
        button.classList.toggle("cursor-not-allowed", !unlocked);
      });
    }
    if (budgetGuidanceToggle) {
      budgetGuidanceToggle.disabled = !unlocked;
      budgetGuidanceToggle.classList.toggle("opacity-50", !unlocked);
      budgetGuidanceToggle.classList.toggle("cursor-not-allowed", !unlocked);
      if (!unlocked && budgetGuidanceOptions) {
        budgetGuidanceOptions.classList.add("hidden");
      }
    }
  };

  const updateBudgetSummary = () => {
    const totalValue = Number(totalBudgetInput?.value || 0);
    const employeeValue = Number(employeeCountInput?.value || 0);
    const roundToNearestFive = (value) => Math.round(Number(value || 0) / 5) * 5;
    const computedTotal = totalValue;
    const selectedRangeKey = String(state.landingDraft?.totalBudgetRange || getBudgetRangeKeyFromValue("total", computedTotal) || "").trim();
    const selectedRange = getBudgetRangeByKey("total", selectedRangeKey);
    const rangeLow = selectedRange ? Math.round(Number(selectedRange.min || 0)) : Math.round(computedTotal || 0);
    const rangeHigh = selectedRange ? Math.round(Number(selectedRange.max || 0)) : Math.round(computedTotal || 0);
    const rangeMedian = Math.round((rangeLow + rangeHigh) / 2);
    const computedPerEmployee = employeeValue > 0
      ? roundToNearestFive(rangeMedian / employeeValue)
      : 0;
    const annualTotal = Math.round(computedTotal * 12);

    if (budgetHelper) {
      budgetHelper.textContent = `Per Employee Per Month (Median): ${fmtWholeMoney(computedPerEmployee)}`;
    }
    if (annualTotalEl) {
      annualTotalEl.textContent = fmtWholeMoney(annualTotal);
    }
    const feeAmount = Math.round(rangeHigh * 0.2);
    if (setupPlatformFeeCopy) {
      setupPlatformFeeCopy.textContent = "Total investment includes our fee.";
    }
    if (budgetRangeExplainer) {
      budgetRangeExplainer.textContent = "";
      budgetRangeExplainer.classList.add("hidden");
    }
  };

  const renderSetupRangeOptions = () => {
    if (!setupTotalRangeOptions) return;
    const selectedKey = String(state.landingDraft?.totalBudgetRange || getBudgetRangeKeyFromValue("total", Number(totalBudgetInput?.value || 0)) || "").trim();
    const options = getBudgetRangeOptions("total");
    setupTotalRangeOptions.innerHTML = options.map((option) => {
      const isSelected = option.key === selectedKey;
      return `<button type="button" data-setup-budget-range-key="${escapeHtml(option.key)}" class="w-full rounded-full border px-4 py-2 text-sm font-semibold ${isSelected ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}">${escapeHtml(option.label)}</button>`;
    }).join("");

    setupTotalRangeOptions.querySelectorAll("[data-setup-budget-range-key]").forEach((node) => {
      const button = node;
      if (button.dataset.setupBudgetRangeBound === "true") return;
      button.dataset.setupBudgetRangeBound = "true";
      button.addEventListener("click", () => {
        if (!hasEnteredTeamSize()) {
          if (employeeCountInput) employeeCountInput.focus();
          return;
        }
        if (isCompletedStepEditBlocked(2)) {
          showSetupSignUpPopup();
          return;
        }
        const key = String(button.dataset.setupBudgetRangeKey || "").trim();
        const range = getBudgetRangeByKey("total", key);
        if (!range) return;
        const rangeBudgetValue = getBudgetRangeHighEnd("total", String(range.key || ""), Number(range.max || 0));
        if (totalBudgetInput) totalBudgetInput.value = String(rangeBudgetValue);
        state.landingDraft.totalBudgetRange = key;
        state.programSettings.totalBudgetRange = key;
        handleBudgetCalculation("totalBudget");
        renderSetupRangeOptions();
      });
    });
  };

  const renderBudgetModeUI = () => {
    const totalActiveClass = ["bg-white", "text-blue-700", "shadow-sm"];
    const totalIdleClass = ["text-slate-600", "hover:text-slate-800"];
    const perActiveClass = ["bg-white", "text-blue-700", "shadow-sm"];
    const perIdleClass = ["text-slate-600", "hover:text-slate-800"];

    if (modeTotalBtn) {
      modeTotalBtn.classList.remove(...totalActiveClass, ...totalIdleClass);
      modeTotalBtn.classList.add(...(budgetMode === "total" ? totalActiveClass : totalIdleClass));
    }
    if (modePerEmployeeBtn) {
      modePerEmployeeBtn.classList.remove(...perActiveClass, ...perIdleClass);
      modePerEmployeeBtn.classList.add(...(budgetMode === "perEmployee" ? perActiveClass : perIdleClass));
    }

    if (totalBudgetPanel) totalBudgetPanel.classList.add("hidden");
    if (perEmployeePanel) perEmployeePanel.classList.add("hidden");
    if (budgetInputLabel) {
      budgetInputLabel.textContent = "Total Monthly Investment";
    }

    renderSetupRangeOptions();
    applyFundingGateState();
    updateBudgetSummary();
  };

  const setBudgetMode = (nextMode, options = {}) => {
    const resolvedMode = nextMode === "perEmployee" ? "perEmployee" : "total";
    const shouldPersist = options.persist !== false;
    budgetMode = resolvedMode;
    state.landingDraft.budgetMode = resolvedMode;
    state.programSettings.budgetMode = resolvedMode;
    renderBudgetModeUI();
    if (shouldPersist) persistState();
  };

  if (totalBudgetInput && magicBudgetDefaults && Number(magicBudgetDefaults.totalBudget || 0) > 0) {
    totalBudgetInput.placeholder = `e.g. ${Number(magicBudgetDefaults.totalBudget || 0)}`;
  }

  if (employeeCountInput && magicBudgetDefaults && Number(magicBudgetDefaults.employeeCount || 0) > 0) {
    employeeCountInput.placeholder = `e.g. ${Number(magicBudgetDefaults.employeeCount || 0)}`;
  }
  if (perEmployeeInput && magicBudgetDefaults && Number(magicBudgetDefaults.perEmployee || 0) > 0) {
    perEmployeeInput.placeholder = `e.g. ${Number(magicBudgetDefaults.perEmployee || 0)}`;
  }

  if (isRevelryMagicBudgetContext) {
    if (modePerEmployeeBtn) {
      modePerEmployeeBtn.textContent = "Per Employee Monthly";
    }
    if (employeeCountInput) {
      employeeCountInput.placeholder = "e.g. 40";
    }
    if (totalBudgetInput) {
      totalBudgetInput.min = String(revelryMinTotalMonthly);
      totalBudgetInput.placeholder = `e.g. ${revelryMinTotalMonthly}`;
    }
    if (perEmployeeInput) {
      perEmployeeInput.min = String(revelryMinPerEmployeeMonthly);
      perEmployeeInput.placeholder = `e.g. ${revelryMinPerEmployeeMonthly}`;
    }
  }
  
  // Initialize values from state
  if (totalBudgetInput) {
    const currentTotal = Number(state.landingDraft.totalBudget || 0);
    const shouldShowConfiguredTotal = Boolean(state.landingDraft?.budgetConfigured) && currentTotal > 0;
    totalBudgetInput.value = shouldShowConfiguredTotal ? String(currentTotal) : "";
  }
  if (employeeCountInput) {
    const currentEmployees = Number(state.landingDraft.employeeCount || 0);
    employeeCountInput.value = currentEmployees > 0 ? String(currentEmployees) : "";
  }
  if (perEmployeeInput) {
    const currentPerEmployee = Number(state.landingDraft.perEmployee || 0);
    perEmployeeInput.value = currentPerEmployee > 0 ? String(currentPerEmployee) : "";
  }

  renderBudgetModeUI();
  
  const saveBudgetState = () => {
    if (isCompletedStepEditBlocked(2)) {
      if (totalBudgetInput) totalBudgetInput.value = state.landingDraft.totalBudget || "";
      if (employeeCountInput) employeeCountInput.value = state.landingDraft.employeeCount || "";
      if (perEmployeeInput) perEmployeeInput.value = state.landingDraft.perEmployee || "";
      showSetupSignUpPopup();
      return;
    }
    enforceRevelryBudgetMinimums(true); // warn only while typing; enforcement happens on blur/enter

    const prevTotal = Number(state.landingDraft.totalBudget || 0);
    const prevEmployee = Number(state.landingDraft.employeeCount || 0);
    const prevPerEmployee = Number(state.landingDraft.perEmployee || 0);

    const totalRaw = String(totalBudgetInput?.value || "").trim();
    const totalValue = Number(totalRaw || 0);
    const employeeValue = Number(employeeCountInput?.value || 0);
    const computedTotal = totalValue > 0 ? totalValue : 0;
    const perEmployeeValue = employeeValue > 0 ? Math.round(computedTotal / employeeValue) : 0;
    const budgetChanged = computedTotal !== prevTotal || employeeValue !== prevEmployee || perEmployeeValue !== prevPerEmployee;

    state.landingDraft.totalBudget = computedTotal;
    state.landingDraft.employeeCount = employeeValue;
    state.landingDraft.perEmployee = perEmployeeValue;
    state.landingDraft.budgetMode = "total";
    state.landingDraft.totalBudgetRange = resolveTotalBudgetRangeKey(computedTotal, state.landingDraft.totalBudgetRange);
    state.landingDraft.perEmployeeBudgetRange = getBudgetRangeKeyFromValue("perEmployee", perEmployeeValue);
    state.landingDraft.budgetConfigured = computedTotal > 0 && employeeValue > 0;
    state.programSettings.totalBudget = computedTotal;
    state.programSettings.employeeCount = employeeValue;
    state.programSettings.perEmployeeBudget = perEmployeeValue;
    state.programSettings.budgetMode = "total";
    state.programSettings.totalBudgetRange = state.landingDraft.totalBudgetRange;
    state.programSettings.perEmployeeBudgetRange = state.landingDraft.perEmployeeBudgetRange;

    // Preserve empty state while the user clears the total field so placeholder can return.
    if (totalBudgetInput && computedTotal > 0 && totalRaw !== "") {
      totalBudgetInput.value = String(computedTotal);
    }
    if (perEmployeeInput) {
      perEmployeeInput.value = perEmployeeValue > 0 ? String(perEmployeeValue) : "";
    }
    persistState();
    renderSidebar();
    syncBudgetDisplaySurfaces();
    renderFourMonthProgram();
    updateBudgetSummary();
    validateAndUpdateStep2(budgetChanged);
  };
  
  const handleBudgetCalculation = (sourceField) => {
    let totalBudget = Number(totalBudgetInput?.value || 0);
    let employeeCount = Number(employeeCountInput?.value || 0);
    
    // Prevent negative numbers
    if (totalBudget < 0) {
      totalBudgetInput.value = 0;
      totalBudget = 0;
    }
    if (employeeCount < 0) {
      employeeCountInput.value = 0;
      employeeCount = 0;
    }
    if (sourceField === "totalBudget" && employeeCount > 0) {
      const calculatedPerEmployee = Math.round(totalBudget / employeeCount);
      if (perEmployeeInput) perEmployeeInput.value = calculatedPerEmployee > 0 ? String(calculatedPerEmployee) : "";
    } else if (sourceField === "employeeCount" && employeeCount > 0) {
      const hasTotalBudget = totalBudget > 0;
      if (hasTotalBudget) {
        const calculatedPerEmployee = Math.round(totalBudget / employeeCount);
        if (perEmployeeInput) perEmployeeInput.value = calculatedPerEmployee > 0 ? String(calculatedPerEmployee) : "";
      }
    }
    
    enforceRevelryBudgetMinimums();
    saveBudgetState();
  };

  if (modeTotalBtn) {
    modeTotalBtn.addEventListener("click", () => {
      if (!hasEnteredTeamSize()) {
        if (employeeCountInput) employeeCountInput.focus();
        return;
      }
      if (isCompletedStepEditBlocked(2)) {
        showSetupSignUpPopup();
        return;
      }
      setBudgetMode("total");
      validateAndUpdateStep2(true);
    });
  }

  if (modePerEmployeeBtn) {
    modePerEmployeeBtn.addEventListener("click", () => {
      if (!hasEnteredTeamSize()) {
        if (employeeCountInput) employeeCountInput.focus();
        return;
      }
      if (isCompletedStepEditBlocked(2)) {
        showSetupSignUpPopup();
        return;
      }
      setBudgetMode("perEmployee");
      validateAndUpdateStep2(true);
    });
  }
  
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
      if (!hasEnteredTeamSize()) return;
      handleBudgetCalculation("totalBudget");
    });
    
    totalBudgetInput.addEventListener("input", (e) => {
      if (!hasEnteredTeamSize()) {
        e.target.value = "";
        return;
      }
      if (Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      updateBudgetSummary();
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
      applyFundingGateState();
      updateBudgetSummary();
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
      if (!hasEnteredTeamSize()) return;
      handleBudgetCalculation("perEmployee");
    });
    
    perEmployeeInput.addEventListener("input", (e) => {
      if (!hasEnteredTeamSize()) {
        e.target.value = "";
        return;
      }
      if (Number(e.target.value) < 0) {
        e.target.value = 0;
      }
      updateBudgetSummary();
      validateAndUpdateStep2(true);
      saveBudgetState();
    });
  }

  if (budgetGuidanceToggle && budgetGuidanceOptions) {
    budgetGuidanceToggle.addEventListener("click", () => {
      if (!hasEnteredTeamSize()) {
        if (employeeCountInput) employeeCountInput.focus();
        return;
      }
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

function syncLandingDraftToProgramSettings() {
  const budgetMode = "total";
  const employeeCount = Number(state.landingDraft?.employeeCount || state.programSettings?.employeeCount || 0);
  const totalBudget = Number(state.landingDraft?.totalBudget || 0);
  const perEmployeeBudget = Number(state.landingDraft?.perEmployee || 0);
  const computedMonthlyBudget = totalBudget;

  state.landingDraft.budgetMode = budgetMode;
  state.landingDraft.totalBudget = computedMonthlyBudget;
  state.landingDraft.employeeCount = employeeCount;
  state.landingDraft.perEmployee = perEmployeeBudget;
  state.landingDraft.budgetConfigured = computedMonthlyBudget > 0 || employeeCount > 0 || perEmployeeBudget > 0;

  state.programSettings.budgetMode = budgetMode;
  state.programSettings.totalBudget = computedMonthlyBudget;
  state.programSettings.totalBudgetRange = state.landingDraft.totalBudgetRange || "";
  state.programSettings.monthlyBudget = computedMonthlyBudget;
  state.programSettings.perEmployeeBudget = perEmployeeBudget;
  state.programSettings.perEmployeeBudgetRange = state.landingDraft.perEmployeeBudgetRange || "";
  state.programSettings.employeeCount = employeeCount;
  state.programSettings.goals = Array.isArray(state.landingDraft.goals)
    ? [...state.landingDraft.goals]
    : [];
  state.programSettings.preferredSchedule = Array.isArray(state.landingDraft.schedule)
    ? [...state.landingDraft.schedule]
    : [];
  state.programSettings.daysSelected = Array.isArray(state.landingDraft.daysSelected)
    ? [...state.landingDraft.daysSelected]
    : [];
  state.programSettings.timesSelected = Array.isArray(state.landingDraft.timesSelected)
    ? [...state.landingDraft.timesSelected]
    : [];
  state.programSettings.localCity = state.landingDraft.localCity || state.programSettings.localCity;
  state.programSettings.teamPreferenceEstimate = Array.isArray(state.landingDraft.teamPreferenceEstimate)
    ? [...state.landingDraft.teamPreferenceEstimate]
    : [];
  state.programSettings.cadence = state.landingDraft.cadence || state.programSettings.cadence || "Monthly";
  state.programSettings.admin_preference_weight = state.programSettings.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
}

function buildPersonalizedProgramFromSetup() {
  syncLandingDraftToProgramSettings();
  generateRecommendedEvents();

  if (window.generateFourMonthProgram && typeof window.generateFourMonthProgram === "function") {
    state.fourMonthProgram = window.generateFourMonthProgram(state.programSettings);
    if (!hasFixedProgramWeekLayout(state.fourMonthProgram)) {
      state.fourMonthProgram = applyMagicLinkFourMonthOverride(state.fourMonthProgram);
      state.fourMonthProgram = seedFirstMonthFreeEvents(state.fourMonthProgram);
    }
  }
}




function attachSetupStepHandlers() {
  document.querySelectorAll(".setup-step-header").forEach(header => {
    header.onclick = () => {
      // Main-step headers no longer control navigation.
      // Only sidebar selections can change the active step.
    };
  });

  document.querySelectorAll(".setup-step-next").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step);
      const isCompletedStep = state.completedSetupSteps.includes(step);
      const isSaveAction = step <= 6 && isCompletedStep;
      
      // Validate step before allowing advance
      if (!isSetupStepValid(step)) {
        if (step === 2 && isRevelryLabsReadOnlyMagicLink()) {
          const messageEl = $("setupBudgetValidationMessage");
          const mode = String(state.landingDraft?.budgetMode || "total").trim();
          const total = Number(state.landingDraft?.totalBudget || 0);
          const perEmployee = Number(state.landingDraft?.perEmployee || 0);
          if (messageEl) {
            if (mode === "perEmployee" && perEmployee > 0 && perEmployee < 15) {
              messageEl.textContent = "Based on company size, the minimum is $15 per employee per month.";
              messageEl.classList.remove("hidden");
            } else if (total > 0 && total < 585) {
              messageEl.textContent = "Based on company size, the minimum is $585.";
              messageEl.classList.remove("hidden");
            }
          }
        }
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

        // Rebuild the personalized program after setup has been completed.
        if (state.completedSetupSteps.includes(6)) {
          buildPersonalizedProgramFromSetup();
        } else if (state.setupEventsGenerated) {
          generateRecommendedEvents();
        }

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
        buildPersonalizedProgramFromSetup();
        
        // One-time auto-collapse after final setup step is completed
        if (!state.sidebarSetupAutoCollapsed) {
          state.sidebarActiveSection = "event-workflow";
          state.sidebarSetupExpanded = false;
          state.setupMenuExpanded = false;
          state.sidebarEventWorkflowExpanded = true;
          state.sidebarSetupAutoCollapsed = true;
          persistState();
        }
      }

      // Advance to next step if exists (book mode intentionally skips poll step and jumps to Book Event)
      if (step < 13 && !(step === 7 && state.setupShortlistMode === "book")) {
        state.currentSetupStep = step + 1;
      }
      
      // After setup completes (step 6), navigate to Shortlist Events (step 7) with expanded view
      if (step === 6) {
        persistState();
        renderAll();
        renderSidebarStepMenus();
        updateSetupStepButtonStates();
        return; // Skip rest of handler to avoid extra rendering
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
      
      if (step === 2 || step === 5) showSaveNudge();
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
      if (isRevelryBracketsMagicContext()) {
        return state.landingDraft.goals.length === 3;
      }
      return state.landingDraft.goals.length >= 1 && state.landingDraft.goals.length <= 3;
    
    case 2: // Budget
      const totalBudget = Number(state.landingDraft.totalBudget || 0);
      const employees = Number(state.landingDraft.employeeCount || 0);
      if (isRevelryLabsReadOnlyMagicLink()) {
        const meetsTotalMin = totalBudget >= 585;
        return employees > 0 && meetsTotalMin;
      }
      // Employee count is required and monthly total must be at least $500.
      return employees > 0 && totalBudget >= 500;
    
    case 3: // Cadence
      return state.landingDraft.cadence && state.landingDraft.cadence.length > 0;
    
    case 4: // Setting
      if (!state.landingDraft.schedule || state.landingDraft.schedule.length === 0) {
        return false;
      }
      // Check if city sub-question should be shown and if it's filled
      const cityTriggers = new Set([
        "In-person",
        "Hybrid"
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
      if (!state.landingDraft.daysSelected.some((day) => ["M", "T", "W", "Th", "F"].includes(day))) {
        return false;
      }
      if (!state.landingDraft.timesSelected || state.landingDraft.timesSelected.length === 0) {
        return false;
      }
      return true;

    case 6: // Interests
      return Array.isArray(state.landingDraft.teamPreferenceEstimate)
        && state.landingDraft.teamPreferenceEstimate.length >= 1;

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

    if (step === 7) {
      btn.classList.add("hidden");
      btn.disabled = true;
      return;
    }
    btn.classList.remove("hidden");

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
      btn.textContent = "Get your program →";
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
  enforceRevelryLeaderboardLockState();
  reorderMainSetupCards();
  const singleStepMainView = true;
  const revelryReadOnlyCompletedSteps = isRevelryLabsReadOnlyMagicLink();
  const allCoreSetupComplete = isAllCoreSetupComplete();
  const setupProcessCurrentStep = (() => {
    for (let step = 1; step <= 6; step += 1) {
      if (!state.completedSetupSteps.includes(step)) return step;
    }
    return null;
  })();
  const eventWorkflowProcessCurrentStep = getEventWorkflowProcessStep();
  const activeWorkflowType = getActiveWorkflowType();
  const visibleEventWorkflowSteps = EVENT_WORKFLOW_STEP_SEQUENCE.filter(
    (stepNum) => !isWorkflowStepSkipped(stepNum, activeWorkflowType)
  );
  const isRenderableStep = (stepNum) => {
    if (!Number.isInteger(stepNum)) return false;
    if (stepNum >= 1 && stepNum <= 6) return true;
    if (stepNum >= EVENT_WORKFLOW_STEPS.SHORTLIST && stepNum <= EVENT_WORKFLOW_STEPS.REVIEW) {
      return allCoreSetupComplete && visibleEventWorkflowSteps.includes(stepNum);
    }
    return false;
  };
  let activeSetupStep = Number.isInteger(state.currentSetupStep) ? state.currentSetupStep : null;
  if (!isRenderableStep(activeSetupStep)) {
    if (!allCoreSetupComplete) {
      activeSetupStep = setupProcessCurrentStep || 1;
    } else {
      const processStep = Number.isInteger(eventWorkflowProcessCurrentStep) ? eventWorkflowProcessCurrentStep : null;
      activeSetupStep = visibleEventWorkflowSteps.includes(processStep)
        ? processStep
        : (visibleEventWorkflowSteps[0] || 1);
    }
    state.currentSetupStep = activeSetupStep;
  }
  const expandMainSetupAll = allCoreSetupComplete && Boolean(state.mainSetupExpandAll);
  const collapseMainSetupCards = allCoreSetupComplete && !state.sidebarSetupExpanded && !expandMainSetupAll;
  const setupHeadingMain = document.getElementById("setupHeadingMain");
  const setupHeadingMainLabel = document.getElementById("setupHeadingMainLabel");
  const setupHeadingMainEdit = document.getElementById("setupHeadingMainEdit");
  const eventWorkflowHeadingMain = document.getElementById("eventWorkflowHeadingMain");
  const eventWorkflowHeadingMainLabel = document.getElementById("eventWorkflowHeadingMainLabel");
  const landingHeroCopy = document.getElementById("landingHeroCopy");
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

  const sidebarWorkflowEventSubtitle = document.getElementById("sidebarWorkflowEventSubtitle");
  if (sidebarWorkflowEventSubtitle) {
    const _wfEventName = getSidebarWorkflowEventName();
    sidebarWorkflowEventSubtitle.textContent = _wfEventName;
    const shouldShowWorkflowEventName = allCoreSetupComplete && _wfEventName;
    sidebarWorkflowEventSubtitle.style.display = shouldShowWorkflowEventName ? "inline-block" : "none";
    if (shouldShowWorkflowEventName) {
      sidebarWorkflowEventSubtitle.style.alignItems = "";
      sidebarWorkflowEventSubtitle.style.maxWidth = "calc(100% - 72px)";
      sidebarWorkflowEventSubtitle.style.padding = "2px 10px";
      sidebarWorkflowEventSubtitle.style.borderRadius = "9999px";
      sidebarWorkflowEventSubtitle.style.border = "1px solid #cbd5e1";
      sidebarWorkflowEventSubtitle.style.background = "#f8fafc";
      sidebarWorkflowEventSubtitle.style.fontSize = "11px";
      sidebarWorkflowEventSubtitle.style.fontWeight = "600";
      sidebarWorkflowEventSubtitle.style.lineHeight = "1.35";
      sidebarWorkflowEventSubtitle.style.color = "#0f172a";
      sidebarWorkflowEventSubtitle.style.paddingRight = "10px";
      sidebarWorkflowEventSubtitle.style.whiteSpace = "normal";
      sidebarWorkflowEventSubtitle.style.overflow = "visible";
      sidebarWorkflowEventSubtitle.style.textOverflow = "clip";
      sidebarWorkflowEventSubtitle.style.overflowWrap = "anywhere";
    }
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

  if (singleStepMainView) {
    if (landingHeroCopy) {
      landingHeroCopy.style.display = shouldShowLandingHome() ? "" : "none";
    }
    renderLandingProgressBar();
    if (setupHeadingMain) setupHeadingMain.style.display = "none";
    if (setupHeadingMainEdit) setupHeadingMainEdit.style.display = "none";
    if (eventWorkflowHeadingMain) eventWorkflowHeadingMain.style.display = "none";
    if (sidebarWorkflowEventSubtitle) sidebarWorkflowEventSubtitle.style.display = "none";
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
    const isActiveStep = stepNum === activeSetupStep;
    const isCoreSetupStep = stepNum >= 1 && stepNum <= 6;
    const isEventWorkflowStep = stepNum >= EVENT_WORKFLOW_STEPS.SHORTLIST && stepNum <= EVENT_WORKFLOW_STEPS.REVIEW;
    const isSkippedWorkflowStep = isEventWorkflowStep && isWorkflowStepSkipped(stepNum, activeWorkflowType);
    const previousWorkflowStep = isEventWorkflowStep ? getPreviousWorkflowStep(stepNum, activeWorkflowType) : null;
    const isEventWorkflowStepLocked = isEventWorkflowStep
      && !(Boolean(state.debugMode) && stepNum === EVENT_WORKFLOW_STEPS.BOOK)
      && !isSkippedWorkflowStep
      && !state.completedSetupSteps.includes(stepNum)
      && stepNum > EVENT_WORKFLOW_STEPS.SHORTLIST
      && previousWorkflowStep !== null
      && !state.completedSetupSteps.includes(previousWorkflowStep);
    const suppressRunStepLockStyling = stepNum === EVENT_WORKFLOW_STEPS.RUN
      && isRevelryBracketsMagicContext();
    const isEventWorkflowStepLockedForUi = isEventWorkflowStepLocked && !suppressRunStepLockStyling;
    const isRevelrySetupReadOnly = revelryReadOnlyCompletedSteps
      && allCoreSetupComplete
      && isCoreSetupStep;
    stepEl.classList.toggle("setup-step-locked", isEventWorkflowStepLockedForUi || isRevelrySetupReadOnly);
    if ((!allCoreSetupComplete && isEventWorkflowStep) || isSkippedWorkflowStep) {
      stepEl.style.display = "none";
    } else {
      stepEl.style.display = isActiveStep ? "" : "none";
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
        if (isRevelrySetupReadOnly) {
          if (control.tagName === "A") {
            control.setAttribute("aria-disabled", "true");
            control.setAttribute("tabindex", "-1");
            control.style.pointerEvents = "none";
          } else {
            control.disabled = true;
          }
          return;
        }
        if (isEventWorkflowStepLockedForUi) {
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
    if (isActiveStep) {
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
      numberCircle.style.fontSize = "";
      numberCircle.innerHTML = '<img src="clipboard.png" alt="" aria-hidden="true" style="width: 16px; height: 16px; object-fit: contain;" />';
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
      numberCircle.textContent = "✓";
    } else if (stepNum === 10) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "↗";
    } else if (stepNum === 11) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "✉️";
    } else if (stepNum === 12) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "🏁";
    } else if (stepNum === 13) {
      numberCircle.style.visibility = "visible";
      numberCircle.style.background = "#ffffff";
      numberCircle.style.color = "#0f172a";
      numberCircle.style.border = "1px solid #e2e8f0";
      numberCircle.style.fontSize = "16px";
      numberCircle.textContent = "📊";
    } else if (stepNum === 14) {
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
  renderRsvpStep();
  renderPromoteEventStep();
  renderBookEventStep();
  renderRunEventStep();
  renderCollectFeedbackStep();
  renderReviewImpactStep();
  updateLandingHomeView();
  renderSidebarVisibility();
}

function renderSidebarVisibility() {
  const appShell = document.getElementById('appShell');
  if (!appShell) return;
  const isMagicLink = parseMagicLinkFromHostPath() !== null;
  const useGenericLandingFlow = isGenericLandingMirrorMagicContext();
  const showSidebar = (!useGenericLandingFlow && isMagicLink)
    || (!useGenericLandingFlow && Number(state.currentSetupStep || 1) >= 7);
  appShell.classList.toggle('sidebar-hidden', !showSidebar);
  const hamburger = document.getElementById('mobileSidebarToggle');
  if (hamburger) hamburger.classList.toggle('hidden', !showSidebar);
}




// ================================================================
// LANDING TYPEFORM
// ================================================================

const ltfAnswers = {
  goals: [],
  employeeCount: 0,
  budgetMode: "total",
  totalBudget: 0,
  totalBudgetRange: "",
  perEmployee: 0,
  perEmployeeBudgetRange: "",
  cadence: "Monthly",
  schedule: [],
  localCity: "",
  workEmail: "",
  daysSelected: [],
  timesSelected: [],
  saturdayOn: undefined,
  teamPreferenceEstimate: [],
  activeLtfAvailabilitySection: "days",
  ltfAvailabilitySectionsTouched: { days: false, times: false, weekend: false },
  ltfAvailabilitySectionsCompleted: { days: false, times: false, weekend: false },
  ltfAvailabilitySectionCompleteTimers: { days: null, times: null, weekend: null },
  activeLtfBudgetSection: "teamsize",
  ltfBudgetSectionsTouched: { teamsize: false, funding: false },
  ltfBudgetSectionsCompleted: { teamsize: false, funding: false },
  ltfBudgetSectionCompleteTimers: { teamsize: null, funding: null }
};

let ltfCurrentQ = 0;
let ltfPhase = "hero"; // "hero" | "builder" | "loading" | "complete"

const LTF_LOADING_STEPS = [
  { key: "event_recommendations", label: "Event recommendations" },
  { key: "planning_scheduling", label: "Automated planning & scheduling" },
  { key: "engagement_reporting", label: "Engagement & feedback reporting" },
  { key: "copy_prompts_announcements", label: "Copy, prompts, and announcements" },
  { key: "slack_email_automations", label: "Slack + Email automations" },
  { key: "admin_rollout_guidance", label: "Admin rollout guidance" }
];

const LTF_PREVIEW_PART_IDS = [
  "ltfOverviewTop",
  "ltfOverviewGrid",
  "ltfOverviewMiniSentiment",
  "ltfOverviewGoalsMiniCard",
  "ltfOverviewGoalsLabel",
  "ltfOverviewGoalsOverlayLabel",
  "ltfWeek2Label",
  "ltfWeek2Name",
  "ltfWeek2Desc",
  "ltfWeek2PillGoal",
  "ltfWeek2PillMode",
  "ltfWeek3Label",
  "ltfWeek3Name",
  "ltfWeek3Desc",
  "ltfWeek3PillGoal",
  "ltfWeek3PillMode",
  "ltfWeek3PillDuration",
  "ltfWeek4Label",
  "ltfWeek4Name",
  "ltfWeek4Desc",
  "ltfWeek4PillGoal",
  "ltfWeek4PillMode",
  "ltfWeek5Label",
  "ltfWeek5Name",
  "ltfWeek5Desc",
  "ltfWeek5PillGoal",
  "ltfWeek5PillMode",
  "ltfWeek5PillDuration",
  "ltfWeek6Label",
  "ltfWeek6Name",
  "ltfWeek6Desc",
  "ltfWeek6PillGoal",
  "ltfWeek6PillMode",
  "ltfWeek6PillDuration",
  "ltfGoalPillPerformance",
  "ltfGoalPillMorale",
  "ltfGoalPillWellbeing",
  "ltfGoalPillConnection"
];

function toggleLtfPreviewPartBlur(id, blurred) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle("ltf-blurred", Boolean(blurred));
}

function blurAllLtfPreviewParts() {
  LTF_PREVIEW_PART_IDS.forEach((id) => toggleLtfPreviewPartBlur(id, true));
}

function revealLtfPreviewParts(ids = []) {
  ids.forEach((id) => toggleLtfPreviewPartBlur(id, false));
}

function setLtfWeekPillAlignment(weekNum, alignLeft) {
  const metaCell = $(`ltfWeek${weekNum}MetaCell`);
  const pillsWrap = $(`ltfWeek${weekNum}PillsWrap`);
  if (metaCell) metaCell.style.textAlign = alignLeft ? "left" : "right";
  if (pillsWrap) pillsWrap.style.justifyContent = alignLeft ? "flex-start" : "flex-end";
}

function updateLtfProgramGoalPillsFromAnswers() {
  const goalToPillId = {
    "Improve employee performance": "ltfGoalPillPerformance",
    "Boost morale": "ltfGoalPillMorale",
    "Support employee wellbeing": "ltfGoalPillWellbeing",
    "Strengthen team connection": "ltfGoalPillConnection"
  };

  [
    "ltfGoalPillPerformance",
    "ltfGoalPillMorale",
    "ltfGoalPillWellbeing",
    "ltfGoalPillConnection"
  ].forEach((pillId) => {
    const pillEl = $(pillId);
    if (!pillEl) return;
    pillEl.classList.add("ltf-goal-pill-hidden");
    pillEl.classList.add("ltf-blurred");
  });

  const selected = new Set(Array.isArray(ltfAnswers.goals) ? ltfAnswers.goals : []);
  Object.entries(goalToPillId).forEach(([goal, pillId]) => {
    if (!selected.has(goal)) return;
    const pillEl = $(pillId);
    if (!pillEl) return;
    pillEl.classList.remove("ltf-goal-pill-hidden");
    pillEl.classList.remove("ltf-blurred");
  });
}

function getSelectedLtfGoalPillIds() {
  const goalToPillId = {
    "Improve employee performance": "ltfGoalPillPerformance",
    "Boost morale": "ltfGoalPillMorale",
    "Support employee wellbeing": "ltfGoalPillWellbeing",
    "Strengthen team connection": "ltfGoalPillConnection"
  };
  const selected = Array.isArray(ltfAnswers.goals) ? ltfAnswers.goals : [];
  return selected.map((goal) => goalToPillId[goal]).filter(Boolean);
}

function mapLtfGoalToPillLabel(goalValue) {
  const key = String(goalValue || "").trim().toLowerCase();
  if (key === "improve employee performance") return "Performance";
  if (key === "boost morale") return "Morale";
  if (key === "support employee wellbeing") return "Wellbeing";
  if (key === "strengthen team connection") return "Connection";
  return "Connection";
}

function mapLtfFormatToPillLabel(eventLike) {
  const formatCapability = String(eventLike?.formatCapability || "").trim().toLowerCase();
  const inPersonOnly = eventLike?.inPersonOnly === true;
  if (inPersonOnly || formatCapability.includes("in_person") || formatCapability.includes("in-person")) return "In-person";
  if (formatCapability.includes("async")) return "Async";
  if (formatCapability.includes("remote") || formatCapability.includes("virtual")) return "Remote";
  return "Remote";
}

function getLtfProgramRevealDisplayName(templateId, fallbackTitle) {
  return String(fallbackTitle || "").trim();
}

function getLtfProgramRevealDescription(templateId, fallbackDescription) {
  return String(fallbackDescription || "").trim();
}

function buildLtfGeneratedProgramPreview() {
  if (!window.generateFourMonthProgram || typeof window.generateFourMonthProgram !== "function") return null;

  const employeeCount = Math.max(1, Number(ltfAnswers.employeeCount || $("ltfEmployeeCount")?.value || 1));
  const selectedDays = [
    ...(Array.isArray(ltfAnswers.daysSelected) ? ltfAnswers.daysSelected : []),
    ...(ltfAnswers.saturdayOn ? ["Sa"] : [])
  ];

  const setupData = {
    goals: Array.isArray(ltfAnswers.goals) ? [...ltfAnswers.goals] : [],
    interests: Array.isArray(ltfAnswers.teamPreferenceEstimate) ? [...ltfAnswers.teamPreferenceEstimate] : [],
    preferredSchedule: Array.isArray(ltfAnswers.schedule) ? [...ltfAnswers.schedule] : [],
    daysSelected: selectedDays,
    timesSelected: Array.isArray(ltfAnswers.timesSelected) ? [...ltfAnswers.timesSelected] : [],
    localCity: String(ltfAnswers.localCity || "").trim(),
    employeeCount,
    totalBudget: Number(ltfAnswers.totalBudget || 0),
    monthlyBudget: Number(ltfAnswers.totalBudget || 0)
  };

  let generated = window.generateFourMonthProgram(setupData);
  if (!hasFixedProgramWeekLayout(generated)) {
    if (typeof applyMagicLinkFourMonthOverride === "function") {
      generated = applyMagicLinkFourMonthOverride(generated);
    }
    if (typeof seedFirstMonthFreeEvents === "function") {
      generated = seedFirstMonthFreeEvents(generated);
    }
  }
  return generated;
}

function updateLtfWeekPreviewRowFromEvent(weekNumber, weekEvent) {
  if (!weekEvent || typeof weekEvent !== "object") return;
  const templateId = String(weekEvent.templateId || "").trim();
  const title = getLtfProgramRevealDisplayName(templateId, weekEvent.title || "");
  const description = getLtfProgramRevealDescription(templateId, weekEvent.description || "");
  const goals = Array.isArray(weekEvent.goals) ? weekEvent.goals : [];
  const goalLabel = mapLtfGoalToPillLabel(goals[0]);
  const modeLabel = mapLtfFormatToPillLabel(weekEvent);
  const estimatedCost = Number(weekEvent.estimatedCost || 0);
  const costLabel = estimatedCost <= 0 ? "Free" : "$" + Math.max(0, Math.round(estimatedCost / Math.max(1, Number(ltfAnswers.employeeCount || 1)))).toLocaleString("en-US") + "/pp";

  const nameEl = $(`ltfWeek${weekNumber}Name`);
  const descEl = $(`ltfWeek${weekNumber}Desc`);
  const goalPillEl = $(`ltfWeek${weekNumber}PillGoal`);
  const modePillEl = $(`ltfWeek${weekNumber}PillMode`);
  const costPillEl = $(`ltfWeek${weekNumber}PillCost`);

  if (nameEl) nameEl.textContent = title;
  if (descEl) descEl.textContent = description;
  if (goalPillEl) goalPillEl.textContent = goalLabel;
  if (modePillEl) modePillEl.textContent = modeLabel;
  if (costPillEl) costPillEl.textContent = costLabel;
}

function syncLtfWeek2Week3PreviewWithGeneratedProgram() {
  const generated = buildLtfGeneratedProgramPreview();
  const weeks = Array.isArray(generated?.weeks) ? generated.weeks : [];
  if (!weeks.length) return;

  const week2 = weeks.find((item) => Number(item?.week) === 2) || weeks[1] || null;
  const week3 = weeks.find((item) => Number(item?.week) === 3) || weeks[2] || null;

  if (week2) updateLtfWeekPreviewRowFromEvent(2, week2);
  if (week3) updateLtfWeekPreviewRowFromEvent(3, week3);
}

function resetLtfBuilderRevealPreviewToOriginalSample() {
  const weekDefaults = {
    2: {
      label: "Week 2",
      name: "Coffee Meetup",
      desc: "Relaxed hangout to help the team bond",
      goal: "connection",
      mode: "remote"
    },
    3: {
      label: "Week 3",
      name: "AMA: Teammate Edition",
      desc: "Learn teammate stories, skills, and quirks",
      goal: "performance",
      mode: "async"
    },
    4: {
      label: "Week 4",
      name: "Workspace Show & Tell",
      desc: "Team gives a peek into their workspace",
      goal: "connection",
      mode: "async"
    },
    5: {
      label: "Week 5",
      name: "Arcade Night",
      desc: "Games, drinks, music, and social fun together",
      goal: "morale",
      mode: "async"
    },
    6: {
      label: "Week 6",
      name: "Wednesday Wind Down",
      desc: "Drop-in meditation session for EOD de-stress",
      goal: "wellbeing",
      mode: "remote"
    }
  };

  [2, 3, 4, 5, 6].forEach((weekNum) => {
    const defaults = weekDefaults[weekNum];
    if (!defaults) return;
    const labelEl = $(`ltfWeek${weekNum}Label`);
    const nameEl = $(`ltfWeek${weekNum}Name`);
    const descEl = $(`ltfWeek${weekNum}Desc`);
    const goalEl = $(`ltfWeek${weekNum}PillGoal`);
    const modeEl = $(`ltfWeek${weekNum}PillMode`);
    if (labelEl) labelEl.textContent = defaults.label;
    if (nameEl) nameEl.textContent = defaults.name;
    if (descEl) descEl.textContent = defaults.desc;
    if (goalEl) goalEl.textContent = defaults.goal;
    if (modeEl) modeEl.textContent = defaults.mode;
  });
}

function updateLtfSamplePreviewRevealState() {
  const overviewCard = $("ltfOverviewCard");
  const expandedCard = document.querySelector(".ltf-preview-card--expanded");
  const scheduleList = document.querySelector(".ltf-preview-schedule-list");

  if (ltfPhase !== "builder") return;

  // Builder flow uses the original Week 2-6 sample, independent of the generic landing preview.
  resetLtfBuilderRevealPreviewToOriginalSample();

  // Base: keep schedule cards blurred and blur revealable preview parts.
  if (overviewCard) overviewCard.classList.remove("ltf-blurred");
  if (expandedCard) expandedCard.classList.add("ltf-blurred");
  if (scheduleList) scheduleList.classList.add("ltf-blurred");
  blurAllLtfPreviewParts();
  updateLtfProgramGoalPillsFromAnswers();

  [2, 3, 4, 5, 6].forEach((weekNum) => setLtfWeekPillAlignment(weekNum, false));

  // After Setting submission (ltfCurrentQ >= 2).
  if (ltfCurrentQ >= 2) {
    if (scheduleList) scheduleList.classList.remove("ltf-blurred");
    revealLtfPreviewParts(["ltfWeek3Label", "ltfWeek4Label", "ltfWeek5Label"]);
  }

  // During/after Goals step (ltfCurrentQ >= 3).
  if (ltfCurrentQ >= 3) {
    const selectedGoalPillIds = getSelectedLtfGoalPillIds();
    revealLtfPreviewParts(selectedGoalPillIds);
    if (selectedGoalPillIds.length > 0) {
      revealLtfPreviewParts(["ltfOverviewGoalsOverlayLabel"]);
    }
  }

  // After Investment submission (ltfCurrentQ >= 5).
  if (ltfCurrentQ >= 5) {
    revealLtfPreviewParts([
      "ltfWeek2Label",
      "ltfWeek6Label",
      "ltfWeek2PillMode",
      "ltfWeek6PillMode",
      "ltfWeek3PillMode",
      "ltfWeek5PillMode"
    ]);
  }

  // After Interests submission (ltfCurrentQ >= 6).
  if (ltfCurrentQ >= 6) {
    revealLtfPreviewParts([
      "ltfWeek2Name",
      "ltfWeek2Desc",
      "ltfWeek3Name",
      "ltfWeek3Desc",
      "ltfWeek2PillGoal",
      "ltfWeek3PillMode"
    ]);
  }
}

function initLandingTypeform() {
  const root = $("landingTypeformRoot");
  if (!root) return;

  const cyclePill = $("ltfOverviewCyclePill");
  if (cyclePill) {
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonth = previousMonthDate.toLocaleString("en-US", { month: "long" });
    cyclePill.textContent = `Period ending ${previousMonth}`;
  }

  // Set Week 2-6 labels to actual upcoming dates (1–5 weeks from today),
  // snapped to the nearest Mon–Thu (Fri → Thu, Sat → Mon, Sun → Mon).
  [2, 3, 4, 5, 6].forEach((weekNum, i) => {
    const el = $(`ltfWeek${weekNum}Label`);
    if (!el) return;
    const d = new Date();
    d.setDate(d.getDate() + (i + 1) * 7);
    const day = d.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    if (day === 5) d.setDate(d.getDate() - 1);       // Fri → Thu
    else if (day === 6) d.setDate(d.getDate() + 2);  // Sat → Mon
    else if (day === 0) d.setDate(d.getDate() + 1);  // Sun → Mon
    // Mon–Thu: no change
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    el.textContent = `${mm}/${dd}`;
  });

  const previewMonthOffsets = [
    { previewMonth: 2, offset: 1 },
    { previewMonth: 3, offset: 2 },
    { previewMonth: 4, offset: 3 },
    { previewMonth: 5, offset: 4 }
  ];
  previewMonthOffsets.forEach(({ previewMonth, offset }) => {
    const monthLabelEl = document.querySelector(`.ltf-preview-card[data-preview-month="${previewMonth}"] .ltf-card-month`);
    if (!monthLabelEl) return;
    if (previewMonth === 2) {
      monthLabelEl.textContent = "UP NEXT";
    } else {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + offset);
      const monthName = targetDate.toLocaleString("en-US", { month: "long" });
      monthLabelEl.textContent = monthName;
    }
  });

  const overviewCard = document.querySelector(".ltf-overview-card");
  const costPerEngagedEl = $("ltfOverviewCostPerEngaged");
  if (overviewCard && costPerEngagedEl) {
    const spent = Number(overviewCard.dataset.overviewSpent || 0);
    const engaged = Number(overviewCard.dataset.overviewEngaged || 0);
    const costPerEngaged = engaged > 0 ? spent / engaged : 0;
    costPerEngagedEl.textContent = `$${Math.round(costPerEngaged).toLocaleString("en-US")}`;
  }

  const isMagic = Boolean(parseMagicLinkFromHostPath());
  const useGenericLandingFlow = !isMagic || isGenericLandingMirrorMagicContext();
  if (!useGenericLandingFlow || state.landingTypeformComplete || state.landingBuilderStarted) {
    root.style.display = "none";
    return;
  }

  // Populate Q0: Goals
  renderGoalInputs("ltfGoalsGrid", ltfAnswers.goals, (goal, inputEl) => {
    if (inputEl.checked) {
      if (ltfAnswers.goals.length >= 4) { inputEl.checked = false; return; }
      ltfAnswers.goals.push(goal);
    } else {
      ltfAnswers.goals = ltfAnswers.goals.filter(g => g !== goal);
    }
    updateLtfSamplePreviewRevealState();
  });

  // Populate Q1: Investment
  initLtfBudget();

  // Populate Q2: Cadence (DISABLED)
  // initLtfCadence();

  // Populate Q3: Setting
  const updateNextButtonStateForSchedule = () => {
    const nextBtn = $("ltfNextBtn");
    if (!nextBtn) return;
    
    // Button enables when schedule is selected AND
    // (if Remote, just needs selection) OR (if In-person/Hybrid, needs city filled too)
    const hasScheduleSelection = ltfAnswers.schedule.length > 0;
    if (!hasScheduleSelection) {
      nextBtn.disabled = true;
      return;
    }
    
    const selectedOption = ltfAnswers.schedule[0];
    const localTriggers = ["In-person", "Hybrid"];
    const needsCity = localTriggers.includes(selectedOption);
    
    if (needsCity) {
      const cityFilled = (ltfAnswers.localCity || "").trim().length > 0;
      nextBtn.disabled = !cityFilled;
    } else {
      // Remote selected - just needs schedule, no city needed
      nextBtn.disabled = false;
    }
  };

  renderScheduleInputs("ltfScheduleGrid", ltfAnswers.schedule, (option) => {
    ltfAnswers.schedule = [option];
    const localTriggers = ["In-person", "Hybrid"];
    const showCity = localTriggers.includes(option);
    $("ltfLocalCityRow")?.classList.toggle("hidden", !showCity);
    updateNextButtonStateForSchedule();
  });

  // Bind city input for real-time updates
  const cityInput = $("ltfLocalCity");
  ltfAnswers.localCity = String(state.landingDraft?.localCity || ltfAnswers.localCity || "").trim();
  if (cityInput) {
    cityInput.value = ltfAnswers.localCity;
    cityInput.addEventListener("input", () => {
      ltfAnswers.localCity = (cityInput.value || "").trim();
      updateNextButtonStateForSchedule();
    });
  }

  // Populate Q4: Availability
  initLtfAvailability();

  // Populate Q5: Interests
  renderInterestInputs("ltfInterestsGrid", ltfAnswers.teamPreferenceEstimate, (interest, inputEl) => {
    if (inputEl.checked) {
      ltfAnswers.teamPreferenceEstimate.push(interest);
    } else {
      ltfAnswers.teamPreferenceEstimate = ltfAnswers.teamPreferenceEstimate.filter(o => o !== interest);
    }
  });

  // Populate Q6: Save Progress (work email)
  const workEmailInput = $("ltfWorkEmail");
  ltfAnswers.workEmail = String(state.landingDraft?.workEmail || "").trim();
  if (workEmailInput) {
    workEmailInput.value = ltfAnswers.workEmail;
    workEmailInput.addEventListener("input", () => {
      ltfAnswers.workEmail = String(workEmailInput.value || "").trim();
      if (ltfCurrentQ === 6) {
        const nextBtn = $("ltfNextBtn");
        if (nextBtn) {
          nextBtn.disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ltfAnswers.workEmail);
        }
      }
    });
  }

  // Bind CTA
  $("ltfStartBtn")?.addEventListener("click", startLandingTypeform);

  // Bind navigation
  $("ltfBackBtn")?.addEventListener("click", () => goLtfQuestion(ltfCurrentQ - 1));
  $("ltfNextBtn")?.addEventListener("click", advanceLtfQuestion);

  root.style.display = "";
}

function initLtfBudget() {
  const totalRangeOptionsWrap = $("ltfTotalRangeOptions");
  const rangePrompt = $("ltfRangePrompt");
  const totalInput = $("setupTotalBudget");
  const perInput = $("setupPerEmployee");

  const hasEnteredTeamSize = () => (parseInt($("ltfEmployeeCount")?.value || "0", 10) || 0) > 0;
  ltfAnswers.budgetMode = "total";

  const applyLtfFundingGateState = () => {
    const unlocked = hasEnteredTeamSize();
    document.querySelectorAll("[data-ltf-budget-range-key]").forEach((node) => {
      const button = node;
      button.disabled = !unlocked;
      button.classList.toggle("opacity-50", !unlocked);
      button.classList.toggle("cursor-not-allowed", !unlocked);
    });
  };

  const syncLtfRangeDerivedValues = () => {
    const empCount = parseInt($("ltfEmployeeCount")?.value || "0", 10) || 0;
    const totalOption = getBudgetRangeByKey("total", ltfAnswers.totalBudgetRange);
    const totalValue = totalOption
      ? getBudgetRangeHighEnd("total", String(totalOption.key || ""), Number(totalOption.max || 0))
      : 0;
    ltfAnswers.totalBudget = totalValue;
    ltfAnswers.perEmployee = empCount > 0 ? totalValue / empCount : 0;
    ltfAnswers.perEmployeeBudgetRange = getBudgetRangeKeyFromValue("perEmployee", ltfAnswers.perEmployee);

    if (totalInput) totalInput.value = ltfAnswers.totalBudget > 0 ? String(Math.round(ltfAnswers.totalBudget)) : "0";
    if (perInput) perInput.value = ltfAnswers.perEmployee > 0 ? String(Math.round(ltfAnswers.perEmployee)) : "0";
  };

  const renderLtfRangeOptions = () => {
    if (!totalRangeOptionsWrap) return;
    const options = getBudgetRangeOptions("total");
    totalRangeOptionsWrap.innerHTML = options.map((option) => {
      const isSelected = option.key === ltfAnswers.totalBudgetRange;
      return `<button type="button" data-ltf-budget-range-mode="total" data-ltf-budget-range-key="${option.key}" class="w-full rounded-full border px-4 py-2 text-sm font-semibold ${isSelected ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}">${escapeHtml(option.label)}</button>`;
    }).join("");

    document.querySelectorAll("[data-ltf-budget-range-key]").forEach((node) => {
      const button = node;
      if (button.dataset.ltfBudgetRangeBound === "true") return;
      button.dataset.ltfBudgetRangeBound = "true";
      button.addEventListener("click", () => {
        if (!hasEnteredTeamSize()) {
          $("ltfEmployeeCount")?.focus();
          return;
        }
        const mode = String(button.dataset.ltfBudgetRangeMode || "");
        const key = String(button.dataset.ltfBudgetRangeKey || "");
        const option = getBudgetRangeByKey(mode, key);
        if (!option) return;
        if (mode !== "total") return;
        ltfAnswers.totalBudgetRange = key;
        syncLtfRangeDerivedValues();
        updateLtfBudgetHelper();
        renderLtfRangeOptions();
        
        // Mark funding section as touched if this is the first selection
        if (!ltfAnswers.ltfBudgetSectionsTouched.funding) {
          markQ4SectionTouched("funding");
        }
        updateQ4NextButtonState();
      });
    });
    applyLtfFundingGateState();
  };

  if (rangePrompt) {
    rangePrompt.textContent = "Choose your total monthly investment range:";
  }

  $("ltfEmployeeCount")?.addEventListener("input", () => {
    const empCount = parseInt($("ltfEmployeeCount")?.value || "0", 10) || 0;
    syncLtfRangeDerivedValues();
    updateLtfBudgetHelper();
    applyLtfFundingGateState();
    
    // Mark team size as touched if user enters a value
    if (empCount > 0 && !ltfAnswers.ltfBudgetSectionsTouched.teamsize) {
      markQ4SectionTouched("teamsize");
      updateQ4NextButtonState();
    }
  });

  const startingTotal = Number(ltfAnswers.totalBudget || 0);
  if (!ltfAnswers.totalBudgetRange) {
    ltfAnswers.totalBudgetRange = getBudgetRangeKeyFromValue("total", startingTotal);
  }
  ltfAnswers.budgetMode = "total";
  syncLtfRangeDerivedValues();
  renderLtfRangeOptions();
  updateLtfBudgetHelper();
  applyLtfFundingGateState();
  
  // Initialize Q4 circle indicators and lock state
  updateQ4CircleIndicators();
  updateQ4BudgetLockState();
  updateQ4NextButtonState();
}

function updateLtfBudgetHelper() {
  const perEmployeeDisplay = $("ltfPerEmployeeDisplay");
  const ltfPlatformFeeCopy = $("ltfPlatformFeeCopy");
  if (!perEmployeeDisplay) return;

  const empCount = parseInt($("ltfEmployeeCount")?.value || "0", 10) || 0;

  const formatMoney = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString("en-US")}`;

  if (empCount <= 0) {
    perEmployeeDisplay.textContent = "—";
    if (ltfPlatformFeeCopy) {
      ltfPlatformFeeCopy.textContent = "Total investment includes our fee.";
    }
    return;
  }

  const totalRange = getBudgetRangeByKey("total", ltfAnswers.totalBudgetRange);
  if (!totalRange) {
    perEmployeeDisplay.textContent = "—";
    if (ltfPlatformFeeCopy) {
      ltfPlatformFeeCopy.textContent = "Total investment includes our fee.";
    }
    return;
  }

  const rangeLow = Number(totalRange.min || 0);
  const monthlyTotal = Number(totalRange.max || 0);
  const rangeMedian = Math.round((rangeLow + monthlyTotal) / 2);
  const pepm = empCount > 0 ? Math.round((rangeMedian / empCount) / 5) * 5 : 0;
  perEmployeeDisplay.textContent = `${formatMoney(pepm)} / mo`;
  const feeAmount = Math.round(monthlyTotal * 0.2);
  if (ltfPlatformFeeCopy) {
    ltfPlatformFeeCopy.textContent = "Total investment includes our fee.";
  }
}

function updateQ4CircleIndicators() {
  const sections = ["teamsize", "funding"];
  
  sections.forEach(section => {
    const indicator = document.querySelector(`[data-ltf-budget-section="${section}"] .ltf-availability-indicator`);
    if (!indicator) return;
    
    const isCompleted = ltfAnswers.ltfBudgetSectionsCompleted[section];
    const isActive = ltfAnswers.activeLtfBudgetSection === section;
    
    indicator.classList.remove("bg-white", "bg-slate-800", "border", "border-slate-700", "text-slate-700", "text-white");
    
    if (isCompleted) {
      // Filled circle with checkmark
      indicator.classList.add("bg-slate-800", "text-white");
      indicator.innerHTML = '✓';
    } else if (isActive) {
      // Current step: filled circle (no label)
      indicator.classList.add("bg-slate-800", "text-white");
      indicator.textContent = '';
    } else {
      // Upcoming step: unfilled circle with border (no label)
      indicator.classList.add("border", "border-slate-700", "bg-white", "text-slate-700");
      indicator.textContent = '';
    }
  });
}

function updateQ4BudgetLockState() {
  const sections = ["teamsize", "funding"];
  
  sections.forEach((section) => {
    const isCompleted = ltfAnswers.ltfBudgetSectionsCompleted[section];
    const isActive = ltfAnswers.activeLtfBudgetSection === section;
    const shouldBeEnabled = isCompleted || isActive;
    
    // Gray out the entire section container
    const sectionEl = document.querySelector(`[data-ltf-budget-section="${section}"]`);
    if (sectionEl) {
      sectionEl.classList.toggle("opacity-50", !shouldBeEnabled);
      sectionEl.classList.toggle("text-slate-400", !shouldBeEnabled);
      sectionEl.style.pointerEvents = shouldBeEnabled ? "auto" : "none";
    }
    
    // Disable buttons/inputs in this section if not enabled
    if (section === "teamsize") {
      const input = $("ltfEmployeeCount");
      if (input) input.disabled = !shouldBeEnabled;
    } else if (section === "funding") {
      document.querySelectorAll("[data-ltf-budget-range-key]").forEach((btn) => {
        btn.disabled = !shouldBeEnabled;
        btn.classList.toggle("opacity-50", !shouldBeEnabled);
        btn.classList.toggle("cursor-not-allowed", !shouldBeEnabled);
      });
    }
  });
}

function markQ4SectionTouched(section) {
  ltfAnswers.ltfBudgetSectionsTouched[section] = true;
  
  // Clear any existing timer
  if (ltfAnswers.ltfBudgetSectionCompleteTimers[section]) {
    clearTimeout(ltfAnswers.ltfBudgetSectionCompleteTimers[section]);
  }
  
  const sections = ["teamsize", "funding"];
  const currentIndex = sections.indexOf(section);
  const isLastSection = currentIndex === sections.length - 1;
  
  // Set 0.5-second timer to mark complete and auto-advance to next section
  ltfAnswers.ltfBudgetSectionCompleteTimers[section] = setTimeout(() => {
    ltfAnswers.ltfBudgetSectionsCompleted[section] = true;
    
    // Auto-advance to next section (if not the last one)
    if (!isLastSection) {
      ltfAnswers.activeLtfBudgetSection = sections[currentIndex + 1];
    }
    
    updateQ4CircleIndicators();
    updateQ4BudgetLockState();
    updateQ4NextButtonState();
  }, 500);
}

function updateQ4NextButtonState() {
  // Button enables when both sections are completed
  const teamSizeComplete = ltfAnswers.ltfBudgetSectionsCompleted.teamsize;
  const fundingComplete = ltfAnswers.ltfBudgetSectionsCompleted.funding;
  
  const nextBtn = $("ltfNextBtn");
  if (!nextBtn) return;
  
  nextBtn.disabled = !(teamSizeComplete && fundingComplete);
}

function initLtfCadence() {
  const sel = $("ltfCadence");
  if (!sel) return;
  sel.innerHTML = CADENCE_OPTIONS.map(opt =>
    `<option value="${opt}"${opt === ltfAnswers.cadence ? " selected" : ""}>${opt}</option>`
  ).join("");
  sel.addEventListener("change", e => { ltfAnswers.cadence = e.target.value; });
}

function initLtfAvailability() {
  const getNormalizedDaysForDraft = () => {
    const weekdays = Array.isArray(ltfAnswers.daysSelected)
      ? ltfAnswers.daysSelected.filter((day) => ["M", "T", "W", "Th", "F"].includes(day))
      : [];
    return ltfAnswers.saturdayOn ? [...weekdays, "Sa"] : weekdays;
  };

  const persistLtfAvailabilityDraft = () => {
    state.landingDraft.daysSelected = getNormalizedDaysForDraft();
    state.landingDraft.timesSelected = Array.isArray(ltfAnswers.timesSelected)
      ? [...ltfAnswers.timesSelected]
      : [];
    persistState();
  };

  const updateCircleIndicators = () => {
    const sections = ["days", "times", "weekend"];
    
    sections.forEach(section => {
      const indicator = document.querySelector(`[data-ltf-availability-section="${section}"] span:first-child`);
      if (!indicator) return;
      
      const isCompleted = ltfAnswers.ltfAvailabilitySectionsCompleted[section];
      const isActive = ltfAnswers.activeLtfAvailabilitySection === section;
      
      indicator.classList.remove("bg-white", "bg-slate-800", "border", "border-slate-700", "text-slate-700", "text-white");
      
      if (isCompleted) {
        // Filled circle with checkmark
        indicator.classList.add("bg-slate-800", "text-white");
        indicator.innerHTML = '✓';
      } else if (isActive) {
        // Current step: filled circle (no label)
        indicator.classList.add("bg-slate-800", "text-white");
        indicator.textContent = '';
      } else {
        // Upcoming step: unfilled circle with border (no label)
        indicator.classList.add("border", "border-slate-700", "bg-white", "text-slate-700");
        indicator.textContent = '';
      }
    });
  };

  const updateNextButtonState = () => {
    // Button enables when all 3 sections have at least one selection
    const daysHasSelection = ltfAnswers.daysSelected.length > 0;
    const timesHasSelection = ltfAnswers.timesSelected.length > 0;
    const weekendHasSelection = ltfAnswers.saturdayOn !== undefined && ltfAnswers.ltfAvailabilitySectionsTouched.weekend;
    
    const allHaveSelections = daysHasSelection && timesHasSelection && weekendHasSelection;
    
    const nextBtn = $("ltfNextBtn");
    if (!nextBtn) return;
    
    nextBtn.disabled = !allHaveSelections;
  };

  const markSectionTouched = (section) => {
    ltfAnswers.ltfAvailabilitySectionsTouched[section] = true;
    
    // Clear any existing timer
    if (ltfAnswers.ltfAvailabilitySectionCompleteTimers[section]) {
      clearTimeout(ltfAnswers.ltfAvailabilitySectionCompleteTimers[section]);
    }
    
    const sections = ["days", "times", "weekend"];
    const currentIndex = sections.indexOf(section);
    const isLastSection = currentIndex === sections.length - 1;
    
    // Set 0.25-second timer to mark complete and auto-advance to next section
    ltfAnswers.ltfAvailabilitySectionCompleteTimers[section] = setTimeout(() => {
      ltfAnswers.ltfAvailabilitySectionsCompleted[section] = true;
      
      // Auto-advance to next section (if not the last one)
      if (!isLastSection) {
        ltfAnswers.activeLtfAvailabilitySection = sections[currentIndex + 1];
      }
      
      updateCircleIndicators();
      updateNextButtonState();
      updateAvailabilityButtonLockState();
    }, 250);
    
    // For the last section, immediately activate the button (don't wait for the 1-second timer)
    if (isLastSection) {
      updateNextButtonState();
    }
  };

  const renderDayBtns = () => {
    document.querySelectorAll("[data-ltf-day]").forEach(btn => {
      const day = btn.dataset.ltfDay;
      const sel = ltfAnswers.daysSelected.includes(day);
      btn.classList.toggle("border-slate-800", sel);
      btn.classList.toggle("bg-slate-800", sel);
      btn.classList.toggle("text-white", sel);
      btn.classList.toggle("border-slate-200", !sel);
      btn.classList.toggle("bg-white", !sel);
      btn.classList.toggle("text-slate-700", !sel);
    });
  };

  const renderTimeBtns = () => {
    document.querySelectorAll("[data-availability-time]").forEach(btn => {
      const time = btn.dataset.availabilityTime;
      const sel = ltfAnswers.timesSelected.includes(time);
      btn.classList.toggle("border-slate-800", sel);
      btn.classList.toggle("bg-slate-800", sel);
      btn.classList.toggle("text-white", sel);
      btn.classList.toggle("border-slate-200", !sel);
      btn.classList.toggle("bg-white", !sel);
      btn.classList.toggle("text-slate-700", !sel);
    });
  };

  const renderWeekendBtns = () => {
    document.querySelectorAll("[data-ltf-weekend]").forEach((btn) => {
      const value = String(btn.dataset.ltfWeekend || "").toLowerCase();
      const selected = (value === "yes" && ltfAnswers.saturdayOn === true)
        || (value === "no" && ltfAnswers.saturdayOn === false);
      btn.classList.toggle("border-slate-800", selected);
      btn.classList.toggle("bg-slate-800", selected);
      btn.classList.toggle("text-white", selected);
      btn.classList.toggle("border-slate-200", !selected);
      btn.classList.toggle("bg-white", !selected);
      btn.classList.toggle("text-slate-700", !selected);
    });
  };

  const updateAvailabilityButtonLockState = () => {
    const sections = ["days", "times", "weekend"];
    
    sections.forEach((section) => {
      const isCompleted = ltfAnswers.ltfAvailabilitySectionsCompleted[section];
      const isActive = ltfAnswers.activeLtfAvailabilitySection === section;
      const shouldBeEnabled = isCompleted || isActive;
      
      // Gray out the entire section container
      const sectionEl = document.querySelector(`[data-ltf-availability-section="${section}"]`);
      if (sectionEl) {
        sectionEl.classList.toggle("opacity-50", !shouldBeEnabled);
        sectionEl.classList.toggle("text-slate-400", !shouldBeEnabled);
        // Also disable pointer events on the whole section
        sectionEl.style.pointerEvents = shouldBeEnabled ? "auto" : "none";
      }
      
      // Find the selector for this section's buttons
      let selector;
      if (section === "days") selector = "[data-ltf-day]";
      if (section === "times") selector = "[data-availability-time]";
      if (section === "weekend") selector = "[data-ltf-weekend]";
      
      document.querySelectorAll(selector).forEach((btn) => {
        btn.disabled = !shouldBeEnabled;
      });
    });
  };

  document.querySelectorAll("[data-ltf-day]").forEach(btn => {
    btn.addEventListener("click", () => {
      const day = btn.dataset.ltfDay;
      if (ltfAnswers.daysSelected.includes(day)) {
        ltfAnswers.daysSelected = ltfAnswers.daysSelected.filter(d => d !== day);
      } else {
        ltfAnswers.daysSelected.push(day);
      }
      renderDayBtns();
      markSectionTouched("days");
      persistLtfAvailabilityDraft();
      updateAvailabilityButtonLockState();
    });
  });

  document.querySelectorAll("[data-availability-time]").forEach(btn => {
    btn.addEventListener("click", () => {
      const time = btn.dataset.availabilityTime;
      if (ltfAnswers.timesSelected.includes(time)) {
        ltfAnswers.timesSelected = ltfAnswers.timesSelected.filter(t => t !== time);
      } else {
        ltfAnswers.timesSelected.push(time);
      }
      renderTimeBtns();
      markSectionTouched("times");
      persistLtfAvailabilityDraft();
      updateAvailabilityButtonLockState();
    });
  });

  document.querySelectorAll("[data-ltf-weekend]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = String(btn.dataset.ltfWeekend || "").toLowerCase();
      if (value === "yes") ltfAnswers.saturdayOn = true;
      if (value === "no") ltfAnswers.saturdayOn = false;
      renderWeekendBtns();
      markSectionTouched("weekend");
      persistLtfAvailabilityDraft();
      updateAvailabilityButtonLockState();
    });
  });

  renderDayBtns();
  renderTimeBtns();
  renderWeekendBtns();
  updateCircleIndicators();
  updateNextButtonState();
  persistLtfAvailabilityDraft();
  updateAvailabilityButtonLockState();
}

function startLandingTypeform() {
  const root = $("landingTypeformRoot");
  if (root) root.classList.remove("ltf-loading-fullscreen");
  ltfPhase = "builder";
  ltfCurrentQ = 0;
  $("landingTfHero")?.classList.add("hidden");
  $("landingTfBuilder")?.classList.remove("hidden");
  renderLtfProgressBar();
  renderLtfNavButtons();
  // Update rail label and enable full color preview
  const railLabel = $("ltfPreviewRailLabel");
  if (railLabel) {
    railLabel.textContent = "YOUR PROGRAM";
    railLabel.classList.add("ltf-preview-rail-label--active");
  }
  const previewPanel = $("landingTfRight");
  if (previewPanel) {
    previewPanel.querySelector(".ltf-preview-panel")?.classList.add("ltf-preview-panel--active");
  }
  // Blur all preview cards, schedule list, and the cycle label — reveal progressively as questions are answered.
  document.querySelectorAll(".ltf-preview-card, .ltf-preview-schedule-list, .ltf-events-cycle-label").forEach((node) => node.classList.add("ltf-blurred"));
  const previewTitle = $("ltfPreviewTitle");
  const previewSub = $("ltfPreviewSubtitle");
  if (previewTitle) previewTitle.textContent = "Your program is building...";
  if (previewSub) previewSub.textContent = "Answer each question to reveal events";
  // Display first question (Setting, since Cadence is disabled) without blurring preview
  ltfCurrentQ = 1;
  const q1 = $("ltfQ1");
  if (q1) {
    q1.classList.add("ltf-q--active");
  }
  renderLtfProgressBar();
  renderLtfNavButtons();
  
  // Initialize button state for Setting question
  const nextBtn = $("ltfNextBtn");
  if (nextBtn) {
    nextBtn.disabled = true;
  }

  updateLtfSamplePreviewRevealState();
}

function renderLtfProgressBar() {
  document.querySelectorAll("[data-ltf-node]").forEach(node => {
    const idx = Number(node.dataset.ltfNode);
    node.classList.remove("ltf-node--done", "ltf-node--active", "ltf-node--pending");
    if (idx < ltfCurrentQ) node.classList.add("ltf-node--done");
    else if (idx === ltfCurrentQ) node.classList.add("ltf-node--active");
    else node.classList.add("ltf-node--pending");
  });
  document.querySelectorAll("[data-ltf-node-wrap]").forEach(wrap => {
    const idx = Number(wrap.dataset.ltfNodeWrap);
    wrap.classList.remove("ltf-nw-done", "ltf-nw-active");
    if (idx < ltfCurrentQ) wrap.classList.add("ltf-nw-done");
    else if (idx === ltfCurrentQ) wrap.classList.add("ltf-nw-active");
  });
  document.querySelectorAll("[data-ltf-connector]").forEach(conn => {
    const idx = Number(conn.dataset.ltfConnector);
    conn.classList.toggle("ltf-connector--done", idx < ltfCurrentQ);
  });
}

function renderLtfNavButtons() {
  const back = $("ltfBackBtn");
  const next = $("ltfNextBtn");
  // Hide Back button on the initial/setting question (Q0 or Q1)
  const hideBack = ltfCurrentQ === 0 || ltfCurrentQ === 1;
  if (back) back.classList.toggle("hidden", hideBack);
  if (next) next.textContent = ltfCurrentQ === 6 ? "See My Program" : "Next →";
}

function goLtfQuestion(targetIdx) {
  // Skip Q0 (Cadence is disabled)
  if (targetIdx === 0) targetIdx = 1;
  if (targetIdx < 1 || targetIdx > 6) return;
  const isBack = targetIdx < ltfCurrentQ;
  const currentEl = $(`ltfQ${ltfCurrentQ}`);
  const targetEl = $(`ltfQ${targetIdx}`);

  if (currentEl) {
    currentEl.classList.remove("ltf-q--active", "ltf-slide-back");
  }

  if (targetEl) {
    targetEl.classList.remove("ltf-slide-back");
    if (isBack) targetEl.classList.add("ltf-slide-back");
    // Force reflow so animation triggers fresh
    void targetEl.offsetWidth;
    targetEl.classList.add("ltf-q--active");
  }

  ltfCurrentQ = targetIdx;
  renderLtfProgressBar();
  renderLtfNavButtons();

  // Update button state based on current question
  if (ltfCurrentQ === 1) {
    // Setting question: update button state
    const nextBtn = $("ltfNextBtn");
    if (nextBtn) {
      const hasScheduleSelection = ltfAnswers.schedule.length > 0;
      if (!hasScheduleSelection) {
        nextBtn.disabled = true;
      } else {
        const selectedOption = ltfAnswers.schedule[0];
        const localTriggers = ["In-person", "Hybrid"];
        const needsCity = localTriggers.includes(selectedOption);
        if (needsCity) {
          const cityFilled = (ltfAnswers.localCity || "").trim().length > 0;
          nextBtn.disabled = !cityFilled;
        } else {
          nextBtn.disabled = false;
        }
      }
    }
  } else if (ltfCurrentQ === 2) {
    // Availability question: update button state based on selections
    const nextBtn = $("ltfNextBtn");
    if (nextBtn) {
      const daysHasSelection = ltfAnswers.daysSelected.length > 0;
      const timesHasSelection = ltfAnswers.timesSelected.length > 0;
      const weekendHasSelection = ltfAnswers.saturdayOn !== undefined && ltfAnswers.ltfAvailabilitySectionsTouched.weekend;
      const allHaveSelections = daysHasSelection && timesHasSelection && weekendHasSelection;
      nextBtn.disabled = !allHaveSelections;
    }
  } else if (ltfCurrentQ === 6) {
    const nextBtn = $("ltfNextBtn");
    if (nextBtn) {
      const emailValue = String(ltfAnswers.workEmail || $("ltfWorkEmail")?.value || "").trim();
      nextBtn.disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    }
  } else {
    // Other questions: enable by default
    const nextBtn = $("ltfNextBtn");
    if (nextBtn) nextBtn.disabled = false;
  }

  // Hide error on navigation
  const errEl = $("ltfErrorMsg");
  if (errEl) errEl.classList.add("hidden");

  updateLtfSamplePreviewRevealState();
}

function showLtfError(msg) {
  const errEl = $("ltfErrorMsg");
  if (!errEl) return;
  errEl.textContent = msg;
  errEl.classList.remove("hidden");
}

function validateLtfCurrentQuestion() {
  // Q0 (Cadence) is disabled, always return true to allow advancement
  if (ltfCurrentQ === 0) return true;
  // if (ltfCurrentQ === 0) return true; // cadence always has a value
  if (ltfCurrentQ === 1) {
    if (ltfAnswers.schedule.length === 0) { showLtfError("Please select at least one setting."); return false; }
    // Check if city is required and filled
    const localTriggers = ["In-person", "Hybrid"];
    const shouldShowCity = ltfAnswers.schedule.some(s => localTriggers.includes(s));
    if (shouldShowCity) {
      const city = (ltfAnswers.localCity || "").trim();
      if (!city) { showLtfError("Please enter a city for local recommendations."); return false; }
    }
    return true;
  }
  if (ltfCurrentQ === 2) {
    // Check if all 3 availability sections are completed
    const allCompleted = ltfAnswers.ltfAvailabilitySectionsCompleted.days 
      && ltfAnswers.ltfAvailabilitySectionsCompleted.times 
      && ltfAnswers.ltfAvailabilitySectionsCompleted.weekend;
    if (!allCompleted) { showLtfError("Please complete all availability questions."); return false; }
    if (ltfAnswers.daysSelected.length === 0) { showLtfError("Please select at least one day."); return false; }
    if (ltfAnswers.timesSelected.length === 0) { showLtfError("Please select at least one time window."); return false; }
    return true;
  }
  if (ltfCurrentQ === 3) {
    if (ltfAnswers.goals.length === 0) { showLtfError("Please select at least one goal."); return false; }
    return true;
  }
  if (ltfCurrentQ === 4) {
    const empCount = parseInt($("ltfEmployeeCount")?.value || "0", 10);
    if (!empCount || empCount < 1) { showLtfError("Please enter the number of employees."); return false; }
    const isTotal = ltfAnswers.budgetMode === "total";
    const hasSelectedRange = isTotal
      ? Boolean(ltfAnswers.totalBudgetRange)
      : Boolean(ltfAnswers.perEmployeeBudgetRange);
    if (!hasSelectedRange) {
      showLtfError(isTotal ? "Please select a total monthly range." : "Please select a per-employee monthly range.");
      return false;
    }
    return true;
  }
  if (ltfCurrentQ === 5) {
    if (ltfAnswers.teamPreferenceEstimate.length === 0) { showLtfError("Please select at least one interest."); return false; }
    return true;
  }
  if (ltfCurrentQ === 6) {
    const emailValue = String(ltfAnswers.workEmail || $("ltfWorkEmail")?.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      showLtfError("Please enter a valid work email.");
      return false;
    }
    return true;
  }
  return true;
}

function saveLtfCurrentAnswer() {
  // Q0 (Cadence) is disabled, skip saving
  // if (ltfCurrentQ === 0) {
  //   ltfAnswers.cadence = $("ltfCadence")?.value || "Monthly";
  // }
  if (ltfCurrentQ === 1) {
    ltfAnswers.localCity = ($("ltfLocalCity")?.value || "").trim();
  }
  if (ltfCurrentQ === 6) {
    ltfAnswers.workEmail = String($("ltfWorkEmail")?.value || "").trim();
  }
  if (ltfCurrentQ === 4) {
    ltfAnswers.employeeCount = parseInt($("ltfEmployeeCount")?.value || "0", 10) || 0;
    if (ltfAnswers.budgetMode === "total") {
      const totalRange = getBudgetRangeByKey("total", ltfAnswers.totalBudgetRange);
      ltfAnswers.totalBudget = totalRange
        ? getBudgetRangeHighEnd("total", String(totalRange.key || ""), Number(totalRange.max || 0))
        : 0;
      ltfAnswers.totalBudgetRange = resolveTotalBudgetRangeKey(ltfAnswers.totalBudget, ltfAnswers.totalBudgetRange);
      ltfAnswers.perEmployee = ltfAnswers.employeeCount > 0 ? ltfAnswers.totalBudget / ltfAnswers.employeeCount : 0;
      ltfAnswers.perEmployeeBudgetRange = getBudgetRangeKeyFromValue("perEmployee", ltfAnswers.perEmployee);
    } else {
      const perRange = getBudgetRangeByKey("perEmployee", ltfAnswers.perEmployeeBudgetRange);
      ltfAnswers.perEmployee = perRange
        ? getBudgetRangeHighEnd("perEmployee", String(perRange.key || ""), Number(perRange.max || 0))
        : 0;
      ltfAnswers.perEmployeeBudgetRange = getBudgetRangeKeyFromValue("perEmployee", ltfAnswers.perEmployee);
      ltfAnswers.totalBudget = ltfAnswers.perEmployee * ltfAnswers.employeeCount;
      ltfAnswers.totalBudgetRange = getBudgetRangeKeyFromValue("total", ltfAnswers.totalBudget);
    }
  }
}

function advanceLtfQuestion() {
  if (!validateLtfCurrentQuestion()) return;
  saveLtfCurrentAnswer();
  if (ltfCurrentQ < 6) {
    goLtfQuestion(ltfCurrentQ + 1);
  } else {
    completeLtfSetup();
  }
}

function waitForMs(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, Number(ms || 0)));
  });
}

function resetLtfLoadingChecklist() {
  const checklistItems = document.querySelectorAll("#ltfLoadingChecklist .ltf-loading-item");
  checklistItems.forEach((item) => {
    item.classList.remove("is-complete");
  });
  const announcer = $("ltfLoadingAnnouncer");
  if (announcer) announcer.textContent = "";
}

async function runLtfLoadingChecklistSequence() {
  resetLtfLoadingChecklist();

  for (let index = 0; index < LTF_LOADING_STEPS.length; index += 1) {
    const step = LTF_LOADING_STEPS[index];
    await waitForMs(index === 0 ? 560 : 620);

    const row = document.querySelector(`#ltfLoadingChecklist .ltf-loading-item[data-loading-key="${step.key}"]`);
    if (row) row.classList.add("is-complete");

    const announcer = $("ltfLoadingAnnouncer");
    if (announcer) announcer.textContent = `${step.label} completed.`;
  }

  await waitForMs(260);
}

async function completeLtfSetup() {
  ltfPhase = "loading";
  const root = $("landingTypeformRoot");
  const landingHeaderSignIn = $("landingHeaderSignIn");
  if (root) root.classList.add("ltf-loading-fullscreen");
  if (landingHeaderSignIn) landingHeaderSignIn.style.visibility = "hidden";
  $("landingTfBuilder")?.classList.add("hidden");
  $("landingTfLoading")?.classList.remove("hidden");
  const loadingSequencePromise = runLtfLoadingChecklistSequence();

  // Write answers to state.landingDraft
  state.landingDraft.goals = [...ltfAnswers.goals];
  state.landingDraft.employeeCount = ltfAnswers.employeeCount;
  state.landingDraft.budgetMode = ltfAnswers.budgetMode;
  state.landingDraft.totalBudget = ltfAnswers.totalBudget;
  state.landingDraft.totalBudgetRange = ltfAnswers.totalBudgetRange;
  state.landingDraft.perEmployee = ltfAnswers.perEmployee;
  state.landingDraft.perEmployeeBudgetRange = ltfAnswers.perEmployeeBudgetRange;
  state.landingDraft.budgetConfigured = true;
  state.programSettings.budgetMode = ltfAnswers.budgetMode;
  state.programSettings.totalBudget = ltfAnswers.totalBudget;
  state.programSettings.totalBudgetRange = ltfAnswers.totalBudgetRange;
  state.programSettings.perEmployeeBudget = ltfAnswers.perEmployee;
  state.programSettings.perEmployeeBudgetRange = ltfAnswers.perEmployeeBudgetRange;
  state.programSettings.employeeCount = ltfAnswers.employeeCount;
  // state.landingDraft.cadence = ltfAnswers.cadence; // Q0 (Cadence) is disabled
  state.landingDraft.schedule = [...ltfAnswers.schedule];
  state.landingDraft.localCity = ltfAnswers.localCity;
  state.landingDraft.daysSelected = [
    ...ltfAnswers.daysSelected,
    ...(ltfAnswers.saturdayOn ? ["Sa"] : [])
  ];
  state.landingDraft.timesSelected = [...ltfAnswers.timesSelected];
  state.landingDraft.teamPreferenceEstimate = [...ltfAnswers.teamPreferenceEstimate];
  state.landingDraft.workEmail = String(ltfAnswers.workEmail || "").trim();

  state.landingTypeformComplete = true;
  state.landingBuilderStarted = true;
  state.completedSetupSteps = [1, 2, 3, 4, 5, 6];
  state.currentSetupStep = 7;
  buildPersonalizedProgramFromSetup();
  persistState();

  const enteredEmail = String(ltfAnswers.workEmail || state.landingDraft.workEmail || "").trim().toLowerCase();
  const hasValidWorkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail);
  if (hasValidWorkEmail) {
    (async () => {
      try {
        const emailSaveResponse = await onboardingEmailSave({
          email: enteredEmail,
          identity: {
            companyName: String(state.companyName || "").trim(),
            adminName: String(state.adminName || "").trim()
          },
          draft: buildDraftPayload(state),
          stateBlob: clone(state),
          programSummary: buildProgramWeekSummary(state.fourMonthProgram)
        });

        const rootResponse = (emailSaveResponse?.data && typeof emailSaveResponse.data === "object")
          ? emailSaveResponse.data
          : emailSaveResponse;
        const token = String(rootResponse?.token || "").trim();
        const companyId = String(rootResponse?.companyId || "").trim();
        if (token && companyId) {
          setAuthSession(token, companyId);
          state.accountId = companyId;
        }

        const magicLinkUrl = String(rootResponse?.magicLogin?.url || "").trim();
        if (magicLinkUrl) {
          state.landingDraft.magicLoginUrl = magicLinkUrl;
        }
        showMiniToast("Progress saved to your account.");
      } catch (error) {
        console.warn("Email save failed", error?.message || error);
        showMiniToast("We couldn’t save to account right now. Your progress is still on this device.");
      }
    })();
  }

  await loadingSequencePromise;

  ltfPhase = "complete";
  if (root) root.style.display = "none";
  if (root) root.classList.remove("ltf-loading-fullscreen");
  if (landingHeaderSignIn) landingHeaderSignIn.style.visibility = "";
  renderAll();
}

// ================================================================
// END LANDING TYPEFORM
// ================================================================


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
const programBudgetInfoModal = $("programBudgetInfoModal");
const programBudgetInfoModalClose = $("programBudgetInfoModalClose");
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
if (programBudgetInfoModalClose) {
  programBudgetInfoModalClose.addEventListener("click", hideProgramBudgetInfoModal);
}
if (programBudgetInfoModal) {
  programBudgetInfoModal.addEventListener("click", (event) => {
    if (event.target === programBudgetInfoModal) {
      hideProgramBudgetInfoModal();
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

const landingStartBuilderBtn = $("landingStartBuilder");
if (landingStartBuilderBtn) {
  landingStartBuilderBtn.addEventListener("click", startLandingBuilder);
}

try {
  initLandingTypeform();
} catch (error) {
  console.warn("initLandingTypeform failed", error);
}

const setupStepsContainer = $("setupStepsContainer");
if (setupStepsContainer) {
  setupStepsContainer.addEventListener("input", markLandingBuilderStarted);
  setupStepsContainer.addEventListener("change", markLandingBuilderStarted);
}
updateLandingHomeView();

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

const appTestingReset = $("appTestingReset");
if (appTestingReset) {
  appTestingReset.addEventListener("click", async () => {
    appTestingReset.disabled = true;
    try {
      await resetTestingWorkspaceFromUi();
    } finally {
      appTestingReset.disabled = false;
    }
  });
}




$("btnSaveProgramSetup").addEventListener("click", () => {
  saveProgramSetupFromInputs();
});




$("workflowStepper").addEventListener("click", handleWorkflowAction);
$("browserPanel").addEventListener("click", handleWorkflowAction);
const programOverviewCards = $("programOverviewCards");
if (programOverviewCards) {
  programOverviewCards.addEventListener("click", handleWorkflowAction);
}
const monthlyEventsContainer = $("monthlyEvents");
if (monthlyEventsContainer) {
  monthlyEventsContainer.addEventListener("click", handleWorkflowAction);
}


const sidebarSetupHeading = $("sidebarSetupHeading");
if (sidebarSetupHeading) {
  sidebarSetupHeading.addEventListener("click", () => {
    const allCoreSetupComplete = isAllCoreSetupComplete();
    if (!allCoreSetupComplete) return;
    setSidebarActiveSection("setup");
    state.currentSetupStep = 1;
    state.setupMenuExpanded = true;
    state.sidebarSetupExpanded = true;
    state.sidebarEventWorkflowExpanded = false;
    persistState();
    renderSetupMenuState();
    renderSidebarStepMenus();
    renderSetupStepStates();
    forceExpandSetupStep(1);
    scrollSetupStepIntoView(1, "smooth", true);
  });
}

const sidebarDashboardSection = $("sidebarDashboardSection");
if (sidebarDashboardSection) {
  const handleDashboardOverviewActivate = (e) => {
    e.preventDefault();
    return;
  };
  sidebarDashboardSection.addEventListener("click", handleDashboardOverviewActivate);
  sidebarDashboardSection.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    handleDashboardOverviewActivate(e);
  });
}

const sidebarEventWorkflowHeading = $("sidebarEventWorkflowHeading");
if (sidebarEventWorkflowHeading) {
  sidebarEventWorkflowHeading.style.cursor = "default";
}

const sidebarEventWorkflowToggle = $("sidebarEventWorkflowToggle");
if (sidebarEventWorkflowToggle) {
  sidebarEventWorkflowToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAllCoreSetupComplete()) return;
    state.sidebarEventWorkflowExpanded = !state.sidebarEventWorkflowExpanded;
    if (state.sidebarEventWorkflowExpanded) {
      setSidebarActiveSection("event-workflow");
    }
    persistState();
    renderSidebarStepMenus();
  });
  sidebarEventWorkflowToggle.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    sidebarEventWorkflowToggle.click();
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
  openDashboardMainView({ behavior: "auto" });
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

const mobileSidebarToggle = $("mobileSidebarToggle");
if (mobileSidebarToggle) {
  mobileSidebarToggle.addEventListener("click", openMobileSidebar);
}

const mobileSidebarClose = $("mobileSidebarClose");
if (mobileSidebarClose) {
  mobileSidebarClose.addEventListener("click", closeMobileSidebar);
}

const mobileSidebarBackdrop = $("mobileSidebarBackdrop");
if (mobileSidebarBackdrop) {
  mobileSidebarBackdrop.addEventListener("click", closeMobileSidebar);
}

window.addEventListener("resize", updateMobileSidebarToggleOffset);
requestAnimationFrame(updateMobileSidebarToggleOffset);




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




function openMobileSidebar() {
  const sidebar = document.querySelector(".eeos-sidebar");
  const backdrop = $("mobileSidebarBackdrop");
  const toggle = $("mobileSidebarToggle");
  if (sidebar) sidebar.classList.add("sidebar-mobile-open");
  if (backdrop) backdrop.classList.add("is-visible");
  if (toggle) toggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  const sidebar = document.querySelector(".eeos-sidebar");
  const backdrop = $("mobileSidebarBackdrop");
  const toggle = $("mobileSidebarToggle");
  if (sidebar) sidebar.classList.remove("sidebar-mobile-open");
  if (backdrop) backdrop.classList.remove("is-visible");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function updateMobileSidebarToggleOffset() {
  const toggle = $("mobileSidebarToggle");
  if (!toggle) return;

  const selectors = [
    "#landingView .setup-step .setup-step-header",
    "#landingView .mx-auto",
    "#appView .eeos-main-header",
    ".eeos-main"
  ];

  let anchor = null;
  for (const selector of selectors) {
    const candidate = document.querySelector(selector);
    if (!candidate) continue;
    const style = window.getComputedStyle(candidate);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = candidate.getBoundingClientRect();
    if (rect.width <= 0) continue;
    anchor = candidate;
    break;
  }

  if (!anchor) {
    toggle.style.right = "30px";
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const rightOffset = Math.max(12, Math.round(window.innerWidth - rect.right));
  toggle.style.right = `${rightOffset}px`;
}

async function bootstrap() {
  state.sidebarSetupExpanded = false;
  applyTestingResetFromQueryBeforeLoad();
  applyMagicLinkPageTitleFromCurrentPath();
  await redeemMagicLoginFromQueryIfPresent();
  bindSidebarSetupEditPrefs();
  bindMainSetupEditPrefs();
  logIdentityDebug("bootstrap:start");
  applyPinnedIdentity();
  const storedCompanyId = getAuthCompanyId();
  loadLocalState(storedCompanyId || "anon", { strictAccount: Boolean(storedCompanyId) });
  applyPinnedIdentity();
  await applyLandingIdentityFromMagicLinkHostPath();
  applyLandingIdentityFromQuery();
  applyTestingMagicProfileFromQuery();
  applyPinnedIdentity();
  inferLandingBuilderStartedState();
  enforceGenericLandingMagicMode();
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
      enforceRevelryRunEventViewHardLock();
      setSidebarHydrationLoading(false);
      renderSidebar();
    }
  }

  enforceRevelryRunEventViewHardLock();

  hideAuthGate();
  if (isRevelryLabsReadOnlyMagicLink()) {
    showApp();
  } else {
    showLanding();
  }
  applyMagicLandingHeaderBranding();
  renderAll();
  updateMobileSidebarToggleOffset();
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
    eventsPollButton.classList.add("hidden");
    eventsPollButton.disabled = true;
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
      eventsPollButton.disabled = true;
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
      : "Book this event ↗";
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
  state.pollBuilder.energyResetLaunch = null;
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
    renderRsvpStep();
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
    renderRsvpStep();
  });
  pollRsvpResultsIntervalId = setInterval(() => {
    refreshRsvpResultsFromBackend(normalizedId, { render: true }).catch((error) => {
      pollUiState.rsvpResultsError = String(error?.message || "Couldn’t refresh RSVP results.").trim();
      renderPollBuilderStep();
      renderRsvpStep();
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

const promoteUiState = {
  announcementChannel: "slack",
  copiedAction: null
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
  const pollProgressStages = ["Create Poll", "Poll Live", "Poll Closed", "Send RSVP"];
  const pollProgressActiveIndex = (() => {
    if (!pollCreated) return 0;
    if (!pollLive) return 0;
    if (!pollClosed) return 1;
    if (!pollRsvpSent) return 2;
    return 3;
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
      <div class="mt-3">${pollProgressBarHtml}</div>
      ${isPollClosed ? `
        <section id="pollClosedTopPanel" class="w-full space-y-4">
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
  enforceRevelryLeaderboardLockState();
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
  const isMagicLinkContext = Boolean(parseMagicLinkFromHostPath());
  const allowTestingStepNavigation = Boolean(getActiveTestingMagicContext());
  const isRevelryLeaderboardLock = !allowTestingStepNavigation && isRevelryBracketsMagicContext() && Boolean(state.revelryLeaderboardLockArmed);
  const isMarchMadnessEvent = isRevelryBracketsMagicContext() || String(eventName || "").trim().toLowerCase() === "march madness bracket challenge";
  const headerOverrideStep = String(promote.activeStep || "").trim();
  const shouldUseMarchMadnessHeaderCopy = isMagicLinkContext
    && isMarchMadnessEvent
    && (headerOverrideStep === "reminder_dayof" || headerOverrideStep === "reminder_dayof_2" || headerOverrideStep === "final_winner");
  const promoteHeaderTitle = shouldUseMarchMadnessHeaderCopy
    ? "March Madness Bracket Challenge"
    : "Promote Event";
  const promoteHeaderDescription = shouldUseMarchMadnessHeaderCopy
    ? ""
    : "Let Revelers know the bracket challenge is live, and keep the excitement going throughout the tournament with weekly leaderboard updates.";
  const promoteHeaderSummary = shouldUseMarchMadnessHeaderCopy
    ? "March 19 - April 7"
    : eventSummary;
  const promoteHeaderDescriptionStyle = shouldUseMarchMadnessHeaderCopy
    ? "max-width: 75%;"
    : "";
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
    if (stepKey === "reminder_dayof_2") return promote.reminderDayOf2;
    if (stepKey === "final_winner") return promote.finalWinner;
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

  const marchMadnessAnnouncementEmailMessage = [
    "Hi everyone,",
    "",
    "We\u2019re running a Revelry bracket competition for the NCAA men\u2019s and women\u2019s basketball tournaments.",
    "",
    "In a bracket challenge, you predict which teams will win each game throughout the tournament. As the games are played, your bracket earns points for every correct pick. The person with the most points at the end wins.",
    "",
    "Create your bracket and compete with fellow Revelers to see who predicts the tournament best.",
    "",
    "Join the challenge:",
    "",
    "Women\u2019s bracket here (url: https://shorturl.at/tleLy)",
    "",
    "Men\u2019s bracket here (url: https://shorturl.at/Jv9yZ)",
    "",
    "Password for both: Revelry2026",
    "",
    "Bracket submission deadlines:",
    "",
    "Men\u2019s tournament: Thursday, March 19 @ 12:15 PM ET",
    "Women\u2019s tournament: Friday, March 20 @ 11:30 AM ET",
    "",
    "Make sure your bracket is submitted before the first games begin.",
    "",
    "The person with the most points at the end takes the Revelry Bracket Champion crown and earns the greatest gift of all\u2014a year\u2019s worth of bragging rights over your coworkers.",
    "",
    "How to Join",
    "1. Click the links for the men\u2019s and women\u2019s challenge.",
    "2. Enter the password above.",
    "3. Fill out your bracket by predicting the winner of each game.",
    "4. Submit your bracket before the tournaments begin.",
    "",
    "Good luck\u2014and enjoy the madness!",
    "",
    "",
    "P.S. Extra bragging rights to the Reveler with the best bracket name."
  ].join("\n");

  const marchMadnessAnnouncementSlackMessage = [
    "\ud83c\udfc0 March Madness Bracket Challenge is back!",
    "",
    "We\u2019re running a Revelry bracket competition for the NCAA men\u2019s and women\u2019s basketball tournaments.",
    "",
    "In a bracket challenge, you predict which teams will win each game throughout the tournament. As the games are played, your bracket earns points for every correct pick.",
    "",
    "Create your bracket and compete with fellow Revelers to see who predicts the tournament best.",
    "",
    "Join the challenge:",
    "",
    "Women\u2019s bracket here (url: https://shorturl.at/tleLy)",
    "",
    "Men\u2019s bracket here (url: https://shorturl.at/Jv9yZ)",
    "",
    "Password for both: Revelry2026",
    "",
    "Bracket submission deadlines:",
    "",
    "Men\u2019s tournament: Thursday, March 19 @ 12:15 PM ET",
    "Women\u2019s tournament: Friday, March 20 @ 11:30 AM ET",
    "",
    "Make sure your bracket is submitted before the first games begin.",
    "",
    "The person with the most points at the end takes the Revelry Bracket Champion crown and earns the greatest gift of all\u2014a year\u2019s worth of bragging rights over your coworkers.",
    "",
    "How to Join",
    "\t1.\tClick the links for the men\u2019s and women\u2019s challenge.",
    "\t2.\tEnter the password above.",
    "\t3.\tFill out your bracket by predicting the winner of each game.",
    "\t4.\tSubmit your bracket before the tournaments begin.",
    "",
    "Good luck\u2014and enjoy the madness!",
  ].join("\n");

  const marchMadnessSignupReminderMessage = [
    "📈 My professional investment advice for the week:",
    "",
    "Listen, I'm not a financial advisor, but I've crunched the numbers:",
    "",
    "Cost to enter: $0",
    "",
    "Effort required: 5 minutes of clicking teams you recognize (or have the coolest colors).",
    "",
    "Potential ROI: 12 months of looking your manager in the eye and saying, \"Actually, I believe I'm the Revelry Bracket Champion, so you're muted.\"",
    "",
    "The math checks out, so get in there before the deadline divides your chances by zero! 🏀",
    "",
    "Password for both: Revelry2026",
    "",
    "Men's Tournament (deadline Thurs @ 12:15 PM ET): Join here (url: https://shorturl.at/Jv9yZ)",
    "Women's Tournament (deadline Fri @ 11:30 AM ET): Join here (url: https://shorturl.at/tleLy)",
    "",
    "Make sure your picks are in before tip-off!"
  ].join("\n");

  const marchMadnessWeeklyLeaderboardMessage = [
    "🏀 March Madness Bracket Challenge Update",
    "",
    "Here are the current standings heading into the Sweet 16...",
    "",
    "Great minds think alike in the Women's tournament, with LSU or UConn set to decide who takes the Revelry crown:",
    "🥇 1st - Nick (550 pts)",
    "🥈 2nd - Cameron (520)",
    "🥉 3rd - Jeff (510)",
    "",
    "*Riding with odds-on title favorite UConn, Peter and Stu are still in contention.",
    "",
    "In the Men's tournament, only 20 points separate first and third:",
    "🥇 1st - Cameron (500 pts)",
    "🥈 2nd - Rebecca (490)",
    "🥉 T-3rd - Dan (480)",
    "🥉 T-3rd - Nik (480)",
    "",
    "*Can Feroz make a comeback with his champion pick Arizona, ranked by ESPN as #1 among the remaining 16 teams?  Or can Peter, Nik, and Jeff make a push with Duke (ESPN #3)?",
    "",
    "Follow the standings here:",
    "Women's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f",
    "Men's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9"
  ].join("\n");

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

  const processSteps = (isMagicLinkContext && isMarchMadnessEvent)
    ? [
        { key: "announcement", label: "Announcement", title: "Announcement" },
        { key: "reminder_week", label: "Signup Reminder", title: "Signup Reminder" }
      ]
    : [
        { key: "calendar", label: "Calendar invite", title: "Calendar invite" },
        { key: "announcement", label: "Announcement", title: "Announcement" },
        { key: "reminder_week", label: "Reminder (1 week out)", title: "Reminder (1 week out)" },
        { key: "reminder_dayof", label: "Reminder (day of)", title: "Reminder (day of)" }
      ];
  const doneFlags = {
    calendar: Boolean(promote.calendar.done),
    announcement: Boolean(promote.announcement.done),
    reminder_week: Boolean(promote.reminderWeek.done),
    reminder_dayof: Boolean(promote.reminderDayOf.done),
    reminder_dayof_2: Boolean(promote.reminderDayOf2.done),
    final_winner: Boolean(promote.finalWinner?.done)
  };
  const isPromoteCompleted = processSteps.every((step) => doneFlags[step.key]);
  const validStepKeys = processSteps.map((s) => s.key);
  let activeStep = validStepKeys.includes(promote.activeStep) ? promote.activeStep : (validStepKeys[0] || "calendar");
  const isRevelryBracketsPromoteFlow = isMagicLinkContext && isMarchMadnessEvent;
  const reminderWeekIndex = processSteps.findIndex((item) => item.key === "reminder_week");
  const activeStepIndex = processSteps.findIndex((item) => item.key === activeStep);
  const shouldResumeReminderWeek = isRevelryBracketsPromoteFlow
    && Boolean(promote.announcementLockedAfterContinue)
    && doneFlags.announcement
    && reminderWeekIndex >= 0
    && activeStepIndex >= 0
    && activeStepIndex < reminderWeekIndex;
  if (shouldResumeReminderWeek) {
    activeStep = "reminder_week";
    state.promoteEvent.activeStep = "reminder_week";
    state.promoteEvent.collapsedStep = "";
    persistState();
  }
  const reminderDayOfIndex = processSteps.findIndex((item) => item.key === "reminder_dayof");
  const activeStepIndexAfterReminderResume = processSteps.findIndex((item) => item.key === activeStep);
  const shouldResumeReminderDayOf = isRevelryBracketsPromoteFlow
    && Boolean(promote.reminderWeekLockedAfterContinue)
    && doneFlags.reminder_week
    && reminderDayOfIndex >= 0
    && activeStepIndexAfterReminderResume >= 0
    && activeStepIndexAfterReminderResume < reminderDayOfIndex;
  if (shouldResumeReminderDayOf) {
    activeStep = "reminder_dayof";
    state.promoteEvent.activeStep = "reminder_dayof";
    state.promoteEvent.collapsedStep = "";
    persistState();
  }
  const reminderDayOf2Index = processSteps.findIndex((item) => item.key === "reminder_dayof_2");
  const activeStepIndexAfterReminderDayOfResume = processSteps.findIndex((item) => item.key === activeStep);
  const shouldResumeReminderDayOf2 = isRevelryBracketsPromoteFlow
    && doneFlags.reminder_dayof
    && !doneFlags.reminder_dayof_2
    && reminderDayOf2Index >= 0
    && activeStepIndexAfterReminderDayOfResume >= 0
    && activeStepIndexAfterReminderDayOfResume < reminderDayOf2Index;
  if (shouldResumeReminderDayOf2) {
    activeStep = "reminder_dayof_2";
    state.promoteEvent.activeStep = "reminder_dayof_2";
    state.promoteEvent.collapsedStep = "";
    persistState();
  }

  const getLeaderboardLockMeta = (stepKey) => {
    if (!isRevelryBracketsPromoteFlow) return { locked: false, dateLabel: "" };
    const alreadyDone = Boolean(doneFlags[stepKey]);
    return getRuleDrivenStepLockMeta(stepKey, {
      pageScope: "promote",
      alreadyDone
    });
  };

  const isAnnouncementGateActive = isRevelryBracketsPromoteFlow && !doneFlags.announcement;
  const isStepLocked = (stepKey) => {
    if (allowTestingStepNavigation) return false;
    if (isAnnouncementGateActive && stepKey !== "announcement") return true;
    const lockMeta = getLeaderboardLockMeta(stepKey);
    return lockMeta.locked;
  };
  if (isAnnouncementGateActive && (activeStep !== "announcement" || promote.collapsedStep === "announcement")) {
    state.promoteEvent.activeStep = "announcement";
    state.promoteEvent.collapsedStep = "";
    persistState();
  }
  const activeIndex = processSteps.findIndex((item) => item.key === activeStep);
  const promoteProgressStages = processSteps.map((step) => step.label);
  const promoteCompletedIndexes = processSteps
    .map((step, index) => (doneFlags[step.key] ? index : -1))
    .filter((index) => index >= 0);
  const promoteProgressBarHtml = getHorizontalProcessBarHtml(promoteProgressStages, activeIndex, {
    completedIndexes: promoteCompletedIndexes,
    clickable: !isRevelryLeaderboardLock
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

  const isCardExpanded = () => true;

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
          <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Email</button>
        </div>
        <div class="mt-2 text-xs text-slate-500">If you’re using Slack only, attendees can still add the event using the .ics file.</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(inviteMessage)}</div>
        <div class="mt-4 flex items-center justify-end gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="calendar" class="h-4 w-4 rounded border-slate-300" ${doneFlags.calendar ? "checked" : ""} />
            <span>Calendar invite sent</span>
          </label>
        </div>
      `;
    }

    if (stepKey === "announcement") {
      if (isMagicLinkContext && isMarchMadnessEvent) {
        const useEmail = promoteUiState.announcementChannel === "email";
        const isAnnouncementReadOnly = isRevelryBracketsPromoteFlow && Boolean(promote.announcementLockedAfterContinue);
        return `
          <div class="mt-3 text-sm text-slate-600">We have already created the Revelry group for you at ESPN. Send this message to your team via Slack or email to invite everyone to join the bracket challenge.</div>
          <div class="mt-3 rounded-lg border border-slate-200 text-sm text-slate-700 ${isAnnouncementReadOnly ? "bg-slate-100" : "bg-slate-50"}" style="min-height: 80px;">
            <div class="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <button type="button" id="promoteAnnouncementChannelSlack" class="rounded-full px-3 py-1.5 text-sm font-medium ${useEmail ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white"} ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isAnnouncementReadOnly ? "disabled" : ""}>Slack</button>
              <button type="button" id="promoteAnnouncementChannelEmail" class="rounded-full px-3 py-1.5 text-sm font-medium ${useEmail ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isAnnouncementReadOnly ? "disabled" : ""}>Email</button>
            </div>
            <div class="p-3" style="${useEmail ? "" : "white-space: pre-line;"}">${useEmail ? `<div class="rounded-lg border border-slate-200 bg-slate-100 mb-2" style="padding: 5px 8px;"><div class="flex items-center gap-2"><span class="text-xs font-semibold text-slate-600 whitespace-nowrap">Subject:</span><span class="font-medium text-slate-900 flex-1 min-w-0">Join the Revelry March Madness Bracket Challenge 🏀</span><button type="button" data-promote-action="copy-announcement-subject" class="text-xs px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 font-medium whitespace-nowrap flex-shrink-0 ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isAnnouncementReadOnly ? "disabled" : ""}>${promoteUiState.copiedAction === "copy-announcement-subject" ? "✓ Copied" : "Copy"}</button></div></div><div class="text-sm text-slate-700 mt-2" style="white-space: pre-line;">
Hi everyone,

We're running a Revelry bracket competition for the NCAA men's and women's basketball tournaments.

In a bracket challenge, you predict which teams will win each game throughout the tournament. As the games are played, your bracket earns points for every correct pick. The person with the most points at the end wins.

Create your bracket and compete with fellow Revelers to see who predicts the tournament best.

<strong>Join the challenge:</strong>

Women's bracket <a href="https://shorturl.at/tleLy" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;"><strong>here</strong></a>

Men's bracket <a href="https://shorturl.at/Jv9yZ" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;"><strong>here</strong></a>

Password for both: <strong>Revelry2026</strong>

Bracket submission deadlines:

Men's tournament: Thursday, March 19 @ 12:15 PM ET
Women's tournament: Friday, March 20 @ 11:30 AM ET

Make sure your bracket is submitted before the first games begin.

The person with the most points at the end takes the Revelry Bracket Champion crown and earns the greatest gift of all—a year's worth of bragging rights over your coworkers.

<strong>How to Join</strong>
1. Click the links for the men's and women's challenge.
2. Enter the password above.
3. Fill out your bracket by predicting the winner of each game.
4. Submit your bracket before the tournaments begin.

Good luck—and enjoy the madness!


P.S. Extra bragging rights to the Reveler with the best bracket name.</div>
            ` : (() => {
              const simpleBoldLines = new Set([
                "\ud83c\udfc0 March Madness Bracket Challenge is back!",
                "Join the challenge:",
                "How to Join",
              ]);
              const linkedLines = {
                "Women\u2019s bracket here (url: https://shorturl.at/tleLy)": { prefix: "Women\u2019s bracket ", url: "https://shorturl.at/tleLy" },
                "Men\u2019s bracket here (url: https://shorturl.at/Jv9yZ)": { prefix: "Men\u2019s bracket ", url: "https://shorturl.at/Jv9yZ" },
              };
              return marchMadnessAnnouncementSlackMessage.split("\n").map(line => {
                const escaped = escapeHtml(line);
                if (simpleBoldLines.has(line)) return `<strong>${escaped}</strong>`;
                if (linkedLines[line]) {
                  const { prefix, url } = linkedLines[line];
                  return `${escapeHtml(prefix)}<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;"><strong>here</strong></a>`;
                }
                if (line.includes("Revelry2026")) {
                  return line.replace("Revelry2026", "<strong>Revelry2026</strong>");
                }
                return escaped;
              }).join("\n");
            })()}</div>
          </div>
          <div class="${rowBase}">
            <button type="button" data-promote-action="copy-announcement" class="rounded-lg px-3 py-2 text-sm font-medium text-white ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" style="background-color: #546373;" ${isAnnouncementReadOnly ? "disabled" : ""}>${promoteUiState.copiedAction === "copy-announcement" ? "✓ Copied" : "Copy message"}</button>
            ${useEmail
              ? `<button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isAnnouncementReadOnly ? "disabled" : ""}>Open Email</button>`
              : `<button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${isAnnouncementReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isAnnouncementReadOnly ? "disabled" : ""}>Open Slack</button>`
            }
          </div>
          ${promoteUiState.copiedAction === "copy-announcement" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}
          <div class="mt-3 text-sm text-slate-500">After sending the message, come back here to complete this step.</div>
          <div class="mt-12 flex flex-col items-start gap-3">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700 ${isAnnouncementReadOnly ? "opacity-70" : ""}">
              <input type="checkbox" data-promote-complete="announcement" class="h-4 w-4 rounded border-slate-300" ${doneFlags.announcement ? "checked" : ""} ${isAnnouncementReadOnly ? "disabled" : ""} />
              <span>I shared the announcement with the team</span>
            </label>
            <button type="button" data-promote-action="continue-to-signup-reminder" class="rounded-lg px-3 py-2 text-sm font-medium text-white ${(doneFlags.announcement && !isAnnouncementReadOnly) ? "bg-slate-800 hover:bg-slate-700" : "cursor-not-allowed bg-slate-300"}" ${(doneFlags.announcement && !isAnnouncementReadOnly) ? "" : "disabled"}>Continue → Schedule reminder</button>
          </div>
        `;
      }
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
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="announcement" class="h-4 w-4 rounded border-slate-300" ${doneFlags.announcement ? "checked" : ""} />
            <span>Announcement posted</span>
          </label>
        </div>
      `;
    }

    if (stepKey === "reminder_week") {
      if (isRevelryBracketsPromoteFlow) {
        const isReminderWeekReadOnly = isRevelryBracketsPromoteFlow && Boolean(promote.reminderWeekLockedAfterContinue);
        const formattedSignupReminderHtml = marchMadnessSignupReminderMessage.split("\n").map((line) => {
          const escapedLine = escapeHtml(line);
          const signupLinkedLines = {
            "Men's Tournament (deadline Thurs @ 12:15 PM ET): Join here (url: https://shorturl.at/Jv9yZ)": {
              label: "Men's Tournament",
              suffix: " (deadline Thurs @ 12:15 PM ET): Join ",
              url: "https://shorturl.at/Jv9yZ"
            },
            "Women's Tournament (deadline Fri @ 11:30 AM ET): Join here (url: https://shorturl.at/tleLy)": {
              label: "Women's Tournament",
              suffix: " (deadline Fri @ 11:30 AM ET): Join ",
              url: "https://shorturl.at/tleLy"
            }
          };
          if (line === "📈 My professional investment advice for the week:") {
            return `<strong>${escapedLine}</strong>`;
          }
          if (line.startsWith("Cost to enter:")) {
            return `<strong>Cost to enter:</strong>${escapeHtml(line.slice("Cost to enter:".length))}`;
          }
          if (line.startsWith("Effort required:")) {
            return `<strong>Effort required:</strong>${escapeHtml(line.slice("Effort required:".length))}`;
          }
          if (line.startsWith("Potential ROI:")) {
            return `<strong>Potential ROI:</strong>${escapeHtml(line.slice("Potential ROI:".length))}`;
          }
          if (line.startsWith("Password for both:")) {
            return `<strong>Password for both:</strong>${escapeHtml(line.slice("Password for both:".length))}`;
          }
          if (signupLinkedLines[line]) {
            const { label, suffix, url } = signupLinkedLines[line];
            return `<strong>${escapeHtml(label)}:</strong>${escapeHtml(suffix)}<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;"><strong>here</strong></a>`;
          }
          if (line === "Make sure your picks are in before tip-off!") {
            return `<em>${escapedLine}</em>`;
          }
          return escapedLine;
        }).join("\n");

        return `
          <div class="mt-3 text-sm text-slate-600">Schedule this reminder in Slack for Wednesday, March 18</div>
          <div class="mt-4 rounded-lg border border-slate-200 ${isReminderWeekReadOnly ? "bg-slate-100" : "bg-slate-50"} p-3 text-sm text-slate-700" style="white-space: pre-line;">${formattedSignupReminderHtml}</div>
          <div class="${rowBase}">
            <button type="button" data-promote-action="copy-reminder-week" class="rounded-lg px-3 py-2 text-sm font-medium text-white ${isReminderWeekReadOnly ? "cursor-not-allowed opacity-60" : ""}" style="background-color: #546373;" ${isReminderWeekReadOnly ? "disabled" : ""}>${promoteUiState.copiedAction === "copy-reminder-week" ? "✓ Copied" : "Copy message"}</button>
            <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${isReminderWeekReadOnly ? "cursor-not-allowed opacity-60" : ""}" ${isReminderWeekReadOnly ? "disabled" : ""}>Open Slack</button>
          </div>
          ${promoteUiState.copiedAction === "copy-reminder-week" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}
          <div class="mt-3 text-sm text-slate-500">After scheduling the reminder, come back here to mark this step complete.</div>
          <div class="mt-12 flex flex-col items-start gap-3">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700 ${isReminderWeekReadOnly ? "opacity-70" : ""}">
              <input type="checkbox" data-promote-complete="reminder_week" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_week ? "checked" : ""} ${isReminderWeekReadOnly ? "disabled" : ""} />
              <span>I scheduled the reminder</span>
            </label>
            <button type="button" data-promote-action="complete-reminder-week-and-continue" class="rounded-lg px-3 py-2 text-sm font-medium text-white ${(doneFlags.reminder_week && !isReminderWeekReadOnly) ? "bg-slate-800 hover:bg-slate-700" : "cursor-not-allowed bg-slate-300"}" ${(doneFlags.reminder_week && !isReminderWeekReadOnly) ? "" : "disabled"}>Complete step and continue</button>
          </div>
        `;
      }

      return `
        ${showOrderNote ? `<div class="mt-2 text-xs text-slate-500">Recommended order: Calendar → Announcement → Reminders.</div>` : ""}
        <div class="mt-3 text-sm text-slate-600">Schedule this reminder in Slack for Wednesday, March </div>
        <div class="mt-2 text-xs text-slate-500">When: 1 week before</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(reminderWeekMessage)}</div>
        <div class="${rowBase}">
          <button type="button" data-promote-action="copy-reminder-week" class="rounded-lg px-3 py-2 text-sm font-medium text-white" style="background-color: #546373;">${promoteUiState.copiedAction === "copy-reminder-week" ? "✓ Copied" : "Copy message"}</button>
          <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Email</button>
        </div>
        ${promoteUiState.copiedAction === "copy-reminder-week" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}
        <div class="mt-4 flex items-center justify-end gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="reminder_week" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_week ? "checked" : ""} />
            <span>1-week reminder sent</span>
          </label>
        </div>
      `;
    }

    if (stepKey === "final_winner") {
      return `
        <div class="mt-3 text-sm text-slate-600">Send this announcement when the final winner is decided.</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(reminderDayOfMessage)}</div>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" data-promote-action="copy-reminder-dayof" class="rounded-lg px-3 py-2 text-sm font-medium text-white" style="background-color: #546373;">${promoteUiState.copiedAction === "copy-reminder-dayof" ? "✓ Copied" : "Copy message"}</button>
          <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          <button type="button" data-promote-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Email</button>
        </div>
        ${promoteUiState.copiedAction === "copy-reminder-dayof" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}
        <div class="mt-4 flex items-center justify-end gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-promote-complete="final_winner" class="h-4 w-4 rounded border-slate-300" ${doneFlags.final_winner ? "checked" : ""} />
            <span>Final winner announcement sent</span>
          </label>
        </div>
      `;
    }

    const reminderDayOfCardMessage = isRevelryBracketsPromoteFlow
      ? marchMadnessWeeklyLeaderboardMessage
      : reminderDayOfMessage;
    const reminderDayOfCardHtml = isRevelryBracketsPromoteFlow
      ? marchMadnessWeeklyLeaderboardMessage.split("\n").map((line) => {
          const escapedLine = escapeHtml(line);
          if (line === "Men's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9") {
            return `<a href="https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Men's tournament</a>`;
          }
          if (line === "Women's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f") {
            return `<a href="https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Women's tournament</a>`;
          }
          return escapedLine;
        }).join("\n")
      : escapeHtml(reminderDayOfCardMessage);
    const isWeeklyLeaderboardStep = stepKey === "reminder_dayof" || stepKey === "reminder_dayof_2";
    const leaderboardLockMeta = getLeaderboardLockMeta(stepKey);
    const reminderDayOfIntroMessage = isRevelryBracketsPromoteFlow
      ? (stepKey === "reminder_dayof_2"
          ? "Your work is done for now.\n\nExpect an email at jennifer.baldwin@revelry.co on March 31 with your completed weekly update. Since the leaderboards are handled for you, just copy the provided text and share it in Slack. It will look like this:"
          : "Your work is done for now.\n\nExpect an email at jennifer.baldwin@revelry.co on March 24 with your completed weekly update. Since the leaderboards are handled for you, just copy the provided text and share it in Slack. It will look like this:")
      : "Send this reminder the day of the event.";

    return `
      ${showOrderNote ? `<div class="mt-2 text-xs text-slate-500">Recommended order: Calendar → Announcement → Reminders.</div>` : ""}
      <div class="mt-3 text-sm text-slate-600" style="white-space: pre-line;">${escapeHtml(reminderDayOfIntroMessage)}</div>
      <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${reminderDayOfCardHtml}</div>
      ${isRevelryBracketsPromoteFlow && isWeeklyLeaderboardStep && leaderboardLockMeta.locked && !allowTestingStepNavigation
        ? `<div class="mt-4 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">Read-only stage. This step is currently locked by the configured lock rules.${leaderboardLockMeta.dateLabel ? ` It unlocks around ${escapeHtml(leaderboardLockMeta.dateLabel)}.` : ""} No action is required right now.</div>`
        : `<div class="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" data-promote-action="copy-reminder-dayof" class="rounded-lg px-3 py-2 text-sm font-medium text-white" style="background-color: #546373;">${promoteUiState.copiedAction === "copy-reminder-dayof" ? "✓ Copied" : "Copy message"}</button>
            <button type="button" data-promote-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          </div>
          ${promoteUiState.copiedAction === "copy-reminder-dayof" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}`
      }
      ${isRevelryBracketsPromoteFlow && stepKey === "reminder_dayof" && (!leaderboardLockMeta.locked || allowTestingStepNavigation) ? `
      <div class="mt-12 flex flex-col items-start gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-promote-complete="reminder_dayof" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_dayof ? "checked" : ""} />
          <span>I shared Weekly Leaderboard Updates #1</span>
        </label>
      </div>
      ` : isRevelryBracketsPromoteFlow && stepKey === "reminder_dayof_2" && (!leaderboardLockMeta.locked || allowTestingStepNavigation) ? `
      <div class="mt-12 flex flex-col items-start gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-promote-complete="reminder_dayof_2" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_dayof_2 ? "checked" : ""} />
          <span>I shared Weekly Leaderboard Updates #2</span>
        </label>
      </div>
      ` : !isRevelryBracketsPromoteFlow ? `
      <div class="mt-4 flex items-center justify-end gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-promote-complete="reminder_dayof" class="h-4 w-4 rounded border-slate-300" ${doneFlags.reminder_dayof ? "checked" : ""} />
          <span>Day-of reminder sent</span>
        </label>
      </div>
      ` : ""}
    `;
  };

  const visibleSteps = processSteps.filter((step) => step.key === activeStep);
  const cardsHtml = visibleSteps.map((step) => {
    const shouldHideCompletedAnnouncementCard = isRevelryBracketsPromoteFlow
      && step.key === "announcement"
      && Boolean(promote.announcementLockedAfterContinue)
      && activeStep !== "announcement";
    if (shouldHideCompletedAnnouncementCard) return "";
    const expanded = isCardExpanded(step.key);
    return `
      <article id="promote-card-${step.key}" class="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <h4 class="truncate text-base font-semibold text-slate-900">${escapeHtml(step.title)}</h4>
          </div>
          <!-- <span class="inline-flex h-6 items-center rounded-full border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-600">${escapeHtml(getStatusPill(step.key))}</span> -->
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
          <h2 class="text-2xl font-semibold text-slate-900 md:text-3xl">${escapeHtml(promoteHeaderTitle)}</h2>
          ${promoteHeaderDescription
            ? `<p class="mt-1 text-sm text-slate-600" style="${promoteHeaderDescriptionStyle}">${escapeHtml(promoteHeaderDescription)}</p>`
            : ""}
          <p class="mt-2 text-xs text-slate-500">${escapeHtml(promoteHeaderSummary)}</p>
        </div>
        <span class="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 whitespace-nowrap">${isPromoteCompleted ? "✓ Completed" : "● In progress"}</span>
      </div>
    </div>

    <div class="mt-4 space-y-3">${cardsHtml}</div>

  `;

  const copyToClipboard = async (text) => {
    try {
      await writeClipboardMessage(String(text || ""));
    } catch (error) {
      console.warn("Clipboard copy failed", error?.message || error);
    }
  };

  const setActiveStep = (stepKey) => {
    normalizePromoteEventState();
    if (!processSteps.some((s) => s.key === stepKey)) return;
    if (isStepLocked(stepKey)) return;
    state.promoteEvent.activeStep = stepKey;
    state.promoteEvent.collapsedStep = "";
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
    } else if (stepKey === "reminder_dayof_2") {
      state.promoteEvent.reminderDayOf2.done = done;
      state.promoteEvent.reminderDayOf2.doneAt = stamp;
    } else if (stepKey === "final_winner") {
      state.promoteEvent.finalWinner.done = done;
      state.promoteEvent.finalWinner.doneAt = stamp;
    }
    const shouldGateAnnouncementAdvance = isRevelryBracketsPromoteFlow && stepKey === "announcement";
    const shouldGateReminderWeekAdvance = isRevelryBracketsPromoteFlow && stepKey === "reminder_week";
    if (done) {
      if (!shouldGateAnnouncementAdvance && !shouldGateReminderWeekAdvance) {
        const currentIndex = processSteps.findIndex((s) => s.key === stepKey);
        const nextStep = processSteps[currentIndex + 1]?.key;
        if (nextStep) {
          state.promoteEvent.activeStep = nextStep;
          state.promoteEvent.collapsedStep = "";
        }
      }
    } else {
      state.promoteEvent.activeStep = stepKey;
      state.promoteEvent.collapsedStep = "";
    }
    persistState();
    renderPromoteEventStep();
  };

  panel.querySelectorAll("#promoteProcessBar [data-process-index]").forEach((item) => {
    const stageIndex = Number(item.getAttribute("data-process-index"));
    const isFutureStep = Number.isFinite(stageIndex) && stageIndex > activeIndex;
    if (isFutureStep && !allowTestingStepNavigation) {
      item.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none");
      item.setAttribute("aria-disabled", "true");
    }
    item.addEventListener("click", () => {
      const clickedIndex = Number(item.getAttribute("data-process-index"));
      if (!Number.isFinite(clickedIndex)) return;
      if (clickedIndex > activeIndex && !allowTestingStepNavigation) return;
      const stepKey = processSteps[clickedIndex]?.key;
      if (!stepKey) return;
      if (isStepLocked(stepKey) && !allowTestingStepNavigation) return;
      setActiveStep(stepKey);
      setTimeout(() => {
        const card = document.getElementById(`promote-card-${stepKey}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  });

  const announcementSlackBtn = document.getElementById("promoteAnnouncementChannelSlack");
  if (announcementSlackBtn) {
    announcementSlackBtn.addEventListener("click", () => {
      promoteUiState.announcementChannel = "slack";
      renderPromoteEventStep();
    });
  }
  const announcementEmailBtn = document.getElementById("promoteAnnouncementChannelEmail");
  if (announcementEmailBtn) {
    announcementEmailBtn.addEventListener("click", () => {
      promoteUiState.announcementChannel = "email";
      renderPromoteEventStep();
    });
  }

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
        if (isMagicLinkContext && isMarchMadnessEvent) {
          const useEmail = promoteUiState.announcementChannel === "email";
          copyToClipboard(useEmail ? marchMadnessAnnouncementEmailMessage : marchMadnessAnnouncementSlackMessage);
        } else {
          copyToClipboard(announcementMessage);
        }
        promoteUiState.copiedAction = "copy-announcement";
        renderPromoteEventStep();
        setTimeout(() => { promoteUiState.copiedAction = null; renderPromoteEventStep(); }, 3000);
        return;
      }
      if (action === "copy-announcement-subject") {
        copyToClipboard("Join the Revelry March Madness Bracket Challenge 🏀");
        promoteUiState.copiedAction = "copy-announcement-subject";
        renderPromoteEventStep();
        setTimeout(() => { promoteUiState.copiedAction = null; renderPromoteEventStep(); }, 3000);
        return;
      }
      if (action === "continue-to-signup-reminder") {
        if (!doneFlags.announcement) return;
        state.promoteEvent.announcementLockedAfterContinue = true;
        persistState();
        setActiveStep("reminder_week");
        setTimeout(() => {
          const card = document.getElementById("promote-card-reminder_week");
          if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
        return;
      }
      if (action === "complete-reminder-week-and-continue") {
        if (!doneFlags.reminder_week) return;
        state.promoteEvent.reminderWeekLockedAfterContinue = true;
        state.promoteEvent.activeStep = "reminder_dayof";
        state.promoteEvent.collapsedStep = "";
        persistState();
        ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.PROMOTE);
        goToEventWorkflowStep(EVENT_WORKFLOW_STEPS.RUN);
        setTimeout(() => {
          const card = document.getElementById("run-substep-card-reminder_dayof");
          if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
        return;
      }
      if (action === "copy-reminder-week") {
        if (isRevelryBracketsPromoteFlow) {
          copyToClipboard(marchMadnessSignupReminderMessage);
        } else {
          copyToClipboard(reminderWeekMessage);
        }
        promoteUiState.copiedAction = "copy-reminder-week";
        renderPromoteEventStep();
        setTimeout(() => { promoteUiState.copiedAction = null; renderPromoteEventStep(); }, 3000);
        return;
      }
      if (action === "copy-reminder-dayof") {
        if (isRevelryBracketsPromoteFlow) {
          copyToClipboard(marchMadnessWeeklyLeaderboardMessage);
        } else {
          copyToClipboard(reminderDayOfMessage);
        }
        promoteUiState.copiedAction = "copy-reminder-dayof";
        renderPromoteEventStep();
        setTimeout(() => { promoteUiState.copiedAction = null; renderPromoteEventStep(); }, 3000);
        return;
      }
      if (action === "open-slack") {
        window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
        return;
      }
      if (action === "open-gmail") {
        window.open("https://gmail.com", "_blank", "noopener,noreferrer");
      }
    });
  });

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
    chosenDateTime
  } = context;

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
  const hasEnoughSchedulingContext = Boolean(eventDateTime || vendorUrl || confirmedHeadcount > 0);
  const isMagicLinkContext = Boolean(parseMagicLinkFromHostPath());
  const allowTestingStepNavigation = Boolean(getActiveTestingMagicContext());
  const isMarchMadnessEvent = isRevelryBracketsMagicContext() || String(eventName || "").trim().toLowerCase() === "march madness bracket challenge";
  const isRevelryMarchMadnessRunSubsteps = isMagicLinkContext && isMarchMadnessEvent;
  const chosenEventId = String(state.pollBuilder?.chosenEventId || "").trim();
  const normalizedRunEventName = String(eventName || "").trim().toLowerCase();
  const isEnergyResetLaunch = chosenEventId === "5_day_energy_reset_challenge"
    || normalizedRunEventName === "5-day energy reset challenge"
    || normalizedRunEventName.includes("energy reset challenge");

  if (isEnergyResetLaunch) {
    const isSuscoMagicLinkContext = getMagicLinkContextKey() === "susco.eeos.work/susco2026a7d4k9m2";
    const programWeekSummary = buildProgramWeekSummary(state.fourMonthProgram);
    const upcomingWeekRows = programWeekSummary
      .filter((item) => Number(item?.week || 0) >= 3 && Number(item?.week || 0) <= 12)
      .sort((a, b) => Number(a.week || 0) - Number(b.week || 0))
      .map((item) => {
        const weekNumber = Number(item?.week || 0);
        const weekLabel = weekNumber > 0 ? `Week ${weekNumber}` : "Week";
        const eventName = String(item?.eventName || "").trim() || "TBD";
        return `<li class="text-sm text-slate-700">${escapeHtml(weekLabel)} - ${escapeHtml(eventName)}</li>`;
      })
      .join("");

    const allTemplates = getSeededFreeEventTemplates();
    const currentTemplateIndex = allTemplates.findIndex(t => String(t.id || t.templateId || "").trim() === "5_day_energy_reset_challenge");
    const nextTemplate = currentTemplateIndex >= 0 && currentTemplateIndex + 1 < allTemplates.length ? allTemplates[currentTemplateIndex + 1] : null;
    const nextEventTitle = nextTemplate ? String(nextTemplate.title || "").trim() : "your next event";
    const launchState = normalizeEnergyResetLaunchState();
    const now = new Date();
    let launchStateChanged = false;

    // Check if timestamps are missing OR already expired (stale from a previous test run)
    const existingUnlockDate = new Date(String(launchState.reviewUnlockAt || ""));
    const unlockAlreadyExpired = !Number.isNaN(existingUnlockDate.getTime()) && existingUnlockDate.getTime() <= now.getTime();

    if (!launchState.challengeStartedAt || unlockAlreadyExpired) {
      launchState.challengeStartedAt = now.toISOString();
      launchStateChanged = true;
    }
    if (!launchState.reviewUnlockAt || unlockAlreadyExpired) {
      launchState.reviewUnlockAt = getEnergyResetReviewUnlockAt(launchState.challengeStartedAt)
        || String(launchState.challengeStartedAt || now.toISOString());
      launchStateChanged = true;
    }

    const unlockDate = new Date(String(launchState.reviewUnlockAt || ""));
    const hasValidUnlockDate = !Number.isNaN(unlockDate.getTime());
    const remainingMs = hasValidUnlockDate ? Math.max(0, unlockDate.getTime() - now.getTime()) : 0;
    const totalHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const countdownLabel = remainingMs > 0
      ? `${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"} remaining`
      : "Countdown complete";
    const unlockDateLabel = hasValidUnlockDate
      ? unlockDate.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
      : "7 days from launch";

    panel.innerHTML = `
      <article class="rounded-xl border border-slate-200 bg-white p-5">
        <h3 class="text-2xl font-semibold text-slate-900">Current Event: 5-Day Energy Reset Challenge</h3>
        <p class="mt-2 text-sm text-slate-600">You already scheduled all Slack posts for this challenge. Nice work.</p>
      </article>

      <article class="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-base font-semibold text-slate-900">What to do now</h4>
        <p class="mt-2 text-sm text-slate-700">There is nothing left to do right now while the challenge runs.</p>
        <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs uppercase tracking-wide text-slate-500">Countdown to review</div>
          <div class="mt-1 text-lg font-semibold text-slate-900">${countdownLabel}</div>
          <div class="mt-1 text-xs text-slate-500">Review Impact unlocks around ${escapeHtml(unlockDateLabel)}.</div>
        </div>
      </article>

      <article class="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-base font-semibold text-slate-900">What happens next</h4>
        <p class="mt-2 text-sm text-slate-700">When this countdown ends, you&rsquo;ll move on to <span class="font-medium">Review Impact</span> for the 5-Day Energy Reset Challenge&mdash;covering budget, participation, reactions, and notes.</p>
        ${isSuscoMagicLinkContext ? `<p class="mt-2 text-sm text-slate-700">You&rsquo;ll return here, using your magic link: <a href="https://susco.eeos.work/susco2026a7d4k9m2" target="_blank" rel="noopener noreferrer" class="underline font-semibold">https://susco.eeos.work/susco2026a7d4k9m2</a></p>` : ""}
        <p class="mt-2 text-sm text-slate-700">Once you complete Review Impact, your dashboard (engagement, budget, and employee sentiment tracking) will unlock.</p>
        <p class="mt-2 text-sm text-slate-700">After that, your next event&mdash;<strong>${escapeHtml(nextEventTitle)}</strong>&mdash;will be ready to launch.</p>
      </article>

      <article class="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-base font-semibold text-slate-900">What&apos;s after that</h4>
        <ul class="mt-2 space-y-1">
          ${upcomingWeekRows}
        </ul>
      </article>
    `;

    if (launchStateChanged) {
      persistState();
      renderSidebarStepMenus();
    }
    return;
  }

  normalizePromoteEventState();
  const promote = state.promoteEvent;
  const runSubsteps = [
    { key: "reminder_dayof", label: "Weekly Leaderboard Update #1", title: "Weekly Leaderboard Update #1" },
    { key: "reminder_dayof_2", label: "Weekly Leaderboard Update #2", title: "Weekly Leaderboard Update #2" },
    { key: "final_winner", label: "Final Winner Announcement", title: "Final Winner Announcement" }
  ];
  const runSubstepDoneFlags = {
    reminder_dayof: Boolean(promote.reminderDayOf.done),
    reminder_dayof_2: Boolean(promote.reminderDayOf2.done),
    final_winner: Boolean(promote.finalWinner?.done)
  };
  const getRunSubstepLockMeta = (stepKey) => {
    if (!isRevelryMarchMadnessRunSubsteps) return { locked: false, dateLabel: "" };
    const alreadyDone = Boolean(runSubstepDoneFlags[stepKey]);
    return getRuleDrivenStepLockMeta(stepKey, {
      pageScope: "run",
      alreadyDone
    });
  };
  const isRunSubstepLocked = (stepKey) => {
    if (allowTestingStepNavigation) return false;
    const lockMeta = getRunSubstepLockMeta(stepKey);
    return lockMeta.locked;
  };

  const runSubstepKeys = runSubsteps.map((item) => item.key);
  let activeRunSubstep = runSubstepKeys.includes(promote.activeStep) ? promote.activeStep : "reminder_dayof";
  if (isRevelryMarchMadnessRunSubsteps && runSubstepDoneFlags.reminder_dayof && !runSubstepDoneFlags.reminder_dayof_2 && activeRunSubstep === "reminder_dayof") {
    activeRunSubstep = "reminder_dayof_2";
    state.promoteEvent.activeStep = "reminder_dayof_2";
    state.promoteEvent.collapsedStep = "";
    persistState();
  }

  const defaultRunReminderDayOfMessage = (
    `Today is the day: ${eventName} starts at ${eventTime}.\n` +
    "See you soon - please join on time."
  );
  const runReminderDayOfMessage = (promote.messages?.reminderDayOfOverride || defaultRunReminderDayOfMessage).trim();
  const marchMadnessWeeklyLeaderboardMessage = [
    "🏀 March Madness Bracket Challenge Update",
    "",
    "Here are the current standings after the latest round:",
    "",
    "Men's Tournament",
    "🥇 1st - [NAME] - [POINTS]",
    "🥈 2nd - [NAME] - [POINTS]",
    "🥉 3rd - [NAME] - [POINTS]",
    "",
    "Women's Tournament",
    "🥇 1st - [NAME] - [POINTS]",
    "🥈 2nd - [NAME] - [POINTS]",
    "🥉 3rd - [NAME] - [POINTS]",
    "",
    "Plenty of basketball left - the leaderboard can still change.",
    "",
    "Follow the standings here:",
    "Men's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9",
    "Women's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f"
  ].join("\n");

  const runReminderCardHtml = marchMadnessWeeklyLeaderboardMessage.split("\n").map((line) => {
    const escapedLine = escapeHtml(line);
    if (line === "Men's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9") {
      return `<a href="https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=fed14992-c909-4761-a5d0-63093b6f93f9" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Men's tournament</a>`;
    }
    if (line === "Women's tournament: https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f") {
      return `<a href="https://fantasy.espn.com/games/tournament-challenge-bracket-women-2026/group?id=78b3bbb5-8736-4875-baf0-58474afc995f" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Women's tournament</a>`;
    }
    return escapedLine;
  }).join("\n");

  const renderRunSubstepBody = (stepKey) => {
    if (stepKey === "final_winner") {
      return `
        <div class="mt-3 text-sm text-slate-600">Send this announcement when the final winner is decided.</div>
        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(runReminderDayOfMessage)}</div>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" data-run-substep-action="copy-reminder-dayof" data-run-substep-step="final_winner" class="rounded-lg px-3 py-2 text-sm font-medium text-white" style="background-color: #546373;">${promoteUiState.copiedAction === "copy-reminder-dayof" ? "✓ Copied" : "Copy message"}</button>
          <button type="button" data-run-substep-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          <button type="button" data-run-substep-action="open-gmail" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Email</button>
        </div>
        ${promoteUiState.copiedAction === "copy-reminder-dayof" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}
        <div class="mt-4 flex items-center justify-end gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" data-run-substep-complete="final_winner" class="h-4 w-4 rounded border-slate-300" ${runSubstepDoneFlags.final_winner ? "checked" : ""} />
            <span>Final winner announcement sent</span>
          </label>
        </div>
      `;
    }

    const isWeeklyLeaderboardStep = stepKey === "reminder_dayof" || stepKey === "reminder_dayof_2";
    const lockMeta = getRunSubstepLockMeta(stepKey);
    const isLockedWeeklyLeaderboardStep = isWeeklyLeaderboardStep && lockMeta.locked && !allowTestingStepNavigation;
    const introMessage = stepKey === "reminder_dayof_2"
      ? "Your work is done for now.\n\nExpect an email at jennifer.baldwin@revelry.co on March 31 with your completed weekly update. Since the leaderboards are handled for you, just copy the provided text and share it in Slack. It will look like this:"
      : "Your work is done for now.\n\nExpect an email at jennifer.baldwin@revelry.co on March 24 with your completed weekly update. Since the leaderboards are handled for you, just copy the provided text and share it in Slack. It will look like this:";

    return `
      <div class="mt-3 text-sm text-slate-800" style="white-space: pre-line;">${escapeHtml(introMessage)}</div>
      <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" style="white-space: pre-line;">${runReminderCardHtml}</div>
      ${isLockedWeeklyLeaderboardStep
        ? ""
        : `<div class="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" data-run-substep-action="copy-reminder-dayof" data-run-substep-step="${stepKey}" class="rounded-lg px-3 py-2 text-sm font-medium text-white" style="background-color: #546373;">${promoteUiState.copiedAction === "copy-reminder-dayof" ? "✓ Copied" : "Copy message"}</button>
            <button type="button" data-run-substep-action="open-slack" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
          </div>
          ${promoteUiState.copiedAction === "copy-reminder-dayof" ? `<div class="mt-2 text-sm font-medium" style="color: #10B981;">Copied to clipboard</div>` : ""}`
      }
      ${stepKey === "reminder_dayof" && (!lockMeta.locked || allowTestingStepNavigation) ? `
      <div class="mt-12 flex flex-col items-start gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-run-substep-complete="reminder_dayof" class="h-4 w-4 rounded border-slate-300" ${runSubstepDoneFlags.reminder_dayof ? "checked" : ""} />
          <span>I shared Weekly Leaderboard Updates #1</span>
        </label>
      </div>
      ` : stepKey === "reminder_dayof_2" && (!lockMeta.locked || allowTestingStepNavigation) ? `
      <div class="mt-12 flex flex-col items-start gap-3">
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" data-run-substep-complete="reminder_dayof_2" class="h-4 w-4 rounded border-slate-300" ${runSubstepDoneFlags.reminder_dayof_2 ? "checked" : ""} />
          <span>I shared Weekly Leaderboard Updates #2</span>
        </label>
      </div>
      ` : ""}
    `;
  };

  const runSubstepActiveIndex = runSubsteps.findIndex((item) => item.key === activeRunSubstep);
  const runSubstepCompletedIndexes = runSubsteps
    .map((step, index) => (runSubstepDoneFlags[step.key] ? index : -1))
    .filter((index) => index >= 0);
  const runSubstepProgressHtml = getHorizontalProcessBarHtml(runSubsteps.map((step) => step.label), runSubstepActiveIndex, {
    completedIndexes: runSubstepCompletedIndexes,
    clickable: true
  });
  const runSubstepCardsHtml = isRevelryMarchMadnessRunSubsteps
    ? runSubsteps.filter((step) => step.key === activeRunSubstep).map((step) => `
      <article id="run-substep-card-${step.key}" class="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <h4 class="truncate text-base font-semibold text-slate-900">${escapeHtml(step.title)}</h4>
          </div>
        </div>
        <div class="mt-4 border-t border-slate-200 pt-4">${renderRunSubstepBody(step.key)}</div>
      </article>
    `).join("")
    : "";
  const marchMadnessRunSubstepsHtml = isRevelryMarchMadnessRunSubsteps
    ? `
      <div class="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 class="text-2xl font-semibold text-slate-900 md:text-3xl">March Madness Bracket Challenge</h3>
            <p class="mt-2 text-xs text-slate-700">March 19 - April 7</p>
          </div>
        </div>
      </div>

      <div id="runSubstepProcessBar" class="mt-3">
        ${runSubstepProgressHtml}
      </div>

      <div class="mt-4 space-y-3">
        ${runSubstepCardsHtml}
      </div>
    `
    : "";
  // Hide legacy Run Event cards for Revelry/testing March Madness; only run substeps should be visible.
  const showLegacyRunEventCards = !isRevelryMarchMadnessRunSubsteps;

  panel.innerHTML = `
    ${marchMadnessRunSubstepsHtml}
    ${showLegacyRunEventCards && debugPreview ? `
      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">Debug preview (event details may be missing).</div>
    ` : ""}
    ${showLegacyRunEventCards && !debugPreview && !hasEnoughSchedulingContext ? `
      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">Run Event is visible now so the workflow stays intact. Final event details can still be filled in upstream.</div>
    ` : ""}

    ${showLegacyRunEventCards ? `<div class="rounded-xl border border-slate-200 bg-white p-5">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-semibold text-slate-900">Run Event</h3>
          <p class="mt-1 text-sm text-slate-600">Day-of checklist and notes.</p>
        </div>
        <span class="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">${statusText}</span>
      </div>
    </div>` : ""}

    ${showLegacyRunEventCards ? `<article class="rounded-xl border border-slate-200 bg-white p-5">
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
    </article>` : ""}

    ${showLegacyRunEventCards ? `<article class="rounded-xl border border-slate-200 bg-white p-5">
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
    </article>` : ""}
  `;

  if (isRevelryMarchMadnessRunSubsteps) {
    const setRunSubstepActive = (stepKey) => {
      if (!runSubsteps.some((item) => item.key === stepKey)) return;
      if (isRunSubstepLocked(stepKey)) return;
      state.promoteEvent.activeStep = stepKey;
      state.promoteEvent.collapsedStep = "";
      persistState();
      renderRunEventStep();
    };

    const setRunSubstepDone = (stepKey, done) => {
      normalizePromoteEventState();
      const stamp = done ? new Date().toISOString() : "";
      if (stepKey === "reminder_dayof") {
        state.promoteEvent.reminderDayOf.done = done;
        state.promoteEvent.reminderDayOf.doneAt = stamp;
      } else if (stepKey === "reminder_dayof_2") {
        state.promoteEvent.reminderDayOf2.done = done;
        state.promoteEvent.reminderDayOf2.doneAt = stamp;
      } else if (stepKey === "final_winner") {
        state.promoteEvent.finalWinner.done = done;
        state.promoteEvent.finalWinner.doneAt = stamp;
      }

      if (done) {
        const currentIndex = runSubsteps.findIndex((item) => item.key === stepKey);
        const nextStep = runSubsteps[currentIndex + 1]?.key;
        if (nextStep) {
          state.promoteEvent.activeStep = nextStep;
          state.promoteEvent.collapsedStep = "";
        }
      } else {
        state.promoteEvent.activeStep = stepKey;
        state.promoteEvent.collapsedStep = "";
      }
      persistState();
      renderRunEventStep();
    };

    panel.querySelectorAll("#runSubstepProcessBar [data-process-index]").forEach((item) => {
      const stageIndex = Number(item.getAttribute("data-process-index"));
      const isFutureStep = Number.isFinite(stageIndex) && stageIndex > runSubstepActiveIndex;
      if (isFutureStep && !allowTestingStepNavigation) {
        item.classList.add("cursor-not-allowed", "pointer-events-none");
        item.setAttribute("aria-disabled", "true");
      }
      item.addEventListener("click", () => {
        const clickedIndex = Number(item.getAttribute("data-process-index"));
        if (!Number.isFinite(clickedIndex)) return;
        if (clickedIndex > runSubstepActiveIndex && !allowTestingStepNavigation) return;
        const stepKey = runSubsteps[clickedIndex]?.key;
        if (!stepKey) return;
        setRunSubstepActive(stepKey);
      });
    });

    panel.querySelectorAll("[data-run-substep-complete]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const stepKey = String(checkbox.getAttribute("data-run-substep-complete") || "");
        setRunSubstepDone(stepKey, Boolean(checkbox.checked));
      });
    });

    panel.querySelectorAll("[data-run-substep-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = String(button.getAttribute("data-run-substep-action") || "");
        if (action === "copy-reminder-dayof") {
          const stepKey = String(button.getAttribute("data-run-substep-step") || activeRunSubstep || "");
          const copyText = stepKey === "final_winner" ? runReminderDayOfMessage : marchMadnessWeeklyLeaderboardMessage;
          writeClipboardMessage(String(copyText || "")).catch(() => {});
          promoteUiState.copiedAction = "copy-reminder-dayof";
          renderRunEventStep();
          setTimeout(() => {
            promoteUiState.copiedAction = null;
            renderRunEventStep();
          }, 3000);
          return;
        }
        if (action === "open-slack") {
          window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
          return;
        }
        if (action === "open-gmail") {
          window.open("https://gmail.com", "_blank", "noopener,noreferrer");
        }
      });
    });
  }

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
  const isPreviewMode = !context.canAccess;

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
    ${isPreviewMode ? `
      <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">Preview</h4>
        <p class="mt-1 text-sm text-slate-600">Feedback unlocks after Run Event is completed. You can preview this step now.</p>
        <div class="mt-3">
          <button id="feedbackGoToRunEvent" data-allow-locked="true" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Go to Run Event</button>
        </div>
      </article>
    ` : ""}

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
      await writeClipboardMessage(String(text || ""));
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
      if (!state.completedSetupSteps.includes(13)) {
        state.completedSetupSteps.push(13);
      }
      state.currentSetupStep = 14;
      state.eventWorkflowProcessStep = 14;
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      updateSetupStepButtonStates();
      scrollSetupStepIntoView(14);
    });
  }

  const goButton = document.getElementById("feedbackGoToRunEvent");
  if (goButton) {
    goButton.addEventListener("click", () => {
      state.currentSetupStep = 12;
      persistState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      scrollSetupStepIntoView(12);
    });
  }
}

function renderReviewImpactStep() {
  const panel = document.getElementById("reviewImpactPanel");
  if (!panel) return;

  const engagement = calculateEngagementMetrics();
  const usingEngagementPercents = engagement.employeeCount > 0;
  const pollEngagementValue = usingEngagementPercents
    ? `${engagement.pollParticipationPercent}%`
    : `${engagement.pollParticipantCount} responders`;
  const rsvpEngagementValue = usingEngagementPercents
    ? `${engagement.rsvpParticipationPercent}%`
    : `${engagement.rsvpParticipantCount} responders`;
  const pollEngagementDetail = usingEngagementPercents
    ? `${engagement.pollParticipantCount} of ${engagement.employeeCount} employees`
    : "Employee count not set";
  const rsvpEngagementDetail = usingEngagementPercents
    ? `${engagement.rsvpParticipantCount} of ${engagement.employeeCount} employees`
    : "Employee count not set";

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

    <article class="rounded-xl border border-slate-200 bg-white p-5">
      <h4 class="text-base font-semibold text-slate-900">Team Engagement</h4>
      <div class="mt-3 space-y-2 text-sm">
        <div class="metric-row"><span>Poll participation</span><strong>${pollEngagementValue}</strong></div>
        <div class="text-[11px] text-slate-500 -mt-1">${pollEngagementDetail}</div>
        <div class="metric-row"><span>RSVP participation</span><strong>${rsvpEngagementValue}</strong></div>
        <div class="text-[11px] text-slate-500 -mt-1">${rsvpEngagementDetail}</div>
        <div class="metric-row"><span>Expected attendance</span><strong>${engagement.expectedAttendanceCount} employees</strong></div>
        <div class="metric-row"><span>Events run this quarter</span><strong>${engagement.eventsRunCount}</strong></div>
      </div>
      <p class="mt-3 text-[11px] text-slate-500">Engagement improves when teams participate in events.</p>
      <p class="mt-1 text-[11px] text-slate-500">Planning activity: ${engagement.planningActivityCount} (${engagement.pollsCreated} poll${engagement.pollsCreated === 1 ? "" : "s"}, ${engagement.rsvpsCreated} RSVP${engagement.rsvpsCreated === 1 ? "" : "s"})</p>
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

function getPollWorkflowSnapshot() {
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
  const topEventLabel = String(resultsModel?.topEvent?.label || selectedEvents[0]?.defaultLabel || state.pollBuilder?.chosenEventLabel || state.eventLaunchContext?.title || "Selected event").trim() || "Selected event";
  const topTimeLabel = String(resultsModel?.topTime?.label || proposedTimeLabels[0] || "").trim();
  const topTimeIndex = proposedTimeLabels.findIndex((label) => label === topTimeLabel);
  const topTimeRaw = topTimeIndex >= 0
    ? String(proposedDateTimes[topTimeIndex] || "").trim()
    : String(proposedDateTimes[0] || "").trim();
  return {
    selectedEvents,
    resultsModel,
    topEventLabel,
    topTimeLabel,
    topTimeRaw
  };
}

function renderRsvpStep() {
  const panel = document.getElementById("rsvpStepPanel");
  if (!panel) return;

  const workflowType = getActiveWorkflowType();
  const chosenEventId = String(state.pollBuilder?.chosenEventId || "").trim();
  const pollSnapshot = getPollWorkflowSnapshot();
  const eventName = String(state.pollBuilder?.chosenEventLabel || pollSnapshot.topEventLabel || state.eventLaunchContext?.title || "Selected event").trim() || "Selected event";
  const normalizedEventName = String(eventName || "").trim().toLowerCase();
  const isEnergyResetLaunch = chosenEventId === "5_day_energy_reset_challenge"
    || normalizedEventName === "5-day energy reset challenge"
    || normalizedEventName.includes("energy reset challenge");
  syncRsvpStepLabels(isEnergyResetLaunch);

  if (isWorkflowStepSkipped(EVENT_WORKFLOW_STEPS.RSVP, workflowType)) {
    panel.innerHTML = "";
    return;
  }

  const pollReadyForRsvp = workflowType !== EVENT_WORKFLOW_TYPES.POLL
    || Boolean(state.completedSetupSteps.includes(EVENT_WORKFLOW_STEPS.POLL))
    || Boolean(state.pollBuilder?.showResultsPage)
    || Boolean(String(state.pollBuilder?.shareLink || "").trim());

  if (!pollReadyForRsvp) {
    panel.innerHTML = `
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">${isEnergyResetLaunch ? "Launch Event" : "RSVP"}</h4>
        <p class="mt-2 text-sm text-slate-600">Complete Poll Team first, then continue here to create and share the RSVP.</p>
      </div>
    `;
    return;
  }

  const eventDateTimeValue = String(state.pollBuilder?.chosenDateTime || pollSnapshot.topTimeRaw || "").trim();
  const eventDateTimeDisplay = eventDateTimeValue ? (formatPollDateTime(eventDateTimeValue) || eventDateTimeValue) : "Date/time required before sending RSVP";
  const savedDeadlineIso = String(state.pollBuilder?.rsvpDeadlineDateTime || "").trim();
  const parseIsoToFields = (isoValue) => {
    const parsed = isoValue ? new Date(isoValue) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return { date: "", hour: "12", minute: "00", period: "PM" };
    }
    const hour24 = parsed.getHours();
    return {
      date: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`,
      hour: String(hour24 % 12 || 12),
      minute: String(parsed.getMinutes()).padStart(2, "0"),
      period: hour24 >= 12 ? "PM" : "AM"
    };
  };
  const savedDeadlineFields = parseIsoToFields(savedDeadlineIso);
  if (!pollUiState.rsvpDeadlineDate) pollUiState.rsvpDeadlineDate = savedDeadlineFields.date || getLocalIsoDatePlusBusinessDays(2);
  if (!pollUiState.rsvpDeadlineHour) pollUiState.rsvpDeadlineHour = savedDeadlineFields.hour || "12";
  if (!pollUiState.rsvpDeadlineMinute) pollUiState.rsvpDeadlineMinute = savedDeadlineFields.minute || "00";
  if (!pollUiState.rsvpDeadlinePeriod) pollUiState.rsvpDeadlinePeriod = savedDeadlineFields.period || "PM";

  const hasDeadlineDraft = Boolean(
    String(pollUiState.rsvpDeadlineDate || "").trim()
    && String(pollUiState.rsvpDeadlineHour || "").trim()
    && String(pollUiState.rsvpDeadlineMinute || "").trim()
    && String(pollUiState.rsvpDeadlinePeriod || "").trim()
  );
  const activeDeadlineIso = hasDeadlineDraft
    ? buildPollDateTimeValue(
      pollUiState.rsvpDeadlineDate,
      pollUiState.rsvpDeadlineHour,
      pollUiState.rsvpDeadlineMinute,
      pollUiState.rsvpDeadlinePeriod
    )
    : "";
  const deadlineDisplayText = savedDeadlineIso ? (formatPollDateTime(savedDeadlineIso) || savedDeadlineIso) : "Date/Time";

  const rsvpId = String(state.pollBuilder?.rsvpId || "").trim();
  const rsvpShareUrl = String(state.pollBuilder?.rsvpShareUrl || "").trim();
  const rsvpResults = state.pollBuilder?.rsvpResults && typeof state.pollBuilder.rsvpResults === "object"
    ? state.pollBuilder.rsvpResults
    : { yesCount: 0, noCount: 0, totalResponses: 0, responses: [] };
  const responses = Array.isArray(rsvpResults.responses) ? rsvpResults.responses : [];
  const attendingNames = responses
    .filter((row) => String(row?.answer || "").trim().toLowerCase() === "yes")
    .map((row) => String(row?.name || "").trim())
    .filter(Boolean);
  const previewLimit = 9;
  const expanded = Boolean(state.pollBuilder?.rsvpAttendeesExpanded);
  const visibleAttendees = expanded ? attendingNames : attendingNames.slice(0, previewLimit);
  const hasMoreAttendees = attendingNames.length > previewLimit;
  let subject = `Confirm your spot — ${eventName}`;
  const eventLine = eventDateTimeValue ? (formatPollDateTime(eventDateTimeValue) || eventDateTimeValue) : "the scheduled event time";
  let messageBody = savedDeadlineIso
    ? `We’re planning ${eventName} on ${eventLine}.\nPlease confirm if you’ll attend so we can finalize the headcount.\nRSVP by ${deadlineDisplayText}.\nRSVP here: ${rsvpShareUrl || "[RSVP link]"}`
    : `We’re planning ${eventName} on ${eventLine}.\nPlease confirm if you’ll attend so we can finalize the headcount.\nRSVP here: ${rsvpShareUrl || "[RSVP link]"}`;

  if (rsvpId) {
    startRsvpResultsPolling(rsvpId);
  } else {
    stopRsvpResultsPolling();
  }

  if (isEnergyResetLaunch) {
    const energyResetState = normalizeEnergyResetLaunchState();
    const activeStepKey = String(energyResetState.activeStepKey || ENERGY_RESET_LAUNCH_STEPS[0].key);
    panel.innerHTML = `
      <div class="space-y-5">
        <article class="rounded-xl border border-slate-200 bg-white p-5">
          <h4 class="text-base font-semibold text-slate-900">5-Day Energy Reset Challenge</h4>
          <p class="mt-1 text-sm text-slate-600">This challenge includes a series of daily Slack messages. Just copy and paste each one below and schedule it for the appropriate day.</p>

          <div class="mt-5 space-y-3">
            ${ENERGY_RESET_LAUNCH_STEPS.map((step, index) => {
              const isActive = step.key === activeStepKey;
              const isDone = energyResetState.completedStepKeys.includes(step.key);
              const nextStep = ENERGY_RESET_LAUNCH_STEPS[index + 1] || null;
              const dayTitleMatch = step.title.match(/^(Day\s+\d+)(.*)$/);
              const dayPrefix = dayTitleMatch ? dayTitleMatch[1] : step.title;
              const daySuffix = dayTitleMatch ? dayTitleMatch[2] : "";
              const advanceLabel = nextStep
                ? `Mark complete and advance to ${nextStep.title}`
                : "I have scheduled all Slack messages for the 5-Day Energy Reset Challenge";
              return `
                <article class="overflow-hidden rounded-xl border bg-white ${isActive ? "border-slate-400 shadow-sm" : "border-slate-200"}">
                  <div class="flex items-center justify-between px-4 py-3 ${isActive ? "border-b border-slate-700 bg-slate-800" : ""}">
                    <div class="text-sm ${isActive ? "text-white" : "text-slate-900"}"><span class="font-semibold">${dayPrefix}</span><span class="font-normal">${daySuffix}</span></div>
                    ${isDone ? `<span class="text-xs font-medium ${isActive ? "text-emerald-300" : "text-emerald-600"}">✓ Complete</span>` : ""}
                  </div>
                  ${isActive ? `
                    <div class="p-4">
                      <div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">${step.htmlMessage}</div>
                        <div class="mt-4 flex flex-wrap items-center gap-3">
                          <button type="button" data-energy-reset-copy="${step.key}" class="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Copy message</button>
                          <button type="button" data-energy-reset-open-slack class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
                        </div>
                      </div>
                      <div class="mt-8">
                        <label class="flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" data-energy-reset-advance="${step.key}" class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400">
                          <span>${advanceLabel}</span>
                        </label>
                      </div>
                    </div>
                  ` : ""}
                </article>
              `;
            }).join("")}
          </div>
        </article>
      </div>
    `;
  } else {
    panel.innerHTML = `
    <div class="space-y-5">
      <article class="rounded-xl border border-slate-200 bg-white p-5">
        <h4 class="text-base font-semibold text-slate-900">Create RSVP</h4>
        <p class="mt-1 text-sm text-slate-600">Collect final attendance before moving the workflow forward.</p>

        <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Event</div>
            <div class="mt-1 text-lg font-semibold text-slate-900">${escapeHtml(eventName)}</div>
            <div class="mt-3">
              <label class="block text-xs font-medium text-slate-600" for="rsvpStepEventDateTime">Event date & time</label>
              <input id="rsvpStepEventDateTime" type="datetime-local" value="${escapeHtml(eventDateTimeValue)}" class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
              <div class="mt-1 text-xs text-slate-500">${escapeHtml(eventDateTimeDisplay)}</div>
            </div>
          </div>
          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">RSVP deadline</div>
            ${savedDeadlineIso ? `
              <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span class="font-medium text-slate-900">${escapeHtml(deadlineDisplayText)}</span>
                <button id="rsvpStepDeadlineEdit" type="button" class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
              </div>
            ` : `
              <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <input id="rsvpStepDeadlineDate" type="date" value="${escapeHtml(pollUiState.rsvpDeadlineDate || "")}" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                <select id="rsvpStepDeadlineHour" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900">${Array.from({ length: 12 }, (_, index) => String(index + 1)).map((hour) => `<option value="${hour}" ${hour === String(pollUiState.rsvpDeadlineHour || "12") ? "selected" : ""}>${hour}</option>`).join("")}</select>
                <select id="rsvpStepDeadlineMinute" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900">${["00", "15", "30", "45"].map((minute) => `<option value="${minute}" ${minute === String(pollUiState.rsvpDeadlineMinute || "00") ? "selected" : ""}>${minute}</option>`).join("")}</select>
                <select id="rsvpStepDeadlinePeriod" class="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900"><option value="AM" ${String(pollUiState.rsvpDeadlinePeriod || "PM") === "AM" ? "selected" : ""}>AM</option><option value="PM" ${String(pollUiState.rsvpDeadlinePeriod || "PM") === "PM" ? "selected" : ""}>PM</option></select>
                <button id="rsvpStepDeadlineSubmit" type="button" class="rounded-lg border border-slate-800 bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700">Submit</button>
              </div>
            `}
          </div>
        </div>

        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="text-sm font-semibold text-slate-900">Preview</div>
          <div class="mt-2 text-sm text-slate-800">${escapeHtml(subject)}</div>
          <div class="mt-2 text-sm text-slate-700" style="white-space: pre-line;">${escapeHtml(messageBody)}</div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button id="rsvpStepCreateLink" type="button" ${pollUiState.rsvpCreateBusy ? "disabled" : ""} class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">${pollUiState.rsvpCreateBusy ? "Creating…" : (rsvpId ? "Recreate RSVP link" : "Generate RSVP link")}</button>
          ${pollUiState.rsvpCreateError ? `<div class="text-xs text-amber-700">${escapeHtml(pollUiState.rsvpCreateError)}</div>` : ""}
        </div>
      </article>

      ${rsvpShareUrl ? `
        <article class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="text-base font-semibold text-slate-900">Share RSVP</div>
          <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="text-xs font-medium text-slate-500">Share link</div>
            <div class="mt-2 flex items-center gap-2">
              <input id="rsvpStepShareUrl" readonly value="${escapeHtml(rsvpShareUrl)}" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
              <button id="rsvpStepCopyLink" type="button" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Copy</button>
            </div>
          </div>
          <div class="mt-4 flex flex-col gap-3 md:flex-row">
            <button id="rsvpStepCopyMessage" type="button" class="rounded-lg bg-slate-600 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700">Copy message</button>
            <button id="rsvpStepOpenSlack" type="button" class="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Slack</button>
            <button id="rsvpStepOpenGmail" type="button" class="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Open Gmail</button>
          </div>
          ${pollUiState.rsvpShareStatus ? `<div class="mt-2 text-xs font-medium text-emerald-600">${escapeHtml(pollUiState.rsvpShareStatus)}</div>` : ""}

          <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="text-sm font-semibold text-slate-900">RSVP status</div>
            <div class="mt-2 space-y-1 text-sm text-slate-700">
              <div>✔ Attending: ${Number(rsvpResults?.yesCount || 0)}</div>
              <div>✖ Can’t make it: ${Number(rsvpResults?.noCount || 0)}</div>
              <div>⏳ Responses: ${Number(rsvpResults?.totalResponses || 0)}</div>
            </div>
            <div class="mt-3 border-t border-slate-200 pt-3">
              <div class="text-sm font-semibold text-slate-900">Attending so far</div>
              ${visibleAttendees.length ? `<div class="mt-2 flex flex-wrap gap-2">${visibleAttendees.map((name) => `<span class="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">${escapeHtml(name)}</span>`).join("")}</div>` : '<div class="mt-2 text-sm text-slate-500">No attendees yet</div>'}
              ${hasMoreAttendees ? `<button id="rsvpStepToggleAttendees" type="button" class="mt-2 text-xs font-medium text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-900">${expanded ? "Show less" : `+${attendingNames.length - previewLimit} more`}</button>` : ""}
            </div>
          </div>

          <div class="mt-5 flex flex-col gap-2 md:items-end">
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input id="rsvpStepSharedConfirmed" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" ${state.pollBuilder?.rsvpSharedConfirmed ? "checked" : ""}>
              <span>I shared the RSVP with my team</span>
            </label>
            <button id="rsvpStepContinue" type="button" ${state.pollBuilder?.rsvpSharedConfirmed ? "" : "disabled"} class="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Continue →</button>
          </div>
        </article>
      ` : ""}
    </div>
  `;
  }

  const eventDateTimeInput = document.getElementById("rsvpStepEventDateTime");
  if (eventDateTimeInput) {
    eventDateTimeInput.addEventListener("change", () => {
      state.pollBuilder.chosenDateTime = String(eventDateTimeInput.value || "").trim();
      persistState();
      renderRsvpStep();
    });
  }

  const bindDeadlineField = (id, key) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("change", () => {
      pollUiState[key] = String(input.value || "").trim();
      renderRsvpStep();
    });
  };
  bindDeadlineField("rsvpStepDeadlineDate", "rsvpDeadlineDate");
  bindDeadlineField("rsvpStepDeadlineHour", "rsvpDeadlineHour");
  bindDeadlineField("rsvpStepDeadlineMinute", "rsvpDeadlineMinute");
  bindDeadlineField("rsvpStepDeadlinePeriod", "rsvpDeadlinePeriod");

  const deadlineSubmitButton = document.getElementById("rsvpStepDeadlineSubmit");
  if (deadlineSubmitButton) {
    deadlineSubmitButton.onclick = () => {
      if (!activeDeadlineIso) {
        showMiniToast("Set a valid RSVP deadline first.");
        return;
      }
      state.pollBuilder.rsvpDeadlineDateTime = activeDeadlineIso;
      persistState();
      renderRsvpStep();
    };
  }

  const deadlineEditButton = document.getElementById("rsvpStepDeadlineEdit");
  if (deadlineEditButton) {
    deadlineEditButton.onclick = () => {
      state.pollBuilder.rsvpDeadlineDateTime = "";
      persistState();
      renderRsvpStep();
    };
  }

  const createLinkButton = document.getElementById("rsvpStepCreateLink");
  if (createLinkButton) {
    createLinkButton.onclick = async () => {
      const chosenDateTime = String(state.pollBuilder?.chosenDateTime || "").trim();
      if (!chosenDateTime) {
        showMiniToast("Add the event date and time first.");
        return;
      }
      if (!state.pollBuilder?.rsvpDeadlineDateTime) {
        showMiniToast("Submit the RSVP deadline first.");
        return;
      }
      if (pollUiState.rsvpCreateBusy) return;
      pollUiState.rsvpCreateBusy = true;
      pollUiState.rsvpCreateError = "";
      renderRsvpStep();

      const locationType = String(state.pollBuilder?.eventLocationType || "").trim().toLowerCase();
      const locationLabel = locationType === "virtual"
        ? "Virtual"
        : (locationType === "in_person" || locationType === "in-person" ? "In-person" : null);

      try {
        const created = await createRsvpInBackend({
          companyId: String(state.accountId || "anon").trim() || "anon",
          publicBaseUrl: "https://eeoswork.github.io/eeos",
          eventName,
          eventDate: formatPollDateTime(chosenDateTime) || chosenDateTime,
          eventTime: formatPollDateTime(chosenDateTime) || chosenDateTime,
          deadlineIso: String(state.pollBuilder?.rsvpDeadlineDateTime || "").trim(),
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
        showMiniToast(pollUiState.rsvpCreateError || "Couldn’t create RSVP.");
      } finally {
        pollUiState.rsvpCreateBusy = false;
        renderRsvpStep();
      }
    };
  }

  const copyLinkButton = document.getElementById("rsvpStepCopyLink");
  if (copyLinkButton) {
    copyLinkButton.onclick = async () => {
      if (!rsvpShareUrl) return;
      await writeClipboardMessage(rsvpShareUrl);
      pollUiState.rsvpShareStatus = "Copied RSVP link.";
      renderRsvpStep();
    };
  }

  const copyMessageButton = document.getElementById("rsvpStepCopyMessage");
  if (copyMessageButton) {
    copyMessageButton.onclick = async () => {
      await writeClipboardMessage(`${subject}\n\n${messageBody}`);
      pollUiState.rsvpShareStatus = "Copied RSVP message.";
      renderRsvpStep();
    };
  }

  const slackButton = document.getElementById("rsvpStepOpenSlack");
  if (slackButton) {
    slackButton.onclick = () => {
      window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
    };
  }

  if (isEnergyResetLaunch) {
    const activeEnergyResetState = normalizeEnergyResetLaunchState();
    const activeEnergyResetStep = ENERGY_RESET_LAUNCH_STEPS.find((step) => step.key === activeEnergyResetState.activeStepKey) || ENERGY_RESET_LAUNCH_STEPS[0];

    const energyResetCopyButton = panel.querySelector('[data-energy-reset-copy]');
    if (energyResetCopyButton) {
      energyResetCopyButton.onclick = async () => {
        await writeClipboardMessage(activeEnergyResetStep.plainMessage, { html: activeEnergyResetStep.htmlMessage });
        const originalLabel = "Copy message";
        energyResetCopyButton.textContent = "✓ Copied";
        if (energyResetCopyButton._copiedResetTimer) {
          clearTimeout(energyResetCopyButton._copiedResetTimer);
        }
        energyResetCopyButton._copiedResetTimer = setTimeout(() => {
          energyResetCopyButton.textContent = originalLabel;
          energyResetCopyButton._copiedResetTimer = null;
        }, 1200);
      };
    }


    const energyResetSlackButton = panel.querySelector('[data-energy-reset-open-slack]');
    if (energyResetSlackButton) {
      energyResetSlackButton.onclick = () => {
        window.open("https://app.slack.com/client/", "_blank", "noopener,noreferrer");
      };
    }

    const energyResetAdvanceCheckbox = panel.querySelector('[data-energy-reset-advance]');
    if (energyResetAdvanceCheckbox) {
      energyResetAdvanceCheckbox.onchange = () => {
        if (!energyResetAdvanceCheckbox.checked) return;

        const launchState = normalizeEnergyResetLaunchState();
        if (!launchState.completedStepKeys.includes(activeEnergyResetStep.key)) {
          launchState.completedStepKeys.push(activeEnergyResetStep.key);
        }

        const currentIndex = ENERGY_RESET_LAUNCH_STEPS.findIndex((step) => step.key === activeEnergyResetStep.key);
        const nextStep = ENERGY_RESET_LAUNCH_STEPS[currentIndex + 1] || null;
        if (nextStep) {
          launchState.activeStepKey = nextStep.key;
          persistState();
          renderRsvpStep();
          return;
        }

        state.pollBuilder.rsvpSent = true;
        ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.RSVP);
        const nowIso = new Date().toISOString();
        // Always overwrite on final step completion so a fresh run never inherits stale timestamps
        launchState.challengeStartedAt = nowIso;
        launchState.reviewUnlockAt = getEnergyResetReviewUnlockAt(nowIso) || nowIso;
        persistState();
        ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.PROMOTE);
        const nextWorkflowStep = workflowType === EVENT_WORKFLOW_TYPES.POLL ? EVENT_WORKFLOW_STEPS.BOOK : EVENT_WORKFLOW_STEPS.RUN;
        goToEventWorkflowStep(nextWorkflowStep);
      };
    }

    return;
  }

  const gmailButton = document.getElementById("rsvpStepOpenGmail");
  if (gmailButton) {
    gmailButton.onclick = () => {
      const subjectEncoded = encodeURIComponent(subject);
      const bodyEncoded = encodeURIComponent(messageBody);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subjectEncoded}&body=${bodyEncoded}`, "_blank", "noopener,noreferrer");
    };
  }

  const sharedConfirmedInput = document.getElementById("rsvpStepSharedConfirmed");
  if (sharedConfirmedInput) {
    sharedConfirmedInput.onchange = () => {
      state.pollBuilder.rsvpSharedConfirmed = Boolean(sharedConfirmedInput.checked);
      persistState();
      renderRsvpStep();
    };
  }

  const toggleAttendeesButton = document.getElementById("rsvpStepToggleAttendees");
  if (toggleAttendeesButton) {
    toggleAttendeesButton.onclick = () => {
      state.pollBuilder.rsvpAttendeesExpanded = !Boolean(state.pollBuilder?.rsvpAttendeesExpanded);
      persistState();
      renderRsvpStep();
    };
  }

  const continueButton = document.getElementById("rsvpStepContinue");
  if (continueButton) {
    continueButton.onclick = () => {
      if (!state.pollBuilder?.rsvpSharedConfirmed) {
        showMiniToast("Confirm you shared the RSVP first.");
        return;
      }
      ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.RSVP);
      state.pollBuilder.rsvpSent = true;
      const nextStep = workflowType === EVENT_WORKFLOW_TYPES.POLL ? EVENT_WORKFLOW_STEPS.BOOK : EVENT_WORKFLOW_STEPS.PROMOTE;
      goToEventWorkflowStep(nextStep);
    };
  }
}

function renderBookEventStep() {
  const panel = document.getElementById("bookEventPanel");
  if (!panel) return;

  if (isWorkflowStepSkipped(EVENT_WORKFLOW_STEPS.BOOK)) {
    panel.innerHTML = "";
    return;
  }

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

        if (!state.completedSetupSteps.includes(10)) {
          state.completedSetupSteps.push(10);
        }
        state.eventWorkflowProcessStep = Math.max(11, state.eventWorkflowProcessStep || 11);
        collapseSetupViewsForWorkflowStep();
        state.currentSetupStep = 11;
        scrollSetupStepIntoView(11, "smooth");

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
      if (!state.completedSetupSteps.includes(10)) {
        state.completedSetupSteps.push(10);
      }
      state.eventWorkflowProcessStep = Math.max(11, state.eventWorkflowProcessStep || 11);
      collapseSetupViewsForWorkflowStep();
      state.currentSetupStep = 11;
      persistState();
      renderSetupMenuState();
      renderSetupStepStates();
      renderSidebarStepMenus();
      scrollSetupStepIntoView(11, "smooth");
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
      const shouldShowClosedPlan = Boolean(effectiveView.countdownStatus.isClosed)
        && (
          Boolean(state.pollBuilder?.pollSharedConfirmed)
          || Boolean(pollUiState.rsvpSetupOpen)
          || Boolean(pollUiState.rsvpCollectionStarted)
          || Boolean(state.pollBuilder?.rsvpSent)
        );

      pollResultsPage.innerHTML = getPollResponsesPageHtml(resultsModel, {
        reminderPanelOpen: pollUiState.reminderPanelOpen,
        isPollClosed: shouldShowClosedPlan,
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
        pollClosed: shouldShowClosedPlan,
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
            await writeClipboardMessage(reminderMessage.bodyPlain);
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
            await writeClipboardMessage(reminderMessage.subject);
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
        openRsvpSetupButton.onclick = () => {
          const topTimeLabel = String(resultsModel?.topTime?.label || "").trim();
          const topTimeIndex = proposedTimeLabels.findIndex((label) => label === topTimeLabel);
          const selectedTopTimeRaw = topTimeIndex >= 0
            ? String(proposedDateTimes[topTimeIndex] || "").trim()
            : String(state.pollBuilder?.chosenDateTime || proposedDateTimes[0] || "").trim();
          state.pollBuilder.chosenEventLabel = String(resultsModel?.topEvent?.label || state.pollBuilder?.chosenEventLabel || topEventLabel || "").trim();
          if (selectedTopTimeRaw) {
            state.pollBuilder.chosenDateTime = selectedTopTimeRaw;
          }
          if (!pollUiState.rsvpDeadlineDate) {
            pollUiState.rsvpDeadlineDate = defaultRsvpFields.date;
            pollUiState.rsvpDeadlineHour = defaultRsvpFields.hour;
            pollUiState.rsvpDeadlineMinute = defaultRsvpFields.minute;
            pollUiState.rsvpDeadlinePeriod = defaultRsvpFields.period;
          }
          ensureCompletedSetupStep(EVENT_WORKFLOW_STEPS.POLL);
          pollUiState.rsvpDeadlineEditing = true;
          pollUiState.rsvpCollectionStarted = false;
          pollUiState.rsvpSetupOpen = false;
          state.pollBuilder.rsvpSent = false;
          state.pollBuilder.vendorLinkOpened = false;
          state.pollBuilder.markedBooked = false;
          pollUiState.rsvpShareStatus = "";
          pollUiState.rsvpResultsError = "";
          state.pollBuilder.showResultsPage = true;
          persistState();
          goToEventWorkflowStep(EVENT_WORKFLOW_STEPS.RSVP, { renderRsvp: true });
        };
      }

      const continueRsvpFlowButton = document.getElementById("pollRsvpContinueCollecting");
      if (continueRsvpFlowButton) {
        const continueToRsvpReview = async () => {
          if (!isRsvpDeadlineSubmitted) {
            showMiniToast("Submit the RSVP deadline first.");
            return;
          }
          if (!state.pollBuilder?.rsvpSharedConfirmed) {
            showMiniToast("Confirm you shared the RSVP first.");
            return;
          }

          // After RSVP is shared, always route to Poll Team -> Poll Live responses view.
          state.setupShortlistMode = "poll";
          state.pollBuilder.showResultsPage = true;
          state.eventWorkflowProcessStep = 8;
          state.currentSetupStep = 8;
          pollUiState.rsvpSetupOpen = false;
          pollUiState.rsvpCollectionStarted = false;
          persistState();
          renderSetupMenuState();
          renderSetupStepStates();
          renderSidebarStepMenus();
          scrollSetupStepIntoView(8, "smooth");
          renderPollBuilderStep();

          if (pollUiState.resultsSyncBusy) return;
          pollUiState.resultsSyncBusy = true;
          pollUiState.resultsSyncError = "";
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
              continueToRsvpReview().catch(() => {});
            });
            openAuthGateWithContext("rsvp_review");
            return;
          }
          continueToRsvpReview().catch(() => {});
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
            await writeClipboardMessage(`${rsvpMessageSubject}\n\n${rsvpMessageBodyPlain}`);
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
            await writeClipboardMessage(text);

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
        state.pollBuilder.showResultsPage = true;
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
  syncLandingDraftToProgramSettings();
  if (isRevelryBracketsMagicContext()) {
    state.eventsRecommended = getRevelryGoalBasedRecommendations(state.programSettings.goals);
  } else {
    state.eventsRecommended = generateRecommendations(state.programSettings);
  }

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
  
  // Populate event cards with recommended events
  const eventCards = document.querySelectorAll(".event-card");
  eventCards.forEach((card, index) => {
    const eventNumber = index + 1;
    const eventTitle = card.querySelector(".event-title");
    const eventWhy = card.querySelector(".event-why");
    const eventDescription = card.querySelector(".event-description");
    const eventFooter = card.querySelector(".event-footer");
    
    const recommendedEvent = state.eventsRecommended[index];
    
    if (eventTitle) {
      eventTitle.textContent = recommendedEvent ? recommendedEvent.name : `Event ${eventNumber}`;
    }
    if (eventWhy) {
      eventWhy.textContent = recommendedEvent ? (recommendedEvent.type === "free" ? "Free event option" : "Team bonding opportunity") : "";
    }
    if (eventDescription) {
      eventDescription.textContent = recommendedEvent ? recommendedEvent.description : "";
    }
    if (eventFooter && recommendedEvent) {
      const costText = recommendedEvent.cost_per_person === 0 
        ? "Free" 
        : `$${recommendedEvent.cost_per_person} per person`;
      const viewUrl = recommendedEvent.url || "#";
      eventFooter.innerHTML = `
        <span>${costText}</span>
        <a href="${viewUrl}" target="_blank" rel="noopener noreferrer">View Event</a>
      `;
    } else if (eventFooter) {
      eventFooter.innerHTML = "";
    }
  });
  
  // Clear the fade-away-vertical classes since we're showing real content
  document.querySelectorAll(".fade-away-vertical").forEach(el => {
    el.classList.remove("fade-away-vertical");
    el.style.removeProperty("--i");
    el.style.removeProperty("--total");
  });
  
  // Hide the poll button container (Program Reveal no longer uses this CTA)
  const buttonContainer = document.getElementById("eventsPollButtonContainer");
  if (buttonContainer) {
    buttonContainer.classList.add("hidden");
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








