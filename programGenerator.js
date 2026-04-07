/**
 * Quarter-aware 4-month program generator.
 *
 * Produces:
 * - `months`: presentation-first month objects used by reveal UI
 * - `events`: compatibility objects for existing month-card interactions
 */

(function initQuarterAwareProgramGenerator() {
  const GOAL_KEY_BY_LABEL = {
    "strengthen team connection": "team_connection",
    "improve employee performance": "employee_performance",
    "boost morale": "morale",
    "support employee wellbeing": "wellbeing"
  };

  const INTEREST_KEY_BY_LABEL = {
    "games & competitions": "games_and_competitions",
    "food & drinks": "food_and_drinks",
    volunteering: "volunteering",
    "learning events": "learning_events",
    "social meetups": "social_meetups"
  };

  const KICKOFF_ASYNC_PRIORITY_IDS = [
    "5_day_energy_reset_challenge",
    "clarity_week",
    "focus_thread",
    "ama_teammate_edition"
  ];

  const KICKOFF_REMOTE_PRIORITY_IDS = [
    "coffee_meetup",
    "lunch_and_listen",
    "wind_down"
  ];

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

  function normalizeKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function roundMoney(value) {
    return Math.max(0, Math.round(Number(value || 0)));
  }

  function toGoalKeys(rawGoals) {
    if (!Array.isArray(rawGoals)) return [];
    return rawGoals
      .map((goal) => GOAL_KEY_BY_LABEL[normalizeKey(goal)] || "")
      .filter(Boolean);
  }

  function toInterestKeys(rawInterests) {
    if (!Array.isArray(rawInterests)) return [];
    return rawInterests
      .map((interest) => INTEREST_KEY_BY_LABEL[normalizeKey(interest)] || "")
      .filter(Boolean);
  }

  function normalizeSchedulePreference(rawSchedule) {
    const first = Array.isArray(rawSchedule) && rawSchedule.length
      ? String(rawSchedule[0] || "").trim().toLowerCase()
      : "";
    if (first === "remote" || first === "hybrid") return first;
    return "hybrid";
  }

  function normalizeSelectedDays(rawDays) {
    const map = {
      m: "monday",
      t: "tuesday",
      w: "wednesday",
      th: "thursday",
      f: "friday",
      sa: "saturday",
      saturday: "saturday"
    };
    if (!Array.isArray(rawDays)) return new Set();
    return new Set(
      rawDays
        .map((day) => map[normalizeKey(day)] || "")
        .filter(Boolean)
    );
  }

  function normalizeSelectedTimes(rawTimes) {
    const map = {
      "before 9a": "before_9am",
      "12-1p": "lunch",
      "after 5p": "after_5pm"
    };
    if (!Array.isArray(rawTimes)) return new Set();
    return new Set(
      rawTimes
        .map((time) => map[normalizeKey(time)] || "")
        .filter(Boolean)
    );
  }

  function estimateTotalCost(offering, teamSize) {
    const costPerPerson = Math.max(0, Number(offering?.costPerPerson || 0));
    if (costPerPerson <= 0) return 0;
    return roundMoney(costPerPerson * Math.max(1, Number(teamSize || 1)));
  }

  function getCatalog() {
    const fromRepository = Array.isArray(window.EVENT_OFFERINGS) ? window.EVENT_OFFERINGS : [];
    return fromRepository;
  }

  function findFirstByPriority(catalog, priorityIds, predicate = null) {
    const ids = Array.isArray(priorityIds) ? priorityIds : [];
    const matchesPredicate = typeof predicate === "function"
      ? predicate
      : () => true;

    for (let i = 0; i < ids.length; i += 1) {
      const wantedId = String(ids[i] || "").trim();
      if (!wantedId) continue;
      const found = catalog.find((item) => String(item?.id || "") === wantedId && matchesPredicate(item));
      if (found) return found;
    }

    return null;
  }

  function scoreOffering(offering, preferences, monthIndex, maxBudget = 0) {
    const offeringGoalKeys = Array.isArray(offering?.goalKeys)
      ? offering.goalKeys.map(normalizeKey)
      : [];
    const offeringInterestKeys = Array.isArray(offering?.interestKeys)
      ? offering.interestKeys.map(normalizeKey)
      : [];

    const goalMatches = preferences.goalKeys.filter((key) => offeringGoalKeys.includes(key)).length;
    const interestMatches = preferences.interestKeys.filter((key) => offeringInterestKeys.includes(key)).length;
    const popularity = Number(offering?.popularityScore || 0);
    const noveltyPenalty = preferences.usedIds.has(String(offering?.id || "")) ? 25 : 0;
    const monthBoost = monthIndex === 0 && Number(offering?.costPerPerson || 0) === 0 ? 10 : 0;
    const remoteBoost = preferences.remotePreferred && offering?.inPersonOnly ? -12 : 8;
    const monthlyBudget = Math.max(0, Number(maxBudget || 0));
    let budgetEfficiencyBoost = 0;
    if (monthlyBudget > 0) {
      const totalCost = estimateTotalCost(offering, preferences.teamSize);
      const remainingBudgetRatio = Math.max(0, Math.min(1, (monthlyBudget - totalCost) / monthlyBudget));
      budgetEfficiencyBoost = remainingBudgetRatio * 15;
    }

    return (popularity * 0.7) + (goalMatches * 25) + (interestMatches * 15) + monthBoost + remoteBoost + budgetEfficiencyBoost - noveltyPenalty;
  }

  function chooseOffering(catalog, preferences, options = {}) {
    const requireFree = options.requireFree === true;
    const maxBudget = Number(options.maxBudget || 0);
    const monthIndex = Number(options.monthIndex || 0);
    const forceInPersonOnly = options.forceInPersonOnly === true;
    const allowUsedIds = options.allowUsedIds === true;
    const previousOffering = options.previousOffering || null;
    const weekendsAllowed = preferences.weekendsAllowed === true;

    const isBlockedFocusPair = (candidate) => {
      const previousId = String(previousOffering?.id || "").trim();
      const candidateId = String(candidate?.id || "").trim();
      if (!previousId || !candidateId) return false;
      return (
        (previousId === "focus_thread" && candidateId === "focus_hour") ||
        (previousId === "focus_hour" && candidateId === "focus_thread")
      );
    };

    const passesScheduleFilter = (offering) => {
      if (preferences.schedulePreference === "hybrid") return true;
      if (preferences.schedulePreference === "remote") return offering?.inPersonOnly !== true;
      return true;
    };

    const passesDayFilter = (offering) => {
      if (!preferences.selectedDays.size) return true;
      const day = normalizeKey(offering?.day);
      if (!day || day === "any") return true;
      return preferences.selectedDays.has(day);
    };

    const passesTimeFilter = (offering) => {
      if (!preferences.selectedTimes.size) return true;
      const slot = normalizeKey(offering?.timeSlot);
      if (!slot || slot === "any") return true;
      return preferences.selectedTimes.has(slot);
    };

    const passesCityFilter = (offering) => {
      const requestedCity = normalizeKey(preferences.localCity);
      if (!requestedCity) return true;
      if (offering?.inPersonOnly !== true) return true;
      const city = normalizeKey(offering?.location?.city);
      if (!city) return false;
      return city === requestedCity;
    };

    const filterPasses = [
      { schedule: true, day: true, time: true, city: true },
      { schedule: true, day: true, time: true, city: false },
      { schedule: true, day: true, time: false, city: false },
      { schedule: true, day: false, time: false, city: false },
      { schedule: false, day: false, time: false, city: false }
    ];

    let candidates = [];
    for (let i = 0; i < filterPasses.length; i += 1) {
      const pass = filterPasses[i];
      candidates = catalog.filter((offering) => {
        const offeringId = String(offering?.id || "").trim();
        const offeringDay = normalizeKey(offering?.day);
        const isSaturdayEvent = offeringDay === "saturday";
        const isWeekendFlagged = offering?.includeWeekends === true;
        if (!allowUsedIds && offeringId && preferences.usedIds.has(offeringId)) return false;
        if (isBlockedFocusPair(offering)) return false;
        if (!weekendsAllowed && (isSaturdayEvent || isWeekendFlagged)) return false;
        const totalCost = estimateTotalCost(offering, preferences.teamSize);
        if (requireFree && totalCost > 0) return false;
        if (!requireFree && maxBudget > 0 && totalCost > (maxBudget * 1.15)) return false;
        if (forceInPersonOnly && offering?.inPersonOnly !== true) return false;
        if (pass.schedule && !passesScheduleFilter(offering)) return false;
        if (pass.day && !passesDayFilter(offering)) return false;
        if (pass.time && !passesTimeFilter(offering)) return false;
        if (pass.city && !passesCityFilter(offering)) return false;
        return true;
      });
      if (candidates.length) break;
    }

    const ranked = candidates
      .map((offering) => ({
        offering,
        score: scoreOffering(offering, preferences, monthIndex, maxBudget),
        totalCost: estimateTotalCost(offering, preferences.teamSize)
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
        return String(a.offering?.title || "").localeCompare(String(b.offering?.title || ""));
      });

    return ranked.length ? ranked[0] : null;
  }

  function toGeneratedEvent(offering, teamSize) {
    return {
      name: String(offering?.title || "Team Event"),
      type: Number(offering?.costPerPerson || 0) > 0 ? "paid" : "free",
      cost: estimateTotalCost(offering, teamSize)
    };
  }

  function toDescription(offering, fallbackText) {
    const description = String(offering?.description || "").trim();
    if (description) return description;
    return fallbackText;
  }

  function toTitle(offering, fallbackTitle) {
    const title = String(offering?.title || "").trim();
    if (title) return title;
    return fallbackTitle;
  }

  function toSubtitle(monthIndex) {
    if (monthIndex === 0) return "Start light to build momentum";
    return "Balanced monthly event selected from your repository using budget and setup preferences.";
  }

  function toWorkflowType(offering) {
    const workflowType = String(offering?.workflowType || "").trim().toLowerCase();
    if (workflowType === "poll" || workflowType === "straight-to-promote") return workflowType;
    return "rsvp";
  }

  function toLegacyMonthEvent(monthIndex, monthData) {
    const monthNumber = monthIndex + 1;
    const selected = monthData?.selectedOffering || null;

    return {
      month: monthNumber,
      templateId: String(selected?.id || `generated-month-${monthNumber}`),
      title: toTitle(selected, monthIndex === 0 ? "Kickoff" : "Featured Team Event"),
      description: toDescription(selected, monthIndex === 0
        ? "Start light to build momentum."
        : "Featured event selected for this month based on your budget and goals."),
      type: "rsvp",
      workflowType: toWorkflowType(selected),
      estimatedCost: roundMoney(monthData?.estimatedCost || 0),
      goals: Array.isArray(selected?.goals) && selected.goals.length
        ? [...selected.goals]
        : ["Strengthen team connection"],
      generatedEvents: Array.isArray(monthData?.events) ? monthData.events : [],
      monthBudget: roundMoney(monthData?.budget || 0),
      subtitle: String(monthData?.subtitle || ""),
      url: String(selected?.registrationLink || selected?.vendorUrl || "").trim()
    };
    }

  // ── New Orleans preset ──────────────────────────────────────────────────────
  // Detects common spellings of "New Orleans" entered by the user.
  function isNolaCity(city) {
    const stripped = String(city || "").trim().toLowerCase().replace(/[\s.,]+/g, "");
    return (
      stripped === "nola" ||
      stripped === "no" ||
      stripped === "neworleans" ||
      stripped === "neworleanslouisiana" ||
      stripped === "neworleansla" ||
      stripped.startsWith("neworleans")
    );
  }

  function buildWeeksProgramResult(weeks, monthlyBudget, teamSize, now) {
    const pepm = teamSize > 0 ? monthlyBudget / teamSize : 0;
    const totalEstimatedCost = weeks.reduce((sum, week) => sum + Math.max(0, Number(week.estimatedCost || 0)), 0);
    return {
      monthlyBudget: roundMoney(monthlyBudget),
      pepm,
      weeks,
      nextQuarter: getQuarter((now.getMonth() + 1) % 12),
      totalBudget: roundMoney(monthlyBudget * 3),
      totalEstimatedCost,
      remainingBudget: Math.max(0, roundMoney(monthlyBudget * 3) - totalEstimatedCost),
      teamSize,
      months: [],
      events: [],
      timestamp: new Date().toISOString()
    };
  }

  function toWeekEvent(offering, weekNumber, teamSize) {
    return {
      week: weekNumber,
      templateId: String(offering?.id || ""),
      title: String(offering?.title || ""),
      description: String(offering?.description || ""),
      estimatedCost: roundMoney(estimateTotalCost(offering || {}, teamSize)),
      goals: Array.isArray(offering?.goals) ? [...offering.goals] : [],
      workflowType: toWorkflowType(offering),
      url: String(offering?.registrationLink || offering?.vendorUrl || ""),
      isLaunchReady: weekNumber === 1,
      formatCapability: String(offering?.formatCapability || ""),
      inPersonOnly: offering?.inPersonOnly === true,
      adminLoad: String(offering?.adminLoad || ""),
      deliveryMode: String(offering?.deliveryMode || ""),
      durationMinutes: Number(offering?.durationMinutes || 0)
    };
  }

  function buildVirtualOnlyWeeks(catalog, preferences, teamSize, monthlyBudget) {
    const asyncFreePool = catalog.filter(
      (o) => normalizeKey(o.formatCapability) === "async_slack" && estimateTotalCost(o, teamSize) === 0
    );
    const remoteFreePool = catalog.filter(
      (o) => normalizeKey(o.formatCapability) === "remote_only" && estimateTotalCost(o, teamSize) === 0
    );
    const remotePaidPool = catalog.filter((o) => {
      const fmt = normalizeKey(o.formatCapability);
      const totalCost = estimateTotalCost(o, teamSize);
      return fmt === "remote_only" && totalCost > 0 && totalCost <= monthlyBudget;
    });

    const pickAsyncFree = (usedIds, monthIndex, previousOffering = null, preferredIds = []) => {
      const prioritized = findFirstByPriority(asyncFreePool, preferredIds, (item) => !usedIds.has(String(item?.id || "")));
      if (prioritized) return prioritized;
      const prefs = { ...preferences, usedIds: new Set(usedIds) };
      let pick = chooseOffering(asyncFreePool, prefs, {
        requireFree: true,
        monthIndex,
        previousOffering
      });
      if (!pick?.offering) {
        pick = chooseOffering(asyncFreePool, prefs, {
          requireFree: true,
          monthIndex,
          allowUsedIds: true,
          previousOffering
        });
      }
      return pick?.offering || prioritized || asyncFreePool[0] || null;
    };

    const pickRemoteFree = (usedIds, monthIndex, preferredIds = []) => {
      const prioritized = findFirstByPriority(remoteFreePool, preferredIds, (item) => !usedIds.has(String(item?.id || "")));
      if (prioritized) return prioritized;
      const prefs = { ...preferences, usedIds: new Set(usedIds) };
      let pick = chooseOffering(remoteFreePool, prefs, {
        requireFree: true,
        monthIndex
      });
      if (!pick?.offering) {
        pick = chooseOffering(remoteFreePool, prefs, {
          requireFree: true,
          monthIndex,
          allowUsedIds: true
        });
      }
      return pick?.offering || prioritized || remoteFreePool[0] || null;
    };

    const pickRemotePaid = (usedIds, monthIndex) => {
      const prefs = { ...preferences, usedIds: new Set(usedIds) };
      let pick = chooseOffering(remotePaidPool, prefs, {
        requireFree: false,
        maxBudget: monthlyBudget,
        monthIndex
      });
      if (!pick?.offering) {
        pick = chooseOffering(remotePaidPool, prefs, {
          requireFree: false,
          maxBudget: monthlyBudget,
          monthIndex,
          allowUsedIds: true
        });
      }
      return pick?.offering || remotePaidPool[0] || null;
    };

    const usedIds = new Set();
    const slotOfferings = [];
    const week1 = pickAsyncFree(usedIds, 0, null, KICKOFF_ASYNC_PRIORITY_IDS);
    if (week1?.id) usedIds.add(String(week1.id));
    slotOfferings.push(week1);

    const week2 = pickRemoteFree(usedIds, 1, KICKOFF_REMOTE_PRIORITY_IDS);
    if (week2?.id) usedIds.add(String(week2.id));
    slotOfferings.push(week2);

    const week3 = pickAsyncFree(usedIds, 2, week1, ["ama_teammate_edition", "focus_thread", "the_reset_hour"]);
    if (week3?.id) usedIds.add(String(week3.id));
    slotOfferings.push(week3);

    const week4 = pickRemotePaid(usedIds, 3);
    if (week4?.id) usedIds.add(String(week4.id));
    slotOfferings.push(week4);

    const week5 = pickAsyncFree(usedIds, 4, week3, ["clarity_week", "wins_of_the_week", "show_and_tell"]);
    if (week5?.id) usedIds.add(String(week5.id));
    slotOfferings.push(week5);

    const week6 = pickRemoteFree(usedIds, 5, ["lunch_and_listen", "friday_wind_down", "throwback_thursday"]);
    if (week6?.id) usedIds.add(String(week6.id));
    slotOfferings.push(week6);

    const week7 = pickAsyncFree(usedIds, 6, week5, ["pet_parade", "idea_walk", "show_and_tell"]);
    if (week7?.id) usedIds.add(String(week7.id));
    slotOfferings.push(week7);

    const week8 = pickRemotePaid(usedIds, 7);
    if (week8?.id) usedIds.add(String(week8.id));
    slotOfferings.push(week8);

    const week9 = pickAsyncFree(usedIds, 8, week7, ["clarity_week", "wins_of_the_week", "the_reset_hour"]);
    if (week9?.id) usedIds.add(String(week9.id));
    slotOfferings.push(week9);

    const week10 = pickRemoteFree(usedIds, 9, ["lunch_and_listen", "friday_wind_down", "throwback_thursday"]);
    if (week10?.id) usedIds.add(String(week10.id));
    slotOfferings.push(week10);

    const week11 = pickAsyncFree(usedIds, 10, week9, ["idea_walk", "show_and_tell", "wins_of_the_week"]);
    if (week11?.id) usedIds.add(String(week11.id));
    slotOfferings.push(week11);

    const week12 = pickRemotePaid(usedIds, 11);
    slotOfferings.push(week12);

    return slotOfferings.map((offering, index) => toWeekEvent(offering, index + 1, teamSize));
  }

  // Builds the fixed 12-week NOLA program.
  // Hybrid keeps the existing in-person pattern; remote keeps the same cadence
  // but uses premium remote paid events in weeks 4, 8, and 12.
  function buildNolaWeeks(catalog, preferences, teamSize, monthlyBudget) {
    const fixedIds = new Set([
      "5_day_energy_reset_challenge",
      "coffee_meetup",
      "ama_teammate_edition",
      "wats_may6",
      "pet_parade",
      "clarity_week",
      "lunch_and_listen",
      "throwback_thursday",
      "green_light_new_orleans",
      "trivia_monday_second_line_7p",
      "trivia_tuesday_urban_south_6_30p",
      "trivia_wednesday_mcyc_7_30p",
      "trivia_thursday_port_orleans_7_30p"
    ]);

    function findById(id) {
      return catalog.find((o) => String(o.id || "") === id) || null;
    }

    const remoteFreePool = catalog.filter(
      (o) => normalizeKey(o.formatCapability) === "remote_only" && estimateTotalCost(o, teamSize) === 0
    );

    const pickFreeRemoteOffering = (usedIds, monthIndex, preferredIds = []) => {
      const prioritized = findFirstByPriority(remoteFreePool, preferredIds, (item) => !usedIds.has(String(item?.id || "")));
      if (prioritized) return prioritized;
      const prefs = { ...preferences, usedIds: new Set(usedIds || []) };
      let pick = chooseOffering(remoteFreePool, prefs, {
        requireFree: true,
        monthIndex
      });
      if (!pick?.offering) {
        pick = chooseOffering(remoteFreePool, prefs, {
          requireFree: true,
          monthIndex,
          allowUsedIds: true
        });
      }
      return pick?.offering || remoteFreePool[0] || null;
    };

    // Week 5: async event, goals-aligned, not already a fixed slot
    const asyncPool = catalog.filter(
      (o) => normalizeKey(o.formatCapability) === "async_slack" && !fixedIds.has(String(o.id || ""))
    );
    const week5Prefs = { ...preferences, usedIds: new Set(fixedIds) };
    const week5Pick = chooseOffering(asyncPool, week5Prefs, {
      requireFree: true,
      monthIndex: 4
    });
    const week5Offering = week5Pick?.offering || null;
    const isRemoteOnlyNola = preferences.schedulePreference === "remote";

    // Premium remote event helper for fixed premium weeks.
    const pickPremiumRemoteOffering = (usedIds, monthIndex) => {
      const pool = catalog.filter((o) => {
        const fmt = normalizeKey(o.formatCapability);
        const cost = Number(o.costPerPerson || 0);
        const totalCost = estimateTotalCost(o, teamSize);
        return fmt === "remote_only" && cost > 0 && totalCost <= monthlyBudget;
      });
      const prefs = { ...preferences, usedIds: new Set(usedIds || []) };
      const pick = chooseOffering(pool, prefs, {
        requireFree: false,
        maxBudget: monthlyBudget,
        monthIndex
      });
      return pick?.offering || null;
    };

    const remotePremiumPool = catalog.filter((o) => {
      const fmt = normalizeKey(o.formatCapability);
      const cost = Number(o.costPerPerson || 0);
      const totalCost = estimateTotalCost(o, teamSize);
      return fmt === "remote_only" && cost > 0 && totalCost <= monthlyBudget;
    });

    // Week 8: premium remote event, goals-aligned, in budget
    const week8UsedIds = new Set(fixedIds);
    if (week5Offering?.id) week8UsedIds.add(String(week5Offering.id));
    const week8Prefs = { ...preferences, usedIds: week8UsedIds };
    const week8Pick = chooseOffering(remotePremiumPool, week8Prefs, {
      requireFree: false,
      maxBudget: monthlyBudget,
      monthIndex: 7
    });
    const week8Offering = week8Pick?.offering || null;

    const hasSaturday = preferences.selectedDays instanceof Set && preferences.selectedDays.has("saturday");
    let week12Offering;
    if (hasSaturday) {
      week12Offering = findById("green_light_new_orleans");
    } else {
      const triviaByDay = {
        monday: "trivia_monday_second_line_7p",
        tuesday: "trivia_tuesday_urban_south_6_30p",
        wednesday: "trivia_wednesday_mcyc_7_30p",
        thursday: "trivia_thursday_port_orleans_7_30p"
      };
      const dayPriority = ["monday", "tuesday", "wednesday", "thursday"];
      const matchedDay = dayPriority.find(
        (d) => preferences.selectedDays instanceof Set && preferences.selectedDays.has(d)
      );
      week12Offering = findById(matchedDay ? triviaByDay[matchedDay] : "trivia_thursday_port_orleans_7_30p");
    }

    const week6UsedIds = new Set(fixedIds);
    if (week5Offering?.id) week6UsedIds.add(String(week5Offering.id));
    const week6Offering = pickFreeRemoteOffering(week6UsedIds, 5, ["lunch_and_listen", "friday_wind_down", "throwback_thursday"]);

    const week9UsedIds = new Set(week6UsedIds);
    if (week6Offering?.id) week9UsedIds.add(String(week6Offering.id));
    if (week8Offering?.id) week9UsedIds.add(String(week8Offering.id));
    const week9Prefs = { ...preferences, usedIds: week9UsedIds };
    let week9Pick = chooseOffering(asyncPool, week9Prefs, {
      requireFree: true,
      monthIndex: 8,
      previousOffering: findById("pet_parade")
    });
    if (!week9Pick?.offering) {
      week9Pick = chooseOffering(asyncPool, week9Prefs, {
        requireFree: true,
        monthIndex: 8,
        allowUsedIds: true,
        previousOffering: findById("pet_parade")
      });
    }
    const week9Offering = week9Pick?.offering || findById("clarity_week") || null;

    const week10UsedIds = new Set(week9UsedIds);
    if (week9Offering?.id) week10UsedIds.add(String(week9Offering.id));
    const week10Offering = pickFreeRemoteOffering(week10UsedIds, 9, ["lunch_and_listen", "friday_wind_down", "throwback_thursday"]);

    const week11UsedIds = new Set(week10UsedIds);
    if (week10Offering?.id) week11UsedIds.add(String(week10Offering.id));
    let week11Pick = chooseOffering(asyncPool, { ...preferences, usedIds: week11UsedIds }, {
      requireFree: true,
      monthIndex: 10,
      previousOffering: week9Offering
    });
    if (!week11Pick?.offering) {
      week11Pick = chooseOffering(asyncPool, { ...preferences, usedIds: week11UsedIds }, {
        requireFree: true,
        monthIndex: 10,
        allowUsedIds: true,
        previousOffering: week9Offering
      });
    }
    const week11Offering = week11Pick?.offering || findById("idea_walk") || null;

    let week4Offering = findById("wats_may6");
    if (isRemoteOnlyNola) {
      return buildVirtualOnlyWeeks(catalog, preferences, teamSize, monthlyBudget);
    }

    const slotOfferings = [
      findById("5_day_energy_reset_challenge"), // week 1
      findById("coffee_meetup"),                // week 2
      findById("ama_teammate_edition"),          // week 3
      week4Offering,                             // week 4
      week5Offering,                             // week 5 — dynamic async
      week6Offering,                             // week 6 — remote free
      findById("pet_parade"),                    // week 7
      week8Offering,                             // week 8 — dynamic premium remote
      week9Offering,                             // week 9 — dynamic async
      week10Offering,                            // week 10 — remote free
      week11Offering,                            // week 11 — dynamic async
      week12Offering                             // week 12 — in-person event
    ];

    return slotOfferings.map((offering, slotIndex) => toWeekEvent(offering, slotIndex + 1, teamSize));
  }
  // ─────────────────────────────────────────────────────────────────────────────

  window.generateFourMonthProgram = function generateFourMonthProgram(setupData = {}) {
    const now = new Date();
    const teamSize = Math.max(1, Number(setupData.employeeCount || setupData.teamSize || 1));
    const monthlyBudget = Math.max(0, Number(setupData.monthlyBudget || setupData.totalBudget || 0));
    const catalog = getCatalog();
    const selectedDays = normalizeSelectedDays(setupData.daysSelected);
    const preferences = {
      teamSize,
      goalKeys: toGoalKeys(Array.isArray(setupData.goals) ? setupData.goals : []),
      interestKeys: toInterestKeys(Array.isArray(setupData.interests) ? setupData.interests : []),
      schedulePreference: normalizeSchedulePreference(setupData.preferredSchedule),
      selectedDays,
      selectedTimes: normalizeSelectedTimes(setupData.timesSelected),
      localCity: String(setupData.localCity || "").trim(),
      weekendsAllowed: selectedDays.has("saturday"),
      remotePreferred: true,
      usedIds: new Set()
    };

    const kickoffWeekOne = findFirstByPriority(
      catalog,
      KICKOFF_ASYNC_PRIORITY_IDS,
      (item) => estimateTotalCost(item, teamSize) === 0 && normalizeKey(item?.formatCapability) === "async_slack"
    );
    const kickoffWeekTwo = findFirstByPriority(
      catalog,
      KICKOFF_REMOTE_PRIORITY_IDS,
      (item) => estimateTotalCost(item, teamSize) === 0 && normalizeKey(item?.formatCapability) === "remote_only"
    );

    if (preferences.schedulePreference === "remote") {
      return buildWeeksProgramResult(buildVirtualOnlyWeeks(catalog, preferences, teamSize, monthlyBudget), monthlyBudget, teamSize, now);
    }

    // ── NOLA preset: return fixed 12-week program for New Orleans hybrid teams ──
    const isNolaContext = preferences.schedulePreference === "hybrid" && isNolaCity(preferences.localCity);
    if (isNolaContext) {
      return buildWeeksProgramResult(buildNolaWeeks(catalog, preferences, teamSize, monthlyBudget), monthlyBudget, teamSize, now);
    }
    // ─────────────────────────────────────────────────────────────────────────────

    const months = getProgramMonths(now);
    const weights = [0.3, 1.1, 1.0, 1.2];
    if (isLateMonth(now)) {
      weights[0] = 0.15;
    }

    const maxMonthlyMultiplier = 1.5;
    let carryover = 0;

    const freePool = catalog.filter((item) => estimateTotalCost(item, teamSize) === 0);
    const requiresMonthThreeInPerson = preferences.schedulePreference === "hybrid";

    const monthRows = months.map((monthDate, index) => {
      const weightedBudget = monthlyBudget * Number(weights[index] || 1);
      const adjustedBudget = Math.min(
        weightedBudget + (carryover * 0.5),
        monthlyBudget * maxMonthlyMultiplier
      );

      const isKickoffMonth = index === 0;
      const fallbackFree = freePool.length
        ? freePool[index % freePool.length]
        : { id: `free-fallback-${index}`, title: "Coffee Meetup", costPerPerson: 0, goals: ["Strengthen team connection"], workflowType: "rsvp", type: "rsvp" };
      const kickoffChoice = chooseOffering(catalog, preferences, {
        requireFree: true,
        monthIndex: index
      });
      const selectedFree = isKickoffMonth && kickoffChoice ? kickoffChoice.offering : fallbackFree;

      if (isKickoffMonth && kickoffWeekOne?.id) {
        preferences.usedIds.add(String(kickoffWeekOne.id));
      }
      if (isKickoffMonth && kickoffWeekTwo?.id) {
        preferences.usedIds.add(String(kickoffWeekTwo.id));
      }

      let paidChoice = null;
      if (!isKickoffMonth) {
        paidChoice = chooseOffering(catalog, preferences, {
          requireFree: false,
          maxBudget: adjustedBudget,
          monthIndex: index,
          forceInPersonOnly: requiresMonthThreeInPerson && index === 2
        });

        if (!paidChoice) {
          paidChoice = chooseOffering(catalog, preferences, {
            requireFree: false,
            maxBudget: adjustedBudget,
            monthIndex: index,
            forceInPersonOnly: requiresMonthThreeInPerson && index === 2,
            allowUsedIds: true
          });
        }
      }

      const selectedPaid = paidChoice ? paidChoice.offering : null;
      const events = [];

      if (isKickoffMonth) {
        const weekOne = kickoffWeekOne || selectedFree;
        const weekTwo = kickoffWeekTwo || selectedFree;
        if (weekOne) events.push(toGeneratedEvent(weekOne, teamSize));
        if (weekTwo) events.push(toGeneratedEvent(weekTwo, teamSize));
      } else {
        events.push(toGeneratedEvent(selectedFree, teamSize));
        if (selectedPaid && estimateTotalCost(selectedPaid, teamSize) > 0) {
          events.push(toGeneratedEvent(selectedPaid, teamSize));
        }
      }

      let monthThreeInPersonFallback = null;
      if (!isKickoffMonth && requiresMonthThreeInPerson && index === 2 && !selectedPaid) {
        let monthThreeFallback = chooseOffering(catalog, preferences, {
          requireFree: true,
          monthIndex: index,
          forceInPersonOnly: true
        });
        if (!monthThreeFallback) {
          monthThreeFallback = chooseOffering(catalog, preferences, {
            requireFree: true,
            monthIndex: index,
            forceInPersonOnly: true,
            allowUsedIds: true
          });
        }
        if (monthThreeFallback?.offering) {
          monthThreeInPersonFallback = monthThreeFallback.offering;
          events.push(toGeneratedEvent(monthThreeFallback.offering, teamSize));
          preferences.usedIds.add(String(monthThreeFallback.offering.id || ""));
        }
      }

      const spend = events.reduce((sum, item) => sum + Math.max(0, Number(item?.cost || 0)), 0);
      carryover = adjustedBudget - spend;

      if (selectedFree?.id) preferences.usedIds.add(String(selectedFree.id));
      if (selectedPaid?.id) preferences.usedIds.add(String(selectedPaid.id));

      const monthName = monthDate.toLocaleString("en-US", { month: "long" });
      const monthQuarter = getQuarter(monthDate.getMonth());
      const monthLabel = isKickoffMonth
        ? `${monthName} - Kickoff`
        : monthName;

      const primarySelection = isKickoffMonth
        ? (kickoffWeekOne || selectedFree)
        : (selectedPaid || monthThreeInPersonFallback || selectedFree);

      return {
        label: monthLabel,
        month: monthName,
        budget: roundMoney(adjustedBudget),
        events,
        selectedOffering: primarySelection,
        estimatedCost: roundMoney(spend),
        quarter: monthQuarter,
        subtitle: toSubtitle(index)
      };
    });

    const pepm = teamSize > 0 ? (monthlyBudget / teamSize) : 0;
    const legacyEvents = monthRows.map((monthRow, index) => toLegacyMonthEvent(index, monthRow));
    const totalEstimatedCost = legacyEvents.reduce((sum, item) => sum + Math.max(0, Number(item?.estimatedCost || 0)), 0);
    const totalBudget = roundMoney(monthlyBudget * 3);

    // Build 12 weekly event slots — one event per week, weeks 1–12.
    // Weeks 1 & 2 are always the kickoff free events.
    // Weeks 3–12 are scored selections, one per week, no repeats.
    const weeklyUsedIds = new Set(preferences.usedIds);
    const weeklySelections = [kickoffWeekOne, kickoffWeekTwo].filter(Boolean);

    for (let w = 3; w <= 12; w++) {
      const forceInPerson = requiresMonthThreeInPerson && w === 10;
      const weekPrefs = { ...preferences, usedIds: weeklyUsedIds };
      const previousOffering = weeklySelections.length ? weeklySelections[weeklySelections.length - 1] : null;
      let pick = chooseOffering(catalog, weekPrefs, {
        requireFree: false,
        maxBudget: monthlyBudget,
        monthIndex: w - 1,
        forceInPersonOnly: forceInPerson,
        previousOffering
      });
      if (!pick) {
        pick = chooseOffering(catalog, weekPrefs, {
          requireFree: false,
          maxBudget: monthlyBudget,
          monthIndex: w - 1,
          forceInPersonOnly: forceInPerson,
          allowUsedIds: true,
          previousOffering
        });
      }
      if (pick?.offering) {
        weeklySelections.push(pick.offering);
        weeklyUsedIds.add(String(pick.offering.id || ""));
      }
    }

    const weeks = weeklySelections.slice(0, 12).map((offering, slotIndex) => ({
      week: slotIndex + 1,
      templateId: String(offering?.id || ""),
      title: String(offering?.title || ""),
      description: String(offering?.description || ""),
      estimatedCost: roundMoney(estimateTotalCost(offering, teamSize)),
      goals: Array.isArray(offering?.goals) ? [...offering.goals] : [],
      workflowType: toWorkflowType(offering),
      url: String(offering?.registrationLink || offering?.vendorUrl || ""),
      isLaunchReady: slotIndex === 0,
      formatCapability: String(offering?.formatCapability || ""),
      inPersonOnly: offering?.inPersonOnly === true,
      adminLoad: String(offering?.adminLoad || ""),
      deliveryMode: String(offering?.deliveryMode || ""),
      durationMinutes: Number(offering?.durationMinutes || 0)
    }));

    return {
      monthlyBudget: roundMoney(monthlyBudget),
      pepm,
      months: monthRows,
      weeks,
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
