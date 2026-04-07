#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const INPUT_CSV = path.join(ROOT, "events-repository.csv");
const OUTPUT_JS = path.join(ROOT, "offerings.js");
const OUTPUT_JSON = path.join(ROOT, "dist", "events-normalized.json");
const MIN_POPULARITY_SCORE = Number(process.env.MIN_POPULARITY_SCORE || 60);

const GOAL_MAP = {
  team_connection: "Strengthen team connection",
  employee_performance: "Improve employee performance",
  morale: "Boost morale",
  wellbeing: "Support employee wellbeing"
};

const INTEREST_MAP = {
  games_and_competitions: "Games & competitions",
  food_and_drinks: "Food & drinks",
  volunteering: "Volunteering",
  learning_events: "Learning events",
  social_meetups: "Social meetups"
};

function toBool(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function toNumber(value, fallback = 0) {
  const numeric = Number(String(value || "").trim());
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toNullableNumber(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalizeGoalKey(raw) {
  const key = String(raw || "").trim().toLowerCase();
  if (key in GOAL_MAP) return key;
  return "team_connection";
}

function normalizeInterestKey(raw) {
  const key = String(raw || "").trim().toLowerCase();
  if (key in INTEREST_MAP) return key;
  return "social_meetups";
}

function normalizeRow(row) {
  const id = String(row.id || "").trim();
  const title = String(row.name || "").trim();
  if (!id || !title) {
    return { ok: false, reason: "missing id or name" };
  }

  const popularityScore = toNumber(row.popularity_score, 0);
  if (popularityScore < MIN_POPULARITY_SCORE) {
    return { ok: false, reason: `popularity below threshold (${MIN_POPULARITY_SCORE})` };
  }

  const goalKey = normalizeGoalKey(row.roi_primary);
  const interestKey = normalizeInterestKey(row.activity_type);
  const costPerPerson = Math.max(0, toNumber(row.cost_per_person, 0));
  const durationMinutes = toNullableNumber(row.duration_minutes);
  const maxParticipants = toNullableNumber(row.max_participants);

  return {
    ok: true,
    value: {
      id,
      title,
      description: String(row.description || "").trim() || `${title} for teams.`,
      category: String(row.category || "").trim().toLowerCase() || "one_off",
      deliveryMode: String(row.delivery_mode || "").trim().toLowerCase() || "remote",
      formatCapability: String(row.format_capability || "").trim().toLowerCase() || "remote_only",
      day: String(row.day || "Any").trim(),
      timeSlot: String(row.time_slot || "Any").trim(),
      includeWeekends: toBool(row.include_weekends),
      costPerPerson,
      durationMinutes,
      maxParticipants,
      goals: [GOAL_MAP[goalKey]],
      goalKeys: [goalKey],
      interestCategories: [INTEREST_MAP[interestKey]],
      interestKeys: [interestKey],
      energyLevel: String(row.energy_level || "").trim().toLowerCase() || "low",
      interactionLevel: String(row.interaction_level || "").trim().toLowerCase() || "low",
      popularityScore,
      registrationRequired: toBool(row.registration_required),
      instructions: String(row.instructions || "").trim(),
      vendorName: String(row.vendor_name || "").trim(),
      vendorUrl: String(row.vendor_url || "").trim(),
      registrationLink: String(row.registration_link || "").trim(),
      location: {
        address: String(row.location_address || "").trim(),
        city: String(row.location_city || "").trim(),
        state: String(row.location_state || "").trim(),
        country: String(row.location_country || "").trim()
      },
      remoteCompatible: String(row.format_capability || "").trim().toLowerCase() !== "in_person_only",
      inPersonOnly: String(row.format_capability || "").trim().toLowerCase() === "in_person_only",
      adminLoad: String(row.admin_load || "").trim(),
      workflowType: "rsvp",
      type: "rsvp"
    }
  };
}

function run() {
  if (!fs.existsSync(INPUT_CSV)) {
    throw new Error(`Input CSV not found at ${INPUT_CSV}`);
  }

  const raw = fs.readFileSync(INPUT_CSV, "utf8");
  const parsed = parseCsv(raw);
  if (!parsed.length) {
    throw new Error("CSV is empty");
  }

  const [header, ...body] = parsed;
  const records = body
    .filter((row) => row.some((cell) => String(cell || "").trim().length > 0))
    .map((row) => {
      const obj = {};
      header.forEach((key, idx) => {
        obj[String(key || "").trim()] = row[idx] !== undefined ? row[idx] : "";
      });
      return obj;
    });

  const report = {
    totalRows: records.length,
    acceptedRows: 0,
    rejectedRows: 0,
    rejectedByReason: {},
    duplicatesDropped: 0
  };

  const deduped = new Map();

  records.forEach((row) => {
    const normalized = normalizeRow(row);
    if (!normalized.ok) {
      report.rejectedRows += 1;
      report.rejectedByReason[normalized.reason] = (report.rejectedByReason[normalized.reason] || 0) + 1;
      return;
    }

    const item = normalized.value;
    const existing = deduped.get(item.id);
    if (!existing) {
      deduped.set(item.id, item);
      report.acceptedRows += 1;
      return;
    }

    if (item.popularityScore > existing.popularityScore) {
      deduped.set(item.id, item);
    } else if (item.popularityScore === existing.popularityScore) {
      deduped.set(item.id, item);
    }
    report.duplicatesDropped += 1;
  });

  const offerings = Array.from(deduped.values()).sort((a, b) => {
    if (b.popularityScore !== a.popularityScore) return b.popularityScore - a.popularityScore;
    return a.title.localeCompare(b.title);
  });

  const jsContent = [
    "/* Auto-generated by scripts/build-offerings.js. Do not edit manually. */",
    `(function initEventOfferings() {`,
    `  window.EVENT_OFFERINGS = ${JSON.stringify(offerings, null, 2)};`,
    `  window.EVENT_OFFERINGS_META = ${JSON.stringify({ generatedAt: new Date().toISOString(), minPopularityScore: MIN_POPULARITY_SCORE, report }, null, 2)};`,
    `})();`,
    ""
  ].join("\n");

  fs.writeFileSync(OUTPUT_JS, jsContent, "utf8");
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ offerings, report }, null, 2), "utf8");

  console.log(`Built ${offerings.length} offerings`);
  console.log(JSON.stringify(report, null, 2));
}

run();
