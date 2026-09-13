import { UserProfile, HistoryEntry } from '../types';
import { KNOWLEDGE_ARTICLES } from './knowledgeBase';

export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  icon: 'flame' | 'award' | 'shield-check' | 'sparkles';
  isUnlocked: (user: UserProfile, history: HistoryEntry[]) => boolean;
}

// Mirrors the badge triggers in backend/src/services/gamificationService.ts —
// kept as a static client-side list (rather than a fetched one) so locked
// milestones can be shown too, not just the ones already unlocked.
//
// The first four are "starting steps" milestones — unlocked via
// AppContext.unlockMilestone() at low-friction moments (finishing
// onboarding, opening your first rehearsal, exploring Learn, personalizing
// your profile) rather than requiring a full completed rehearsal, so a new
// user gets an early win before the harder badges are even reachable.
export const MILESTONES: MilestoneDef[] = [
  {
    id: 'badge_onboarded',
    title: 'Welcome Aboard',
    description: 'Completed onboarding and picked your focus.',
    icon: 'sparkles',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_onboarded
  },
  {
    id: 'badge_first_session_started',
    title: 'Stepped Up',
    description: 'Started your very first rehearsal.',
    icon: 'flame',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_first_session_started
  },
  {
    id: 'badge_explorer',
    title: 'Explorer',
    description: 'Opened the Learn tab for the first time.',
    icon: 'award',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_explorer
  },
  {
    id: 'badge_profile_customized',
    title: 'Made It Yours',
    description: 'Personalized your profile.',
    icon: 'shield-check',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_profile_customized
  },
  {
    id: 'badge_story_mode',
    title: 'Story Chooser',
    description: 'Completed your first Story Mode.',
    icon: 'sparkles',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_story_mode
  },
  {
    id: 'badge_roadmap_complete',
    title: 'Path Cleared',
    description: 'Completed every lesson on your Learn roadmap.',
    icon: 'award',
    isUnlocked: (user) => {
      const audience = user.audience || 'founders_investors';
      const total = KNOWLEDGE_ARTICLES.filter((a) => a.audience === audience).length;
      const read = new Set(user.readArticleIds || []);
      const completed = KNOWLEDGE_ARTICLES.filter((a) => a.audience === audience && read.has(a.id)).length;
      return total > 0 && completed === total;
    }
  },
  // Supersedes badge_roadmap_complete for the unified Journey (lessons +
  // story scenes together) — that older badge is left in place purely so
  // anyone who already earned it under the old separate Learn roadmap keeps
  // it, but new completions are driven by this one instead (fired via
  // unlockMilestone from JourneyScreen/JourneyStoryScreen).
  {
    id: 'badge_journey_complete',
    title: 'Path Cleared',
    description: 'Completed every stage of your Journey.',
    icon: 'award',
    isUnlocked: (user) => !!user.milestoneFlags?.badge_journey_complete
  },
  {
    id: 'badge_first_rehearsal',
    title: 'Stepped into the Arena',
    description: 'Complete your first high-stakes conversation rehearsal.',
    icon: 'flame',
    isUnlocked: (user) => user.totalRehearsals >= 1
  },
  {
    id: 'badge_3day_streak',
    title: 'Relentless Practice',
    description: 'Maintain a 3-day hard conversation streak.',
    icon: 'award',
    isUnlocked: (user) => (user.longestStreak || 0) >= 3
  },
  {
    id: 'badge_masterclass_score',
    title: 'Executive Composure',
    description: 'Score 90%+ on a single rehearsal.',
    icon: 'shield-check',
    isUnlocked: (_user, history) => history.some((h) => h.overallScore >= 90)
  },
  {
    id: 'badge_7day_streak',
    title: 'One Week Strong',
    description: 'A full 7-day rehearsal streak.',
    icon: 'flame',
    isUnlocked: (user) => (user.longestStreak || 0) >= 7
  },
  {
    id: 'badge_10_rehearsals',
    title: 'Double Digits',
    description: 'Complete 10 rehearsals.',
    icon: 'award',
    isUnlocked: (user) => user.totalRehearsals >= 10
  },
  {
    id: 'badge_25_rehearsals',
    title: 'Seasoned Operator',
    description: 'Complete 25 rehearsals.',
    icon: 'shield-check',
    isUnlocked: (user) => user.totalRehearsals >= 25
  },
  {
    id: 'badge_30day_streak',
    title: 'Unshakeable',
    description: '30 days of consistent practice.',
    icon: 'flame',
    isUnlocked: (user) => (user.longestStreak || 0) >= 30
  },
  {
    id: 'badge_50_rehearsals',
    title: 'Master Communicator',
    description: 'Complete 50 rehearsals.',
    icon: 'shield-check',
    isUnlocked: (user) => user.totalRehearsals >= 50
  },

  // Category-mastery badges — tied to the app's actual skill categories
  // rather than generic counts, so the badge itself says something specific
  // about what the user is good at (worth sharing precisely because it's
  // specific, not "I did 10 things").
  {
    id: 'badge_negotiator',
    title: 'The Closer',
    description: 'Scored 80+ on 3 negotiation rehearsals.',
    icon: 'award',
    isUnlocked: (_user, history) =>
      history.filter((h) => h.category === 'negotiation' && h.overallScore >= 80).length >= 3
  },
  {
    id: 'badge_boundary_setter',
    title: 'The Line Holder',
    description: 'Scored 80+ on 3 boundary-setting rehearsals.',
    icon: 'shield-check',
    isUnlocked: (_user, history) =>
      history.filter((h) => h.category === 'boundaries' && h.overallScore >= 80).length >= 3
  },
  {
    id: 'badge_crisis_handler',
    title: 'Composed Under Fire',
    description: 'Scored 80+ on a crisis-category rehearsal.',
    icon: 'flame',
    isUnlocked: (_user, history) =>
      history.some((h) => h.category === 'crisis' && h.overallScore >= 80)
  },
  {
    id: 'badge_feedback_giver',
    title: 'The Straight Talker',
    description: 'Scored 80+ on 3 feedback rehearsals.',
    icon: 'award',
    isUnlocked: (_user, history) =>
      history.filter((h) => h.category === 'feedback' && h.overallScore >= 80).length >= 3
  },
  {
    id: 'badge_managing_up',
    title: 'Boardroom Ready',
    description: 'Scored 80+ managing up to leadership.',
    icon: 'shield-check',
    isUnlocked: (_user, history) =>
      history.filter((h) => h.category === 'managing_up' && h.overallScore >= 80).length >= 3
  },
  {
    id: 'badge_difficult_decisions',
    title: 'Decisive Under Pressure',
    description: 'Scored 80+ navigating a difficult decision.',
    icon: 'flame',
    isUnlocked: (_user, history) =>
      history.some((h) => h.category === 'difficult_decisions' && h.overallScore >= 80)
  },
  {
    id: 'badge_perfect_score',
    title: 'Flawless Execution',
    description: 'Scored a perfect 100 on a rehearsal.',
    icon: 'sparkles',
    isUnlocked: (_user, history) => history.some((h) => h.overallScore === 100)
  },
  {
    id: 'badge_100day_streak',
    title: 'The Discipline of Command',
    description: '100 days of deliberate practice.',
    icon: 'flame',
    isUnlocked: (user) => (user.longestStreak || 0) >= 100
  }
];
