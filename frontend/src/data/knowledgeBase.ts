import { Audience } from '../types';

export interface KnowledgeArticleSection {
  heading: string;
  explanation: string;
  example?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  tagline: string;
  sourceCredit: string;
  audience: Audience;
  category: 'fundraising' | 'valuation' | 'objections' | 'board' | 'management' | 'feedback' | 'interviews' | 'networking' | 'boundaries' | 'conflict' | 'onboarding';
  summary: string;
  sections: KnowledgeArticleSection[];
  relatedScenarioId?: string;
  /** "Test Your Understanding" — shown after the article, drives the
   * shareable comprehension result card (see JourneyScreen/KnowledgeArticleScreen). */
  quiz: QuizQuestion[];
}

// Knowledge base for all 4 target audience segments. Feeds the "Learn"
// surface (LearnScreen / KnowledgeArticleScreen), filtered to whichever
// audience the user picked in onboarding, and doubles as the content backing
// the domain-fluency prompts in domainContext.ts, so the vocabulary here
// should stay consistent with what the AI counterpart uses.
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-fundraising-vocabulary',
    title: 'Fundraising Vocabulary, Decoded',
    tagline: 'The terms investors assume you already know.',
    sourceCredit: 'Rehearse Founder Knowledge Base',
    audience: 'founders_investors',
    category: 'fundraising',
    summary: 'Walking into a term sheet conversation without knowing this vocabulary is the fastest way to lose leverage before you\'ve said a word. These are the terms that come up in nearly every real fundraising conversation.',
    sections: [
      {
        heading: 'SAFE vs. Priced Round',
        explanation: 'A SAFE (Simple Agreement for Future Equity) converts to equity later, at a future priced round — no valuation is set today. A priced round sets your valuation and issues equity immediately. Early rounds are usually SAFEs; Series A and beyond are usually priced.',
        example: '"We\'re running this as a SAFE with a $12M cap, so we\'re not setting a valuation today — it converts at the next priced round."'
      },
      {
        heading: 'Cap Table & Dilution',
        explanation: 'Your cap table is the full list of who owns what percentage of the company. Every new round of funding issues new shares, which dilutes (reduces) everyone\'s existing ownership percentage — including yours.',
        example: '"Raising this round dilutes existing shareholders by roughly 15-18%, which is standard for a Series A."'
      },
      {
        heading: 'Liquidation Preference',
        explanation: 'This determines who gets paid first — and how much — if the company is sold or liquidated. A "1x non-participating" preference is founder-friendly and standard; anything higher or "participating" favors the investor disproportionately.',
        example: '"We\'re comfortable with a standard 1x non-participating preference — anything above that, and we need to talk."'
      },
      {
        heading: 'Pro-Rata Rights',
        explanation: 'The right for an existing investor to maintain their ownership percentage by investing in future rounds. Granting generous pro-rata rights early can crowd out your options in later rounds.',
        example: '"We\'re offering standard pro-rata rights, not super pro-rata — that keeps room open for new lead investors later."'
      }
    ],
    relatedScenarioId: 'scenario-talk-to-investor',
    quiz: [
      {
        question: 'What does a SAFE do, compared to a priced round?',
        options: [
          'Converts to equity later, at a future priced round, without setting a valuation today',
          'Sets your valuation and issues equity immediately',
          'Pays off existing investors before new ones join',
          'Locks in a fixed interest rate on your raise'
        ],
        correctIndex: 0
      },
      {
        question: 'A "1x non-participating" liquidation preference is considered...',
        options: [
          'Highly unusual and investor-hostile',
          'Founder-friendly and standard',
          'Only used in down rounds',
          'A form of pro-rata rights'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'kb-vc-objections',
    title: 'The 5 Objections Every VC Raises',
    tagline: 'And the reframe that actually moves the conversation forward.',
    sourceCredit: 'Rehearse Founder Knowledge Base',
    audience: 'founders_investors',
    category: 'objections',
    summary: 'Investors ask the same handful of questions in almost every meeting. Knowing the objection before it lands means you answer with a plan, not a scramble.',
    sections: [
      {
        heading: '"Your market feels too small"',
        explanation: 'They\'re testing whether you understand your own TAM (Total Addressable Market) beyond the current beachhead. Don\'t argue the number — show the expansion path.',
        example: '"Our current wedge is $400M, but it\'s the entry point into a $6B adjacent category we expand into in year 3."'
      },
      {
        heading: '"Your growth doesn\'t look venture-scale"',
        explanation: 'They\'re comparing your curve to category benchmarks, not judging you in isolation. Anchor on the specific metric that predicts venture-scale outcomes for your model — not vanity growth.',
        example: '"Month-over-month revenue growth is 8%, but net dollar retention is 128% — that\'s the number that predicts our scale."'
      },
      {
        heading: '"What happens if a competitor raises first?"',
        explanation: 'This is a pressure test on your conviction, not a real forecast request. Name your actual moat, not just speed.',
        example: '"Speed isn\'t our moat — our data advantage compounds with every customer, which a faster-funded competitor can\'t shortcut."'
      },
      {
        heading: '"I need to see more traction first"',
        explanation: 'Often means "I like this, but I\'m not the one who has to convince the partnership." Ask directly what specific milestone would change the answer.',
        example: '"What\'s the exact metric and number that would move this from \'interesting\' to \'yes\' for you?"'
      },
      {
        heading: '"Your team has a gap"',
        explanation: 'Usually about a missing functional leader (sales, technical co-founder). Don\'t get defensive — show the hiring plan and interim coverage.',
        example: '"We\'re actively closing a VP Sales search — here\'s the interim plan and the three finalists in process."'
      }
    ],
    relatedScenarioId: 'scenario-talk-to-investor',
    quiz: [
      {
        question: 'When a VC says "your market feels too small," what are they actually testing?',
        options: [
          'Whether your growth rate is above 8%',
          'Whether you understand your TAM beyond the current beachhead',
          'Whether you have a technical co-founder',
          'Whether you can lower your valuation'
        ],
        correctIndex: 1
      },
      {
        question: 'The best way to respond to "I need to see more traction first" is to...',
        options: [
          'Lower your ask immediately',
          'Wait silently for a few months',
          'Ask directly what specific milestone would change the answer',
          'Argue that traction doesn\'t matter'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'kb-valuation-basics',
    title: 'Cap Table & Valuation Basics',
    tagline: 'Pre-money, post-money, and the option pool shuffle — in plain terms.',
    sourceCredit: 'Rehearse Founder Knowledge Base',
    audience: 'founders_investors',
    category: 'valuation',
    summary: 'Valuation math sounds intimidating but is genuinely simple once the terms are demystified — and it\'s exactly the math investors expect you to run in real time during a negotiation.',
    sections: [
      {
        heading: 'Pre-Money vs. Post-Money',
        explanation: 'Pre-money is what the company is worth before new investment. Post-money = pre-money + the new investment amount. Investors often quote pre-money; make sure you\'re both talking about the same number.',
        example: '"$8M pre-money plus our $2M raise puts us at $10M post-money — so you\'re buying 20%."'
      },
      {
        heading: 'The Option Pool Shuffle',
        explanation: 'Investors often require an expanded employee option pool created BEFORE the new money comes in — which dilutes only the founders, not the new investor. Always check whether the pool is pre-money or post-money.',
        example: '"We\'re fine expanding the option pool to 12%, but it needs to come out of post-money, not pre-money."'
      },
      {
        heading: 'Ownership Percentage Math',
        explanation: 'Your ownership after a round = your shares ÷ total shares outstanding after the round. This is the number that actually matters, not the headline valuation.',
        example: '"Even at this valuation, my post-round ownership only drops from 62% to 51% — I\'m comfortable with that."'
      }
    ],
    relatedScenarioId: 'scenario-talk-to-investor',
    quiz: [
      {
        question: 'If a startup raises $2M at an $8M pre-money valuation, what\'s the post-money valuation?',
        options: ['$6M', '$8M', '$10M', '$2M'],
        correctIndex: 2
      },
      {
        question: 'The "option pool shuffle" refers to...',
        options: [
          'Giving investors extra shares as a bonus',
          'Expanding the option pool before new money comes in, diluting only founders',
          'A tax strategy for employee stock',
          'Converting SAFEs to a priced round'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'kb-board-communication',
    title: 'Speaking Board Fluently',
    tagline: 'What board members actually want to hear — and what makes them nervous.',
    sourceCredit: 'Rehearse Founder Knowledge Base',
    audience: 'founders_investors',
    category: 'board',
    summary: 'Board meetings reward founders who lead with the number that matters and name the risk before someone else does. This is the communication pattern experienced operators use.',
    sections: [
      {
        heading: 'Lead With Runway and Burn',
        explanation: 'Every board member is silently doing this math anyway. Naming it first — clearly, without hedging — builds trust immediately.',
        example: '"We have 14 months of runway at current burn, and here\'s the plan to extend that to 20."'
      },
      {
        heading: 'Name the Risk Before They Ask',
        explanation: 'Board members trust founders who surface bad news proactively far more than founders who wait to be asked. Silence reads as either hiding something or not seeing it.',
        example: '"I want to flag now: churn ticked up 2 points this quarter. Here\'s what we think is driving it and what we\'re testing."'
      },
      {
        heading: 'Separate the Update From the Ask',
        explanation: 'Mixing "here\'s how we\'re doing" with "here\'s what I need from you" muddies both. State the update, then make a distinct, specific ask.',
        example: '"That\'s the Q3 update. Separately, I want the board\'s input on the pricing change before we ship it next month."'
      },
      {
        heading: 'A Co-Founder Disagreement in the Room',
        explanation: 'If you and a co-founder disagree in front of the board, resolve it as a united front on process, even if not on outcome — a visible split erodes board confidence fast.',
        example: '"We see this differently, and we\'re working through it together — we\'ll bring the board a joint recommendation by Friday."'
      }
    ],
    relatedScenarioId: 'scenario-talk-to-cofounder',
    quiz: [
      {
        question: 'What should you do with bad news before a board meeting?',
        options: [
          'Wait to see if anyone notices',
          'Only mention it if directly asked',
          'Name the risk proactively, before they ask',
          'Address it after the meeting privately'
        ],
        correctIndex: 2
      },
      {
        question: 'How should you handle a status update alongside a request for board input?',
        options: [
          'Blend them into one long narrative',
          'State the update, then make a distinct, specific ask',
          'Only bring the ask, skip the update',
          'Let the board bring it up themselves'
        ],
        correctIndex: 1
      }
    ]
  },

  // New Manager segment
  {
    id: 'kb-first-90-days-managing',
    title: 'The First 90 Days of Managing',
    tagline: 'The habits that separate managers people trust from managers people tolerate.',
    sourceCredit: 'Rehearse New Manager Knowledge Base',
    audience: 'new_managers',
    category: 'management',
    summary: 'Most first-time managers are promoted for being great individual contributors, then given zero training on the actual job. These are the fundamentals that matter most in your first quarter.',
    sections: [
      {
        heading: 'Run 1-on-1s That Are Theirs, Not Yours',
        explanation: 'A 1-on-1 is your direct report\'s meeting, not a status update to you. Let them set the agenda first, and resist the urge to fill every silence.',
        example: '"Before I share updates — what\'s on your mind this week? What would be most useful to spend our time on?"'
      },
      {
        heading: 'Delegate the Outcome, Not the Method',
        explanation: 'New managers often over-specify how a task should be done, which reads as micromanagement and blocks growth. State the outcome and constraints, then let them own the approach.',
        example: '"I need this ready to present Friday and it needs exec-level polish — how you get there is your call. Flag me if you hit a blocker."'
      },
      {
        heading: 'Set Expectations Explicitly, Early',
        explanation: 'Most performance problems trace back to expectations that were assumed, not stated. Say what "good" looks like before the work starts, not after it\'s wrong.',
        example: '"Here\'s what I\'ll be looking for when I review this: accuracy first, then speed. Let\'s align on that before you start."'
      }
    ],
    relatedScenarioId: 'scenario-talk-to-manager',
    quiz: [
      {
        question: 'In a 1-on-1, whose meeting is it?',
        options: [
          'The manager\'s — set the agenda for them',
          'HR\'s — they set the structure',
          'The direct report\'s — let them set the agenda first',
          'Whoever speaks first'
        ],
        correctIndex: 2
      },
      {
        question: '"Delegate the outcome, not the method" means...',
        options: [
          'Specify every step so nothing goes wrong',
          'Do the task yourself to be safe',
          'Avoid giving any guidance at all',
          'State the outcome and constraints, then let them own the approach'
        ],
        correctIndex: 3
      }
    ]
  },
  {
    id: 'kb-feedback-that-lands',
    title: 'Giving Feedback That Actually Lands',
    tagline: 'A simple structure that replaces the feedback sandwich.',
    sourceCredit: 'Rehearse New Manager Knowledge Base',
    audience: 'new_managers',
    category: 'feedback',
    summary: 'The "compliment sandwich" trains people to brace for the middle and discount the praise. This structure is more direct and, counterintuitively, feels more respectful to the person receiving it.',
    sections: [
      {
        heading: 'Situation → Behavior → Impact',
        explanation: 'Name the specific moment, the specific observable behavior (not a character trait), and the concrete impact it had. This keeps feedback factual instead of personal.',
        example: '"In yesterday\'s client call, when you cut off Priya twice, the client visibly disengaged — I think it cost us credibility in that moment."'
      },
      {
        heading: 'Ask, Don\'t Just Tell',
        explanation: 'After naming the behavior and impact, ask what they noticed or what got in the way. This turns feedback into a conversation instead of a verdict.',
        example: '"What was going on for you in that moment? I want to understand before we talk about what to do differently."'
      },
      {
        heading: 'Make the Next Step Concrete',
        explanation: 'End with one specific, observable change — not a vague "be more mindful." Vague feedback is the #1 reason feedback doesn\'t change behavior.',
        example: '"Next client call, let\'s try you holding your point until they finish their sentence, even if you\'re sure where they\'re headed."'
      }
    ],
    relatedScenarioId: 'scenario-02-critical-feedback',
    quiz: [
      {
        question: 'The Situation → Behavior → Impact structure keeps feedback focused on...',
        options: [
          'The person\'s general attitude',
          'Specific, observable behavior and its concrete impact — not character',
          'Past performance reviews',
          'Comparisons to other team members'
        ],
        correctIndex: 1
      },
      {
        question: 'Why is "be more mindful" considered weak feedback?',
        options: [
          'It\'s too harsh',
          'It should be given in writing only',
          'It skips the compliment sandwich',
          'It\'s vague — feedback needs one specific, observable next step'
        ],
        correctIndex: 3
      }
    ]
  },

  // MBA Student segment
  {
    id: 'kb-case-interview-communication',
    title: 'Case Interview Communication Basics',
    tagline: 'How to sound structured under pressure, even when you\'re not sure yet.',
    sourceCredit: 'Rehearse MBA Knowledge Base',
    audience: 'mba_students',
    category: 'interviews',
    summary: 'Interviewers are grading how you think out loud as much as the final answer. These are the communication habits that read as structured, confident thinking — even mid-case.',
    sections: [
      {
        heading: 'Restate, Then Take a Beat',
        explanation: 'Repeat the question in your own words before answering — it confirms you understood it and buys you a few seconds to structure your response, without an awkward silence.',
        example: '"So we\'re trying to figure out why margins dropped 8 points despite flat revenue — let me structure how I\'d approach that."'
      },
      {
        heading: 'Signpost Your Structure Out Loud',
        explanation: 'Say your framework before you dive into it. Interviewers can\'t see your thinking — naming the buckets first makes you sound organized even before you\'ve solved anything.',
        example: '"I\'d look at this through three lenses: cost structure, pricing, and mix shift. Let\'s start with cost structure."'
      },
      {
        heading: 'Narrate Pivots, Don\'t Hide Them',
        explanation: 'When new data changes your hypothesis, say so explicitly instead of quietly changing direction. Interviewers reward visible, adaptive reasoning over a rigid "right answer."',
        example: '"That changes things — given fixed costs are the real driver, I want to redirect from pricing to the cost side. Is that okay?"'
      }
    ],
    quiz: [
      {
        question: 'Why restate the interviewer\'s question before answering?',
        options: [
          'It shows you weren\'t listening',
          'It confirms understanding and buys structuring time without silence',
          'It\'s required by case interview rules',
          'It fills time when you don\'t know the answer'
        ],
        correctIndex: 1
      },
      {
        question: 'When new data changes your hypothesis mid-case, you should...',
        options: [
          'Stick with your original answer regardless',
          'Ask to restart the case',
          'Narrate the pivot explicitly instead of quietly changing direction',
          'Stay silent and hope they don\'t notice'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'kb-networking-without-transactional',
    title: 'Networking Without Sounding Transactional',
    tagline: 'How to ask for someone\'s time without it feeling like an ask.',
    sourceCredit: 'Rehearse MBA Knowledge Base',
    audience: 'mba_students',
    category: 'networking',
    summary: 'The instinct to lead with "can I pick your brain" or "can you refer me" is exactly what makes networking feel transactional — for both sides. These reframes make outreach feel like a real conversation.',
    sections: [
      {
        heading: 'Lead With Specificity, Not Flattery',
        explanation: 'Generic praise ("I love your career path!") signals a mass-sent message. A specific, genuine observation about their work signals you actually did the homework.',
        example: '"I noticed you moved from consulting into product at a Series B — I\'m weighing that exact transition and would love 15 minutes on what surprised you."'
      },
      {
        heading: 'Make the Ask Small and Clear',
        explanation: 'Vague asks ("would love to connect!") create work for the other person to figure out what you actually want. A small, specific ask is easier to say yes to.',
        example: '"Would you be open to a 15-minute call in the next two weeks? I have three specific questions, not a general chat."'
      },
      {
        heading: 'Close the Loop, Every Time',
        explanation: 'Following up after the conversation with what you actually did with their advice is what turns a one-time favor into an ongoing relationship.',
        example: '"Update: I took your advice and reached out to their platform team directly — got a first interview. Thank you, genuinely."'
      }
    ],
    quiz: [
      {
        question: 'What makes networking outreach feel transactional?',
        options: [
          'Leading with generic praise or a vague, open-ended ask',
          'Being too specific about your interest',
          'Following up afterward',
          'Asking for exactly 15 minutes'
        ],
        correctIndex: 0
      },
      {
        question: 'What turns a one-time favor into an ongoing relationship?',
        options: [
          'Asking for another favor right away',
          'Never contacting them again',
          'Closing the loop — following up with what you did with their advice',
          'Sending a generic thank-you template'
        ],
        correctIndex: 2
      }
    ]
  },

  // Working Professional segment
  {
    id: 'kb-boundaries-at-work',
    title: 'Setting Boundaries at Work Without Sounding Difficult',
    tagline: 'How to say no in a way that protects the relationship.',
    sourceCredit: 'Rehearse Professional Knowledge Base',
    audience: 'professionals',
    category: 'boundaries',
    summary: 'Most people over-explain or over-apologize when setting a boundary, which invites negotiation. A clear, brief boundary — stated without excessive justification — is actually easier for the other person to accept.',
    sections: [
      {
        heading: 'State It Once, Without Apologizing',
        explanation: 'Repeated apologies ("sorry, I know this is annoying, but...") signal that the boundary is negotiable. State it plainly, once.',
        example: '"I\'m not available for calls after 6pm. For anything urgent, email works and I\'ll see it first thing."'
      },
      {
        heading: 'Offer the Alternative, Not Just the No',
        explanation: 'A boundary paired with a workable alternative reads as collaborative, not obstructive.',
        example: '"I can\'t take this on this week, but I can prioritize it first thing Monday if that works."'
      },
      {
        heading: 'Expect One Round of Pushback',
        explanation: 'The first response to a new boundary is often a soft test ("just this once?"). Holding the line calmly the first time usually means you won\'t have to repeat it.',
        example: '"I hear that it\'s tight — my answer\'s still the same for this one. Let\'s find a plan that works within that."'
      }
    ],
    relatedScenarioId: 'scenario-03-weekend-boundaries',
    quiz: [
      {
        question: 'How should you state a boundary?',
        options: [
          'With multiple apologies to soften it',
          'Only when directly confronted',
          'As a question, not a statement',
          'Plainly, once, without repeated apologizing'
        ],
        correctIndex: 3
      },
      {
        question: 'What usually happens the first time you hold a new boundary?',
        options: [
          'Immediate, permanent acceptance',
          'One round of soft pushback that holding calmly usually resolves',
          'The other person escalates indefinitely',
          'Nothing — boundaries are never tested'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'kb-navigating-peer-conflict',
    title: 'Navigating Workplace Conflict With a Peer',
    tagline: 'De-escalating tension without avoiding the actual issue.',
    sourceCredit: 'Rehearse Professional Knowledge Base',
    audience: 'professionals',
    category: 'conflict',
    summary: 'Most workplace conflict festers because people either avoid it entirely or vent about it to everyone except the person involved. This is the pattern for addressing it directly and calmly.',
    sections: [
      {
        heading: 'Address It Privately, Early',
        explanation: 'Letting friction build makes the eventual conversation bigger and more charged than it needs to be. Raise it while it\'s still small.',
        example: '"Got a couple minutes today? Something\'s been on my mind from Tuesday\'s meeting I\'d rather just talk through directly."'
      },
      {
        heading: 'Describe Behavior, Not Character',
        explanation: '"You were dismissive" invites defensiveness. "You cut me off twice before I finished the point" describes something specific and undeniable.',
        example: '"In the meeting, I got cut off twice before finishing a point — I want to make sure I\'m getting full airtime on this project."'
      },
      {
        heading: 'End With a Shared Path Forward',
        explanation: 'Conflict conversations land better when they end with an agreement, not just an airing of grievances.',
        example: '"Can we agree that whoever\'s talking finishes the thought before the other jumps in, starting with our next sync?"'
      }
    ],
    relatedScenarioId: 'scenario-05-credit-stealing',
    quiz: [
      {
        question: 'When should you raise friction with a peer?',
        options: [
          'In a group meeting, so witnesses are present',
          'Only after it\'s been building for months',
          'Privately, early — while it\'s still small',
          'Never — let it resolve itself'
        ],
        correctIndex: 2
      },
      {
        question: '"You cut me off twice before I finished the point" is more effective than "you were dismissive" because it...',
        options: [
          'Is more emotional',
          'Describes specific behavior, not character',
          'Involves a witness',
          'Avoids naming a behavior at all'
        ],
        correctIndex: 1
      }
    ]
  },

  // New Hire / Job Seeker segment
  {
    id: 'kb-first-90-days-new-hire',
    title: 'Winning Your First 90 Days',
    tagline: 'The habits that make a new hire look like a fast learner, not a risk.',
    sourceCredit: 'Rehearse New Hire Knowledge Base',
    audience: 'new_hires',
    category: 'onboarding',
    summary: 'The first 90 days set the frame everyone uses to judge you for the next two years. These are the habits that build trust fastest, before you\'ve had time to prove yourself through results alone.',
    sections: [
      {
        heading: 'Ask "What Does Good Look Like?" Early',
        explanation: 'Most new-hire anxiety comes from guessing at unstated standards. Asking directly, in week one, signals maturity rather than incompetence.',
        example: '"Before I dive in — what would make this project a clear success from your side, by the time we review it?"'
      },
      {
        heading: 'Turn Confusion Into a Specific Question',
        explanation: 'A vague "I\'m a bit lost" reads as low competence. A specific, narrow question about one exact thing you don\'t understand reads as sharp attention to detail.',
        example: '"Quick check — when you say \'the client dashboard,\' do you mean the internal one or the one clients log into directly?"'
      },
      {
        heading: 'Name Your Bandwidth Before It Breaks',
        explanation: 'New hires often say yes to everything to prove eagerness, then quietly drown. Flagging capacity early, calmly, prevents a much worse conversation later.',
        example: '"I want to do both of these well — can we agree which one takes priority if I can\'t finish both by Friday?"'
      }
    ],
    relatedScenarioId: 'scenario-new-hire-expectations',
    quiz: [
      {
        question: 'What\'s the best way to handle unstated expectations in week one?',
        options: [
          'Guess and hope you\'re right',
          'Wait for a formal review',
          'Ask directly what "good" looks like — it signals maturity',
          'Assume the job description covers it'
        ],
        correctIndex: 2
      },
      {
        question: 'What should you do before your capacity actually breaks?',
        options: [
          'Say yes to everything to prove eagerness',
          'Name your bandwidth concern calmly, early',
          'Quietly drop lower-priority tasks without telling anyone',
          'Wait until you\'re overwhelmed to say anything'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 'kb-negotiating-the-offer',
    title: 'Negotiating an Offer Without Losing It',
    tagline: 'How to ask for more without sounding ungrateful or greedy.',
    sourceCredit: 'Rehearse New Hire Knowledge Base',
    audience: 'new_hires',
    category: 'onboarding',
    summary: 'Most candidates either don\'t negotiate at all, or negotiate in a way that reads as adversarial. The actual pattern experienced negotiators use is collaborative, specific, and time-bound.',
    sections: [
      {
        heading: 'Anchor on Market Data, Not Feelings',
        explanation: 'Naming a specific number backed by market research reads as informed. Naming a number because "it feels fair" invites the recruiter to negotiate your feelings, not your value.',
        example: '"Based on market data for this role and level, I was expecting something closer to $X — is there room to move toward that?"'
      },
      {
        heading: 'Negotiate the Whole Package, Not Just Salary',
        explanation: 'Base salary is often the least flexible lever. Signing bonus, start date, remote flexibility, and title can all move even when the number can\'t.',
        example: '"If the base is fixed at this level, is there flexibility on a signing bonus or an early performance review?"'
      },
      {
        heading: 'Always Ask for Time to Decide',
        explanation: 'Accepting or countering on the spot removes your leverage. A short, specific timeline signals seriousness, not hesitation.',
        example: '"This is exciting — can I take 48 hours to review the full offer in detail before confirming?"'
      }
    ],
    quiz: [
      {
        question: 'What should you anchor your salary ask on?',
        options: [
          'What your friends make',
          'Specific market data, not just a feeling of fairness',
          'The lowest number you\'d accept',
          'The company\'s stated budget only'
        ],
        correctIndex: 1
      },
      {
        question: 'If base salary is fixed, what else can still move?',
        options: [
          'Nothing — a fixed base means a fixed offer',
          'Only the job title',
          'Signing bonus, start date, or an early performance review',
          'Only the number of vacation days'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 'kb-case-interview-for-new-hires',
    title: 'Interview Answers That Actually Land',
    tagline: 'Sounding confident and specific, even when the question catches you off guard.',
    sourceCredit: 'Rehearse New Hire Knowledge Base',
    audience: 'new_hires',
    category: 'interviews',
    summary: 'Interviewers remember specificity far more than polish. These are the habits that make an answer memorable instead of generic — especially under an unexpected follow-up question.',
    sections: [
      {
        heading: 'Answer With One Story, Not Three Themes',
        explanation: 'A single concrete story with a real number or outcome beats three abstract qualities every time. Specificity is what interviewers actually remember afterward.',
        example: '"Rather than list traits, let me walk through one project where that showed up directly — the Q2 onboarding redesign."'
      },
      {
        heading: 'Handle "I Don\'t Know" Honestly, Then Reason Out Loud',
        explanation: 'Bluffing an answer you don\'t have is riskier than admitting the gap and reasoning through it live — interviewers are often grading the reasoning process, not just the final answer.',
        example: '"I haven\'t worked with that tool directly, but here\'s how I\'d approach figuring it out in the first week."'
      },
      {
        heading: 'Ask One Sharp Question Back',
        explanation: 'A generic "what\'s the culture like?" is forgettable. A specific question about a real tension in the role signals you\'ve actually thought about the job.',
        example: '"How does the team currently decide between shipping fast versus shipping polished — which way does it usually lean?"'
      }
    ],
    quiz: [
      {
        question: 'What do interviewers remember more — abstract traits or a specific story?',
        options: [
          'A list of three abstract qualities',
          'A single concrete story with a real outcome',
          'Neither — only résumés matter',
          'Whichever answer is longest'
        ],
        correctIndex: 1
      },
      {
        question: 'If you don\'t know something in an interview, what\'s the stronger move?',
        options: [
          'Bluff a confident-sounding answer',
          'Change the subject',
          'Ask to skip the question',
          'Admit the gap honestly, then reason through it out loud'
        ],
        correctIndex: 3
      }
    ]
  }
];
