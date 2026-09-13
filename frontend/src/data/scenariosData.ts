import { Scenario } from '../types';

export const CURATED_SCENARIOS: Scenario[] = [
  {
    id: 'sc-1',
    title: 'The Zero-Sum Budget Freeze',
    category: 'negotiation',
    counterpartName: 'Alex Chen',
    counterpartRole: 'VP of Product',
    counterpartArchetype: 'hard_negotiator',
    difficulty: 'High Stakes',
    estimatedMinutes: 8,
    situation:
      'You led a project delivering 22% over quarterly targets, but Alex is enforcing an executive freeze on compensation bands and urging you to delay discussions to next year.',
    userGoal:
      'Secure a locked Q3 formal milestone review paired with immediate equity leveling, avoiding a flat "No".',
    brief: {
      counterpartPosition:
        'Budget is strictly capped department-wide; granting adjustments sets an unaffordable precedent.',
      probablePushbackPatterns: [
        'Cites macroeconomic climate and freezes',
        'Pits your compensation against junior headcount',
        'Asks for indefinite patience until next annual cycle'
      ],
      whatGoodLooksLike:
        'Validating the macro constraint, quantifying your leadership ROI as cost-savings, and locking in a milestone review date.',
      keyPhrasesToAvoid: [
        '“It’s not fair that other teams got raises”',
        '“I might have to look elsewhere”',
        '“I need this money right now”'
      ],
      recommendedOpeningFormula:
        '“I appreciate the candid context on budget caps. Given our 22% over-performance, let’s agree on a structured Q3 milestone framework today so the leveling is locked when review opens.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sc-2',
    title: 'Defending the Roadmap Against Scope Creep',
    category: 'managing_up',
    counterpartName: 'Marcus Vance',
    counterpartRole: 'SVP of Global Strategy',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'High Stakes',
    estimatedMinutes: 6,
    situation:
      'The SVP demands 3 unvetted feature demos for next week’s executive summit, which threatens the stability of the entire Q3 platform release.',
    userGoal:
      'Protect engineering release stability while offering an executive-ready prototype alternative.',
    brief: {
      counterpartPosition:
        'The board summit is paramount; technical risk is an acceptable casualty.',
      probablePushbackPatterns: [
        'Accuses you of lacking urgency or company-first mindset',
        'Pressures team into weekend crunch mode',
        'Minimizes the risk of production crashes'
      ],
      whatGoodLooksLike:
        'Framing release stability as board risk, proposing an interactive Figma prototype demo instead of hasty code.',
      keyPhrasesToAvoid: [
        '“My engineers refuse to do this”',
        '“That is impossible”',
        '“You don’t understand tech debt”'
      ],
      recommendedOpeningFormula:
        '“Marcus, I want us to shine in front of the board. Pushing live code into production this week creates severe uptime risk during your demo. Let’s showcase an interactive prototype that highlights the vision safely.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sc-3',
    title: 'Confronting the Credit-Stealing Peer',
    category: 'difficult_decisions',
    counterpartName: 'Elena Rostova',
    counterpartRole: 'Lead Product Manager',
    counterpartArchetype: 'passive_aggressive_peer',
    difficulty: 'Intermediate',
    estimatedMinutes: 5,
    situation:
      'In yesterday’s executive sync, Elena presented your architectural framework as her exclusive initiative without giving you any credit.',
    userGoal:
      'Address the attribution breach directly, establish co-ownership norms, and agree on written correction.',
    brief: {
      counterpartPosition:
        'It was an honest oversight in the rush of presenting, or she believes she spearheaded the high-level concept.',
      probablePushbackPatterns: [
        'Gaslights with “I thought we all knew it was a team effort”',
        'Plays the victim: “Are you questioning my integrity?”',
        'Dismisses it as a minor semantic detail'
      ],
      whatGoodLooksLike:
        'Calmly citing specific presentation slides, holding firm on public attribution, and establishing clear guidelines for future presentations.',
      keyPhrasesToAvoid: [
        '“You stole my work!”',
        '“Everyone knows you didn’t write a single line”',
        '“I’m reporting you to leadership”'
      ],
      recommendedOpeningFormula:
        '“Elena, I noticed in yesterday’s sync that the architectural framework was presented under your name alone. Because my team built that blueprint, I want to ensure proper attribution in the follow-up summary notes.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sc-4',
    title: 'Delivering Critical Feedback to a Defensive Senior IC',
    category: 'feedback',
    counterpartName: 'David Miller',
    counterpartRole: 'Principal Architect',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'High Stakes',
    estimatedMinutes: 7,
    situation:
      'David’s tone in pull request reviews has become increasingly sarcastic and dismissive, demoralizing junior engineers and risking attrition.',
    userGoal:
      'Make behavioral expectations crystal clear, secure commitment to constructive review standards, without alienating his technical leadership.',
    brief: {
      counterpartPosition:
        'He is simply upholding high engineering standards; juniors are too sensitive.',
      probablePushbackPatterns: [
        '“If I have to sugarcoat everything, code quality will tank.”',
        '“I don’t have time to hold people’s hands.”',
        'Threatens to disengage from reviews entirely'
      ],
      whatGoodLooksLike:
        'Separating technical rigor from interpersonal tone; quoting specific review comments and showing their business impact on team velocity.',
      keyPhrasesToAvoid: [
        '“The team thinks you’re a bully”',
        '“You need to be nicer”',
        '“You’re on thin ice”'
      ],
      recommendedOpeningFormula:
        '“David, your technical standards are vital to the platform. However, the tone in your recent PR comments is creating hesitation rather than growth in the team. Let’s align on how to deliver that same rigor constructively.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sc-5',
    title: 'Protecting Boundaries Against Friday Night Pings',
    category: 'boundaries',
    counterpartName: 'Sarah Jenkins',
    counterpartRole: 'Director of Operations',
    counterpartArchetype: 'guilt_tripper',
    difficulty: 'Intermediate',
    estimatedMinutes: 5,
    situation:
      'Sarah continuously sends high-urgency Slack pings at 6:30 PM on Fridays, expecting immediate turnarounds on routine operational decks.',
    userGoal:
      'Reset asynchronous communication boundaries, define true emergency protocols, and reclaim weekend time.',
    brief: {
      counterpartPosition:
        'Operations move at all hours; high performers stay available around the clock.',
      probablePushbackPatterns: [
        '“I thought you were dedicated to the launch.”',
        '“It only takes 15 minutes of your time.”',
        'Sighs and hints that others don’t complain'
      ],
      whatGoodLooksLike:
        'Firm, polite boundary setting; offering a scheduled Monday morning review while providing an escalation trigger for true severity-1 outages.',
      keyPhrasesToAvoid: [
        '“You are ruining my personal life”',
        '“I don’t get paid enough for this”',
        '“Stop messaging me after 5 PM”'
      ],
      recommendedOpeningFormula:
        '“Sarah, to ensure top quality on our deliverables, I reserve weekends for rest and focused prep. I will review this deck first thing Monday at 8:30 AM. If there is ever an active P0 incident, call my mobile directly.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'sc-6',
    title: 'Communicating Team Downsizing & Restructuring',
    category: 'crisis',
    counterpartName: 'Jordan Taylor',
    counterpartRole: 'Senior Engineering Manager',
    counterpartArchetype: 'guilt_tripper',
    difficulty: 'High Stakes',
    estimatedMinutes: 10,
    situation:
      'Executive leadership has mandated a 15% reduction in force. You must inform a key engineering manager that 3 of his team members are affected.',
    userGoal:
      'Communicate the business reality with dignity, absolute clarity, and provide immediate transition support without making false promises.',
    brief: {
      counterpartPosition:
        'Furious that the team hit its milestones only to be cut; feels betrayed by executive leadership.',
      probablePushbackPatterns: [
        '“Why them? I was promised headcount security!”',
        'Threatens to resign alongside the team',
        'Demands exceptions or appeals to the CEO'
      ],
      whatGoodLooksLike:
        'Holding space for emotional grief without wavering on the finality of the decision; guiding the manager to lead his remaining team forward.',
      keyPhrasesToAvoid: [
        '“I know exactly how you feel”',
        '“It’s not my fault, HR made me do this”',
        '“Maybe things will turn around next quarter”'
      ],
      recommendedOpeningFormula:
        '“Jordan, I have difficult news. As part of company-wide restructuring, we are reducing our footprint, and 3 roles on your team are impacted. I am here to share the transition details and partner with you on supporting them with dignity.”'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'scenario-talk-to-manager',
    title: 'Pushing Back on Scope Without Losing Trust',
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
  },
  {
    id: 'scenario-new-hire-expectations',
    title: 'Getting Real Clarity in Week One',
    audiences: ['new_hires'],
    category: 'managing_up',
    counterpartRole: 'Your New Manager',
    counterpartName: 'Daniel Osei',
    counterpartArchetype: 'defensive_boss',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    situation: 'It\'s your fourth day. Your manager has been vague about what success looks like in your first quarter, and you don\'t want to keep guessing.',
    userGoal: 'Get concrete, specific expectations for your first 90 days without sounding like you need hand-holding.',
    brief: {
      counterpartPosition: 'Assumes things are obvious from the job description and is busy; may respond with vague reassurance instead of specifics.',
      probablePushbackPatterns: [
        '"You\'ll figure it out as you go, don\'t overthink it."',
        '"Just focus on getting up to speed for now."',
        '"We can talk about that later once you\'ve settled in."'
      ],
      whatGoodLooksLike: 'Asking a specific, narrow question about what "good" looks like by a specific date, rather than a broad open-ended one that\'s easy to deflect.',
      keyPhrasesToAvoid: ['"I don\'t really know what I\'m supposed to be doing"', '"Sorry to bother you with this"'],
      recommendedOpeningFormula: '"Before I dive further in — what would make my first 30 days a clear success from your side, specifically?"'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'scenario-new-hire-offer-negotiation',
    title: 'Negotiating the Offer Without Losing It',
    audiences: ['new_hires'],
    category: 'negotiation',
    counterpartRole: 'Talent Acquisition Lead',
    counterpartName: 'Renee Falk',
    counterpartArchetype: 'hard_negotiator',
    difficulty: 'Intermediate',
    estimatedMinutes: 6,
    situation: 'You received an offer 12% below the market range you researched. The recruiter is friendly but firm that "this is our standard band for the level."',
    userGoal: 'Push for a better package — salary or otherwise — without risking the offer or sounding ungrateful.',
    brief: {
      counterpartPosition: 'Has real band constraints but some flexibility on non-salary levers; will test how firm your ask actually is.',
      probablePushbackPatterns: [
        '"This is our standard band for this level company-wide."',
        '"We\'d need a strong reason to make an exception."',
        '"Are you saying you won\'t accept without a change?"'
      ],
      whatGoodLooksLike: 'Anchoring on specific market data, asking about the whole package (bonus, start date, review timeline) rather than just base salary, and asking for time to decide instead of answering on the spot.',
      keyPhrasesToAvoid: ['"I guess that\'s fine"', '"I have another offer"  (unless true)'],
      recommendedOpeningFormula: '"I\'m genuinely excited about this role. Based on market data for this level, I was expecting closer to $X — is there flexibility there or elsewhere in the package?"'
    },
    isCurated: true,
    createdAt: new Date().toISOString()
  }
];
