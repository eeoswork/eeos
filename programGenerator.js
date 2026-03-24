/**
 * Quarter-aware 4-month program generator.
 *
 * Produces:
 * - `months`: presentation-first month objects used by reveal UI
 * - `events`: compatibility objects for existing month-card interactions
 */

(function initQuarterAwareProgramGenerator() {
  const EVENT_COSTS = {
    free: 0,
    low: 1000,
    mid: 2500,
    high: 4500
  };

  const CORE_FREE_EVENTS = [
    "Coffee Meetup",
    "Lunch DJ",
    "Friday Wind Down",
    "Pet Parade"
  ];

  const TIER_TO_TEMPLATE_ID = {
    low: "evt-7",
    mid: "evt-3",
    high: "evt-4"
  };

  const TIER_TO_FALLBACK_TITLE = {
    low: "Featured Team Event (Light)",
    mid: "Featured Team Event",
    high: "Featured Team Event (Premium)"
  };

  function getQuarter(monthIndex) {
    return Math.floor(monthIndex / 3) + 1;
  }

  function isLateMonth(date) {
    const safeDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(safeDate.getTime())) return false;
    const day = safeDate.getDate();
    const lastDay = new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 0).getDate();
    return (lastDay - day) <= 10;
  }

  function getProgramMonths(currentDate) {
    const base = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
    const months = [];
    for (let i = 0; i < 4; i += 1) {
      const d = new Date(safeBase);
      d.setDate(1);
      d.setMonth(d.getMonth() + i);
      months.push(d);
    }
    return months;
  }

  function getPaidEventTier(budget) {
    const value = Number(budget || 0);
    if (value <= 0) return null;
    if (value < 2000) return "low";
    if (value < 4000) return "mid";
    return "high";
  }

  function roundMoney(value) {
    return Math.max(0, Math.round(Number(value || 0)));
  }

  function getTemplateById(templateId) {
    const templates = Array.isArray(window.EVENT_TEMPLATES) ? window.EVENT_TEMPLATES : [];
    return templates.find((item) => String(item?.id || "") === String(templateId || "")) || null;
  }

  function generateMonthEvents(monthBudget, isKickoffMonth, monthOffset) {
    const freeEventName = CORE_FREE_EVENTS[monthOffset % CORE_FREE_EVENTS.length] || "Coffee Meetup";
    const events = [
      { name: freeEventName, type: "free", cost: EVENT_COSTS.free }
    ];

    if (!isKickoffMonth) {
      const tier = getPaidEventTier(monthBudget);
      if (tier) {
        events.push({
          name: "Featured Team Event",
          type: tier,
          cost: EVENT_COSTS[tier]
        });
      }
    }

    return events;
  }

  function toLegacyMonthEvent(monthIndex, monthData) {
    const monthNumber = monthIndex + 1;
    const monthEvents = Array.isArray(monthData?.events) ? monthData.events : [];
    const paidEvent = monthEvents.find((item) => item?.type && item.type !== "free") || null;
    const tier = paidEvent ? String(paidEvent.type || "").trim() : "";

    if (monthIndex === 0) {
      return {
        month: monthNumber,
        templateId: "evt-8",
        title: "Kickoff",
        description: "Start light to build momentum.",
        type: "rsvp",
        workflowType: "rsvp",
        estimatedCost: 0,
        goals: ["Strengthen team connection"],
        generatedEvents: monthEvents,
        monthBudget: roundMoney(monthData?.budget || 0),
        subtitle: String(monthData?.subtitle || "")
      };
    }

    const templateId = TIER_TO_TEMPLATE_ID[tier] || "evt-2";
    const template = getTemplateById(templateId);
    const title = template?.title || TIER_TO_FALLBACK_TITLE[tier] || "Featured Team Event";
    const description = template?.description || "Featured event selected for this month based on your budget.";
    const estimatedCost = roundMoney(paidEvent?.cost || 0);

    return {
      month: monthNumber,
      templateId,
      title,
      description,
      type: "rsvp",
      workflowType: "rsvp",
      estimatedCost,
      goals: ["Strengthen team connection"],
      generatedEvents: monthEvents,
      monthBudget: roundMoney(monthData?.budget || 0),
      subtitle: String(monthData?.subtitle || "")
    };
  }

  window.generateFourMonthProgram = function generateFourMonthProgram(setupData = {}) {
    const now = new Date();
    const teamSize = Math.max(1, Number(setupData.employeeCount || setupData.teamSize || 1));
    const monthlyBudget = Math.max(0, Number(setupData.monthlyBudget || setupData.totalBudget || 0));

    const months = getProgramMonths(now);
    const weights = [0.3, 1.1, 1.0, 1.2];
    if (isLateMonth(now)) {
      weights[0] = 0.15;
    }

    const maxMonthlyMultiplier = 1.5;
    let carryover = 0;

    const monthRows = months.map((monthDate, index) => {
      const weightedBudget = monthlyBudget * Number(weights[index] || 1);
      const adjustedBudget = Math.min(
        weightedBudget + (carryover * 0.5),
        monthlyBudget * maxMonthlyMultiplier
      );

      const isKickoffMonth = index === 0;
      const events = generateMonthEvents(adjustedBudget, isKickoffMonth, index);
      const spend = events.reduce((sum, item) => sum + Math.max(0, Number(item?.cost || 0)), 0);
      carryover = adjustedBudget - spend;

      const monthName = monthDate.toLocaleString("en-US", { month: "long" });
      const monthQuarter = getQuarter(monthDate.getMonth());
      const monthLabel = isKickoffMonth
        ? `${monthName} - Kickoff`
        : monthName;

      return {
        label: monthLabel,
        month: monthName,
        budget: roundMoney(adjustedBudget),
        events,
        quarter: monthQuarter,
        subtitle: isKickoffMonth
          ? "Start light to build momentum"
          : "Build consistency with one core free touchpoint and one featured event."
      };
    });

    const pepm = teamSize > 0 ? (monthlyBudget / teamSize) : 0;
    const legacyEvents = monthRows.map((monthRow, index) => toLegacyMonthEvent(index, monthRow));
    const totalEstimatedCost = legacyEvents.reduce((sum, item) => sum + Math.max(0, Number(item?.estimatedCost || 0)), 0);
    const totalBudget = roundMoney(monthlyBudget * 4);

    return {
      monthlyBudget: roundMoney(monthlyBudget),
      pepm,
      months: monthRows,
      nextQuarter: monthRows[1]?.quarter || getQuarter((now.getMonth() + 1) % 12),
      totalBudget,
      totalEstimatedCost,
      remainingBudget: Math.max(0, totalBudget - totalEstimatedCost),
      teamSize,
      events: legacyEvents,
      timestamp: new Date().toISOString()
    };
  };

  window.updateConfettiSelection = function updateConfettiSelection(program) {
    return program;
  };
})();
