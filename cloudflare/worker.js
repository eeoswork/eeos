const DEFAULT_POLL_UPSTREAM_BASE = "https://esos-polls.ajolly2.workers.dev/api";
const SESSION_TTL_DAYS = 30;
const MAGIC_LOGIN_TTL_HOURS = 48;
const APP_ORIGIN_BASE = "https://eeoswork.github.io/eeos";
const DEFAULT_MAGIC_LOGIN_ORIGIN = "https://eeos.work";
const HOME_PAGE_HOSTS = new Set([
  "eeos.work",
  "revelrylabs.eeos.work"
]);
const TODO_PAGE_HOSTS = new Set([
  "todo.eeos.work"
]);
const OPS_PAGE_HOSTS = new Set([
  "ops.eeos.work"
]);
const BRANDON_HOSTS = new Set([
  "brandon.eeos.work"
]);
const MAGIC_LINK_HOSTS = new Set([
  "avery.eeos.work",
  "neel.eeos.work",
  "susco.eeos.work",
  "testing.eeos.work"
]);
const MAGIC_LINK_COMPANY_ID_OVERRIDES = {
  "avery.eeos.work/avery20264fc4bc68e1": "avery_generic_test",
  "neel.eeos.work/susco19ae29ffe3": "susco_neel"
};

function shouldProxyAsStaticAsset(pathname) {
  const path = String(pathname || "");
  if (!path || path === "/") return false;
  if (path.startsWith("/api/")) return false;
  if (path.startsWith("/assets/")) return true;
  if (path === "/app.js" || path === "/config.js" || path === "/index.html" || path === "/landing.html" || path === "/todo.html" || path === "/poll.html" || path === "/rsvp.html" || path === "/onboarding-dashboard.html" || path === "/event-locked.html") {
    return true;
  }
  return /\.[a-zA-Z0-9]+$/.test(path);
}

async function serveStaticHostRequest(request, fallbackPath) {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return errorResponse("METHOD_NOT_ALLOWED", "Only GET/HEAD are allowed for this route.", 405);
  }

  const normalizedPath = String(url.pathname || "/").replace(/\/+$/, "") || "/";
  const rewrittenPath = normalizedPath === "/about" ? "/about.html" : url.pathname;

  const targetPath = shouldProxyAsStaticAsset(rewrittenPath)
    ? `${rewrittenPath}${url.search || ""}`
    : fallbackPath;
  const upstreamUrl = `${APP_ORIGIN_BASE}${targetPath}`;
  return fetch(upstreamUrl, {
    method,
    headers: request.headers
  });
}

async function serveMagicLinkHostRequest(request) {
  const url = new URL(request.url);
  const path = String(url.pathname || "").replace(/\/+$/, "");
  if (path === "/rlabs2026a1b2c3d4") {
    const target = new URL("/revelry-live.html", url.origin);
    return Response.redirect(target.toString(), 302);
  }
  return serveStaticHostRequest(request, "/index.html");
}

async function serveHomePageHostRequest(request) {
  const url = new URL(request.url);
  const host = String(url.hostname || "").toLowerCase();
  const fallbackPath = host === "revelrylabs.eeos.work"
    ? "/index.html"
    : "/index.html";
  return serveStaticHostRequest(request, fallbackPath);
}

async function serveTodoPageHostRequest(request) {
  return serveStaticHostRequest(request, "/todo.html");
}

async function serveOpsPageHostRequest(request) {
  return serveStaticHostRequest(request, "/ops.html");
}

async function serveBrandonHostRequest(request) {
  return serveStaticHostRequest(request, "/brandon.html");
}

async function handleBrandonArticles(request, env) {
  const GOOGLE_RSS = "https://news.google.com/rss/search?q=los+angeles+real+estate&hl=en-US&gl=US&ceid=US:en";
  const PROXY_URL = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(GOOGLE_RSS);
  const rssRes = await fetch(PROXY_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; brandon-content-assistant/1.0)" }
  });
  if (!rssRes.ok) {
    return errorResponse("RSS_FETCH_FAILED", "Could not load news feed.", 502);
  }
  const data = await rssRes.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    return errorResponse("RSS_PARSE_FAILED", "Could not parse news feed.", 502);
  }

  const raw = data.items.slice(0, 15);
  const items = raw.map(item => {
    const cleanTitle = (item.title || "").replace(/<[^>]*>/g, "").trim();
    // Extract publisher name from title (format: "Headline - Publisher")
    const dashIdx = cleanTitle.lastIndexOf(" - ");
    const title = dashIdx !== -1 ? cleanTitle.slice(0, dashIdx).trim() : cleanTitle;
    const source = dashIdx !== -1 ? cleanTitle.slice(dashIdx + 3).trim() : "Google News";
    const googleUrl = (item.link || "").trim();
    const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
    const snippet = (item.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 200);
    if (!title || !googleUrl) return null;
    return { title, source, publishedAt, snippet, googleUrl };
  }).filter(Boolean);

  // Resolve Google News redirect URLs to actual article URLs in parallel
  const resolved = await Promise.all(items.map(async (item) => {
    let finalUrl = item.googleUrl;
    try {
      const res = await fetch(item.googleUrl, {
        method: "HEAD",
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (compatible; brandon-content-assistant/1.0)" }
      });
      if (res.url && res.url !== item.googleUrl) finalUrl = res.url;
    } catch (_) {
      // keep original if redirect fails
    }
    const id = await sha256Hex(item.googleUrl);
    return {
      id: id.slice(0, 16),
      title: item.title,
      source: item.source,
      publishedAt: item.publishedAt,
      snippet: item.snippet,
      url: finalUrl
    };
  }));

  return jsonResponse(resolved);
}

async function handleBrandonGenerate(request, env) {
  const openaiKey = String(env.OPENAI_API_KEY || "").trim();
  if (!openaiKey) {
    return errorResponse("OPENAI_NOT_CONFIGURED", "OpenAI API key is not configured.", 503);
  }

  const body = await readJson(request);
  const article = body.article && typeof body.article === "object" ? body.article : null;
  if (!article || !article.title || !article.url) {
    return errorResponse("INVALID_ARTICLE", "Article with title and url is required.", 422);
  }

  const prompt = `Create a clear, useful Facebook post based on the article information below.\n\nImportant rules:\n- Do not pretend you read the full article if only headline/snippet/link are provided.\n- Do not exaggerate or make unsupported claims.\n- Do not give legal, tax, or financial advice.\n- Do not sound like an AI.\n- Keep the tone conversational, helpful, professional, and local.\n- Write for homeowners, buyers, sellers, and real estate followers in the Los Angeles area.\n- Include a short line encouraging people to reach out with local real estate questions.\n- Include 3-6 relevant hashtags.\n- Keep the caption suitable for Facebook.\n\nReturn valid JSON only:\n{\n  "hook": "...",\n  "summary": "...",\n  "caption": "...",\n  "hashtags": ["...", "..."]\n}\n\nArticle title: ${String(article.title || "")}\nSource: ${String(article.source || "")}\nSnippet: ${String(article.snippet || "")}\nURL: ${String(article.url || "")}`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are helping a California real estate agent create educational Facebook content based on real estate news. Return valid JSON only."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!aiRes.ok) {
    if (aiRes.status === 401) {
      return errorResponse("OPENAI_AUTH_FAILED", "OpenAI authentication failed. Check the OPENAI_API_KEY secret.", 502);
    }
    return errorResponse("OPENAI_ERROR", `OpenAI returned ${aiRes.status}.`, 502);
  }

  const aiData = await aiRes.json();
  const raw = String(aiData?.choices?.[0]?.message?.content || "");
  let draft;
  try {
    draft = JSON.parse(raw);
  } catch (_) {
    return errorResponse("PARSE_ERROR", "Failed to parse AI response.", 502);
  }

  return jsonResponse({
    hook: String(draft.hook || ""),
    summary: String(draft.summary || ""),
    caption: String(draft.caption || ""),
    hashtags: Array.isArray(draft.hashtags) ? draft.hashtags.map(String) : []
  });
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
  headers.set("access-control-allow-headers", "authorization,content-type,idempotency-key,x-dashboard-key");
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

function parsePositiveInt(value, fallback, { min = 1, max = 100 } = {}) {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function parseJsonValue(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "object") return raw;
  const asString = String(raw || "").trim();
  if (!asString) return fallback;
  try {
    const parsed = JSON.parse(asString);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (_error) {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString();
}

function addHoursIso(hours) {
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + Number(hours || 0));
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

function deepMergeState(baseValue, incomingValue) {
  if (Array.isArray(incomingValue)) return [...incomingValue];
  if (incomingValue === null || typeof incomingValue !== "object") return incomingValue;

  const base = (baseValue && typeof baseValue === "object" && !Array.isArray(baseValue))
    ? baseValue
    : {};
  const merged = { ...base };

  for (const [key, value] of Object.entries(incomingValue)) {
    merged[key] = deepMergeState(base[key], value);
  }
  return merged;
}

function fallbackProgramEventName(item = {}, index = 0) {
  const direct = String(item?.eventName || item?.title || item?.name || "").trim();
  if (direct) return direct;

  const generated = Array.isArray(item?.generatedEvents) ? item.generatedEvents : [];
  const fromGenerated = String(generated[0]?.name || generated[0]?.title || "").trim();
  if (fromGenerated) return fromGenerated;

  const templateId = String(item?.templateId || item?.id || "").trim();
  if (templateId) {
    return templateId
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return `Week ${index + 1} event`;
}

function buildProgramWeekSummaryFromStateBlob(stateBlob = {}) {
  if (!stateBlob || typeof stateBlob !== "object") return [];
  const program = stateBlob.fourMonthProgram;
  if (!program || typeof program !== "object") return [];

  const fromWeeks = Array.isArray(program.weeks)
    ? program.weeks
      .map((item, index) => ({
        week: Number(item?.week || index + 1),
        id: String(item?.templateId || item?.id || "").trim(),
        eventName: fallbackProgramEventName(item, index)
      }))
      .filter((item) => item.week > 0)
    : [];
  if (fromWeeks.length) return fromWeeks;

  const fromEvents = Array.isArray(program.events)
    ? program.events
      .map((item, index) => ({
        week: Number(index + 1),
        id: String(item?.templateId || item?.id || "").trim(),
        eventName: fallbackProgramEventName(item, index)
      }))
      .filter((item) => item.week > 0)
    : [];

  return fromEvents;
}

function ensureSavedProgramWeeks(stateBlob = {}) {
  if (!stateBlob || typeof stateBlob !== "object") return stateBlob;

  const derivedWeeks = buildProgramWeekSummaryFromStateBlob(stateBlob);
  if (!derivedWeeks.length) return stateBlob;

  return {
    ...stateBlob,
    savedProgramWeeks: derivedWeeks
  };
}

const EVENT_WORKFLOW_STAGE_LABELS = {
  launch: "Launch Event",
  run: "Run Event",
  feedback: "Collect Feedback",
  review: "Review Impact"
};

function getWorkflowStageLabelFromStep(stepNum) {
  const step = Number(stepNum || 0);
  if (step >= 14) return EVENT_WORKFLOW_STAGE_LABELS.review;
  if (step === 13) return EVENT_WORKFLOW_STAGE_LABELS.feedback;
  if (step === 12) return EVENT_WORKFLOW_STAGE_LABELS.run;
  if (step >= 7 && step <= 11) return EVENT_WORKFLOW_STAGE_LABELS.launch;
  return "";
}

function normalizeProgramWeeksForDashboard(row = {}) {
  const savedProgramWeeks = parseJsonValue(row.saved_program_weeks, []);
  const fallbackProgramWeeks = (() => {
    const weeks = parseJsonValue(row.four_month_program_weeks, []);
    if (Array.isArray(weeks) && weeks.length) return weeks;
    const events = parseJsonValue(row.four_month_program_events, []);
    return Array.isArray(events) ? events : [];
  })();
  const programWeeks = Array.isArray(savedProgramWeeks) && savedProgramWeeks.length
    ? savedProgramWeeks
    : fallbackProgramWeeks;

  return Array.isArray(programWeeks)
    ? programWeeks
      .map((item, index) => ({
        week: Number(item?.week || index + 1),
        id: String(item?.id || item?.eventId || item?.templateId || "").trim(),
        eventName: fallbackProgramEventName(item, index)
      }))
      .filter((item) => item.week > 0)
    : [];
}

function normalizeBookedEventsForDashboard(row = {}) {
  const bookedEventsRaw = parseJsonValue(row.events_booked, []);
  if (!Array.isArray(bookedEventsRaw) || !bookedEventsRaw.length) return [];

  return bookedEventsRaw
    .map((item, index) => ({
      index,
      bookedId: String(item?.id || "").trim(),
      eventId: String(item?.event_master_id || item?.eventId || item?.templateId || "").trim(),
      eventName: String(item?.name || item?.title || "").trim(),
      status: String(item?.status || "").trim().toLowerCase(),
      bookedAt: String(item?.bookedAt || item?.createdAt || "").trim(),
      runEventCompletedAt: String(
        item?.runEventCompletedAt
        || item?.runEvent?.runEventCompletedAt
        || ""
      ).trim(),
      feedbackClosedAt: String(
        item?.feedbackClosedAt
        || item?.feedback?.feedbackClosedAt
        || ""
      ).trim()
    }))
    .sort((a, b) => {
      const timeA = Date.parse(a.bookedAt || "") || 0;
      const timeB = Date.parse(b.bookedAt || "") || 0;
      return timeA - timeB;
    });
}

function buildDashboardProgressFromRow(row = {}) {
  const program = normalizeProgramWeeksForDashboard(row);
  const booked = normalizeBookedEventsForDashboard(row);
  const activeEventId = String(row.active_event_id || "").trim();
  const processStep = Number(row.event_workflow_process_step || 0);
  const processStageLabel = getWorkflowStageLabelFromStep(processStep);
  const accountState = String(row.password_hash || "").startsWith("pending:") ? "email_only" : "registered";

  const bookingsByEventId = new Map();
  booked.forEach((item) => {
    if (!item.eventId) return;
    const existing = bookingsByEventId.get(item.eventId) || [];
    existing.push(item);
    bookingsByEventId.set(item.eventId, existing);
  });

  const usedBookingIndexes = new Set();
  const matchedBookingsByWeek = program.map((item) => {
    const eventId = String(item.id || "").trim();
    if (eventId) {
      const candidateList = bookingsByEventId.get(eventId) || [];
      const nextCandidate = candidateList.find((entry) => !usedBookingIndexes.has(entry.index));
      if (nextCandidate) {
        usedBookingIndexes.add(nextCandidate.index);
        return nextCandidate;
      }
    }

    const fallbackByName = booked.find((entry) => {
      if (usedBookingIndexes.has(entry.index)) return false;
      if (!entry.eventName || !item.eventName) return false;
      return entry.eventName.toLowerCase() === String(item.eventName).toLowerCase();
    });
    if (fallbackByName) {
      usedBookingIndexes.add(fallbackByName.index);
      return fallbackByName;
    }

    return null;
  });

  const weeks = program.map((item, index) => {
    const booking = matchedBookingsByWeek[index];
    const isActive = booking && booking.bookedId && booking.bookedId === activeEventId;

    if (!booking) {
      return {
        week: item.week,
        eventId: item.id,
        eventName: item.eventName,
        status: "not_started",
        stageLabel: EVENT_WORKFLOW_STAGE_LABELS.launch,
        runEventCompletedAt: "",
        feedbackClosedAt: ""
      };
    }

    if (booking.feedbackClosedAt) {
      return {
        week: item.week,
        eventId: item.id,
        eventName: item.eventName,
        status: "complete",
        stageLabel: EVENT_WORKFLOW_STAGE_LABELS.review,
        runEventCompletedAt: booking.runEventCompletedAt,
        feedbackClosedAt: booking.feedbackClosedAt
      };
    }

    if (booking.runEventCompletedAt) {
      return {
        week: item.week,
        eventId: item.id,
        eventName: item.eventName,
        status: "in_progress",
        stageLabel: isActive && processStageLabel ? processStageLabel : EVENT_WORKFLOW_STAGE_LABELS.feedback,
        runEventCompletedAt: booking.runEventCompletedAt,
        feedbackClosedAt: ""
      };
    }

    return {
      week: item.week,
      eventId: item.id,
      eventName: item.eventName,
      status: "in_progress",
      stageLabel: isActive && processStageLabel ? processStageLabel : EVENT_WORKFLOW_STAGE_LABELS.run,
      runEventCompletedAt: "",
      feedbackClosedAt: ""
    };
  });

  const currentWeekIndex = weeks.findIndex((item) => item.status !== "complete");
  const currentWeek = currentWeekIndex >= 0 ? weeks[currentWeekIndex] : null;
  const completedWeeks = weeks.filter((item) => item.status === "complete").length;

  if (currentWeek && currentWeek.status === "not_started" && processStageLabel) {
    currentWeek.stageLabel = processStageLabel;
  }

  return {
    accountState,
    totalWeeks: weeks.length,
    completedWeeks,
    currentWeek: currentWeek ? Number(currentWeek.week || 0) : 0,
    currentStage: currentWeek?.stageLabel || (weeks.length ? EVENT_WORKFLOW_STAGE_LABELS.review : ""),
    weeks
  };
}

function buildMagicLoginUrl(env, token) {
  const base = String(env.MAGIC_LOGIN_ORIGIN || DEFAULT_MAGIC_LOGIN_ORIGIN).trim().replace(/\/+$/, "");
  return `${base}/?magicLoginToken=${encodeURIComponent(String(token || ""))}`;
}

async function issueMagicLoginToken(env, companyId, email) {
  const token = randomToken(24);
  const createdAt = nowIso();
  const expiresAt = addHoursIso(MAGIC_LOGIN_TTL_HOURS);
  await env.DB.prepare(
    `INSERT INTO user_magic_login_links (token, company_id, email, created_at, expires_at, used_at)
     VALUES (?1, ?2, ?3, ?4, ?5, NULL)`
  ).bind(token, companyId, email, createdAt, expiresAt).run();
  return {
    token,
    expiresAt,
    url: buildMagicLoginUrl(env, token)
  };
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
  const key = `${normalizedHost}/${normalizedToken}`;
  const forcedCompanyId = String(MAGIC_LINK_COMPANY_ID_OVERRIDES[key] || "").trim();
  if (forcedCompanyId) {
    return {
      ...row,
      company_id: forcedCompanyId
    };
  }
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

  const normalizedStateBlob = ensureSavedProgramWeeks(stateBlob);

  const timestamp = nowIso();
  await env.DB.prepare(
    "UPDATE accounts SET state_blob = ?1, state_version = COALESCE(state_version, 0) + 1, updated_at = ?2 WHERE company_id = ?3"
  ).bind(toJsonString(normalizedStateBlob, {}), timestamp, session.company_id).run();

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

async function handleOnboardingEmailSave(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) {
    return errorResponse("INVALID_EMAIL", "A valid email is required.", 422);
  }

  const draft = body.draft && typeof body.draft === "object" ? body.draft : {};
  const identity = body.identity && typeof body.identity === "object" ? body.identity : {};
  const incomingStateBlob = body.stateBlob && typeof body.stateBlob === "object" ? body.stateBlob : {};
  const programSummary = Array.isArray(body.programSummary)
    ? body.programSummary.filter((item) => item && typeof item === "object")
    : [];

  const companyName = String(identity.companyName || incomingStateBlob.companyName || "").trim();
  const adminName = String(identity.adminName || incomingStateBlob.adminName || "").trim();

  const existingAccount = await env.DB.prepare(
    "SELECT company_id, email, state_blob, state_version, company_name, admin_name FROM accounts WHERE email = ?1 LIMIT 1"
  ).bind(email).first();

  const timestamp = nowIso();
  let companyId = "";
  let existingState = {};

  if (!existingAccount) {
    companyId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO accounts (company_id, email, password_hash, company_name, admin_name, state_blob, state_version, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, ?7)`
    ).bind(
      companyId,
      email,
      `pending:${randomToken(12)}`,
      companyName,
      adminName,
      toJsonString({}, {}),
      timestamp
    ).run();
  } else {
    companyId = String(existingAccount.company_id || "").trim();
    existingState = parseJsonField(existingAccount.state_blob, {});
  }

  let mergedState = mergeDraftState(existingState, draft, "if-empty-or-newer");
  mergedState = deepMergeState(mergedState, incomingStateBlob);

  // If the incoming state had no program (generator hadn't run yet), preserve
  // whatever fourMonthProgram is already stored in the DB for this account.
  const incomingProgram = incomingStateBlob.fourMonthProgram;
  const incomingHasWeeks = incomingProgram && Array.isArray(incomingProgram.weeks) && incomingProgram.weeks.length > 0;
  if (!incomingHasWeeks && existingState.fourMonthProgram) {
    mergedState.fourMonthProgram = existingState.fourMonthProgram;
  }

  mergedState.accountId = companyId;
  if (!mergedState.user || typeof mergedState.user !== "object") {
    mergedState.user = {};
  }
  mergedState.user.email = email;
  const normalizedProgramSummary = programSummary.length
    ? programSummary.map((item, index) => ({
      week: Number(item.week || (index + 1)),
      id: String(item.id || item.eventId || item.templateId || "").trim(),
      eventName: fallbackProgramEventName(item, index)
    }))
    : [];
  if (normalizedProgramSummary.length) {
    mergedState.savedProgramWeeks = normalizedProgramSummary;
  }
  mergedState = ensureSavedProgramWeeks(mergedState);

  await env.DB.prepare(
    `UPDATE accounts
     SET company_name = COALESCE(NULLIF(?1, ''), company_name),
         admin_name = COALESCE(NULLIF(?2, ''), admin_name),
         state_blob = ?3,
         state_version = COALESCE(state_version, 0) + 1,
         updated_at = ?4
     WHERE company_id = ?5`
  ).bind(companyName, adminName, toJsonString(mergedState, {}), timestamp, companyId).run();

  const sessionToken = randomToken(24);
  const sessionExpiresAt = addDaysIso(SESSION_TTL_DAYS);
  await env.DB.prepare(
    "INSERT INTO sessions (token, company_id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)"
  ).bind(sessionToken, companyId, email, timestamp, sessionExpiresAt).run();

  const magicLogin = await issueMagicLoginToken(env, companyId, email);

  return jsonResponse({
    token: sessionToken,
    companyId,
    email,
    magicLogin,
    stateBlob: mergedState
  });
}

async function handleAdminResyncProgress(request, env) {
  const expectedReadKey = String(env.DASHBOARD_READ_KEY || "").trim();
  if (!expectedReadKey) {
    return errorResponse("DASHBOARD_NOT_CONFIGURED", "Dashboard read key is not configured.", 503);
  }
  const providedReadKey = String(request.headers.get("x-dashboard-key") || "").trim();
  if (!providedReadKey || providedReadKey !== expectedReadKey) {
    return errorResponse("UNAUTHORIZED", "Dashboard read key is invalid.", 401);
  }

  const rowsResult = await env.DB.prepare(
    "SELECT company_id, state_blob FROM accounts"
  ).all();
  const rows = Array.isArray(rowsResult?.results) ? rowsResult.results : [];

  const timestamp = nowIso();
  let resynced = 0;

  for (const row of rows) {
    const stateBlob = parseJsonField(row.state_blob, {});

    // Only update accounts that are missing savedProgramWeeks but have fourMonthProgram data
    const existingWeeks = parseJsonValue(stateBlob.savedProgramWeeks, []);
    if (Array.isArray(existingWeeks) && existingWeeks.length > 0) continue;

    const derived = buildProgramWeekSummaryFromStateBlob(stateBlob);
    if (!derived.length) continue;

    const updated = { ...stateBlob, savedProgramWeeks: derived };
    await env.DB.prepare(
      "UPDATE accounts SET state_blob = ?1, updated_at = ?2 WHERE company_id = ?3"
    ).bind(toJsonString(updated, {}), timestamp, String(row.company_id || "")).run();
    resynced++;
  }

  return jsonResponse({ resynced, total: rows.length });
}

async function handleAdminOnboardingDashboard(request, env) {
  const expectedReadKey = String(env.DASHBOARD_READ_KEY || "").trim();
  if (!expectedReadKey) {
    return errorResponse("DASHBOARD_NOT_CONFIGURED", "Dashboard read key is not configured.", 503);
  }

  const url = new URL(request.url);
  const providedReadKey = String(request.headers.get("x-dashboard-key") || "").trim();
  if (!providedReadKey || providedReadKey !== expectedReadKey) {
    return errorResponse("UNAUTHORIZED", "Dashboard read key is invalid.", 401);
  }

  const limit = parsePositiveInt(url.searchParams.get("limit"), 25, { min: 1, max: 100 });
  const rowsResult = await env.DB.prepare(
    `SELECT company_id,
            email,
            password_hash,
            company_name,
            admin_name,
            updated_at,
            json_extract(state_blob, '$.landingDraft.employeeCount') AS employee_count,
            json_extract(state_blob, '$.landingDraft.goals') AS goals,
            json_extract(state_blob, '$.landingDraft.setting') AS setting,
            json_extract(state_blob, '$.landingDraft.schedule') AS schedule,
            json_extract(state_blob, '$.landingDraft.localCity') AS local_city,
            json_extract(state_blob, '$.landingDraft.daysSelected') AS days_selected,
            json_extract(state_blob, '$.landingDraft.timesSelected') AS times_selected,
            json_extract(state_blob, '$.landingDraft.teamPreferenceEstimate') AS interests,
            json_extract(state_blob, '$.landingDraft.budgetMode') AS budget_mode,
            json_extract(state_blob, '$.landingDraft.totalBudget') AS total_budget,
            json_extract(state_blob, '$.landingDraft.perEmployee') AS per_employee_budget,
            json_extract(state_blob, '$.savedProgramWeeks') AS saved_program_weeks,
            json_extract(state_blob, '$.fourMonthProgram.weeks') AS four_month_program_weeks,
            json_extract(state_blob, '$.fourMonthProgram.events') AS four_month_program_events,
            json_extract(state_blob, '$.eventsBooked') AS events_booked,
            json_extract(state_blob, '$.activeEventId') AS active_event_id,
            json_extract(state_blob, '$.eventWorkflowProcessStep') AS event_workflow_process_step,
            (
              SELECT token
              FROM user_magic_login_links uml
              WHERE uml.company_id = accounts.company_id
              ORDER BY uml.created_at DESC
              LIMIT 1
            ) AS latest_magic_token,
            (
              SELECT created_at
              FROM user_magic_login_links uml
              WHERE uml.company_id = accounts.company_id
              ORDER BY uml.created_at DESC
              LIMIT 1
            ) AS latest_magic_created_at,
            (
              SELECT expires_at
              FROM user_magic_login_links uml
              WHERE uml.company_id = accounts.company_id
              ORDER BY uml.created_at DESC
              LIMIT 1
            ) AS latest_magic_expires_at,
            (
              SELECT used_at
              FROM user_magic_login_links uml
              WHERE uml.company_id = accounts.company_id
              ORDER BY uml.created_at DESC
              LIMIT 1
            ) AS latest_magic_used_at
     FROM accounts
     ORDER BY updated_at DESC
     LIMIT ?1`
  ).bind(limit).all();

  const rows = Array.isArray(rowsResult?.results) ? rowsResult.results : [];
  const users = rows.map((row) => {
    const normalizedProgram = normalizeProgramWeeksForDashboard(row);
    const progress = buildDashboardProgressFromRow(row);

    return {
      companyId: String(row.company_id || "").trim(),
      email: String(row.email || "").trim(),
      companyName: String(row.company_name || "").trim(),
      adminName: String(row.admin_name || "").trim(),
      updatedAt: String(row.updated_at || "").trim(),
      magicLink: String(row.latest_magic_token || "").trim() ? {
        url: buildMagicLoginUrl(env, String(row.latest_magic_token || "").trim()),
        createdAt: String(row.latest_magic_created_at || "").trim(),
        expiresAt: String(row.latest_magic_expires_at || "").trim(),
        usedAt: String(row.latest_magic_used_at || "").trim()
      } : null,
      answers: {
        employeeCount: Number(row.employee_count || 0) || 0,
        goals: parseJsonValue(row.goals, []),
        setting: String(row.setting || "").trim(),
        schedule: parseJsonValue(row.schedule, []),
        localCity: String(row.local_city || "").trim(),
        daysSelected: parseJsonValue(row.days_selected, []),
        timesSelected: parseJsonValue(row.times_selected, []),
        interests: parseJsonValue(row.interests, []),
        budgetMode: String(row.budget_mode || "").trim(),
        totalBudget: Number(row.total_budget || 0) || 0,
        perEmployeeBudget: Number(row.per_employee_budget || 0) || 0
      },
      program: normalizedProgram,
      progress
    };
  });

  return jsonResponse({
    users,
    count: users.length,
    limit,
    fetchedAt: nowIso()
  });
}

async function handleAdminOnboardingDashboardAccount(request, env) {
  const expectedReadKey = String(env.DASHBOARD_READ_KEY || "").trim();
  if (!expectedReadKey) {
    return errorResponse("DASHBOARD_NOT_CONFIGURED", "Dashboard read key is not configured.", 503);
  }

  const providedReadKey = String(request.headers.get("x-dashboard-key") || "").trim();
  if (!providedReadKey || providedReadKey !== expectedReadKey) {
    return errorResponse("UNAUTHORIZED", "Dashboard read key is invalid.", 401);
  }

  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email"));
  const companyId = String(url.searchParams.get("companyId") || "").trim();
  if (!email && !companyId) {
    return errorResponse("INVALID_TARGET", "email or companyId query param is required.", 422);
  }

  const row = companyId
    ? await env.DB.prepare(
      `SELECT company_id,
              email,
              company_name,
              admin_name,
              updated_at,
              json_extract(state_blob, '$.landingDraft.employeeCount') AS employee_count,
              json_extract(state_blob, '$.landingDraft.goals') AS goals,
              json_extract(state_blob, '$.landingDraft.setting') AS setting,
              json_extract(state_blob, '$.landingDraft.schedule') AS schedule,
              json_extract(state_blob, '$.landingDraft.daysSelected') AS days_selected,
              json_extract(state_blob, '$.landingDraft.timesSelected') AS times_selected,
              json_extract(state_blob, '$.landingDraft.teamPreferenceEstimate') AS interests,
              json_extract(state_blob, '$.landingDraft.budgetMode') AS budget_mode,
              json_extract(state_blob, '$.landingDraft.totalBudget') AS total_budget,
              json_extract(state_blob, '$.landingDraft.perEmployee') AS per_employee_budget,
              json_extract(state_blob, '$.savedProgramWeeks') AS saved_program_weeks,
              json_extract(state_blob, '$.fourMonthProgram.weeks') AS four_month_program_weeks,
              json_extract(state_blob, '$.fourMonthProgram.events') AS four_month_program_events,
              (
                SELECT token
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_token,
              (
                SELECT created_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_created_at,
              (
                SELECT expires_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_expires_at,
              (
                SELECT used_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_used_at
       FROM accounts
       WHERE company_id = ?1
       LIMIT 1`
    ).bind(companyId).first()
    : await env.DB.prepare(
      `SELECT company_id,
              email,
              company_name,
              admin_name,
              updated_at,
              json_extract(state_blob, '$.landingDraft.employeeCount') AS employee_count,
              json_extract(state_blob, '$.landingDraft.goals') AS goals,
              json_extract(state_blob, '$.landingDraft.setting') AS setting,
              json_extract(state_blob, '$.landingDraft.schedule') AS schedule,
              json_extract(state_blob, '$.landingDraft.daysSelected') AS days_selected,
              json_extract(state_blob, '$.landingDraft.timesSelected') AS times_selected,
              json_extract(state_blob, '$.landingDraft.teamPreferenceEstimate') AS interests,
              json_extract(state_blob, '$.landingDraft.budgetMode') AS budget_mode,
              json_extract(state_blob, '$.landingDraft.totalBudget') AS total_budget,
              json_extract(state_blob, '$.landingDraft.perEmployee') AS per_employee_budget,
              json_extract(state_blob, '$.savedProgramWeeks') AS saved_program_weeks,
              json_extract(state_blob, '$.fourMonthProgram.weeks') AS four_month_program_weeks,
              json_extract(state_blob, '$.fourMonthProgram.events') AS four_month_program_events,
              (
                SELECT token
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_token,
              (
                SELECT created_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_created_at,
              (
                SELECT expires_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_expires_at,
              (
                SELECT used_at
                FROM user_magic_login_links uml
                WHERE uml.company_id = accounts.company_id
                ORDER BY uml.created_at DESC
                LIMIT 1
              ) AS latest_magic_used_at
       FROM accounts
       WHERE email = ?1
       LIMIT 1`
    ).bind(email).first();

  if (!row) {
    return errorResponse("ACCOUNT_NOT_FOUND", "Account not found.", 404);
  }

  const savedProgramWeeks = parseJsonValue(row.saved_program_weeks, []);
  const fallbackProgramWeeks = (() => {
    const weeks = parseJsonValue(row.four_month_program_weeks, []);
    if (Array.isArray(weeks) && weeks.length) return weeks;
    const events = parseJsonValue(row.four_month_program_events, []);
    return Array.isArray(events) ? events : [];
  })();
  const programWeeks = Array.isArray(savedProgramWeeks) && savedProgramWeeks.length
    ? savedProgramWeeks
    : fallbackProgramWeeks;
  const normalizedProgram = Array.isArray(programWeeks)
    ? programWeeks
      .map((item, index) => ({
        week: Number(item?.week || index + 1),
        eventName: fallbackProgramEventName(item, index)
      }))
      .filter((item) => item.week > 0)
    : [];

  const user = {
    companyId: String(row.company_id || "").trim(),
    email: String(row.email || "").trim(),
    companyName: String(row.company_name || "").trim(),
    adminName: String(row.admin_name || "").trim(),
    updatedAt: String(row.updated_at || "").trim(),
    magicLink: String(row.latest_magic_token || "").trim() ? {
      url: buildMagicLoginUrl(env, String(row.latest_magic_token || "").trim()),
      createdAt: String(row.latest_magic_created_at || "").trim(),
      expiresAt: String(row.latest_magic_expires_at || "").trim(),
      usedAt: String(row.latest_magic_used_at || "").trim()
    } : null,
    answers: {
      employeeCount: Number(row.employee_count || 0) || 0,
      goals: parseJsonValue(row.goals, []),
      setting: String(row.setting || "").trim(),
      schedule: parseJsonValue(row.schedule, []),
      daysSelected: parseJsonValue(row.days_selected, []),
      timesSelected: parseJsonValue(row.times_selected, []),
      interests: parseJsonValue(row.interests, []),
      budgetMode: String(row.budget_mode || "").trim(),
      totalBudget: Number(row.total_budget || 0) || 0,
      perEmployeeBudget: Number(row.per_employee_budget || 0) || 0
    },
    program: normalizedProgram
  };

  return jsonResponse({ user, fetchedAt: nowIso() });
}

async function handleAdminDeleteAccount(request, env) {
  const expectedReadKey = String(env.DASHBOARD_READ_KEY || "").trim();
  if (!expectedReadKey) {
    return errorResponse("DASHBOARD_NOT_CONFIGURED", "Dashboard read key is not configured.", 503);
  }

  const providedReadKey = String(request.headers.get("x-dashboard-key") || "").trim();
  if (!providedReadKey || providedReadKey !== expectedReadKey) {
    return errorResponse("UNAUTHORIZED", "Dashboard read key is invalid.", 401);
  }

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const companyId = String(body.companyId || "").trim();
  if (!email && !companyId) {
    return errorResponse("INVALID_TARGET", "Email or companyId is required.", 422);
  }

  const account = companyId
    ? await env.DB.prepare(
      "SELECT company_id, email FROM accounts WHERE company_id = ?1 LIMIT 1"
    ).bind(companyId).first()
    : await env.DB.prepare(
      "SELECT company_id, email FROM accounts WHERE email = ?1 LIMIT 1"
    ).bind(email).first();

  if (!account?.company_id) {
    return errorResponse("ACCOUNT_NOT_FOUND", "Account not found.", 404);
  }

  const resolvedCompanyId = String(account.company_id || "").trim();
  const resolvedEmail = normalizeEmail(account.email);

  await env.DB.prepare("DELETE FROM user_magic_login_links WHERE company_id = ?1 OR email = ?2").bind(resolvedCompanyId, resolvedEmail).run();
  await env.DB.prepare("DELETE FROM sessions WHERE company_id = ?1 OR email = ?2").bind(resolvedCompanyId, resolvedEmail).run();
  await env.DB.prepare("DELETE FROM events_recommended WHERE company_id = ?1").bind(resolvedCompanyId).run();
  await env.DB.prepare("DELETE FROM magic_links WHERE company_id = ?1").bind(resolvedCompanyId).run();
  await env.DB.prepare("DELETE FROM accounts WHERE company_id = ?1").bind(resolvedCompanyId).run();

  return jsonResponse({
    deleted: true,
    companyId: resolvedCompanyId,
    email: resolvedEmail
  });
}



async function handleAuthMagicLinkRequest(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) {
    return errorResponse("INVALID_EMAIL", "A valid email is required.", 422);
  }

  const account = await env.DB.prepare(
    "SELECT company_id FROM accounts WHERE email = ?1 LIMIT 1"
  ).bind(email).first();

  if (!account?.company_id) {
    return errorResponse("ACCOUNT_NOT_FOUND", "No account found for this email.", 404);
  }

  const magicLogin = await issueMagicLoginToken(env, String(account.company_id), email);
  return jsonResponse({
    companyId: String(account.company_id),
    email,
    magicLogin
  });
}

async function handleAuthMagicLinkRedeem(request, env) {
  const body = await readJson(request);
  const oneTimeToken = String(body.token || "").trim();
  if (!oneTimeToken) {
    return errorResponse("INVALID_TOKEN", "Magic login token is required.", 422);
  }

  const row = await env.DB.prepare(
    `SELECT token, company_id, email, expires_at, used_at
     FROM user_magic_login_links
     WHERE token = ?1
     LIMIT 1`
  ).bind(oneTimeToken).first();

  if (!row) {
    return errorResponse("TOKEN_NOT_FOUND", "Magic login token is invalid.", 404);
  }
  if (String(row.used_at || "").trim()) {
    return errorResponse("TOKEN_ALREADY_USED", "Magic login token has already been used.", 410);
  }
  if (String(row.expires_at || "") <= nowIso()) {
    return errorResponse("TOKEN_EXPIRED", "Magic login token has expired.", 410);
  }

  const sessionToken = randomToken(24);
  const timestamp = nowIso();
  const expiresAt = addDaysIso(SESSION_TTL_DAYS);

  await env.DB.prepare(
    "INSERT INTO sessions (token, company_id, email, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)"
  ).bind(sessionToken, row.company_id, row.email, timestamp, expiresAt).run();

  await env.DB.prepare(
    "UPDATE user_magic_login_links SET used_at = ?1 WHERE token = ?2"
  ).bind(timestamp, oneTimeToken).run();

  return jsonResponse({
    token: sessionToken,
    companyId: String(row.company_id || ""),
    email: String(row.email || "")
  });
}

async function handleEmailCapture(request, env) {
  if (request.method.toUpperCase() !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", "Only POST is allowed", 405);
  }

  try {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);

    if (!email || !email.includes("@")) {
      return errorResponse("INVALID_EMAIL", "Enter a valid email.", 400);
    }

    const source = String(body.source || "landing_page").trim();
    const eventId = String(body.event_id || "workspace-show-and-tell").trim();
    const eventName = String(body.event_name || "Workspace Show & Tell").trim();
    const captureReason = String(body.capture_reason || "next_week_event").trim();
    const userAgent = String(request.headers.get("user-agent") || "");
    const cfClientIp = String(request.headers.get("cf-connecting-ip") || "");
    const createdAt = nowIso();

    await env.DB.prepare(
      `INSERT INTO email_captures
        (email, source, event_id, event_name, capture_reason, user_agent, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        email,
        source,
        eventId,
        eventName,
        captureReason,
        userAgent,
        cfClientIp,
        createdAt
      )
      .run();

    // Send notification email if RESEND_API_KEY is configured
    const resendApiKey = String(env.RESEND_API_KEY || "").trim();
    const notifyEmail = String(env.NOTIFY_EMAIL || "").trim();
    const fromEmail = String(env.FROM_EMAIL || "no-reply@eeos.work").trim();

    if (resendApiKey && notifyEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `EEOS <${fromEmail}>`,
            to: [notifyEmail],
            subject: "New EEOS lead — next week's event",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
                <h2>New EEOS email capture</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Source:</strong> ${source}</p>
                <p><strong>Event:</strong> ${eventName}</p>
                <p><strong>Capture reason:</strong> ${captureReason}</p>
                <p><strong>Submitted at:</strong> ${createdAt}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
                <p style="font-size: 0.875rem; color: #64748b;">From EEOS email capture system</p>
              </div>
            `,
          }),
        }).catch((err) => {
          console.error("Resend API error:", err);
        });
      } catch (resendError) {
        console.error("Failed to send notification email:", resendError);
        // Don't fail the lead capture if email notification fails
      }
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Email capture error:", error);
    return errorResponse("CAPTURE_ERROR", "Something went wrong. Please try again.", 500);
  }
}

async function handleTestingResetWorkspace(request, env) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
  }

  const testingCompanyId = "revelry-labs-testing";
  if (String(session.company_id || "").trim() !== testingCompanyId) {
    return errorResponse("FORBIDDEN_COMPANY", "Testing reset is only allowed for the testing workspace.", 403);
  }

  const timestamp = nowIso();
  await env.DB.prepare(
    "UPDATE accounts SET state_blob = ?1, state_version = COALESCE(state_version, 0) + 1, updated_at = ?2 WHERE company_id = ?3"
  ).bind(
    toJsonString({ companyName: "Revelry Labs (Testing)", adminName: "" }, {}),
    timestamp,
    testingCompanyId
  ).run();

  await env.DB.prepare("DELETE FROM events_recommended WHERE company_id = ?1").bind(testingCompanyId).run();
  await env.DB.prepare("DELETE FROM sessions WHERE company_id = ?1").bind(testingCompanyId).run();

  return jsonResponse({ companyId: testingCompanyId, reset: true, resetAt: timestamp });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = String(url.hostname || "").toLowerCase();

    if (!url.pathname.startsWith("/api")) {
      if (HOME_PAGE_HOSTS.has(host)) {
        if (url.pathname === "/index.html") {
          return Response.redirect(`${url.origin}/`, 301);
        }
        return withCors(await serveHomePageHostRequest(request), request, env);
      }
      if (TODO_PAGE_HOSTS.has(host)) {
        if (url.pathname === "/todo.html") {
          return Response.redirect(`${url.origin}/`, 301);
        }
        return withCors(await serveTodoPageHostRequest(request), request, env);
      }
      if (OPS_PAGE_HOSTS.has(host)) {
        if (url.pathname === "/ops.html") {
          return Response.redirect(`${url.origin}/`, 301);
        }
        return withCors(await serveOpsPageHostRequest(request), request, env);
      }
      if (BRANDON_HOSTS.has(host)) {
        if (url.pathname === "/brandon.html") {
          return Response.redirect(`${url.origin}/`, 301);
        }
        return withCors(await serveBrandonHostRequest(request), request, env);
      }
      if (MAGIC_LINK_HOSTS.has(host)) {
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
      if (method === "POST" && path === "/auth/magic-link/request") return withCors(await handleAuthMagicLinkRequest(request, env), request, env);
      if (method === "POST" && path === "/auth/magic-link/redeem") return withCors(await handleAuthMagicLinkRedeem(request, env), request, env);
      if (method === "GET" && path === "/admin/onboarding-dashboard") return withCors(await handleAdminOnboardingDashboard(request, env), request, env);
      if (method === "GET" && path === "/admin/onboarding-dashboard/account") return withCors(await handleAdminOnboardingDashboardAccount(request, env), request, env);
      if (method === "DELETE" && path === "/admin/onboarding-dashboard/account") return withCors(await handleAdminDeleteAccount(request, env), request, env);
      if (method === "POST" && path === "/admin/onboarding-dashboard/resync") return withCors(await handleAdminResyncProgress(request, env), request, env);

      if (method === "GET" && path === "/state") return withCors(await handleStateGet(request, env), request, env);
      if (method === "POST" && path === "/state") return withCors(await handleStatePost(request, env), request, env);
      if (method === "POST" && path === "/onboarding/email-save") return withCors(await handleOnboardingEmailSave(request, env), request, env);
      if (method === "POST" && path === "/magic-links/resolve") return withCors(await handleMagicLinkResolve(request, env), request, env);
      if (method === "POST" && path === "/onboarding/migrate-draft") return withCors(await handleOnboardingMigrateDraft(request, env), request, env);
      if (method === "POST" && path === "/recommendations/generate") return withCors(await handleRecommendationsGenerate(request, env), request, env);
      if (method === "POST" && path === "/eeos-email-capture") return withCors(await handleEmailCapture(request, env), request, env);
      if (method === "POST" && path === "/testing/reset-workspace") return withCors(await handleTestingResetWorkspace(request, env), request, env);
      if (method === "GET" && path === "/brandon/articles") return withCors(await handleBrandonArticles(request, env), request, env);
      if (method === "POST" && path === "/brandon/generate") return withCors(await handleBrandonGenerate(request, env), request, env);

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
