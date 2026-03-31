#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const generatorPath = path.join(ROOT, "programGenerator.js");
const offeringsPath = path.join(ROOT, "offerings.js");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function stableProgramShape(program) {
  return {
    monthlyBudget: program.monthlyBudget,
    teamSize: program.teamSize,
    events: (program.events || []).map((event) => ({
      templateId: event.templateId,
      title: event.title,
      workflowType: event.workflowType,
      estimatedCost: event.estimatedCost,
      monthBudget: event.monthBudget,
      generatedEvents: (event.generatedEvents || []).map((item) => ({ name: item.name, cost: item.cost, type: item.type }))
    }))
  };
}

function isNolaProgram(program) {
  return Array.isArray(program?.weeks) && program.weeks.length === 12
    && Array.isArray(program?.events) && program.events.length === 0;
}

function runFixture(windowObj, fixture) {
  const first = windowObj.generateFourMonthProgram(fixture);
  const second = windowObj.generateFourMonthProgram(fixture);

  if (isNolaProgram(first)) {
    assert(first.weeks.length === 12, `Fixture ${fixture.name || "unknown"}: NOLA program expected 12 weeks`);
  } else {
    assert(Array.isArray(first.events) && first.events.length === 4, `Fixture ${fixture.name || "unknown"}: expected 4 events`);
    assert(JSON.stringify(stableProgramShape(first)) === JSON.stringify(stableProgramShape(second)), `Fixture ${fixture.name || "unknown"}: program output is not deterministic`);
  }

  return first;
}

function ensureNolaWeeks(program) {
  const FIXED_WEEK_IDS = {
    1: "7_day_energy_reset_challenge",
    2: "coffee_meetup",
    3: "ama_teammate_edition",
    4: "wednesday_at_the_square",
    6: "focus_hour",
    7: "pet_parade",
    9: "clarity_week",
    10: "lunch_and_listen",
    11: "throwback_thursday"
  };
  const weeks = Array.isArray(program?.weeks) ? program.weeks : [];
  assert(weeks.length === 12, `NOLA program expected 12 weeks, got ${weeks.length}`);
  Object.entries(FIXED_WEEK_IDS).forEach(([weekNum, expectedId]) => {
    const slot = weeks[Number(weekNum) - 1];
    assert(slot, `NOLA program missing week ${weekNum}`);
    assert(
      String(slot.templateId || "") === expectedId,
      `NOLA week ${weekNum} expected ${expectedId}, got ${slot.templateId}`
    );
  });
  // Week 5 and week 8 are dynamic — just verify they are non-empty
  assert(String(weeks[4]?.templateId || "").length > 0, "NOLA week 5 (dynamic async) must be filled");
  assert(String(weeks[7]?.templateId || "").length > 0, "NOLA week 8 (dynamic premium remote) must be filled");
  // Week 12 is conditional — just verify it is non-empty
  assert(String(weeks[11]?.templateId || "").length > 0, "NOLA week 12 must be filled");
}

function ensureCityFiltered(program, cityName) {
  const lowered = String(cityName || "").trim().toLowerCase();
  if (!lowered) return;

  program.events.forEach((event) => {
    const pool = Array.isArray(global.window.EVENT_OFFERINGS) ? global.window.EVENT_OFFERINGS : [];
    const match = pool.find((offering) => String(offering.id || "") === String(event.templateId || ""));
    if (!match || match.inPersonOnly !== true) return;
    const city = String(match?.location?.city || "").trim().toLowerCase();
    assert(city === lowered, `Expected in-person event city ${cityName}, got ${match?.location?.city || "<empty>"}`);
  });
}

function findFirstOfferingByPriority(pool, ids, predicate) {
  const list = Array.isArray(pool) ? pool : [];
  const wanted = Array.isArray(ids) ? ids : [];
  const matches = typeof predicate === "function" ? predicate : () => true;

  for (let i = 0; i < wanted.length; i += 1) {
    const id = String(wanted[i] || "").trim();
    if (!id) continue;
    const found = list.find((item) => String(item?.id || "") === id && matches(item));
    if (found) return found;
  }
  return null;
}

function ensureKickoffPriorities(program, offeringPool) {
  const weekOnePriority = [
    "7_day_energy_reset_challenge",
    "clarity_week",
    "focus_thread",
    "ama_teammate_edition"
  ];
  const weekTwoPriority = ["coffee_meetup", "lunch_and_listen", "wind_down"];

  const expectedWeekOne = findFirstOfferingByPriority(
    offeringPool,
    weekOnePriority,
    (item) => Number(item?.costPerPerson || 0) === 0 && String(item?.formatCapability || "").toLowerCase() === "async_slack"
  );
  const expectedWeekTwo = findFirstOfferingByPriority(
    offeringPool,
    weekTwoPriority,
    (item) => Number(item?.costPerPerson || 0) === 0 && String(item?.formatCapability || "").toLowerCase() === "remote_only"
  );

  assert(expectedWeekOne, "Expected at least one kickoff async slack event from the configured priority list");
  assert(expectedWeekTwo, "Expected at least one kickoff remote event from the configured priority list");

  const monthOne = Array.isArray(program?.events) ? program.events[0] : null;
  assert(monthOne, "Expected a month-1 program event");
  assert(String(monthOne.templateId || "") === String(expectedWeekOne.id || ""), `Expected month 1 templateId ${expectedWeekOne.id}, got ${monthOne.templateId}`);

  const generated = Array.isArray(monthOne.generatedEvents) ? monthOne.generatedEvents : [];
  assert(generated.length >= 2, "Expected month 1 to include at least two generated kickoff events");
  assert(String(generated[0]?.name || "") === String(expectedWeekOne.title || ""), `Expected week 1 kickoff event ${expectedWeekOne.title}, got ${generated[0]?.name || "<empty>"}`);
  assert(String(generated[1]?.name || "") === String(expectedWeekTwo.title || ""), `Expected week 2 kickoff event ${expectedWeekTwo.title}, got ${generated[1]?.name || "<empty>"}`);
  assert(Number(generated[0]?.cost || 0) === 0, "Expected week 1 kickoff event to be free");
  assert(Number(generated[1]?.cost || 0) === 0, "Expected week 2 kickoff event to be free");
}

function ensureMonthThreeInPerson(program, offeringPool) {
  const monthThree = Array.isArray(program?.events) ? program.events[2] : null;
  assert(monthThree, "Expected a month-3 program event");
  const selected = (Array.isArray(offeringPool) ? offeringPool : []).find((item) => String(item?.id || "") === String(monthThree.templateId || ""));
  assert(selected, `Month 3 template ${monthThree.templateId} was not found in offerings`);
  assert(selected.inPersonOnly === true, `Expected month 3 event to be in-person only, got ${selected?.formatCapability || "unknown"}`);
}

function ensureNoConsecutiveDuplicatePrimaryEvents(program) {
  const events = Array.isArray(program?.events) ? program.events : [];
  for (let i = 1; i < events.length; i += 1) {
    const previousId = String(events[i - 1]?.templateId || "").trim();
    const currentId = String(events[i]?.templateId || "").trim();
    if (!previousId || !currentId) continue;
    assert(previousId !== currentId, `Expected no consecutive duplicate primary events, but months ${i} and ${i + 1} both used ${currentId}`);
  }
}

const sandbox = {
  window: {},
  console,
  Date,
  Math,
  setTimeout,
  clearTimeout
};

global.window = sandbox.window;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(offeringsPath, "utf8"), sandbox, { filename: "offerings.js" });
vm.runInContext(fs.readFileSync(generatorPath, "utf8"), sandbox, { filename: "programGenerator.js" });

assert(typeof sandbox.window.generateFourMonthProgram === "function", "generateFourMonthProgram not found");

const fixtures = [
  {
    name: "remote_after_5",
    employeeCount: 40,
    monthlyBudget: 2800,
    goals: ["Strengthen team connection", "Boost morale"],
    preferredSchedule: ["Remote"],
    daysSelected: ["Th", "Sa"],
    timesSelected: ["After 5p"]
  },
  {
    name: "in_person_new_orleans",
    employeeCount: 16,
    monthlyBudget: 1900,
    goals: ["Strengthen team connection"],
    preferredSchedule: ["In-person"],
    localCity: "New Orleans",
    daysSelected: ["M", "W", "Sa"],
    timesSelected: ["After 5p"]
  },
  {
    name: "hybrid_wellbeing_lunch",
    employeeCount: 30,
    monthlyBudget: 2400,
    goals: ["Support employee wellbeing", "Improve employee performance"],
    preferredSchedule: ["Hybrid"],
    daysSelected: ["T", "Th", "Sa"],
    timesSelected: ["12-1p"]
  }
];

fixtures.forEach((fixture) => {
  const output = runFixture(sandbox.window, fixture);
  const offeringPool = Array.isArray(sandbox.window.EVENT_OFFERINGS) ? sandbox.window.EVENT_OFFERINGS : [];

  if (isNolaProgram(output)) {
    ensureNolaWeeks(output);
    return; // skip events-based assertions for NOLA path
  }

  ensureKickoffPriorities(output, offeringPool);
  ensureNoConsecutiveDuplicatePrimaryEvents(output);
  if (String(fixture.preferredSchedule?.[0] || "").toLowerCase() === "in-person") {
    ensureCityFiltered(output, fixture.localCity);
  }
  const normalizedSchedule = String(fixture.preferredSchedule?.[0] || "").toLowerCase();
  if (normalizedSchedule === "in-person" || normalizedSchedule === "hybrid") {
    ensureMonthThreeInPerson(output, offeringPool);
  }
});

console.log(`Validated ${fixtures.length} fixtures`);
