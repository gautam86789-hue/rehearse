import { v4 as uuidv4 } from 'uuid';
import { LLMService, llmService } from './llmService.js';

export type StoryTrajectory = 'assertive' | 'diplomatic' | 'avoidant' | 'aggressive';

const TRAJECTORIES: StoryTrajectory[] = ['assertive', 'diplomatic', 'avoidant', 'aggressive'];

export interface StoryOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  trajectory: StoryTrajectory;
}

export interface StoryBeat {
  narrative: string;
  options: StoryOption[];
}

export interface StoryEnding {
  title: string;
  narrative: string;
  tone: 'strong' | 'growth' | 'mixed';
}

export interface StoryTree {
  id: string;
  date: string;
  title: string;
  premise: string;
  q1: StoryBeat;
  q2: Record<StoryTrajectory, StoryBeat>;
  q3: Record<StoryTrajectory, StoryBeat>;
  q4: Record<StoryTrajectory, StoryBeat>;
  q5: Record<StoryTrajectory, StoryBeat>;
  endings: Record<StoryTrajectory, StoryEnding>;
}

export interface GenerateNodeStoryInput {
  userId: string;
  nodeId: string;
  storySeed: string;
  journeyTitle?: string;
  audience?: string;
  name?: string;
}

// The narrative genuinely branches by choice without needing a full 4^5 tree
// (which would be 1364 nodes and far too large/slow for one LLM call). Instead
// each of the 4 options at every question is tagged with one of 4
// "trajectories" (assertive/diplomatic/avoidant/aggressive — the same
// vocabulary as the scoring rubric elsewhere in the app). After each answer,
// the user's DOMINANT trajectory so far picks which of the 4 pre-generated
// next-beat variants they see, so the story visibly diverges at every step
// while the whole tree — 1 + 4 + 4 + 4 + 4 + 4 = 21 narrative blocks — stays
// small enough to generate coherently in a single request.
export function resolveDominantTrajectory(picks: StoryTrajectory[]): StoryTrajectory {
  if (picks.length === 0) return 'assertive';
  const tally: Record<StoryTrajectory, number> = { assertive: 0, diplomatic: 0, avoidant: 0, aggressive: 0 };
  picks.forEach((p) => tally[p]++);
  let best = picks[picks.length - 1];
  let bestCount = 0;
  // Iterate most-recent-first so a tie resolves to whichever trajectory was
  // picked most recently, keeping the story responsive to the latest choice.
  for (let i = picks.length - 1; i >= 0; i--) {
    const t = picks[i];
    if (tally[t] > bestCount) {
      bestCount = tally[t];
      best = t;
    }
  }
  return best;
}

export class StoryService {
  private cache = new Map<string, StoryTree>();

  constructor(private llm: LLMService = llmService) {}

  // Keyed to a fixed roadmap node (see
  // frontend/src/data/journeys.ts) instead of a calendar date — generated
  // once per user per node and cached permanently, so a "Career Journey"
  // stays coherent across visits instead of reshuffling every day. Reuses
  // the exact same generation/validation/fallback machinery, just swapping
  // the scenario driver (a short authored seed instead of the user's
  // onboarding dread category) and adding one continuity line.
  async getNodeStory(input: GenerateNodeStoryInput): Promise<StoryTree> {
    const cacheKey = `${input.userId}-node-${input.nodeId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    let tree: StoryTree;
    try {
      tree = await this.generateViaLLM(
        {
          userId: input.userId,
          audience: input.audience,
          name: input.name,
          scenarioDriver: input.storySeed,
          continuityContext: input.journeyTitle
            ? `This story is one stage of a longer roadmap titled "${input.journeyTitle}" — write it as a self-contained scene that still reads as part of that ongoing journey.`
            : undefined
        },
        input.nodeId
      );
    } catch (err) {
      console.warn('Node story generation failed, using fallback tree:', err);
      tree = this.buildFallbackTree(input.nodeId);
    }
    this.cache.set(cacheKey, tree);
    return tree;
  }

  private async generateViaLLM(
    input: { userId: string; audience?: string; name?: string; scenarioDriver: string; continuityContext?: string },
    date: string
  ): Promise<StoryTree> {
    const audience = input.audience || 'professionals';
    const dread = input.scenarioDriver;
    const name = input.name || 'the player';

    const systemPrompt = `You are the Story Mode narrative engine for Rehearse, an app that helps people practice difficult conversations.

Generate a 5-question interactive story, personalized for a "${audience}" user, built around this scenario: "${dread}".
${input.continuityContext ? `\n${input.continuityContext}\n` : ''}
The story follows ${name} through an escalating difficult conversation. At each of 5 questions, the player picks ONE of 4 options — each option must represent a distinct communication style tagged as one of exactly: "assertive", "diplomatic", "avoidant", "aggressive".

The story BRANCHES: for questions 2-5 and the ending, you must write 4 separate narrative variants — one continuing as if the player has been mostly "assertive" so far, one for mostly "diplomatic", one for mostly "avoidant", one for mostly "aggressive". Each variant's narrative should visibly reflect how that communication style has been playing out, and each variant still offers its own 4 tagged options.

Keep every narrative beat to 2-3 sentences. Keep every option's "text" to one sentence (what the player says or does).

Return ONLY valid JSON matching EXACTLY this schema (no markdown, no commentary):
{
  "title": "Short story title (5-8 words)",
  "premise": "1-2 sentence setup of the situation",
  "q1": { "narrative": "...", "options": [{"id":"A","text":"...","trajectory":"assertive"},{"id":"B","text":"...","trajectory":"diplomatic"},{"id":"C","text":"...","trajectory":"avoidant"},{"id":"D","text":"...","trajectory":"aggressive"}] },
  "q2": { "assertive": {"narrative":"...","options":[...4 tagged options]}, "diplomatic": {...}, "avoidant": {...}, "aggressive": {...} },
  "q3": { same 4 keys as q2, each a beat with narrative + 4 tagged options },
  "q4": { same 4 keys as q2, each a beat with narrative + 4 tagged options },
  "q5": { same 4 keys as q2, each a beat with narrative + 4 tagged options },
  "endings": {
    "assertive": {"title":"...", "narrative":"2-3 sentence ending", "tone":"strong"},
    "diplomatic": {"title":"...", "narrative":"2-3 sentence ending", "tone":"strong"},
    "avoidant": {"title":"...", "narrative":"2-3 sentence ending", "tone":"growth"},
    "aggressive": {"title":"...", "narrative":"2-3 sentence ending", "tone":"mixed"}
  }
}
Every "options" array must have exactly 4 entries, one per trajectory, ids A/B/C/D in that order. The "tone" field for each ending must be one of exactly "strong", "growth", "mixed" and should reflect how well that communication style actually resolves the conversation (assertive/diplomatic generally resolve well = "strong"; avoidant leaves things unresolved = "growth"; aggressive damages the relationship = "mixed").`;

    const raw = await this.llm.generateCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate today\'s story JSON now.' }
      ],
      { temperature: 0.8, maxTokens: 2200, responseFormat: 'json' }
    );

    const parsed = this.cleanAndParseJSON(raw);
    return this.validateAndNormalize(parsed, date);
  }

  private cleanAndParseJSON(text: string): any {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in story output');
    return JSON.parse(match[0]);
  }

  private validateAndNormalize(parsed: any, date: string): StoryTree {
    const normalizeBeat = (beat: any): StoryBeat => {
      const options: StoryOption[] = (Array.isArray(beat?.options) ? beat.options : []).slice(0, 4).map(
        (opt: any, i: number) => ({
          id: (['A', 'B', 'C', 'D'][i] as StoryOption['id']),
          text: String(opt?.text || 'Respond.'),
          trajectory: TRAJECTORIES.includes(opt?.trajectory) ? opt.trajectory : TRAJECTORIES[i % 4]
        })
      );
      if (options.length < 4) throw new Error('Story beat missing options');
      return { narrative: String(beat?.narrative || ''), options };
    };

    const normalizeBranch = (branch: any): Record<StoryTrajectory, StoryBeat> => {
      const out: any = {};
      TRAJECTORIES.forEach((t) => {
        out[t] = normalizeBeat(branch?.[t]);
      });
      return out;
    };

    const endings: Record<StoryTrajectory, StoryEnding> = {} as any;
    TRAJECTORIES.forEach((t) => {
      const e = parsed?.endings?.[t];
      endings[t] = {
        title: String(e?.title || 'The Conversation Ends'),
        narrative: String(e?.narrative || 'The conversation reaches a close.'),
        tone: ['strong', 'growth', 'mixed'].includes(e?.tone) ? e.tone : 'growth'
      };
    });

    return {
      id: `story-${uuidv4().slice(0, 8)}`,
      date,
      title: String(parsed?.title || "Today's Rehearsal Story"),
      premise: String(parsed?.premise || 'A conversation you cannot avoid is about to happen.'),
      q1: normalizeBeat(parsed?.q1),
      q2: normalizeBranch(parsed?.q2),
      q3: normalizeBranch(parsed?.q3),
      q4: normalizeBranch(parsed?.q4),
      q5: normalizeBranch(parsed?.q5),
      endings
    };
  }

  private buildFallbackTree(date: string): StoryTree {
    const opt = (id: StoryOption['id'], text: string, trajectory: StoryTrajectory): StoryOption => ({ id, text, trajectory });
    const beat = (narrative: string, texts: [string, string, string, string]): StoryBeat => ({
      narrative,
      options: [
        opt('A', texts[0], 'assertive'),
        opt('B', texts[1], 'diplomatic'),
        opt('C', texts[2], 'avoidant'),
        opt('D', texts[3], 'aggressive')
      ]
    });
    const branch = (mk: (mood: StoryTrajectory) => StoryBeat): Record<StoryTrajectory, StoryBeat> => ({
      assertive: mk('assertive'),
      diplomatic: mk('diplomatic'),
      avoidant: mk('avoidant'),
      aggressive: mk('aggressive')
    });

    return {
      id: `story-fallback-${date}`,
      date,
      title: 'The Monday Morning Ask',
      premise: 'Your manager pulls you aside before the team standup: a deadline everyone agreed was unrealistic just got moved up two weeks.',
      q1: beat(
        'Your manager says, "I know it\'s tight, but leadership wants this shipped early. Can you make it work?"',
        [
          '"That timeline isn\'t realistic without cutting scope — let\'s decide together what moves."',
          '"I want to help make this work — can we look at what could shift to hit it?"',
          '"...Sure, I\'ll figure something out." (You have no plan.)',
          '"This is exactly why nothing here gets planned properly."'
        ]
      ),
      q2: branch((mood) =>
        mood === 'assertive'
          ? beat('Your manager pauses, then nods. "Okay — what would you need to cut?" The room is listening.', [
              '"Cut the analytics dashboard for v1 — ship the core flow on time instead."',
              '"Let\'s scope it together so nobody\'s surprised later."',
              '"I don\'t know yet, let me think about it."',
              '"You should have asked before promising leadership anything."'
            ])
          : mood === 'diplomatic'
          ? beat('Your manager relaxes slightly. "Appreciate that. What do you need from me to make it happen?"', [
              '"I need one clear priority, not five — can you rank them?"',
              '"Let\'s find the smallest version that still delivers value."',
              '"I\'ll just try to squeeze it in somehow."',
              '"Honestly you should be asking the team, not just me."'
            ])
          : mood === 'avoidant'
          ? beat('Your manager takes the vague yes at face value and walks away. The deadline stands, unexamined.', [
              '"Actually, wait — I need to flag this is risky before you go."',
              '"Can we talk for two minutes about what\'s realistic?"',
              '"...okay, I\'ll deal with it later I guess."',
              '"This is unfair and I don\'t think I can do it."'
            ])
          : beat('Your manager stiffens. "I\'m not the one who set the timeline — don\'t take it out on me." The tension in the room rises.', [
              '"You\'re right, that came out wrong — let\'s reset and talk about what\'s realistic."',
              '"Sorry — I\'m frustrated, not at you. Can we problem-solve together?"',
              '"Whatever. I\'ll just figure it out."',
              '"Well maybe someone should finally push back on leadership for once."'
            ])
      ),
      q3: branch((mood) =>
        beat(`Later that day, a teammate asks if the new deadline is really happening. Your ${mood === 'aggressive' ? 'tense' : mood === 'avoidant' ? 'uncertain' : 'earlier'} conversation is already shaping how the team feels.`, [
          '"Yes, but I\'m pushing to cut scope so it\'s actually achievable — I\'ll confirm by EOD."',
          '"Still being worked out — I want to make sure it\'s fair to everyone before confirming."',
          '"I think so? Not totally sure, honestly."',
          '"Apparently. Don\'t ask me, ask whoever keeps changing their mind upstairs."'
        ])
      ),
      q4: branch((mood) =>
        beat(`In the next 1-on-1, your manager brings up the deadline again${mood === 'aggressive' ? ', visibly guarded this time' : mood === 'avoidant' ? ', assuming it\'s already handled' : ''}.`, [
          '"Here\'s the plan: cut feature X, ship the core on time, revisit X next sprint."',
          '"I\'ve got a plan that works if we\'re flexible on one feature — want to walk through it?"',
          '"I haven\'t really figured it out yet, I\'ve been busy."',
          '"It\'s still impossible and I don\'t think anyone up there cares."'
        ])
      ),
      q5: branch((mood) =>
        beat(`It's the day before the deadline. ${mood === 'assertive' ? 'Your plan is already in motion.' : mood === 'diplomatic' ? 'The team is aligned behind the adjusted plan.' : mood === 'avoidant' ? 'Nothing was actually decided, and the pressure is peaking.' : 'The relationship with your manager is strained, and the deadline hasn\'t moved.'} Leadership asks for a final status.`, [
          '"On track — we scoped it down and it ships tomorrow as planned."',
          '"We adjusted scope together and the team is confident in tomorrow."',
          '"I think it\'ll be close, I\'m not totally sure."',
          '"It was never going to work and I said so from day one."'
        ])
      ),
      endings: {
        assertive: {
          title: 'The Plan That Held',
          narrative: 'You named the constraint early, proposed a real trade-off, and delivered exactly what you committed to. Your manager starts looping you into planning conversations before deadlines are set, not after.',
          tone: 'strong'
        },
        diplomatic: {
          title: 'The Team That Trusted You',
          narrative: 'You brought the team along instead of just protecting yourself. The deadline was met, and more importantly, nobody felt blindsided — your manager notices who kept the team steady.',
          tone: 'strong'
        },
        avoidant: {
          title: 'The Cost of Staying Quiet',
          narrative: 'The deadline arrived with nothing really settled — you scrambled, the delivery was rough, and the same unrealistic-timeline pattern is already forming again for next quarter.',
          tone: 'growth'
        },
        aggressive: {
          title: 'Right, But Alone',
          narrative: 'You were probably right that the timeline was unfair — but the delivery happened through gritted teeth, and your manager now hesitates before looping you into hard conversations at all.',
          tone: 'mixed'
        }
      }
    };
  }
}

export const storyService = new StoryService();
