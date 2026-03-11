/**
 * EVENT_TEMPLATES - Master repository of event templates
 * Used by the 4-month program generator to recommend bundled events
 * 
 * Each template represents a pre-configured event option that can be
 * instantiated as a poll, RSVP, or external event in the workflow.
 */

window.EVENT_TEMPLATES = [
  // ===== EXISTING EVENTS (Mapped from EVENTS_MASTER_DEFAULT) =====
  
  {
    id: "evt-1",
    title: "Virtual Trivia League",
    description: "Live-hosted team trivia with custom company rounds.",
    type: "rsvp",
    goals: ["Retention & Engagement", "Team Connection & Culture"],
    interestCategories: ["social", "fun"],
    costPerPerson: 35,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://teambuilding.com/team-building/virtual",
    facilitation_kit: null
  },
  
  {
    id: "evt-2",
    title: "Mindful Monday Workshop",
    description: "Guided wellbeing and stress reset for teams.",
    type: "rsvp",
    goals: ["Wellbeing, Growth & Recognition", "Retention & Engagement"],
    interestCategories: ["wellness"],
    costPerPerson: 20,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-3",
    title: "Creative Build Challenge",
    description: "Hands-on problem-solving challenge in small groups.",
    type: "rsvp",
    goals: ["Performance & Productivity", "Team Connection & Culture"],
    interestCategories: ["social", "learning"],
    costPerPerson: 42,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.kraftylab.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-4",
    title: "Employer Brand Story Jam",
    description: "Employee storytelling sprint for recruiting brand content.",
    type: "rsvp",
    goals: ["Employer Brand & Recruiting", "Retention & Engagement"],
    interestCategories: ["learning", "social"],
    costPerPerson: 28,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.teamraderie.com/experience-finder/",
    facilitation_kit: null
  },
  
  {
    id: "evt-5",
    title: "Peer Coaching Pods",
    description: "Structured peer coaching circles with prompts.",
    type: "rsvp",
    goals: ["Retention & Engagement", "Performance & Productivity"],
    interestCategories: ["learning", "wellbeing"],
    costPerPerson: 18,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-6",
    title: "Zero-Cost Team Reflection Sprint",
    description: "Facilitated retrospective format to improve team alignment.",
    type: "poll",
    goals: ["Team Connection & Culture", "Performance & Productivity"],
    interestCategories: ["learning", "team"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.notion.so/",
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
    title: "Lunch-and-Learn Lightning Talks",
    description: "Employee-led quick talks for knowledge sharing.",
    type: "rsvp",
    goals: ["Performance & Productivity", "Employer Brand & Recruiting"],
    interestCategories: ["learning"],
    costPerPerson: 12,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://calendar.google.com/",
    facilitation_kit: null
  },
  
  {
    id: "evt-8",
    title: "Recognition Roundtable",
    description: "Peer appreciation format to boost morale.",
    type: "poll",
    goals: ["Retention & Engagement", "Retention & Engagement"],
    interestCategories: ["social", "recognition"],
    costPerPerson: 0,
    remoteCompatible: true,
    isConfetti: false,
    url: "https://www.withconfetti.com/",
    facilitation_kit: {
      host_script: "Recognition-focused facilitation script.",
      agenda: "30-minute recognition agenda.",
      timeline: "Structured round-robin timing guide.",
      discussion_prompts: "Prompt list for appreciation and wins.",
      follow_up_template: "Template for monthly recognition follow-up."
    }
  },

  // ===== NEW CONFETTI EVENTS (isConfetti = true) =====
  
  {
    id: "confetti-trivia",
    title: "Confetti Trivia Battle",
    description: "Interactive team trivia game with live leaderboard and fun animations.",
    type: "poll",
    goals: ["Team Connection & Culture", "Retention & Engagement"],
    interestCategories: ["fun", "social"],
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
    description: "Team-based survey game in the style of Family Feud with creative questions.",
    type: "poll",
    goals: ["Team Connection & Culture", "Performance & Productivity"],
    interestCategories: ["social", "fun"],
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
    goals: ["Team Connection & Culture", "Retention & Engagement"],
    interestCategories: ["social", "fun", "sports"],
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
    goals: ["Team Connection & Culture", "Employer Brand & Recruiting"],
    interestCategories: ["fun", "social"],
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
    goals: ["Retention & Engagement", "Wellbeing, Growth & Recognition"],
    interestCategories: ["recognition", "social", "fun"],
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
