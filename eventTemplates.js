/**
 * EVENT_TEMPLATES - Master repository of event templates
 * Used by the 4-month program generator to recommend bundled events
 * 
 * Maps to landing page goals and interests:
 * Goals: "Strengthen team connection", "Improve employee performance", "Boost morale", "Support employee wellbeing"
 * Interests: "Games & competitions", "Food & drinks", "Volunteering", "Learning events", "Social meetups"
 */

window.EVENT_TEMPLATES = [
  // ===== CORE EVENTS (Non-Confetti) =====
  
  {
    id: "evt-1",
    title: "Team Trivia Championship",
    description: "Live trivia competition for team bonding and friendly competition.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Strengthen team connection", "Boost morale"],
    interestCategories: ["Games & competitions", "Social meetups"],
    costPerPerson: 35,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://teambuilding.com/team-building/virtual",
    facilitation_kit: null
  },
  
  {
    id: "evt-2",
    title: "Mindfulness & Wellness Workshop",
    description: "Guided wellness and stress management session for team wellbeing.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Support employee wellbeing", "Boost morale"],
    interestCategories: ["Learning events", "Social meetups"],
    costPerPerson: 20,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-3",
    title: "Creative Problem-Solving Challenge",
    description: "Hands-on team challenge to boost creativity and collaborative performance.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Improve employee performance", "Strengthen team connection"],
    interestCategories: ["Games & competitions", "Learning events"],
    costPerPerson: 42,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.kraftylab.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-4",
    title: "Cooking Class & Team Dinner",
    description: "Virtual cooking experience where teams create and share a meal together.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Strengthen team connection", "Boost morale"],
    interestCategories: ["Food & drinks", "Social meetups"],
    costPerPerson: 45,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-5",
    title: "Professional Development Workshop",
    description: "Skill-building session focused on career growth and team effectiveness.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Improve employee performance", "Support employee wellbeing"],
    interestCategories: ["Learning events"],
    costPerPerson: 25,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://calendar.google.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-6",
    title: "Community Volunteering Initiative",
    description: "Team volunteering opportunity supporting local community causes.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Strengthen team connection", "Support employee wellbeing"],
    interestCategories: ["Volunteering", "Social meetups"],
    costPerPerson: 0,
    remoteCompatible: false,
    isConfetti: false,
    url: "https://www.volunteermatch.org/",
    facilitation_kit: {
      host_script: "Volunteer orientation and team assignment guide.",
      agenda: "3-hour volunteering event with team coordination.",
      timeline: "Check-in, orientation, volunteer work, and debrief.",
      discussion_prompts: "Pre-volunteering team briefing and post-event reflection.",
      follow_up_template: "Impact summary and volunteer appreciation template."
    }
  },
  
  {
    id: "evt-7",
    title: "Lunch-and-Learn Knowledge Series",
    description: "Employee-led sessions for knowledge sharing and skill development.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Improve employee performance", "Strengthen team connection"],
    interestCategories: ["Learning events"],
    costPerPerson: 12,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://calendar.google.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-8",
    title: "Team Recognition & Appreciation Hour",
    description: "Peer recognition event celebrating team wins and individual contributions.",
    type: "rsvp",
    workflowType: "rsvp",
    goals: ["Boost morale", "Strengthen team connection"],
    interestCategories: ["Social meetups"],
    costPerPerson: 15,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Recognition event facilitation guide.",
      agenda: "45-minute structured appreciation session.",
      timeline: "Nomination, presentations, and celebration timeline.",
      discussion_prompts: "Recognition prompts and appreciation categories.",
      follow_up_template: "Recognition highlights and follow-up appreciation."
    }
  },

  // ===== CONFETTI EVENTS (isConfetti = true) =====
  
  {
    id: "confetti-trivia",
    title: "Confetti Trivia Battle",
    description: "Interactive team trivia game with live leaderboard and fun animations.",
    type: "poll",
    workflowType: "poll",
    pollVariant: "event-and-datetime",
    goals: ["Strengthen team connection", "Boost morale"],
    interestCategories: ["Games & competitions", "Social meetups"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: true,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Confetti trivia host guide with icebreaker questions.",
      agenda: "30-minute trivia game agenda with breaks.",
      timeline: "Real-time facilitation with live scoring.",
      discussion_prompts: "Trivia questions across multiple categories.",
      follow_up_template: "Leaderboard and winner announcement template."
    }
  },
  
  {
    id: "confetti-feud",
    title: "Confetti Family Feud Style Battle",
    description: "Team-based: survey game in the style of Family Feud with creative questions.",
    type: "poll",
    workflowType: "poll",
    pollVariant: "event-and-datetime",
    goals: ["Strengthen team connection", "Boost morale"],
    interestCategories: ["Games & competitions", "Social meetups"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: true,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Feud-style host script with dramatic pauses.",
      agenda: "45-minute game show format.",
      timeline: "Round-by-round timing with team rotations.",
      discussion_prompts: "Pre-written survey questions for team answers.",
      follow_up_template: "Winning team announcement and fun awards."
    }
  },
  
  {
    id: "confetti-bracket",
    title: "Confetti Bracket Challenge Tournament",
    description: "Bracket-style tournament for team competitions (March Madness style or custom).",
    type: "poll",
    workflowType: "poll",
    pollVariant: "event-and-datetime",
    goals: ["Boost morale", "Strengthen team connection"],
    interestCategories: ["Games & competitions"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: true,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Tournament host commentary and scoring guide.",
      agenda: "Tournament bracket format and pacing guide.",
      timeline: "Multi-round timing with audience engagement.",
      discussion_prompts: "Bracket matchup descriptions and voting instructions.",
      follow_up_template: "Winner brackets and replay invitation."
    }
  },
  
  {
    id: "confetti-scavenger",
    title: "Confetti Scavenger Hunt Challenge",
    description: "Creative scavenger hunt game with photo submissions and real-time scoring.",
    type: "poll",
    workflowType: "poll",
    pollVariant: "event-and-datetime",
    goals: ["Strengthen team connection", "Boost morale"],
    interestCategories: ["Games & competitions", "Social meetups"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: true,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Scavenger hunt host script with fun commentary.",
      agenda: "60-minute hunt with multiple rounds.",
      timeline: "Countdown timer and submission milestones.",
      discussion_prompts: "List of creative hunt items and photo challenges.",
      follow_up_template: "Photo gallery and winner announcement."
    }
  },
  
  {
    id: "confetti-awards",
    title: "Confetti Awards & Recognition Show",
    description: "Themed awards ceremony with peer voting and fun categories.",
    type: "poll",
    workflowType: "poll",
    pollVariant: "event-and-datetime",
    goals: ["Boost morale", "Strengthen team connection"],
    interestCategories: ["Social meetups"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: true,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Awards show host script with dramatic presentations.",
      agenda: "45-minute awards ceremony format.",
      timeline: "Nomination, voting, and announcement schedule.",
      discussion_prompts: "Award categories and nomination descriptions.",
      follow_up_template: "Winner certificates and highlight reel."
    }
  }
];
