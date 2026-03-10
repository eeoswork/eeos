const DEFAULT_POLL_UPSTREAM_BASE = "https://esos-polls.ajolly2.workers.dev/api";
const SESSION_TTL_DAYS = 30;
const APP_ORIGIN_BASE = "https://eeoswork.github.io/eeos";
const MAGIC_LINK_HOST = "revelrylabs.eeos.work";

function shouldProxyAsStaticAsset(pathname) {
  const path = String(pathname || "");
  if (!path || path === "/") return false;
  if (path.startsWith("/api/")) return false;
  if (path.startsWith("/assets/")) return true;
  if (path === "/app.js" || path === "/config.js" || path === "/index.html" || path === "/poll.html" || path === "/rsvp.html") {
    return true;
  }
  return /\.[a-zA-Z0-9]+$/.test(path);
}

async function serveMagicLinkHostRequest(request) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return errorResponse("METHOD_NOT_ALLOWED", "Only GET/HEAD are allowed for this route.", 405);
  }

  const targetPath = shouldProxyAsStaticAsset(url.pathname)
    ? `${url.pathname}${url.search || ""}`
    : "/index.html";
  const upstreamUrl = `${APP_ORIGIN_BASE}${targetPath}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: request.headers
  });
  return upstreamResponse;
}

function resolveCorsOrigin(request, env) {
  const configured = String(env.CORS_ALLOW_ORIGIN || "*").trim();
  if (!configured || configured === "*") return "*";

  const requestOrigin = String(request.headers.get("origin") || "").trim();
  const allowList = configured.split(",").map((item) => item.trim()).filter(Boolean);
  if (!allowList.length) return "*";
  if (!requestOrigin) return allowList[0];
  return allowList.includes(requestOrigin) ? requestOrigin : allowList[0];
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  const origin = resolveCorsOrigin(request, env);
  headers.set("access-control-allow-origin", origin);
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "authorization,content-type,idempotency-key");
  headers.set("access-control-max-age", "86400");
  if (origin !== "*") {
    headers.set("vary", "origin");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function preflightResponse(request, env) {
  return withCors(new Response(null, { status: 204 }), request, env);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function errorResponse(code, message, status = 400) {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
}

async function readJson(request) {
  try {
    const payload = await request.json();
    return payload && typeof payload === "object" ? payload : {};
  } catch (_error) {
    return {};
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString();
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input) {
  const encoded = new TextEncoder().encode(String(input || ""));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password) {
  const salt = randomToken(16);
  const digest = await sha256Hex(`${salt}:${String(password || "")}`);
  return `${salt}:${digest}`;
}

async function verifyPassword(password, storedHash) {
  const token = String(storedHash || "");
  const [salt, digest] = token.split(":");
  if (!salt || !digest) return false;
  const nextDigest = await sha256Hex(`${salt}:${String(password || "")}`);
  return nextDigest === digest;
}

async function getSessionFromRequest(request, env) {
  const auth = String(request.headers.get("authorization") || "");
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match ? String(match[1] || "").trim() : "";
  if (!token) return null;

  const row = await env.DB.prepare(
    "SELECT token, company_id, email, expires_at FROM sessions WHERE token = ?1 LIMIT 1"
  ).bind(token).first();

  if (!row) return null;
  if (String(row.expires_at || "") <= nowIso()) return null;
  return row;
}

function parseJsonField(raw, fallback) {
  try {
    const parsed = JSON.parse(String(raw || ""));
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (_error) {
    return fallback;
  }
}

function toJsonString(value, fallback = {}) {
  try {
    return JSON.stringify(value ?? fallback);
  } catch (_error) {
    return JSON.stringify(fallback);
  }
}

function getBudgetTotal(settings = {}) {
  const mode = String(settings.budgetMode || "total");
  const totalBudget = Number(settings.totalBudget || 0);
  const perEmployeeBudget = Number(settings.perEmployeeBudget || 0);
  const employeeCount = Number(settings.employeeCount || 0);
  if (mode === "perEmployee") {
    return Math.max(0, perEmployeeBudget * Math.max(0, employeeCount));
  }
  return Math.max(0, totalBudget);
}

function surveySignal(settings = {}) {
  const answers = Object.values(settings.surveyAnswers || {});
  if (!answers.length) return 0.5;
  const numeric = answers.map((a) => (a === "High" ? 1 : a === "Medium" ? 0.6 : 0.3));
  return numeric.reduce((sum, n) => sum + n, 0) / numeric.length;
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
  return keywords.some((keyword) => haystack.includes(keyword));
}

function getAdminPreferenceBoostMultiplier(event, settings = {}, hasFirstCycle = true) {
  const selected = Array.isArray(settings.teamPreferenceEstimate) ? settings.teamPreferenceEstimate : [];
  if (!selected.length) return 1;

  const adminWeight = settings.admin_preference_weight || { boost: 0.22, first_cycle_only: true };
  const normalizedBoost = Math.max(0, Math.min(0.25, Number(adminWeight.boost || 0.22)));
  const firstCycleOnly = adminWeight.first_cycle_only !== false;
  if (firstCycleOnly && !hasFirstCycle) return 1;

  const hasMatch = selected.some((interest) => eventMatchesInterest(event, interest));
  return hasMatch ? 1 + normalizedBoost : 1;
}

function scoreEvent(event, settings = {}, hasFirstCycle = true) {
  const goals = Array.isArray(settings.goals) ? settings.goals : [];
  const schedules = Array.isArray(settings.preferredSchedule) ? settings.preferredSchedule : [];

  const goalsMatch = goals.filter((goal) => (event.goals || []).includes(goal)).length;
  const goalWeight = goalsMatch / 3;

  const budgetTotal = getBudgetTotal(settings);
  const employeeCount = Number(settings.employeeCount || 0);
  const budgetLimit = employeeCount > 0 ? budgetTotal / employeeCount : budgetTotal;
  const costPerPerson = Number(event.cost_per_person || 0);
  const budgetFitWeight = costPerPerson <= budgetLimit
    ? 1
    : Math.max(0, 1 - ((costPerPerson - budgetLimit) / Math.max(budgetLimit, 1)));

  const scheduleMatches = schedules.filter((slot) => (event.schedules || []).includes(slot)).length;
  const scheduleWeight = schedules.length ? scheduleMatches / schedules.length : 0.5;

  const surveyWeight = surveySignal(settings);
  const baseScore = goalWeight * 0.35 + budgetFitWeight * 0.25 + scheduleWeight * 0.2 + surveyWeight * 0.2;
  const boostMultiplier = getAdminPreferenceBoostMultiplier(event, settings, hasFirstCycle);
  return Number(Math.min(1, baseScore * boostMultiplier).toFixed(4));
}

function generateRecommendations(settings = {}, sourceCatalog = [], hasFirstCycle = true) {
  const scored = sourceCatalog.map((event) => ({
    ...event,
    score: scoreEvent(event, settings, hasFirstCycle)
  }));

  const freeEvents = scored.filter((event) => event.type === "free").sort((a, b) => b.score - a.score);
  const paidEvents = scored.filter((event) => event.type !== "free").sort((a, b) => b.score - a.score);

  const picked = [];
  if (freeEvents.length) picked.push(freeEvents[0]);

  for (const event of paidEvents) {
    if (picked.length >= 5) break;
    if (!picked.find((p) => p.id === event.id)) picked.push(event);
  }

  for (const event of freeEvents.slice(1)) {
    if (picked.length >= 5) break;
    if (!picked.find((p) => p.id === event.id)) picked.push(event);
  }

  return picked.slice(0, 5).map((event, index) => ({
    ...event,
    rank: index + 1
  }));
}

function mergeDraftState(existingState = {}, draft = {}, mergeMode = "if-empty-or-newer") {
  const base = existingState && typeof existingState === "object" ? structuredClone(existingState) : {};
  const nextLandingDraft = draft?.landingDraft && typeof draft.landingDraft === "object" ? draft.landingDraft : null;
  const nextProgramSettings = draft?.programSettings && typeof draft.programSettings === "object" ? draft.programSettings : null;

  if (!base.landingDraft || mergeMode !== "if-empty-or-newer") {
    if (nextLandingDraft) base.landingDraft = { ...(base.landingDraft || {}), ...nextLandingDraft };
  } else if (nextLandingDraft) {
    base.landingDraft = { ...base.landingDraft, ...Object.fromEntries(
      Object.entries(nextLandingDraft).filter(([key, value]) => {
        const current = base.landingDraft[key];
        if (current === undefined || current === null || current === "") return true;
        if (Array.isArray(current) && current.length === 0) return true;
        if (typeof current === "object" && current && Object.keys(current).length === 0) return true;
        return false;
      })
    ) };
  }

  if (!base.programSettings || mergeMode !== "if-empty-or-newer") {
    if (nextProgramSettings) base.programSettings = { ...(base.programSettings || {}), ...nextProgramSettings };
  } else if (nextProgramSettings) {
    base.programSettings = { ...base.programSettings, ...Object.fromEntries(
      Object.entries(nextProgramSettings).filter(([key, value]) => {
        const current = base.programSettings[key];
        if (current === undefined || current === null || current === "") return true;
        if (Array.isArray(current) && current.length === 0) return true;
        if (typeof current === "object" && current && Object.keys(current).length === 0) return true;
        return false;
      })
    ) };
  }

  if (Array.isArray(draft?.completedSetupSteps)) {
    base.completedSetupSteps = Array.from(new Set(draft.completedSetupSteps.map((step) => Number(step || 0)).filter(Boolean)));
  }
  if (typeof draft?.setupCompleted === "boolean") {
    base.setupCompleted = draft.setupCompleted;
  }

  return base;
}

async function proxyToPollApi(request, env, pathAndQuery) {
  const upstreamBase = String(env.POLL_UPSTREAM_BASE || DEFAULT_POLL_UPSTREAM_BASE).replace(/\/+$/, "");
  const targetUrl = `${upstreamBase}${pathAndQuery}`;
  const method = request.method.toUpperCase();
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(targetUrl, init);
}

async function findValidMagicLink(env, host, tokenId) {
  const normalizedHost = String(host || "").trim().toLowerCase();
  const normalizedToken = String(tokenId || "").trim();
  if (!normalizedHost || !normalizedToken) return null;

  const row = await env.DB.prepare(
    `SELECT host, token_id, company_id, company_name_default, admin_name_default, active, expires_at
     FROM magic_links
     WHERE host = ?1 AND token_id = ?2
     LIMIT 1`
  ).bind(normalizedHost, normalizedToken).first();
  if (!row) return null;
  if (Number(row.active || 0) !== 1) return null;
  const expiresAt = String(row.expires_at || "").trim();
  if (expiresAt && expiresAt <= nowIso()) return null;
  return row;
}

async function handleSignup(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const companyName = String(body.companyName || "").trim();
  if (!email || !password || !companyName) {
    return errorResponse("INVALID_SIGNUP_INPUT", "Email, password, and companyName are required.", 422);
  }

  const magicLink = body.magicLink && typeof body.magicLink === "object" ? body.magicLink : null;
  const magicHost = String(magicLink?.host || "").trim().toLowerCase();
  const magicTokenId = String(magicLink?.tokenId || "").trim();
  const magicRow = (magicHost && magicTokenId)
    ? await findValidMagicLink(env, magicHost, magicTokenId)
    : null;

  if (magicHost && magicTokenId && !magicRow) {
    return errorResponse("MAGIC_LINK_INVALID", "Magic link is invalid or expired.", 410);
  }

  const existingByEmail = await env.DB.prepare("SELECT company_id FROM accounts WHERE email = ?1 LIMIT 1").bind(email).first();
  if (existingByEmail?.company_id && (!magicRow || existingByEmail.company_id !== magicRow.company_id)) {
    return errorResponse("EMAIL_ALREADY_EXISTS", "An account already exists for this email.", 409);
  }

  const companyId = magicRow?.company_id ? String(magicRow.company_id) : crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const timestamp = nowIso();

  const existingByCompany = await env.DB.prepare(
    "SELECT company_id, email, password_hash FROM accounts WHERE company_id = ?1 LIMIT 1"
  ).bind(companyId).first();

  if (!existingByCompany) {
    await env.DB.prepare(
      `INSERT INTO accounts (company_id, email, password_hash, company_name, admin_name, state_blob, state_version, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, '', ?5, 1, ?6, ?6)`
    ).bind(companyId, email, passwordHash, companyName, toJsonString({ companyName, adminName: "" }, {}), timestamp).run();
  } else {
    const currentEmail = String(existingByCompany.email || "").trim().toLowerCase();
    const isSeedPlaceholder = String(existingByCompany.password_hash || "").startsWith("seed:");
    const isSameEmail = currentEmail === email;
    if (!isSameEmail && !isSeedPlaceholder) {
      return errorResponse("COMPANY_ALREADY_CLAIMED", "This company link has already been claimed.", 409);
    }

    await env.DB.prepare(
      `UPDATE accounts
       SET email = ?1,
           password_hash = ?2,
           company_name = COALESCE(NULLIF(?3, ''), company_name),
           updated_at = ?4
       WHERE company_id = ?5`
    ).bind(email, passwordHash, companyName, timestamp, companyId).run();
  }

  const token = randomToken(24);
  const expiresAt = addDaysIso(SESSION_TTL_DAYS);
  await env.DB.prepare(
    "INSERT INTO sessions (token, company_id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)"
  ).bind(token, companyId, email, timestamp, expiresAt).run();

  return jsonResponse({ token, companyId });
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  if (!email || !password) {
    return errorResponse("INVALID_LOGIN_INPUT", "Email and password are required.", 422);
  }

  const account = await env.DB.prepare(
    "SELECT company_id, email, password_hash FROM accounts WHERE email = ?1 LIMIT 1"
  ).bind(email).first();

  if (!account) {
    return errorResponse("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const isValid = await verifyPassword(password, account.password_hash);
  if (!isValid) {
    return errorResponse("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const token = randomToken(24);
  const timestamp = nowIso();
  const expiresAt = addDaysIso(SESSION_TTL_DAYS);
  await env.DB.prepare(
    "INSERT INTO sessions (token, company_id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)"
  ).bind(token, account.company_id, email, timestamp, expiresAt).run();

  return jsonResponse({ token, companyId: account.company_id });
}

async function handleStateGet(request, env) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  const account = await env.DB.prepare(
    "SELECT company_id, state_blob FROM accounts WHERE company_id = ?1 LIMIT 1"
  ).bind(session.company_id).first();

  if (!account) {
    return errorResponse("ACCOUNT_NOT_FOUND", "Account not found.", 404);
  }

  const stateBlob = parseJsonField(account.state_blob, {});
  return jsonResponse({ companyId: session.company_id, stateBlob });
}

async function handleStatePost(request, env) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await readJson(request);
  const stateBlob = body.stateBlob && typeof body.stateBlob === "object" ? body.stateBlob : null;
  if (!stateBlob) {
    return errorResponse("INVALID_STATE", "stateBlob object is required.", 422);
  }

  const timestamp = nowIso();
  await env.DB.prepare(
    "UPDATE accounts SET state_blob = ?1, state_version = COALESCE(state_version, 0) + 1, updated_at = ?2 WHERE company_id = ?3"
  ).bind(toJsonString(stateBlob, {}), timestamp, session.company_id).run();

  return jsonResponse({ companyId: session.company_id, saved: true });
}

async function handleMagicLinkResolve(request, env) {
  const body = await readJson(request);
  const host = String(body.host || "").trim().toLowerCase();
  const tokenId = String(body.tokenId || "").trim();
  if (!host || !/^[A-Za-z0-9._-]+$/.test(host) || !/^[A-Za-z0-9_-]{8,128}$/.test(tokenId)) {
    return errorResponse("INVALID_HOST_OR_TOKEN", "Invalid host or token format.", 400);
  }

  const row = await findValidMagicLink(env, host, tokenId);

  if (!row) {
    return errorResponse("MAGIC_LINK_NOT_FOUND", "Magic link not found.", 404);
  }

  const expiresAt = String(row.expires_at || "").trim();

  const companySlug = host.split(".")[0] || "company";
  return jsonResponse({
    workspace: {
      companySlug,
      companyId: row.company_id,
      companyNameDefault: String(row.company_name_default || "").trim(),
      adminNameDefault: String(row.admin_name_default || "").trim(),
      landingMode: "magic"
    },
    token: {
      tokenId,
      active: true,
      expiresAt: expiresAt || null
    },
    policy: {
      allowIdentityEdit: true,
      requireSignupForSave: true
    }
  });
}

async function handleOnboardingMigrateDraft(request, env) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await readJson(request);
  const companyId = String(body.companyId || "").trim();
  if (!companyId || companyId !== session.company_id) {
    return errorResponse("FORBIDDEN_COMPANY", "companyId does not match authenticated session.", 403);
  }

  const draft = body.draft && typeof body.draft === "object" ? body.draft : null;
  if (!draft) {
    return errorResponse("INVALID_DRAFT_PAYLOAD", "draft object is required.", 422);
  }

  const identity = body.identity && typeof body.identity === "object" ? body.identity : {};
  const mergeMode = String(body.mergeMode || "if-empty-or-newer");

  const account = await env.DB.prepare(
    "SELECT company_id, company_name, admin_name, state_blob, state_version FROM accounts WHERE company_id = ?1 LIMIT 1"
  ).bind(companyId).first();

  if (!account) {
    return errorResponse("ACCOUNT_NOT_FOUND", "Account not found.", 404);
  }

  const existingState = parseJsonField(account.state_blob, {});
  const mergedState = mergeDraftState(existingState, draft, mergeMode);

  if (identity.companyName) mergedState.companyName = String(identity.companyName).trim();
  if (identity.adminName) mergedState.adminName = String(identity.adminName).trim();

  const timestamp = nowIso();
  await env.DB.prepare(
    `UPDATE accounts
     SET company_name = COALESCE(NULLIF(?1, ''), company_name),
         admin_name = COALESCE(NULLIF(?2, ''), admin_name),
         state_blob = ?3,
         state_version = COALESCE(state_version, 0) + 1,
         updated_at = ?4
     WHERE company_id = ?5`
  ).bind(
    String(identity.companyName || "").trim(),
    String(identity.adminName || "").trim(),
    toJsonString(mergedState, {}),
    timestamp,
    companyId
  ).run();

  const nextVersion = Number(account.state_version || 0) + 1;
  return jsonResponse({
    companyId,
    migration: {
      applied: true,
      mergeMode,
      conflicts: []
    },
    stateVersion: nextVersion,
    stateBlob: mergedState
  });
}

async function handleRecommendationsGenerate(request, env) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  const body = await readJson(request);
  const companyId = String(body.companyId || "").trim();
  if (!companyId || companyId !== session.company_id) {
    return errorResponse("FORBIDDEN_COMPANY", "companyId does not match authenticated session.", 403);
  }

  const account = await env.DB.prepare(
    "SELECT state_blob, state_version FROM accounts WHERE company_id = ?1 LIMIT 1"
  ).bind(companyId).first();

  if (!account) {
    return errorResponse("ACCOUNT_NOT_FOUND", "Account not found.", 404);
  }

  const stateBlob = parseJsonField(account.state_blob, {});
  const overrideSettings = body?.inputOverride?.programSettings;
  const settings = (overrideSettings && typeof overrideSettings === "object")
    ? overrideSettings
    : (stateBlob.programSettings && typeof stateBlob.programSettings === "object" ? stateBlob.programSettings : {});

  if (!settings || typeof settings !== "object") {
    return errorResponse("INVALID_PROGRAM_SETTINGS", "Program settings are required.", 422);
  }

  const rows = await env.DB.prepare(
    `SELECT event_id, name, description, url, cost_per_person, goals_json, schedules_json, type
     FROM events_master
     WHERE active = 1`
  ).all();
  const resultRows = Array.isArray(rows?.results) ? rows.results : [];
  if (!resultRows.length) {
    return errorResponse("EVENT_CATALOG_EMPTY", "No active events found.", 404);
  }

  const catalog = resultRows.map((row) => ({
    id: row.event_id,
    name: row.name,
    description: row.description || "",
    url: row.url || "",
    cost_per_person: Number(row.cost_per_person || 0),
    goals: parseJsonField(row.goals_json, []),
    schedules: parseJsonField(row.schedules_json, []),
    type: String(row.type || "paid")
  }));

  const cycleId = String(body?.context?.cycleId || "current-cycle").trim() || "current-cycle";
  const hasFirstCycle = true;
  const recommendations = generateRecommendations(settings, catalog, hasFirstCycle);

  await env.DB.prepare(
    "DELETE FROM events_recommended WHERE company_id = ?1 AND cycle_id = ?2"
  ).bind(companyId, cycleId).run();

  const timestamp = nowIso();
  for (const item of recommendations) {
    await env.DB.prepare(
      `INSERT INTO events_recommended
       (company_id, cycle_id, event_id, rank, score, generated_at, algorithm_version)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'v1')`
    ).bind(companyId, cycleId, item.id, Number(item.rank || 0), Number(item.score || 0), timestamp).run();
  }

  stateBlob.eventsRecommended = recommendations;
  stateBlob.setupEventsGenerated = true;
  await env.DB.prepare(
    "UPDATE accounts SET state_blob = ?1, state_version = COALESCE(state_version, 0) + 1, updated_at = ?2 WHERE company_id = ?3"
  ).bind(toJsonString(stateBlob, {}), timestamp, companyId).run();

  return jsonResponse({
    companyId,
    recommendations,
    meta: {
      generatedAt: timestamp,
      algorithmVersion: "v1",
      eventCountConsidered: catalog.length
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = String(url.hostname || "").toLowerCase();

    if (!url.pathname.startsWith("/api")) {
      if (host === MAGIC_LINK_HOST) {
        return withCors(await serveMagicLinkHostRequest(request), request, env);
      }
      return fetch(request);
    }

    if (request.method.toUpperCase() === "OPTIONS") {
      return preflightResponse(request, env);
    }

    const path = url.pathname.replace(/^\/api/, "") || "/";
    const method = request.method.toUpperCase();

    try {
      if (method === "GET" && path === "/health") {
        return withCors(jsonResponse({ status: "ok", ts: nowIso() }), request, env);
      }
      if (method === "POST" && path === "/auth/signup") return withCors(await handleSignup(request, env), request, env);
      if (method === "POST" && path === "/auth/login") return withCors(await handleLogin(request, env), request, env);
      if (method === "GET" && path === "/state") return withCors(await handleStateGet(request, env), request, env);
      if (method === "POST" && path === "/state") return withCors(await handleStatePost(request, env), request, env);
      if (method === "POST" && path === "/magic-links/resolve") return withCors(await handleMagicLinkResolve(request, env), request, env);
      if (method === "POST" && path === "/onboarding/migrate-draft") return withCors(await handleOnboardingMigrateDraft(request, env), request, env);
      if (method === "POST" && path === "/recommendations/generate") return withCors(await handleRecommendationsGenerate(request, env), request, env);

      const pathAndQuery = `${path}${url.search || ""}`;
      return withCors(await proxyToPollApi(request, env, pathAndQuery), request, env);
    } catch (error) {
      return withCors(
        errorResponse("INTERNAL_ERROR", String(error?.message || "Unexpected server error."), 500),
        request,
        env
      );
    }
  }
};
