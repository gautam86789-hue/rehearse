import { LLMService, llmService } from './llmService.js';
import { computeCompetencyProfileFromScores, formatCompetencyProfileForPrompt } from './competencyProfileService.js';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantSessionSummary {
  scenarioTitle: string;
  category: string;
  overallScore: number;
  clarity: number;
  empathy: number;
  assertiveness: number;
  listening: number;
  growthAreas: string[];
  completedAt: string;
}

export interface AssistantAction {
  id: string;
  label: string;
}

// Every button the assistant can offer. The frontend maps each id to a real
// screen (see AICoachScreen's ACTION_ROUTES) — the model may only pick from
// this list, so a button can never point somewhere that doesn't exist.
const ACTION_CATALOG: Record<string, string> = {
  start_practice: 'Start a practice',
  practice_negotiation: 'Practice negotiation',
  practice_feedback: 'Practice giving feedback',
  practice_boundaries: 'Practice setting boundaries',
  practice_managing_up: 'Practice managing up',
  practice_difficult_decisions: 'Practice a hard decision',
  practice_crisis: 'Practice a crisis talk',
  daily_challenge: "Today's Challenge",
  learn: 'Open Learn',
  progress: 'See my progress',
  history: 'Review my past rehearsals',
  reply_coach: 'Get help replying',
  custom_scenario: 'Practice my own situation',
  tutorial: 'How Rehearse works'
};

const SKILL_TO_ACTION: Record<string, string> = {
  assertiveness: 'practice_boundaries',
  empathy: 'practice_feedback',
  clarity: 'practice_negotiation',
  listening: 'practice_difficult_decisions'
};

const CATEGORY_TO_ACTION: Record<string, string> = {
  negotiation: 'practice_negotiation',
  feedback: 'practice_feedback',
  boundaries: 'practice_boundaries',
  managing_up: 'practice_managing_up',
  difficult_decisions: 'practice_difficult_decisions',
  crisis: 'practice_crisis'
};

export interface AssistantUserContext {
  name: string;
  dailyChallengeDone?: boolean;
  audience?: string;
  role: string;
  totalRehearsals: number;
  currentStreak: number;
  longestStreak: number;
}

export interface AssistantChatInput {
  message: string;
  conversationHistory: AssistantChatMessage[];
  userContext: AssistantUserContext;
  recentSessions: AssistantSessionSummary[];
}

const AUDIENCE_LABEL: Record<string, string> = {
  founders_investors: 'a founder/investor',
  new_managers: 'a new manager',
  mba_students: 'an MBA student',
  professionals: 'a working professional'
};

// A compact, curated reference the assistant draws on — not a live book
// scrape, but the core, most-cited techniques from the frameworks this app
// already teaches (Nonviolent Communication, Crucial Conversations, Getting
// to Yes, and standard feedback/boundary models), condensed for quick recall.
const COMMUNICATION_KNOWLEDGE_BASE = `
- Nonviolent Communication (Rosenberg): separate Observation (facts, no judgment) from Feeling, from Need, from Request. Vague requests get vague results — always end with one specific, doable ask.
- Crucial Conversations STATE model: Share facts first (least controversial), Tell your story (the conclusion you drew), Ask for their path, Talk tentatively (avoid absolutes like "always"/"never"), Encourage testing (invite disagreement).
- Getting to Yes (Fisher & Ury): know your BATNA (best alternative) before you negotiate. Anchor on objective, external criteria, not personal desire. Separate the person from the problem — warm to the relationship, firm on the issue.
- SBI Feedback Model: Situation (the specific moment) → Behavior (observable, not character) → Impact (concrete effect). Never generalize a pattern into "you always..."
- Boundary-setting: state the boundary once, without repeated apology (repeated apologies signal it's negotiable). Pair the "no" with a workable alternative when possible. Expect one round of testing pushback — hold steady calmly.
- Common failure patterns to watch for in a user's own language: softening a direct ask into a question, over-explaining/justifying instead of stating, going vague under pushback instead of staying specific, apologizing before stating a boundary.
`.trim();

export class AssistantService {
  constructor(private llm: LLMService = llmService) {}

  async chat(input: AssistantChatInput): Promise<{ reply: string; actions: AssistantAction[] }> {
    const systemPrompt = this.buildSystemPrompt(input.userContext, input.recentSessions);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...input.conversationHistory.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: input.message }
    ];

    try {
      const response = await this.llm.generateCompletion(messages, { temperature: 0.6, maxTokens: 320, thinking: 'minimal' });
      const { text, ids } = this.extractActions(response.trim());
      const reply = this.stripMarkdown(text) || this.fallbackReply(input.message);
      return { reply, actions: this.resolveActions(ids, input) };
    } catch (err) {
      console.warn('Assistant chat LLM call failed, using fallback:', err);
      return { reply: this.fallbackReply(input.message), actions: this.resolveActions([], input) };
    }
  }

  // The model ends its reply with "ACTIONS: id1, id2" — split that line off
  // (it must never be shown to the user) and keep only ids in the catalog.
  private extractActions(raw: string): { text: string; ids: string[] } {
    const m = raw.match(/\n?\s*ACTIONS?\s*:\s*([^\n]*)\s*$/i);
    if (!m) return { text: raw.replace(/\n?\s*ACTIONS?\s*:.*$/is, '').trim(), ids: [] };
    const ids = m[1]
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase().replace(/[^a-z_]/g, ''))
      .filter((id) => id in ACTION_CATALOG);
    return { text: raw.slice(0, m.index).trim(), ids };
  }

  // 2–3 buttons: the model's own picks first, then topped up from what we
  // know about this user (weakest skill, unfinished daily challenge, brand
  // new, what they just asked about) so there's always a useful next step.
  private resolveActions(modelIds: string[], input: AssistantChatInput): AssistantAction[] {
    const chosen: string[] = [];
    const add = (id?: string) => {
      if (id && id in ACTION_CATALOG && !chosen.includes(id)) chosen.push(id);
    };
    modelIds.forEach(add);

    const msg = input.message.toLowerCase();
    const sessions = input.recentSessions || [];
    const ctx = input.userContext;

    if (/reply|respond|message|email|text back|what (do|should) i say/.test(msg)) add('reply_coach');
    if (/own situation|custom|specific situation|real situation/.test(msg)) add('custom_scenario');
    if (/how (does|do) (this|the app|rehearse)|tutorial|get started/.test(msg)) add('tutorial');

    if (ctx.totalRehearsals === 0 || sessions.length === 0) {
      add('start_practice');
    } else {
      const profile = computeCompetencyProfileFromScores(sessions) as any;
      add(SKILL_TO_ACTION[profile?.weakestSkill]);
      add(CATEGORY_TO_ACTION[sessions[0]?.category]);
    }
    if (!ctx.dailyChallengeDone) add('daily_challenge');
    add('start_practice');
    add('progress');
    add('learn');

    return chosen.slice(0, 3).map((id) => ({ id, label: ACTION_CATALOG[id] }));
  }

  private buildSystemPrompt(user: AssistantUserContext, sessions: AssistantSessionSummary[]): string {
    const audienceLabel = (user.audience && AUDIENCE_LABEL[user.audience]) || 'a professional';

    const sessionLines = sessions.length
      ? sessions
          .slice(0, 10)
          .map(
            (s, i) =>
              `${i + 1}. "${s.scenarioTitle}" (${s.category}) — overall ${s.overallScore}, clarity ${s.clarity}, empathy ${s.empathy}, assertiveness ${s.assertiveness}, listening ${s.listening}. Growth areas noted: ${s.growthAreas.join('; ') || 'none logged'}.`
          )
          .join('\n')
      : 'No rehearsals completed yet.';

    // Pre-computed with plain arithmetic (see competencyProfileService) so
    // the model doesn't have to average scores or spot a trend itself from
    // the raw list above — it's handed the answer directly, which is both
    // cheaper (no reasoning tokens spent recomputing it) and more reliable
    // than trusting an LLM's mental arithmetic across 10 rows of numbers.
    const competencyProfile = computeCompetencyProfileFromScores(sessions);
    const profileBlock = formatCompetencyProfileForPrompt(competencyProfile);

    return `You are the in-app AI assistant for Rehearse, a difficult-conversation practice app. The user talking to you is ${user.name}, ${audienceLabel}, on a ${user.currentStreak}-day streak with ${user.totalRehearsals} total rehearsals completed (longest streak: ${user.longestStreak}).

CRITICAL STYLE RULES:
- Keep every reply SHORT — at most 2 short sentences, under 40 words, like a quick text from a coach. The action buttons carry the next steps, so don't list options or explain features at length. No preamble like "Great question!".
- Plain text only — this renders in a plain chat bubble, not a markdown viewer. Never use **bold**, *italic*, headers, or markdown of any kind.
- Never claim a pattern "showed up in past sessions" unless the rehearsal history below actually contains sessions supporting that claim. If the history says "No rehearsals completed yet," give generic (but still specific and useful) advice instead of fabricating personalized history.

You can do three things:
1. App guidance: recommend which Rehearse feature fits what the user is trying to do (Free Practice, Guided Practice, Quick Drill, Custom Scenario, Learn, Progress). Be specific and brief.
2. Personal pattern coaching: use the rolling performance profile and recent rehearsal data below to name a SPECIFIC recurring pattern in their communication — not just a restated score. E.g. instead of "you scored 72", say something like "you tend to lose specificity when the counterpart pushes back — that's shown up in 3 of your last sessions." The profile's weakest/strongest skill and trend are already computed for you; lean on those numbers rather than re-deriving them from the raw list.
3. Reply assistant: if the user describes an incoming message or a situation and asks what to say, give ONE clear, ready-to-send suggested reply (not multiple options unless they ask for alternatives), plus a one-line reason it works.

BUTTONS: After your reply, on a new final line, list 2 or 3 action ids for buttons that take the user straight to the most useful next step, in this exact form:
ACTIONS: id1, id2, id3
Only use ids from this list, and pick the ones that match what you just suggested and this user's history: ${Object.keys(ACTION_CATALOG).join(', ')}. Never mention the ids or this line in your reply text itself.

Draw on this communication knowledge base when relevant, but never dump it verbatim — apply it to their specific situation:
${COMMUNICATION_KNOWLEDGE_BASE}

${profileBlock}

The user's recent rehearsal history (most recent first):
${sessionLines}`;
  }

  // Belt-and-braces in case the model ignores the "no markdown" instruction —
  // strips the common markers rather than leaving literal asterisks/hashes
  // visible in the plain-text chat bubble.
  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/`([^`]*)`/g, '$1');
  }

  private fallbackReply(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('pattern') || lower.includes('setback') || lower.includes('struggle') || lower.includes('weak')) {
      return "Based on your recent sessions, you tend to lose specificity once the other person pushes back — try anchoring on one concrete number or fact before responding next time.";
    }
    if (lower.includes('reply') || lower.includes('respond') || lower.includes('say to') || lower.includes('what should i')) {
      return 'Try: "I hear that, and here\'s where I stand: [your specific ask]. What would it take to make that work?" — states your position without over-explaining.';
    }
    if (lower.includes('feature') || lower.includes('what should i use') || lower.includes('best')) {
      return 'If you have a specific real situation, use Custom Scenario. For a fast daily rep, use Quick Drill. To build a skill from scratch, start with Guided Practice.';
    }
    return "I'm here to help — ask me what to practice next, how to respond to something, or what patterns are showing up in your rehearsals.";
  }
}

export const assistantService = new AssistantService();
