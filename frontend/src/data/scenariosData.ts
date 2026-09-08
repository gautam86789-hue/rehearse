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
  }
];
