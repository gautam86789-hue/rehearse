import { Archetype, Scenario, FrameworkOfTheDay, DailyPuzzle, WordOfTheDay } from '../types/index.js';

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
  },
  skeptical_investor: {
    id: 'skeptical_investor',
    name: 'Priya Kapoor',
    title: 'The Skeptical Investor',
    tagline: "Questions your traction, pokes holes in your TAM, and anchors valuation low before committing.",
    accentColor: '#0891B2', // Teal
    avatarIcon: 'trending-down',
    personalityDescription: 'A partner at a growth fund who has seen hundreds of pitches this quarter alone. Warm surface manner, but every claim gets stress-tested before a term sheet moves forward.',
    resistancePattern: "Cites down-round comps, questions unit economics and CAC payback, and floats a lower valuation anchored to \"market conditions\" before you've finished your ask.",
    typicalPhrases: [
      "Walk me through your CAC payback again — that retention number feels optimistic.",
      "At this stage, we're seeing comps close 30% below what you're asking for.",
      "I like the team, but I need to see three more months of this growth curve before I move.",
      "What's your answer if your biggest competitor closes a round next month?"
    ],
    coachingHint: "Don't defend the number — defend the trajectory. Anchor on one specific, verifiable growth metric and name the exact terms that would close the round today."
  },
  startup_cofounder: {
    id: 'startup_cofounder',
    name: 'Jordan Reyes',
    title: 'The Co-Founder in Conflict',
    tagline: "Disagrees on strategy, questions equity fairness, and threatens the partnership's stability when pushed.",
    accentColor: '#EA580C', // Burnt Orange
    avatarIcon: 'users',
    personalityDescription: 'Your co-founder and equal partner — technically brilliant but conflict-avoidant until pressure builds, then reacts defensively when core decisions are challenged.',
    resistancePattern: "Brings up past sacrifices and equal effort, questions whether you still believe in the shared vision, and threatens to disengage or \"reconsider his role\" rather than negotiate directly.",
    typicalPhrases: [
      "I've put in the same hours as you since day one — this isn't about who's \"really\" the CEO.",
      "If you push this pivot through without my buy-in, I don't know if I can stay committed to this.",
      "We agreed to decide big calls together. This feels like you're going around me.",
      "Maybe we just see the company differently now. What does that mean for us?"
    ],
    coachingHint: 'Separate the relationship from the decision. Name the specific business risk in concrete terms, and propose a structured way to disagree — a 30-day trial, a tiebreaker mechanism — rather than an ultimatum.'
  }
};

export const CURATED_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-01-salary-raise',
    title: 'The Overdue Raise & Promotion Ask',
    audiences: ['new_managers', 'professionals', 'mba_students', 'founders_investors'],
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
    audiences: ['new_managers', 'professionals', 'mba_students'],
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
    audiences: ['new_managers', 'professionals', 'mba_students'],
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
    audiences: ['new_managers', 'professionals'],
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
    audiences: ['new_managers', 'professionals', 'mba_students'],
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
    audiences: ['new_managers', 'professionals', 'mba_students'],
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
    audiences: ['new_managers', 'professionals'],
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
    audiences: ['new_managers', 'founders_investors'],
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
  },
  {
    id: 'scenario-talk-to-manager',
    title: 'Pushing Back on Scope Without Losing Trust',
    audiences: ['new_managers', 'professionals', 'mba_students'],
    category: 'managing_up',
    counterpartRole: 'Direct Manager',
    counterpartName: 'Marcus Vance',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'Intermediate',
    estimatedMinutes: 5,
    situation: 'Your manager just added two more workstreams to your plate mid-sprint, on top of an already full roadmap, framing it as "just a quick add."',
    userGoal: 'Protect your current commitments and get a clear, explicit decision on what gets de-prioritized before taking anything new on.',
    brief: {
      counterpartPosition: 'Believes the ask is small and reasonable; will resist if it sounds like you are refusing to be a team player.',
      probablePushbackPatterns: [
        '"It\'s really not that much extra work."',
        '"I thought you could handle more than this."',
        '"Everyone else is stretched too."'
      ],
      whatGoodLooksLike: 'Naming your current commitments specifically, asking a direct trade-off question, and holding the line without over-apologizing.',
      keyPhrasesToAvoid: ['"Sorry to make a big deal of this"', '"I guess I could try to fit it in"'],
      recommendedOpeningFormula: '"I want to take this on well, not just take it on. Given my current commitments, what should come off my plate to make room?"'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'scenario-talk-to-cofounder',
    title: 'Resolving a Strategic Disagreement With Your Co-Founder',
    audiences: ['founders_investors'],
    category: 'difficult_decisions',
    counterpartRole: 'Co-Founder & Equal Partner',
    counterpartName: 'Jordan Reyes',
    counterpartArchetype: 'startup_cofounder',
    difficulty: 'High Stakes',
    estimatedMinutes: 6,
    situation: 'You believe the company needs to pivot the core product before the runway runs out. Your co-founder disagrees and feels blindsided that you are pushing this without full buy-in.',
    userGoal: 'Get a real decision — not a stalemate — while keeping the partnership intact and the risk clearly on the table.',
    brief: {
      counterpartPosition: 'Feels the shared vision is being overridden unilaterally; will frame disagreement as a loyalty or trust issue.',
      probablePushbackPatterns: [
        '"This isn\'t about who\'s really the CEO."',
        '"If you push this through, I don\'t know if I can stay committed."',
        '"We agreed to decide big calls together."'
      ],
      whatGoodLooksLike: 'Naming the specific business risk in concrete numbers, separating the relationship from the decision, and proposing a structured way to resolve the disagreement.',
      keyPhrasesToAvoid: ['"You always do this"', '"Fine, forget it, we\'ll do it your way"'],
      recommendedOpeningFormula: '"I don\'t want to decide this without you — I want us to actually decide it. Here\'s the runway math that\'s driving my urgency."'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'scenario-talk-to-investor',
    title: 'Defending Your Valuation on an Update Call',
    audiences: ['founders_investors'],
    category: 'negotiation',
    counterpartRole: 'Growth-Stage VC Partner',
    counterpartName: 'Priya Kapoor',
    counterpartArchetype: 'skeptical_investor',
    difficulty: 'High Stakes',
    estimatedMinutes: 6,
    situation: 'On a term sheet call, your lead investor is anchoring valuation 30% below your ask, citing "market conditions" and recent down-round comps.',
    userGoal: 'Hold your valuation range by anchoring on one hard, verifiable growth metric, without sounding defensive or over-explaining.',
    brief: {
      counterpartPosition: 'Genuinely believes the market has repriced; will keep citing comps and macro conditions rather than your specific traction.',
      probablePushbackPatterns: [
        '"We\'re seeing comps close well below what you\'re asking."',
        '"I need a few more months of this growth curve before I move."',
        '"What happens if your competitor closes a round first?"'
      ],
      whatGoodLooksLike: 'Redirecting from market comps to your specific trajectory, naming the exact terms that would close the round today, and not filling silence with concessions.',
      keyPhrasesToAvoid: ['"I guess we could come down a bit"', '"Whatever you think is fair"'],
      recommendedOpeningFormula: '"I hear the market context. Here\'s the metric that matters for us specifically, and here\'s the number that gets this closed this week."'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  }
];

export const FRAMEWORKS_CATALOG: FrameworkOfTheDay[] = [
  {
    id: 'framework-nvc',
    title: 'Nonviolent Communication (NVC) Framework',
    audiences: ['new_managers', 'professionals', 'mba_students'],
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
    audiences: ['founders_investors', 'mba_students', 'professionals'],
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
    audiences: ['new_managers', 'professionals', 'mba_students'],
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

export const WORDS_CATALOG: WordOfTheDay[] = [
  // Founders / Investors
  {
    id: 'word-runway',
    term: 'Runway',
    audiences: ['founders_investors'],
    meaning: 'The number of months of cash you have left before hitting $0 at your current burn rate.',
    whyItMatters: 'Running out of runway without knowing it is the #1 way founders lose leverage in their next raise — investors can smell desperation, and it shows up first in a fuzzy runway number.',
    releaseDate: '2026-09-01'
  },
  {
    id: 'word-cap-table',
    term: 'Cap Table',
    audiences: ['founders_investors'],
    meaning: 'The ownership ledger showing exactly who owns what percentage of your company.',
    whyItMatters: 'A messy or poorly-understood cap table scares investors and can kill a deal in diligence — you should be able to explain every line of it cold.',
    releaseDate: '2026-09-02'
  },
  {
    id: 'word-term-sheet',
    term: 'Term Sheet',
    audiences: ['founders_investors'],
    meaning: 'A non-binding document outlining the key terms of a proposed investment.',
    whyItMatters: 'The terms you accept here — valuation, liquidation preference, board seats — shape control of your company for years, long after the excitement of "we got a term sheet" fades.',
    releaseDate: '2026-09-03'
  },
  {
    id: 'word-burn-rate',
    term: 'Burn Rate',
    audiences: ['founders_investors'],
    meaning: 'How fast your company is spending cash each month.',
    whyItMatters: 'Investors judge founder discipline by burn rate relative to actual progress, not just growth — a high burn with vague outcomes is the fastest way to lose credibility in a board update.',
    releaseDate: '2026-09-04'
  },
  {
    id: 'word-liquidation-preference',
    term: 'Liquidation Preference',
    audiences: ['founders_investors'],
    meaning: 'The order and multiple at which investors get paid before common shareholders in an exit.',
    whyItMatters: 'A high liquidation preference multiple can wipe out founder and employee returns even in a "successful" acquisition — it is one of the most consequential terms to push back on.',
    releaseDate: '2026-09-05'
  },
  {
    id: 'word-vesting-cliff',
    term: 'Vesting Cliff',
    audiences: ['founders_investors'],
    meaning: 'The initial period, often one year, before any equity vests at all.',
    whyItMatters: 'It protects the company if a co-founder or early hire leaves too soon — explaining and defending it clearly is a common early difficult conversation with new hires.',
    releaseDate: '2026-09-06'
  },
  {
    id: 'word-dilution',
    term: 'Dilution',
    audiences: ['founders_investors'],
    meaning: 'The reduction in your ownership percentage as new shares are issued in later funding rounds.',
    whyItMatters: 'Every funding round costs you equity — knowing the math before you say yes to a term sheet is what separates a confident founder from one negotiating blind.',
    releaseDate: '2026-09-07'
  },
  // New Managers
  {
    id: 'word-psychological-safety',
    term: 'Psychological Safety',
    audiences: ['new_managers'],
    meaning: 'A team climate where people feel safe to speak up, disagree, or admit mistakes without fear of punishment.',
    whyItMatters: 'Teams without it hide problems until they are expensive to fix — it is the single strongest predictor of team performance found in Google\'s own research on effective teams.',
    releaseDate: '2026-09-01'
  },
  {
    id: 'word-delegation-vs-abdication',
    term: 'Delegation vs. Abdication',
    audiences: ['new_managers'],
    meaning: 'Delegating hands off a task while keeping shared accountability; abdicating hands it off and disappears.',
    whyItMatters: 'Confusing the two is the fastest way a new manager loses a team\'s trust — "I delegated it" sounds identical to "I checked out" until something goes wrong.',
    releaseDate: '2026-09-02'
  },
  {
    id: 'word-servant-leadership',
    term: 'Servant Leadership',
    audiences: ['new_managers'],
    meaning: 'A leadership style focused on removing obstacles for your team rather than directing their every move.',
    whyItMatters: 'New managers who over-direct create bottlenecks instead of capacity — the job shifts from "doing the work" to "clearing the path," which feels counterintuitive at first.',
    releaseDate: '2026-09-03'
  },
  {
    id: 'word-radical-candor',
    term: 'Radical Candor',
    audiences: ['new_managers'],
    meaning: 'Caring personally about someone while challenging them directly.',
    whyItMatters: 'Feedback without care reads as an attack; care without challenge reads as empty praise — most feedback conversations fail by leaning too far to one side.',
    releaseDate: '2026-09-04'
  },
  {
    id: 'word-span-of-control',
    term: 'Span of Control',
    audiences: ['new_managers'],
    meaning: 'The number of people who report directly to one manager.',
    whyItMatters: 'Too wide a span means every report gets less of your time than they need — it is often the real reason a "good manager" starts missing things.',
    releaseDate: '2026-09-05'
  },
  {
    id: 'word-one-on-one',
    term: 'One-on-One (1:1)',
    audiences: ['new_managers'],
    meaning: 'A recurring, private meeting between a manager and one direct report.',
    whyItMatters: 'Skipping 1:1s is the most common reason managers miss problems early — by the time an issue surfaces in a group setting, it has usually been brewing for weeks.',
    releaseDate: '2026-09-06'
  },
  {
    id: 'word-managing-up',
    term: 'Managing Up',
    audiences: ['new_managers', 'new_hires'],
    meaning: 'Proactively aligning expectations and communication with your own manager, rather than waiting to be asked.',
    whyItMatters: 'Your manager cannot support what they do not know is happening — managing up is what turns a boss into an advocate instead of a source of surprises.',
    releaseDate: '2026-09-07'
  },
  // MBA Students
  {
    id: 'word-opportunity-cost',
    term: 'Opportunity Cost',
    audiences: ['mba_students'],
    meaning: 'The value of the next-best option you give up by choosing something else.',
    whyItMatters: 'Every strong case-interview answer accounts for what you are choosing not to do — interviewers notice when a recommendation ignores its own trade-offs.',
    releaseDate: '2026-09-01'
  },
  {
    id: 'word-sunk-cost-fallacy',
    term: 'Sunk Cost Fallacy',
    audiences: ['mba_students'],
    meaning: 'The tendency to keep investing in something because of what you have already spent, not its future value.',
    whyItMatters: 'Interviewers deliberately probe whether you can walk away from a bad bet — clinging to sunk costs is one of the fastest ways to lose credibility mid-case.',
    releaseDate: '2026-09-02'
  },
  {
    id: 'word-mece',
    term: 'MECE (Mutually Exclusive, Collectively Exhaustive)',
    audiences: ['mba_students'],
    meaning: 'A framework for structuring an issue into parts that don\'t overlap and together cover everything relevant.',
    whyItMatters: 'It is the structural backbone of nearly every case interview answer — an un-MECE framework is usually the first thing an experienced interviewer flags.',
    releaseDate: '2026-09-03'
  },
  {
    id: 'word-unit-economics',
    term: 'Unit Economics',
    audiences: ['mba_students'],
    meaning: 'The direct revenues and costs associated with a single unit of a business — one customer, one order.',
    whyItMatters: 'A business can grow fast and still be unprofitable per unit — checking unit economics is how you catch that before it becomes the whole answer.',
    releaseDate: '2026-09-04'
  },
  {
    id: 'word-porters-five-forces',
    term: "Porter's Five Forces",
    audiences: ['mba_students'],
    meaning: 'A framework for analyzing how competitive and attractive an industry is.',
    whyItMatters: 'It shows up constantly in strategy cases and interviews alike — being able to apply it fluently, not just recite it, is what separates a strong answer from a memorized one.',
    releaseDate: '2026-09-05'
  },
  {
    id: 'word-anchoring',
    term: 'Anchoring',
    audiences: ['mba_students', 'professionals'],
    meaning: 'The tendency to rely too heavily on the first number offered in a negotiation.',
    whyItMatters: 'Whoever anchors first often shapes the entire negotiation range — knowing this changes whether you open with a number or wait to hear theirs.',
    releaseDate: '2026-09-06'
  },
  {
    id: 'word-npv',
    term: 'Net Present Value (NPV)',
    audiences: ['mba_students'],
    meaning: 'The value today of a future stream of cash flows, discounted for time and risk.',
    whyItMatters: 'It is the core tool for comparing whether an investment is actually worth it — a case answer without it often defaults to gut feeling instead of rigor.',
    releaseDate: '2026-09-07'
  },
  // Working Professionals
  {
    id: 'word-scope-creep',
    term: 'Scope Creep',
    audiences: ['professionals'],
    meaning: 'When a project\'s requirements keep expanding beyond what was originally agreed.',
    whyItMatters: 'Naming it early, calmly, is how you protect your time without sounding difficult — silence just makes the next ask feel equally "reasonable."',
    releaseDate: '2026-09-01'
  },
  {
    id: 'word-boundary-setting',
    term: 'Boundary Setting',
    audiences: ['professionals'],
    meaning: 'Clearly communicating what you will and will not accept in how others treat your time or energy.',
    whyItMatters: 'Unclear boundaries get walked over, not respected — most people are not being malicious, they simply have not been told where the line is.',
    releaseDate: '2026-09-02'
  },
  {
    id: 'word-emotional-labor',
    term: 'Emotional Labor',
    audiences: ['professionals'],
    meaning: 'The effort of managing your own emotions to meet the expectations of a role.',
    whyItMatters: 'Recognizing it helps you notice burnout before it becomes a crisis — "staying calm and professional" all day is real work, even when it is invisible.',
    releaseDate: '2026-09-03'
  },
  {
    id: 'word-stakeholder-mapping',
    term: 'Stakeholder Mapping',
    audiences: ['professionals'],
    meaning: 'Identifying who is affected by a decision and how much influence or interest each person has.',
    whyItMatters: 'Skipping this is why "obvious" decisions blow up politically — the technically-right answer still fails if the wrong person feels blindsided by it.',
    releaseDate: '2026-09-04'
  },
  {
    id: 'word-batna',
    term: 'BATNA (Best Alternative to a Negotiated Agreement)',
    audiences: ['professionals', 'founders_investors'],
    meaning: 'Your fallback plan if the current negotiation fails to reach an agreement.',
    whyItMatters: 'Knowing your BATNA is what gives you real leverage, not bluffing — the strongest negotiators are calm because they genuinely have somewhere else to go.',
    releaseDate: '2026-09-05'
  },
  {
    id: 'word-constructive-conflict',
    term: 'Constructive Conflict',
    audiences: ['professionals', 'new_managers'],
    meaning: 'Disagreement focused on the problem, not the person, that ultimately improves a decision.',
    whyItMatters: 'Teams that avoid all conflict make worse decisions, not more harmonious ones — the goal is not zero friction, it is friction aimed at the right target.',
    releaseDate: '2026-09-06'
  },
  {
    id: 'word-active-listening',
    term: 'Active Listening',
    audiences: ['professionals'],
    meaning: 'Fully concentrating on and reflecting back what someone says before responding.',
    whyItMatters: 'Most "disagreements" are actually misunderstandings that active listening would have caught early, before either side dug in.',
    releaseDate: '2026-09-07'
  },
  // New Hires / Job Seekers
  {
    id: 'word-elevator-pitch',
    term: 'Elevator Pitch',
    audiences: ['new_hires'],
    meaning: 'A concise, compelling summary of who you are and what you offer, deliverable in about 30-60 seconds.',
    whyItMatters: 'Interviewers and new colleagues decide a lot about you in the first minute — a sharp pitch does the work of ten minutes of rambling context.',
    releaseDate: '2026-09-01'
  },
  {
    id: 'word-star-method',
    term: 'STAR Method',
    audiences: ['new_hires'],
    meaning: 'A structure for answering behavioral interview questions: Situation, Task, Action, Result.',
    whyItMatters: 'Unstructured answers make it hard for interviewers to figure out what you actually did versus what your team did — STAR makes your specific contribution legible.',
    releaseDate: '2026-09-02'
  },
  {
    id: 'word-90-day-plan',
    term: '90-Day Plan',
    audiences: ['new_hires'],
    meaning: 'A written roadmap of what you will learn, do, and deliver in your first three months in a role.',
    whyItMatters: 'It shows a new hire understands they need to earn trust, not just show up — managers notice the difference immediately.',
    releaseDate: '2026-09-03'
  },
  {
    id: 'word-counteroffer',
    term: 'Counteroffer',
    audiences: ['new_hires'],
    meaning: 'A modified offer you propose in response to an initial job offer.',
    whyItMatters: 'Knowing how to counter respectfully — with reasons, not just a bigger number — can meaningfully change your comp without souring the relationship before day one.',
    releaseDate: '2026-09-04'
  },
  {
    id: 'word-onboarding',
    term: 'Onboarding',
    audiences: ['new_hires'],
    meaning: 'The structured process of integrating a new employee into a company\'s tools, team, and culture.',
    whyItMatters: 'How you show up during onboarding sets the tone for how you are seen for months — early impressions are disproportionately sticky.',
    releaseDate: '2026-09-05'
  },
  {
    id: 'word-informational-interview',
    term: 'Informational Interview',
    audiences: ['new_hires'],
    meaning: 'A casual conversation to learn about a role or company, distinct from a formal job interview.',
    whyItMatters: 'It is the highest-leverage, lowest-pressure way to build a network before you actually need one — most people only start networking once they are desperate for a job.',
    releaseDate: '2026-09-06'
  },
  {
    id: 'word-salary-negotiation-range',
    term: 'Salary Negotiation Range',
    audiences: ['new_hires'],
    meaning: 'The band between your minimum acceptable offer and your ideal target compensation.',
    whyItMatters: 'Naming a range instead of a single number gives you room to negotiate without looking greedy or naive about the market.',
    releaseDate: '2026-09-07'
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
