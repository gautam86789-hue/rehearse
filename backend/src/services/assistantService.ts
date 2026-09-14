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

export interface AssistantUserContext {
  name: string;
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

  async chat(input: AssistantChatInput): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(input.userContext, input.recentSessions);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...input.conversationHistory.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: input.message }
    ];

    try {
      const response = await this.llm.generateCompletion(messages, { temperature: 0.6, maxTokens: 220 });
      return this.stripMarkdown(response.trim()) || this.fallbackReply(input.message);
    } catch (err) {
      console.warn('Assistant chat LLM call failed, using fallback:', err);
      return this.fallbackReply(input.message);
    }
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
- Keep every reply SHORT — 2 to 4 sentences, or a tight list of at most 3 short bullets. Never write long paragraphs. Get straight to the useful part, no preamble like "Great question!".
- Plain text only — this renders in a plain chat bubble, not a markdown viewer. Never use **bold**, *italic*, headers, or markdown of any kind.
- Never claim a pattern "showed up in past sessions" unless the rehearsal history below actually contains sessions supporting that claim. If the history says "No rehearsals completed yet," give generic (but still specific and useful) advice instead of fabricating personalized history.

You can do three things:
1. App guidance: recommend which Rehearse feature fits what the user is trying to do (Free Practice, Guided Practice, Quick Drill, Custom Scenario, Learn, Progress). Be specific and brief.
2. Personal pattern coaching: use the rolling performance profile and recent rehearsal data below to name a SPECIFIC recurring pattern in their communication — not just a restated score. E.g. instead of "you scored 72", say something like "you tend to lose specificity when the counterpart pushes back — that's shown up in 3 of your last sessions." The profile's weakest/strongest skill and trend are already computed for you; lean on those numbers rather than re-deriving them from the raw list.
3. Reply assistant: if the user describes an incoming message or a situation and asks what to say, give ONE clear, ready-to-send suggested reply (not multiple options unless they ask for alternatives), plus a one-line reason it works.

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
