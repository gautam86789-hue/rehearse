import { Archetype, Scenario, FrameworkOfTheDay, DailyPuzzle } from '../types/index.js';

export const ARCHETYPES: Record<string, Archetype> = {
  defensive_boss: {
    id: 'defensive_boss',
    name: 'Marcus Vance',
    title: 'The Defensive Boss',
    tagline: 'Deflects critique, reframes issues as loyalty tests, and takes feedback as personal attacks.',
    accentColor: '#DC2626', // Crimson Red
    avatarIcon: 'shield-alert',
    personalityDescription: 'Senior executive who immediately raises shields when challenged. Interprets procedural feedback as questioning their competence or leadership.',
    resistancePattern: 'Derails conversations into "Look how much I do for this team" or "Are you saying I don\'t support you?". Uses emotional guilt and counters with unrelated minor shortcomings.',
    typicalPhrases: [
      "After everything we've put into this department, I'm surprised to hear this from you.",
      "Are you saying I'm not supporting the team?",
      "If you were in my shoes with the board breathing down our necks, you'd understand.",
      "Let's not make a mountain out of a molehill."
    ],
    coachingHint: 'Do not apologize or backtrack. Validate their intent in 5 words or less, then anchor immediately back to objective operational metrics and business impact.'
  },
  guilt_tripper: {
    id: 'guilt_tripper',
    name: 'Elena Rostova',
    title: 'The Guilt-Tripper',
    tagline: 'Uses emotional obligation, exhaustion, and collective sacrifice to erode professional boundaries.',
    accentColor: '#D97706', // Amber Gold
    avatarIcon: 'heart-crack',
    personalityDescription: 'Colleague or manager who reframes standard boundaries as a lack of dedication to the "family" or team spirit.',
    resistancePattern: 'Sighs, mentions personal burnout, highlights how everyone else is staying late, and subtly implies you are letting the team down.',
    typicalPhrases: [
      "I guess I'll just have to pull another all-nighter myself then...",
      "We're all making sacrifices right now for the launch. I thought we were in this together.",
      "It's just disappointing because I specifically told leadership we could count on you.",
      "If everyone only worked their strict hours, this company wouldn't survive."
    ],
    coachingHint: 'Separate empathy from agreement. Say "I understand the launch pressure is intense; my capacity tonight is committed, so let\'s prioritize the top 2 blockers."'
  },
  hard_negotiator: {
    id: 'hard_negotiator',
    name: 'David Sterling',
    title: 'The Hard Negotiator',
    tagline: 'Anchors low, claims budget freezes, delays decisions, and tests your willingness to walk away.',
    accentColor: '#2563EB', // Sapphire Blue
    avatarIcon: 'scale',
    personalityDescription: 'Pragmatic, sharp operator who views salary and scope negotiations as zero-sum games where giving ground without resistance is weak.',
    resistancePattern: 'Claims compensation bands are locked by HR, insists macroeconomic timing is terrible, offers vague future equity or non-cash perks instead.',
    typicalPhrases: [
      "You know I think highly of your work, but HR has frozen all band adjustments until Q4.",
      "Let's revisit this in 6 months when the new product metrics come in.",
      "What else matters to you besides base salary? Title? Flexibility?",
      "If I do this for you, I'll have 5 other people knocking on my door tomorrow."
    ],
    coachingHint: 'Never accept a vague deferral. Quantify the exact business value delivered, establish a specific timeline, and ask "What concrete milestone needs to be met between now and next Friday to finalize this adjustement?"'
  },
  passive_aggressive_peer: {
    id: 'passive_aggressive_peer',
    name: 'Julian Hayes',
    title: 'The Passive-Aggressive Peer',
    tagline: 'Steals credit subtly, uses sarcasm, makes backhanded compliments, and avoids direct conflict.',
    accentColor: '#7C3AED', // Deep Violet
    avatarIcon: 'smile-plus',
    personalityDescription: 'A smart peer who presents a polished cooperative demeanor in front of executives while undermining your contributions in side channels.',
    resistancePattern: 'Pretends innocence ("Oh, did you think that was your idea? I thought we brainstormed that together!"), jokes to minimize serious friction, and feigns confusion.',
    typicalPhrases: [
      "Oh wow, I didn't realize you were so sensitive about who presented the slide deck.",
      "I was just trying to help the team look good in front of the VP.",
      "Must be nice having time to worry about attribution while the rest of us fix the bugs.",
      "No offense, but I thought we all agreed I would lead that client call."
    ],
    coachingHint: 'Call out the specific behavior without matching their passive aggression. State the timeline and factual record calmly: "In the client deck, slide 4 through 12 were my analysis. Moving forward, I will present my work directly."'
  },
  micromanager: {
    id: 'micromanager',
    name: 'Rachel Chen',
    title: 'The Micromanager',
    tagline: 'Demands hourly status updates, overrides minor details, and operates out of anxiety about losing control.',
    accentColor: '#059669', // Emerald Green
    avatarIcon: 'eye',
    personalityDescription: 'A manager with high anxiety who mistakes constant oversight for quality control, creating severe bottlenecks for senior contributors.',
    resistancePattern: 'Justifies hyper-involvement by citing historical team errors, questions your judgment on trivial formatting or minor copy, and demands cc on every thread.',
    typicalPhrases: [
      "I wouldn't have to check in three times a day if I had 100% visibility into your task board.",
      "Send me the draft before you send it to anyone else, even a quick Slack ping.",
      "I just like to keep my finger on the pulse so leadership doesn't catch us off guard.",
      "Can we do a 15-minute sync at 9 AM, 1 PM, and 5 PM just to align?"
    ],
    coachingHint: 'Offer proactive structured visibility to eliminate their anxiety without accepting invasive micromanagement: "I will provide a consolidated progress digest every Tuesday at 4 PM so you have complete visibility without daily sync friction."'
  }
};

export const CURATED_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-01-salary-raise',
    title: 'The Overdue Raise & Promotion Ask',
    category: 'negotiation',
    counterpartRole: 'Department VP',
    counterpartName: 'David Sterling',
    counterpartArchetype: 'hard_negotiator',
    difficulty: 'High Stakes',
    estimatedMinutes: 5,
    situation: 'You have exceeded your annual OKRs by 140%, taken on the lead architect responsibilities for 7 months, and market rate for your role has jumped 25%. Your VP has opened the 1-on-1 by saying "Tough quarter ahead, we are tightening our belts."',
    userGoal: 'Secure a 20% base salary increase or locked-in written promotion timeline within the current cycle without accepting a vague "we will see at year end".',
    brief: {
      counterpartPosition: 'Will cite macroeconomic headwinds, HR bands, and attempt to offer a title bump without base compensation increase.',
      probablePushbackPatterns: [
        'Macro budget freeze claim',
        'Deferral to next review cycle',
        'Offering non-cash perks (title, flexibility)'
      ],
      whatGoodLooksLike: 'Opening with concrete revenue/efficiency numbers delivered, stating the exact target compensation figure ($145k), and holding the line when the VP claims "hands are tied".',
      keyPhrasesToAvoid: ['"I was just hoping maybe..."', '"If it\'s not too much trouble"', '"I know times are tough but..."'],
      recommendedOpeningFormula: 'Anchor on verified impact → state specific target number → stop talking and let the silence sit.'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-02-critical-feedback',
    title: 'Giving Critical Feedback to a Defensive Senior Peer',
    category: 'feedback',
    counterpartRole: 'Principal Staff Engineer',
    counterpartName: 'Marcus Vance',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'Intermediate',
    estimatedMinutes: 4,
    situation: 'Your peer Marcus frequently interrupts junior engineers in technical reviews and dismissed a critical security flaw raised by a junior colleague, causing team morale to plummet.',
    userGoal: 'Address the behavioral pattern clearly, establish expected code review conduct, and ensure Marcus commits to hearing team inputs without emotional blowback.',
    brief: {
      counterpartPosition: 'Will claim he is "just upholding high standards" and that people are "too sensitive for high-growth tech".',
      probablePushbackPatterns: [
        'Accusing you of tone policing',
        'Arguing that code velocity matters more than feelings',
        'Asking why the junior didn\'t come to him directly'
      ],
      whatGoodLooksLike: 'Describing the specific observable behavior (not subjective intent), highlighting the technical risk of silencing team input, and securing a clear protocol agreement.',
      keyPhrasesToAvoid: ['"You always get angry"', '"People think you\'re toxic"', '"I might be wrong but..."'],
      recommendedOpeningFormula: 'State the specific meeting instance → link behavior to architectural risk and team retention → ask for collaborative resolution.'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-03-weekend-boundaries',
    title: 'Setting Boundaries on Weekend & Late Night Pings',
    category: 'boundaries',
    counterpartRole: 'Engineering Manager',
    counterpartName: 'Elena Rostova',
    counterpartArchetype: 'guilt_tripper',
    difficulty: 'Beginner',
    estimatedMinutes: 3,
    situation: 'Your manager messages you on Slack on Saturday evening asking for non-urgent report updates and tagged you twice on Sunday morning with "Quick question when you see this".',
    userGoal: 'Establish that weekends are offline time for deep recovery while reassuring them that true P0 on-call emergencies have an automated pager protocol.',
    brief: {
      counterpartPosition: 'Will express disappointment, frame emergency responses as normal startup hustle, and make you feel like a non-team player.',
      probablePushbackPatterns: [
        '"I just sent it so I wouldn\'t forget, you didn\'t have to reply (yet expects reply)"',
        '"The founders work weekends, we are in a crunch"',
        '"I thought you wanted to be on the fast track for promotion"'
      ],
      whatGoodLooksLike: 'Acknowledging the high tempo, clearly stating non-working hours policy, and redirecting non-emergencies to Monday 9 AM sprint planning.',
      keyPhrasesToAvoid: ['"Sorry to bother you with this..."', '"I guess I could check my phone occasionally"'],
      recommendedOpeningFormula: 'State boundary without apologies → define clear P0 emergency threshold vs normal communication.'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-04-scope-creep',
    title: 'Pushing Back on a 50% Scope Increase Without Delaying Deadline',
    category: 'managing_up',
    counterpartRole: 'Product Director',
    counterpartName: 'David Sterling',
    counterpartArchetype: 'hard_negotiator',
    difficulty: 'High Stakes',
    estimatedMinutes: 5,
    situation: 'Two weeks before product launch, the Product Director introduces 4 new major enterprise compliance features and expects the original October 1st ship date to hold.',
    userGoal: 'Reject the "do everything with no trade-offs" fantasy and force the director to choose between Phase 1 scope triage or moving the launch date by 4 weeks.',
    brief: {
      counterpartPosition: 'Will insist these are "dealbreaker features for the enterprise sales pipeline" and demand the team "just rally and sprint hard".',
      probablePushbackPatterns: [
        'Challenging the engineering estimates as inflated',
        'Suggesting cutting QA or automated tests to make time',
        'Bringing up executive visibility'
      ],
      whatGoodLooksLike: 'Presenting the Iron Triangle (Scope, Time, Quality), offering 2 viable trade-off packages (Option A: Ship core on Oct 1 + Phase 2 in Nov; Option B: Ship full scope on Nov 1), and refusing unviable compromises.',
      keyPhrasesToAvoid: ['"We will try our best"', '"Maybe if we work weekends"', '"It\'s basically impossible"'],
      recommendedOpeningFormula: '"We can guarantee a flawless launch on Oct 1st with the committed spec. Adding these 4 items requires choosing between shifting launch to Nov 1st or scoping them into V1.1. Which path do you want to take?"'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-05-credit-stealing',
    title: 'Calling Out a Colleague Who Took Credit in Executive Review',
    category: 'difficult_decisions',
    counterpartRole: 'Senior Product Manager',
    counterpartName: 'Julian Hayes',
    counterpartArchetype: 'passive_aggressive_peer',
    difficulty: 'Intermediate',
    estimatedMinutes: 4,
    situation: 'During the VP all-hands, Julian presented your algorithmic cost-reduction model as "a framework my team and I conceptualized over the weekend" without mentioning you.',
    userGoal: 'Directly confront Julian in private, establish that credit misattribution will not be tolerated, and agree on how your ownership is communicated to leadership.',
    brief: {
      counterpartPosition: 'Will gaslight by acting shocked, claim it was a slip of the tongue, and accuse you of making drama over slide decks.',
      probablePushbackPatterns: [
        '"You\'re taking it out of context"',
        '"I assumed everyone knew you worked on the backend part"',
        '"Let\'s not get petty over slide credits when leadership loved it"'
      ],
      whatGoodLooksLike: 'Calmly quoting the exact slide and sentence, refusing to be drawn into emotional debate, and requiring Julian to include your attribution in the follow-up recap email.',
      keyPhrasesToAvoid: ['"I feel like you don\'t respect me"', '"Why do you hate me?"', '"Never mind, it\'s not a big deal"'],
      recommendedOpeningFormula: 'Direct factual citation → clear boundary on attribution → specific restorative action required.'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-06-micromanagement',
    title: 'Taming a Micromanager Who Demands 3 Daily Syncs',
    category: 'managing_up',
    counterpartRole: 'Engineering Director',
    counterpartName: 'Rachel Chen',
    counterpartArchetype: 'micromanager',
    difficulty: 'Intermediate',
    estimatedMinutes: 4,
    situation: 'Your manager has scheduled morning, midday, and evening checkpoint meetings and asks for Slack updates whenever you step away for 20 minutes.',
    userGoal: 'Replace ad-hoc micromanagement with a single asynchronous automated daily summary, freeing up 15 hours of focused engineering time per week.',
    brief: {
      counterpartPosition: 'Will claim this oversight is necessary due to leadership anxiety and past project slips.',
      probablePushbackPatterns: [
        '"It only takes 5 minutes, why is it such an issue?"',
        '"I need real-time data for the executive dashboard"',
        '"When you have more seniority you will understand why we do this"'
      ],
      whatGoodLooksLike: 'Reframing the discussion around maker focus time and delivery velocity, providing a concrete async reporting alternative, and proposing a 2-week trial.',
      keyPhrasesToAvoid: ['"You are suffocating me"', '"I can\'t do my job with you watching"'],
      recommendedOpeningFormula: '"To increase our feature velocity by 30%, I want to propose a 2-week pilot: one comprehensive async status dashboard at 4:30 PM instead of 3 daily syncs."'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-07-saying-no-vp',
    title: 'Saying "No" to a VP’s Ill-Conceived Pet Project',
    category: 'managing_up',
    counterpartRole: 'Executive VP of Growth',
    counterpartName: 'Marcus Vance',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'High Stakes',
    estimatedMinutes: 5,
    situation: 'The EVP wants your team to drop customer-requested performance fixes to build an unvalidated AI buzzword feature for an upcoming conference keynote in 10 days.',
    userGoal: 'Diplomatically kill or scope down the distraction without alienating the executive, tying your refusal directly to core company revenue and churn metrics.',
    brief: {
      counterpartPosition: 'Will use executive authority, passion for the keynote, and subtle career intimidation.',
      probablePushbackPatterns: [
        '"This came directly from the Board"',
        '"If your team can\'t move fast enough, I\'ll find contractors who can"',
        '"You\'re lacking vision on the future of AI"'
      ],
      whatGoodLooksLike: 'Validating the EVP\'s keynote narrative goal, offering an interactive clickable prototype or demo video for the stage that requires zero production backend refactoring, and protecting core customer reliability.',
      keyPhrasesToAvoid: ['"That\'s a stupid idea"', '"We can\'t do that"', '"It\'s impossible"'],
      recommendedOpeningFormula: '"I share the goal of making your keynote unforgettable. Here is how we give you a stunning onstage demo without jeopardizing our top 5 revenue clients."'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'scenario-08-layoff-conversation',
    title: 'Conducting a Compassionate yet Firm Layoff Notification',
    category: 'crisis',
    counterpartRole: 'Direct Report (Senior Analyst)',
    counterpartName: 'Elena Rostova',
    counterpartArchetype: 'guilt_tripper',
    difficulty: 'High Stakes',
    estimatedMinutes: 5,
    situation: 'Company restructuring has eliminated 3 roles on your team. You must notify a dedicated employee that today is their last day, maintaining dignity, legal compliance, and empathy without negotiating the unchangeable decision.',
    userGoal: 'Deliver the message clearly within the first 60 seconds, convey severance and transition support with deep compassion, and handle emotional distress without wavering on the final decision.',
    brief: {
      counterpartPosition: 'Will be in shock, will plead to take a pay cut or switch teams, and will highlight personal financial vulnerability.',
      probablePushbackPatterns: [
        '"Is this because of my rating last quarter? Tell me the truth!"',
        '"I just signed a mortgage! Please, let me work for half salary."',
        '"How could the company do this after 4 years of 60-hour weeks?"'
      ],
      whatGoodLooksLike: 'Delivering the news directly in sentence 1, never making false promises, validating the pain while maintaining certainty, and walking through transition assistance.',
      keyPhrasesToAvoid: ['"I know exactly how you feel"', '"This is harder on me than on you"', '"Maybe if you talk to HR..."'],
      recommendedOpeningFormula: '"Elena, I have difficult news to share today. As part of company restructuring, your role has been eliminated, effective immediately."'
    },
    isCurated: true,
    createdAt: '2026-09-01T00:00:00Z'
  }
];

export const FRAMEWORKS_CATALOG: FrameworkOfTheDay[] = [
  {
    id: 'framework-nvc',
    title: 'Nonviolent Communication (NVC) Framework',
    sourceCredit: 'Inspired by Marshall Rosenberg’s Nonviolent Communication model',
    tagline: 'Transform heated accusations into actionable, collaborative requests.',
    summary: 'A structured 4-step communication model that separates objective facts from subjective judgments, identifies underlying human needs, and formulates clear, do-able requests.',
    components: [
      {
        step: '1. Observations',
        label: 'Concrete Facts',
        explanation: 'State what occurred with zero interpretation, moralizing, or exaggeration (e.g., avoid "always" or "never").',
        example: '"In the last three sprint reviews, the deployment was delayed by over 48 hours."'
      },
      {
        step: '2. Feelings',
        label: 'Honest Emotion',
        explanation: 'Express your genuine emotional or professional state without disguising thoughts as feelings.',
        example: '"I feel concerned about customer trust and team burnout."'
      },
      {
        step: '3. Needs',
        label: 'Core Objective',
        explanation: 'Connect the feeling to a shared business or human necessity (predictability, respect, clarity).',
        example: '"Because our team needs predictable release cycles to meet SLA commitments."'
      },
      {
        step: '4. Requests',
        label: 'Actionable Ask',
        explanation: 'Ask for a specific, positive, concrete action rather than a vague demand or negative prohibition.',
        example: '"Would you be willing to conduct code freezes 24 hours earlier starting this Wednesday?"'
      }
    ],
    suggestedScenarioId: 'scenario-02-critical-feedback',
    releaseDate: '2026-09-07'
  },
  {
    id: 'framework-batna',
    title: 'Harvard Negotiation Project: BATNA & Anchoring',
    sourceCredit: 'Inspired by Fisher & Ury’s Getting to Yes principles',
    tagline: 'Negotiate from strength by knowing your Best Alternative to a Negotiated Agreement.',
    summary: 'Never enter a high-stakes conversation without knowing your walkaway point and anchoring first with data-backed justification.',
    components: [
      {
        step: '1. Clarify BATNA',
        label: 'Walkaway Point',
        explanation: 'Identify your realistic alternative before opening the discussion to eliminate fear-based concessions.',
        example: '"If no budget adjustment is possible, I will transition ownership of the extra product line to stay within band."'
      },
      {
        step: '2. Objective Criteria',
        label: 'Market Standards',
        explanation: 'Anchor on independent, external benchmarks rather than personal desire.',
        example: '"Radford 75th percentile comp for Staff level in our tier is $155k base."'
      },
      {
        step: '3. Separate People from Problem',
        label: 'Relational Warmth, Problem Rigor',
        explanation: 'Be gentle on the relationship while being unyielding on the objective problem.',
        example: '"I appreciate the department constraints; let’s solve how we close this gap together."'
      },
      {
        step: '4. Expand the Pie',
        label: 'Multi-Variable Trade-offs',
        explanation: 'Trade low-cost high-value items when base currency is constrained.',
        example: '"If base salary is locked until Q4, let’s formalize an immediate signing bonus and equity refresher."'
      }
    ],
    suggestedScenarioId: 'scenario-01-salary-raise',
    releaseDate: '2026-09-08'
  },
  {
    id: 'framework-state',
    title: 'Crucial Conversations: The S.T.A.T.E. Model',
    sourceCredit: 'Inspired by Patterson, Grenny, McMillan, Switzler’s Crucial Conversations',
    tagline: 'Deliver high-stakes, emotionally charged feedback without triggering defense mechanisms.',
    summary: 'A 5-step roadmap to talk about sensitive issues when stakes are high, opinions vary, and emotions run strong.',
    components: [
      {
        step: 'S - Share your facts',
        label: 'Start with Data',
        explanation: 'Facts are the least controversial and most persuasive foundation.',
        example: '"During today’s pitch, you stated the backend was untested."'
      },
      {
        step: 'T - Tell your story',
        label: 'Explain the Impact',
        explanation: 'Explain the conclusion you drew from the facts without acting like it’s an undisputed universal truth.',
        example: '"That led the client to question our overall engineering reliability."'
      },
      {
        step: 'A - Ask for their path',
        label: 'Invite Their View',
        explanation: 'Encourage the other person to share their perspective and intent.',
        example: '"Help me understand what prompted that framing."'
      },
      {
        step: 'T - Talk tentatively',
        label: 'Avoid Absolutes',
        explanation: 'State observations as possibilities rather than aggressive accusations.',
        example: '"It seemed to me that perhaps we weren’t aligned on our narrative."'
      },
      {
        step: 'E - Encourage testing',
        label: 'Seek Differing Views',
        explanation: 'Actively invite dissenting views: "Do you see it differently?"',
        example: '"Does your read of the client’s reaction differ from mine?"'
      }
    ],
    suggestedScenarioId: 'scenario-05-credit-stealing',
    releaseDate: '2026-09-09'
  }
];

export const DAILY_PUZZLES: DailyPuzzle[] = [
  {
    id: 'puzzle-2026-09-07',
    date: '2026-09-07',
    title: 'The "Quick Weekend Favor" Dilemma',
    scenarioContext: 'It is Friday at 6:15 PM. Your director sends a Slack: "Hey, know it is late, but could you quickly rewrite the 20-page board deck by tomorrow noon? The CEO wants new charts."',
    counterpartOpeningLine: 'Can you take care of this tonight? You are our fastest slide builder and I really need your help.',
    options: [
      {
        id: 'opt_a',
        strategyLabel: 'Over-Apologetic & Reluctant',
        responseText: 'I am really so sorry, I had some plans tonight with family, but I guess I can try to wake up at 5 AM and see how much I can finish?',
        isOptimal: false,
        score: 35,
        explanation: 'Fails to hold the boundary, signals that personal commitments are negotiable, and sets up high burnout with unmanaged expectations.'
      },
      {
        id: 'opt_b',
        strategyLabel: 'Firm Boundary + Collaborative Triage',
        responseText: 'I am offline tonight, but I can review the CEO’s core questions and build the top 2 priority charts on Monday at 8:30 AM before the 11 AM board meeting.',
        isOptimal: true,
        score: 95,
        explanation: 'States clear availability without unnecessary apologies, offers an actionable high-impact solution, and protects personal time.'
      },
      {
        id: 'opt_c',
        strategyLabel: 'Hostile & Defensive',
        responseText: 'This is completely unreasonable notice on a Friday evening. It is not my job to fix executive planning failures.',
        isOptimal: false,
        score: 40,
        explanation: 'While the boundary is accurate, the hostile tone burns executive capital and escalates interpersonal conflict unnecessarily.'
      }
    ],
    communityDistribution: {
      optionA: 34,
      optionB: 58,
      optionC: 8
    }
  },
  {
    id: 'puzzle-2026-09-08',
    date: '2026-09-08',
    title: 'The Vague "HR Budget Freeze" Pushback',
    scenarioContext: 'You just asked your VP for an overdue 15% salary review after delivering $2M in cost savings.',
    counterpartOpeningLine: 'Look, you are a rockstar, but HR has completely frozen all band raises across the entire company until next year.',
    options: [
      {
        id: 'opt_a',
        strategyLabel: 'Immediate Capitulation',
        responseText: 'Oh, I understand completely. Let us definitely talk next year then!',
        isOptimal: false,
        score: 25,
        explanation: 'Accepts a blanket deferral with zero accountability or timeline lock-in.'
      },
      {
        id: 'opt_b',
        strategyLabel: 'Direct Exception Exploration + Timeline Anchor',
        responseText: 'I understand macro policy is tight. Given that our project delivered $2M in verified savings this quarter, what is the exact executive exception process for out-of-cycle performance reviews, and how do we initiate it this week?',
        isOptimal: true,
        score: 98,
        explanation: 'Acknowledges constraint, anchors on verified disproportionate impact, and shifts the conversation to the exception mechanism that exists in every enterprise.'
      },
      {
        id: 'opt_c',
        strategyLabel: 'Threatening Resignation',
        responseText: 'Well if you cannot match market rate right now, recruiters have been messaging me weekly and I will start replying to them.',
        isOptimal: false,
        score: 45,
        explanation: 'Issuing ultimatums early triggers counter-defensiveness and forces a standoff before collaborative options are exhausted.'
      }
    ],
    communityDistribution: {
      optionA: 28,
      optionB: 62,
      optionC: 10
    }
  }
];
