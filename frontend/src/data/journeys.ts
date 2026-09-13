import {
  DollarSign,
  Shield,
  TrendingUp,
  Users2,
  UserCog,
  MessageSquareHeart,
  GraduationCap,
  Handshake,
  Ban,
  Swords,
  UserPlus,
  Scale,
  Frown,
  AlertCircle,
  Users
} from 'lucide-react-native';
import { Audience } from '../types';

export type JourneyNodeType = 'lesson' | 'story' | 'upcoming';

export interface JourneyNode {
  /** Stable id — also the backend story-cache key for 'story' nodes. */
  id: string;
  type: JourneyNodeType;
  /** Groups nodes into the path's chapter banners, e.g. "WEEK 1". */
  stageLabel: string;
  title: string;
  description: string;
  icon: any;
  /** 'lesson' nodes only — id into KNOWLEDGE_ARTICLES. */
  articleId?: string;
  /** 'story' nodes only — short theme fed to the backend story prompt. */
  storySeed?: string;
}

export interface Journey {
  audience: Audience;
  title: string;
  tagline: string;
  nodes: JourneyNode[];
}

// Each journey interleaves the audience's existing knowledge-base lessons
// with AI-generated (then permanently cached per user) branching story
// scenes — see backend storyService.getNodeStory. Every lesson references an
// article already in knowledgeBase.ts; every story seed is a short theme
// drawn from this same audience's dread scenarios in OnboardingScreen.tsx,
// so no node invents content from scratch — this just re-threads what
// already existed into one coherent, ordered arc instead of two disconnected
// surfaces (the old LearnScreen list and the old daily-random Story Mode).
export const JOURNEYS: Record<Audience, Journey> = {
  founders_investors: {
    audience: 'founders_investors',
    title: 'The Founder Journey',
    tagline: 'From first pitch to your next board meeting.',
    nodes: [
      {
        id: 'fi-fundraising-vocab',
        type: 'lesson',
        stageLabel: 'PRE-RAISE',
        title: 'Fundraising Vocabulary, Decoded',
        description: 'The terms investors assume you already know.',
        icon: DollarSign,
        articleId: 'kb-fundraising-vocabulary'
      },
      {
        id: 'fi-down-round-pitch',
        type: 'story',
        stageLabel: 'THE RAISE',
        title: 'Pitching a Down Round',
        description: 'Deliver hard financial news while keeping investor confidence intact.',
        icon: TrendingUp,
        storySeed: 'Pitching a down round or valuation cut to existing investors, who are watching your composure as closely as your numbers.'
      },
      {
        id: 'fi-vc-objections',
        type: 'lesson',
        stageLabel: 'THE RAISE',
        title: 'The 5 Objections Every VC Raises',
        description: 'And the reframe that actually moves the conversation forward.',
        icon: Shield,
        articleId: 'kb-vc-objections'
      },
      {
        id: 'fi-term-sheet-pushback',
        type: 'story',
        stageLabel: 'NEGOTIATING TERMS',
        title: "Pushing Back on a Term Sheet",
        description: "Hold your position on an investor's unreasonable demand without souring the relationship.",
        icon: Scale,
        storySeed: "An investor's term sheet includes a demand you believe is unreasonable, and they're testing whether you'll simply accept it."
      },
      {
        id: 'fi-valuation-basics',
        type: 'lesson',
        stageLabel: 'CLOSING THE ROUND',
        title: 'Cap Table & Valuation Basics',
        description: 'Pre-money, post-money, and the option pool shuffle.',
        icon: TrendingUp,
        articleId: 'kb-valuation-basics'
      },
      {
        id: 'fi-board-pushback',
        type: 'story',
        stageLabel: 'AFTER THE RAISE',
        title: 'Defending a Decision to the Board',
        description: 'Anchor your reasoning with conviction under pointed scrutiny.',
        icon: Users2,
        storySeed: 'Defending a strategic decision the board is openly skeptical of, in a meeting where two members have already voiced doubt.'
      },
      {
        id: 'fi-board-communication',
        type: 'lesson',
        stageLabel: 'RUNNING THE COMPANY',
        title: 'Speaking Board Fluently',
        description: 'What board members actually want to hear.',
        icon: Users2,
        articleId: 'kb-board-communication'
      },
      {
        id: 'fi-cofounder-alignment',
        type: 'story',
        stageLabel: 'RUNNING THE COMPANY',
        title: 'Aligning With Your Co-Founder',
        description: 'Resolve a fundamental strategy disagreement without fracturing the partnership.',
        icon: Handshake,
        storySeed: 'A fundamental strategy disagreement with your co-founder that has started to affect how the team sees your partnership.'
      }
    ]
  },

  new_managers: {
    audience: 'new_managers',
    title: 'The New Manager Journey',
    tagline: 'Your first quarter leading a team, one conversation at a time.',
    nodes: [
      {
        id: 'nm-first-90-days',
        type: 'lesson',
        stageLabel: 'GETTING STARTED',
        title: 'The First 90 Days of Managing',
        description: 'The habits that separate managers people trust from managers people tolerate.',
        icon: UserCog,
        articleId: 'kb-first-90-days-managing'
      },
      {
        id: 'nm-difficult-feedback',
        type: 'story',
        stageLabel: 'GETTING STARTED',
        title: 'Your First Hard Feedback Conversation',
        description: 'Address underperformance directly without damaging morale or trust.',
        icon: MessageSquareHeart,
        storySeed: 'Giving a direct report difficult performance feedback for the first time, in a way that lands without damaging trust.'
      },
      {
        id: 'nm-feedback-that-lands',
        type: 'lesson',
        stageLabel: 'BUILDING TRUST',
        title: 'Giving Feedback That Actually Lands',
        description: 'A simple structure that replaces the feedback sandwich.',
        icon: MessageSquareHeart,
        articleId: 'kb-feedback-that-lands'
      },
      {
        id: 'nm-team-conflict',
        type: 'story',
        stageLabel: 'BUILDING TRUST',
        title: 'Mediating a Team Conflict',
        description: 'De-escalate tension and rebuild working trust between two direct reports.',
        icon: Users,
        storySeed: 'Mediating an escalating conflict between two direct reports who both expect you to take their side.'
      },
      {
        id: 'nm-manage-up',
        type: 'story',
        stageLabel: 'LEADING UP',
        title: "Pushing Back on Your Own Manager",
        description: "Set a boundary upward without seeming like you're not a team player.",
        icon: Scale,
        storySeed: "Pushing back on your own manager's unrealistic deadline for your team, without looking uncooperative."
      },
      {
        id: 'nm-boundary-report',
        type: 'story',
        stageLabel: 'HOLDING THE LINE',
        title: 'Setting a Boundary With a Report',
        description: 'Reassert scope and expectations without damaging the relationship.',
        icon: Ban,
        storySeed: 'Setting a firm boundary with a direct report who keeps overstepping their scope, without damaging the relationship.'
      }
    ]
  },

  mba_students: {
    audience: 'mba_students',
    title: 'The MBA Journey',
    tagline: 'From case prep to closing the offer.',
    nodes: [
      {
        id: 'mba-case-basics',
        type: 'lesson',
        stageLabel: 'CASE PREP',
        title: 'Case Interview Communication Basics',
        description: 'How to sound structured under pressure, even when you’re not sure yet.',
        icon: GraduationCap,
        articleId: 'kb-case-interview-communication'
      },
      {
        id: 'mba-case-pushback',
        type: 'story',
        stageLabel: 'CASE PREP',
        title: 'Disagreeing With an Interviewer',
        description: 'Defend your reasoning to an interviewer without sounding defensive.',
        icon: Scale,
        storySeed: 'Pushing back in a case interview when you disagree with the interviewer’s feedback on your framework.'
      },
      {
        id: 'mba-networking',
        type: 'lesson',
        stageLabel: 'BUILDING YOUR NETWORK',
        title: 'Networking Without Sounding Transactional',
        description: 'How to ask for someone’s time without it feeling like an ask.',
        icon: Handshake,
        articleId: 'kb-networking-without-transactional'
      },
      {
        id: 'mba-networking-stall',
        type: 'story',
        stageLabel: 'BUILDING YOUR NETWORK',
        title: 'A Networking Chat Going Nowhere',
        description: 'Redirect a stalled conversation toward a concrete next step.',
        icon: Handshake,
        storySeed: 'A networking conversation with a senior contact that has gone vague and is stalling out, with no next step in sight.'
      },
      {
        id: 'mba-offer-negotiation',
        type: 'story',
        stageLabel: 'LANDING THE ROLE',
        title: 'Negotiating a Job Offer',
        description: 'Anchor your ask with market data and calm conviction.',
        icon: DollarSign,
        storySeed: 'Negotiating a job offer or signing bonus after an interview process, without risking the offer.'
      },
      {
        id: 'mba-group-conflict',
        type: 'story',
        stageLabel: 'ON CAMPUS',
        title: 'A Heated Group Project Disagreement',
        description: 'Disarm tension and get the team realigned on a shared deliverable.',
        icon: Users,
        storySeed: 'A heated disagreement during a group project the night before a deliverable is due.'
      }
    ]
  },

  professionals: {
    audience: 'professionals',
    title: 'The Career Growth Journey',
    tagline: 'Boundaries, conflict, and the conversations that shape your career.',
    nodes: [
      {
        id: 'pro-boundaries',
        type: 'lesson',
        stageLabel: 'PROTECTING YOUR TIME',
        title: 'Setting Boundaries at Work',
        description: 'How to say no in a way that protects the relationship.',
        icon: Ban,
        articleId: 'kb-boundaries-at-work'
      },
      {
        id: 'pro-firm-boundary',
        type: 'story',
        stageLabel: 'PROTECTING YOUR TIME',
        title: 'Setting a Firm Boundary',
        description: 'Say no clearly without sounding defensive or disengaged.',
        icon: Ban,
        storySeed: 'Setting a firm boundary on scope or hours with a colleague who keeps pushing past it.'
      },
      {
        id: 'pro-peer-conflict',
        type: 'lesson',
        stageLabel: 'WORKPLACE CONFLICT',
        title: 'Navigating Workplace Conflict With a Peer',
        description: 'De-escalating tension without avoiding the actual issue.',
        icon: Swords,
        articleId: 'kb-navigating-peer-conflict'
      },
      {
        id: 'pro-peer-friction',
        type: 'story',
        stageLabel: 'WORKPLACE CONFLICT',
        title: 'An Escalating Disagreement With a Peer',
        description: 'Disarm tension and establish collaborative alignment.',
        icon: Swords,
        storySeed: 'An escalating disagreement with a peer over shared deliverables that is starting to affect the whole team.'
      },
      {
        id: 'pro-compensation',
        type: 'story',
        stageLabel: 'GROWING YOUR CAREER',
        title: 'Asking for a Raise',
        description: 'Anchor your market value with calm, evidence-backed conviction.',
        icon: DollarSign,
        storySeed: 'Asking for a compensation increase in a conversation with your manager that you have been putting off.'
      },
      {
        id: 'pro-client-pushback',
        type: 'story',
        stageLabel: 'GROWING YOUR CAREER',
        title: 'Pushing Back on an Unreasonable Client',
        description: 'De-escalate unrealistic deadlines while holding your ground.',
        icon: AlertCircle,
        storySeed: 'Pushing back against an unreasonable client or leader who is demanding an unrealistic deadline.'
      }
    ]
  },

  new_hires: {
    audience: 'new_hires',
    title: 'Your Career Start Journey',
    tagline: 'From your next interview to your first performance review.',
    nodes: [
      {
        id: 'nh-interview-answers',
        type: 'lesson',
        stageLabel: 'LANDING THE JOB',
        title: 'Interview Answers That Actually Land',
        description: 'Sounding confident and specific, even when the question catches you off guard.',
        icon: GraduationCap,
        articleId: 'kb-case-interview-for-new-hires'
      },
      {
        id: 'nh-tough-interview-question',
        type: 'story',
        stageLabel: 'LANDING THE JOB',
        title: 'Acing a Tough Interview Question',
        description: 'Handle an unexpected question under pressure, without losing composure.',
        icon: GraduationCap,
        storySeed: "An interviewer asks a tough, unexpected follow-up question that you don't have a ready answer for."
      },
      {
        id: 'nh-negotiating-offer',
        type: 'lesson',
        stageLabel: 'THE OFFER',
        title: 'Negotiating an Offer Without Losing It',
        description: 'How to ask for more without sounding ungrateful or greedy.',
        icon: DollarSign,
        articleId: 'kb-negotiating-the-offer'
      },
      {
        id: 'nh-salary-negotiation',
        type: 'story',
        stageLabel: 'THE OFFER',
        title: 'Negotiating Your Starting Salary',
        description: 'Anchor your ask with market data without risking the offer.',
        icon: DollarSign,
        storySeed: 'Negotiating a starting salary or signing bonus after receiving an offer below what you expected.'
      },
      {
        id: 'nh-first-90-days',
        type: 'lesson',
        stageLabel: 'DAY ONE',
        title: 'Winning Your First 90 Days',
        description: 'The habits that make a new hire look like a fast learner, not a risk.',
        icon: UserPlus,
        articleId: 'kb-first-90-days-new-hire'
      },
      {
        id: 'nh-clarify-expectations',
        type: 'story',
        stageLabel: 'DAY ONE',
        title: 'Day One: What Does "Good" Look Like?',
        description: 'Get concrete expectations early instead of guessing for months.',
        icon: Scale,
        storySeed: "It's your first week, and your new manager has been vague about what success looks like in your first quarter."
      },
      {
        id: 'nh-admit-not-knowing',
        type: 'story',
        stageLabel: 'THE FIRST FEW WEEKS',
        title: "Admitting You Don't Understand Something",
        description: 'Ask a clarifying question in a way that builds credibility, not doubt.',
        icon: MessageSquareHeart,
        storySeed: "You don't understand an instruction from a teammate, and you're worried asking will make you look incompetent this early."
      },
      {
        id: 'nh-overwhelmed',
        type: 'story',
        stageLabel: 'THE FIRST FEW WEEKS',
        title: "Telling Your Manager You're Overwhelmed",
        description: 'Raise a capacity concern early without looking like you can’t handle the job.',
        icon: AlertCircle,
        storySeed: 'You are quietly overwhelmed in your first month and need to raise it with your manager before it becomes a bigger problem.'
      },
      {
        id: 'nh-team-clique',
        type: 'story',
        stageLabel: 'FITTING IN',
        title: "A Team That Hasn't Let You In Yet",
        description: 'Build trust with a tenured team without forcing it or going quiet.',
        icon: Users,
        storySeed: "You've noticed the existing team hasn't fully let you in yet, and it's starting to affect how included you feel in decisions."
      },
      {
        id: 'nh-rough-review',
        type: 'story',
        stageLabel: 'THE FIRST REVIEW',
        title: 'The Rough First Performance Review',
        description: 'Stay composed and turn early criticism into a concrete improvement plan.',
        icon: Frown,
        storySeed: 'Your first performance review includes more critical feedback than you expected, and you need to respond in the room.'
      }
    ]
  }
};
