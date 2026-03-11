/**
 * PROGRAM GENERATOR - 4-Month Employee Experience Program
 * Generates a bundled 4-month event program optimized for employer goals and budget
 * 
 * Input: Setup data (goals, budget, team size) + event templates
 * Output: Recommended 4-month program with scoring rationale
 */

/**
 * Main function: Generate a 4-month Employee Experience Program
 * @param {Object} setupData - Admin setup configuration
 * @param {number} setupData.monthlyBudget - Monthly budget (per-person or total, based on budgetMode)
 * @param {number} setupData.employeeCount - Team size
 * @param {number} setupData.teamSize - Alias for employeeCount
 * @param {string} setupData.budgetMode - 'total' or 'perEmployee'
 * @param {Array<string>} setupData.goals - Admin selected goals (e.g., ['Retention & Engagement', 'Team Connection'])
 * @param {Array<string>} setupData.teamPreferenceEstimate - Admin interest preferences
 * @param {boolean} setupData.preferredSchedule - Preferred schedule types (optional)
 * @returns {Object} Program object with 4 months of events and budget summary
 */
window.generateFourMonthProgram = function(setupData) {
  // ===== SETUP VALIDATION & BUDGET CALCULATION =====
  
  const teamSize = setupData.employeeCount || setupData.teamSize || 50;
  const monthlyBudget = setupData.monthlyBudget || 1200;
  const budgetMode = setupData.budgetMode || 'total'; // Assume monthlyBudget is total if not specified
  
  // Calculate total 4-month budget
  const totalBudget = monthlyBudget * 4;
  
  const adminGoals = setupData.goals || [];
  const adminInterests = setupData.teamPreferenceEstimate || [];
  
  // ===== EVENT SCORING FUNCTION =====
  
  /**
   * Score a single event against setup criteria
   * Formula: (goalMatch × 3) + (interestMatch × 2) + (budgetFit × 2)
   */
  function scoreEvent(event, usedCategories = new Set()) {
    // Goal matching (0-3 points)
    const goalMatches = event.goals.filter(g => adminGoals.includes(g)).length;
    const goalMatch = Math.min(goalMatches, 3);
    
    // Interest category bonus (0-2 points)
    // Subtract points if category already used (variety constraint)
    const newCategories = event.interestCategories.filter(cat => !usedCategories.has(cat));
    const interestMatch = newCategories.length > 0 ? 1 : 0;
    
    // Budget fitness (0-2 points)
    const estimatedCost = event.costPerPerson * teamSize;
    const budgetFit = estimatedCost <= monthlyBudget ? 2 : 1;
    
    const score = (goalMatch * 3) + (interestMatch * 2) + budgetFit;
    
    return {
      score,
      goalMatch,
      interestMatch,
      budgetFit,
      estimatedCost
    };
  }
  
  // ===== MONTH 1, 3, 4 SELECTION (Non-Confetti) =====
  
  function selectNonConfettiEvent(month, availableEvents, usedCategories, remainingBudget) {
    // Filter compatible events
    const candidates = availableEvents
      .filter(e => !e.isConfetti)
      .filter(e => (e.costPerPerson * teamSize) <= remainingBudget)
      .map(e => ({
        ...e,
        ...scoreEvent(e, usedCategories)
      }))
      .sort((a, b) => b.score - a.score);
    
    if (candidates.length === 0) {
      return null;
    }
    
    const selected = candidates[0];
    
    // Mark categories as used for variety
    selected.interestCategories.forEach(cat => usedCategories.add(cat));
    
    return {
      month,
      templateId: selected.id,
      title: selected.title,
      description: selected.description,
      type: selected.type,
      estimatedCost: selected.estimatedCost,
      score: selected.score,
      goals: selected.goals
    };
  }
  
  // ===== MONTH 2 SELECTION (Confetti Options) =====
  
  function selectConfettiOptions() {
    const confettiEvents = window.EVENT_TEMPLATES
      .filter(e => e.isConfetti)
      .map(e => ({
        ...e,
        ...scoreEvent(e)
      }))
      .sort((a, b) => b.score - a.score);
    
    // Return top 3 Confetti options
    return confettiEvents.slice(0, 3).map(e => ({
      templateId: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      estimatedCost: e.costPerPerson * teamSize,
      score: e.score,
      goals: e.goals
    }));
  }
  
  // ===== GENERATE 4-MONTH PROGRAM =====
  
  const usedCategories = new Set();
  let remainingBudget = totalBudget;
  const events = [];
  
  // Month 1
  const month1Event = selectNonConfettiEvent(1, window.EVENT_TEMPLATES, usedCategories, remainingBudget);
  if (month1Event) {
    events.push(month1Event);
    remainingBudget -= month1Event.estimatedCost;
  }
  
  // Month 2 (Confetti with 3 options)
  const confettiOptions = selectConfettiOptions();
  events.push({
    month: 2,
    isConfettiMonth: true,
    confettiOptions,
    estimatedCost: 0 // User selects one, cost TBD
  });
  // Don't deduct budget yet; depends on which Confetti is picked
  
  // Month 3
  const month3Event = selectNonConfettiEvent(3, window.EVENT_TEMPLATES, usedCategories, remainingBudget);
  if (month3Event) {
    events.push(month3Event);
    remainingBudget -= month3Event.estimatedCost;
  }
  
  // Month 4
  const month4Event = selectNonConfettiEvent(4, window.EVENT_TEMPLATES, usedCategories, remainingBudget);
  if (month4Event) {
    events.push(month4Event);
    remainingBudget -= month4Event.estimatedCost;
  }
  
  // ===== CALCULATE TOTALS =====
  
  let totalEstimatedCost = 0;
  events.forEach(e => {
    if (!e.isConfettiMonth && e.estimatedCost) {
      totalEstimatedCost += e.estimatedCost;
    }
  });
  
  // ===== RETURN PROGRAM =====
  
  return {
    totalBudget,
    monthlyBudget,
    totalEstimatedCost,
    events,
    teamSize,
    remainingBudget: Math.max(0, remainingBudget),
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper: When user selects a Confetti event in Month 2, 
 * update the program with actual cost
 */
window.updateConfettiSelection = function(program, selectedConfettiId) {
  const confettiEvent = program.events.find(e => e.isConfettiMonth);
  if (!confettiEvent) return program;
  
  const template = window.EVENT_TEMPLATES.find(t => t.id === selectedConfettiId);
  if (!template) return program;
  
  const estimatedCost = template.costPerPerson * program.teamSize;
  
  // Update month 2 with selected event
  confettiEvent.selectedTemplateId = template.id;
  confettiEvent.selectedTitle = template.title;
  confettiEvent.selectedType = template.type;
  confettiEvent.estimatedCost = estimatedCost;
  
  // Recalculate totals
  let totalEstimatedCost = 0;
  program.events.forEach(e => {
    if (e.estimatedCost > 0) {
      totalEstimatedCost += e.estimatedCost;
    }
  });
  
  program.totalEstimatedCost = totalEstimatedCost;
  program.remainingBudget = Math.max(0, program.totalBudget - totalEstimatedCost);
  
  return program;
};
