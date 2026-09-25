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

// The opening must at least have a title, premise and a first question with 4 options.
function normalizeCheck(o: any): void {
  if (!o || typeof o.title !== 'string' || typeof o.premise !== 'string') throw new Error('Story opening missing title/premise');
  if (!o.q1 || !Array.isArray(o.q1.options) || o.q1.options.length < 4) throw new Error('Story opening missing first question');
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
    // Shared across users (same roadmap node + audience = same story), so only
    // the first person to open a stage waits for it to be written. Concurrent
    // opens of the same stage also share ONE generation instead of each starting their own.
    const cacheKey = `node-${input.nodeId}-${input.audience || 'professionals'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const inFlight = this.pending.get(cacheKey);
    if (inFlight) return inFlight;
    const work = this.buildNodeStory(input, cacheKey).finally(() => this.pending.delete(cacheKey));
    this.pending.set(cacheKey, work);
    return work;
  }

  private pending = new Map<string, Promise<StoryTree>>();

  private async buildNodeStory(input: GenerateNodeStoryInput, cacheKey: string): Promise<StoryTree> {

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
    // A built-in stand-in shouldn't be remembered as if it were the real story.
    if (!tree.id.startsWith('story-fallback')) this.cache.set(cacheKey, tree);
    return tree;
  }

  // One giant "write the whole 50-beat branching story as one JSON" request
  // took ~37s (and could be cut off and retried). It's now two quick stages:
  //   1. title + premise + the first question (small, ~2s)
  //   2. questions 2-5 and the four endings — FIVE small requests in parallel,
  //      each told the premise and first scene so the story stays coherent.
  // Any part that fails falls back to the matching part of the built-in story
  // instead of throwing the whole thing away.
  private async generateViaLLM(
    input: { userId: string; audience?: string; name?: string; scenarioDriver: string; continuityContext?: string },
    date: string
  ): Promise<StoryTree> {
    const audience = input.audience || 'professionals';
    const scenario = input.scenarioDriver;
    const fallback: any = this.buildFallbackTree(date);
    const options = { temperature: 0.8, responseFormat: 'json' as const, strict: true, thinking: 'minimal' as const };

    const styleRules = `Each option must represent a distinct communication style tagged as exactly one of: "assertive", "diplomatic", "avoidant", "aggressive" — in the order A=assertive, B=diplomatic, C=avoidant, D=aggressive. Every narrative is at most 2 short sentences (under 40 words) and every option's "text" is one short sentence (under 15 words) of what the player says or does. Write in second person ("you"). Return ONLY valid JSON, no markdown.`;
    const optionsShape = `"options":[{"id":"A","text":"...","trajectory":"assertive"},{"id":"B","text":"...","trajectory":"diplomatic"},{"id":"C","text":"...","trajectory":"avoidant"},{"id":"D","text":"...","trajectory":"aggressive"}]`;
    const ask = async (system: string, user: string): Promise<any> => {
      const raw = await this.llm.generateCompletion(
        [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        options
      );
      return this.cleanAndParseJSON(raw);
    };

    // ---- Stage 1: the opening ----
    let opening: any;
    try {
      opening = await ask(
        `You are the Story Mode narrative engine for Rehearse, an app that helps people practice difficult conversations. Write the OPENING of a 5-question interactive story for a "${audience}" user, built around this scenario: "${scenario}".${input.continuityContext ? ` ${input.continuityContext}` : ''} ${styleRules}
Schema: {"title":"5-8 word title","premise":"1-2 sentence setup","q1":{"narrative":"...",${optionsShape}}}`,
        'Write the opening now.'
      );
      normalizeCheck(opening);
    } catch (err) {
      console.warn('Story opening generation failed, using built-in story:', err);
      return this.buildFallbackTree(date);
    }

    const context = `Story so far — Title: "${opening.title}". Premise: ${opening.premise} Opening scene: ${opening.q1?.narrative}`;
    const branchPrompt = (n: number, styles: StoryTrajectory[]) =>
      `You are the Story Mode narrative engine for Rehearse. ${context}
Write QUESTION ${n} of 5 (the conversation escalates a little more each question). The story branches on the player's dominant style so far, so write ${styles.length} variants of this scene: ${styles.map((t) => `one continuing as if the player has mostly been "${t}"`).join(', ')} — each narrative should visibly reflect how that style has been playing out, and each offers its own 4 tagged options. ${styleRules}
Schema: {${styles.map((t) => `"${t}":{"narrative":"...",${optionsShape}}`).join(',')}}`;

    // ---- Stage 2: everything else, in parallel ----
    const part = async (label: string, fn: () => Promise<any>, fb: any) => {
      try {
        return await fn();
      } catch (err) {
        console.warn(`Story part "${label}" failed, using built-in scene:`, err);
        return fb;
      }
    };
    // Each question is written as two smaller requests (two variants each) so
    // no single response is long — the whole stage takes as long as the slowest
    // one of these short calls.
    const HALVES: StoryTrajectory[][] = [['assertive', 'diplomatic'], ['avoidant', 'aggressive']];
    const question = async (n: number, fb: any) => {
      const halves = await Promise.all(
        HALVES.map((styles) =>
          part(`q${n}:${styles.join('+')}`, () => ask(branchPrompt(n, styles), `Write question ${n} now.`), null)
        )
      );
      const merged: any = {};
      HALVES.forEach((styles, i) => styles.forEach((t) => (merged[t] = halves[i]?.[t] ?? fb[t])));
      return merged;
    };
    const [q2, q3, q4, q5, endings] = await Promise.all([
      question(2, fallback.q2),
      question(3, fallback.q3),
      question(4, fallback.q4),
      question(5, fallback.q5),
      part(
        'endings',
        () =>
          ask(
            `You are the Story Mode narrative engine for Rehearse. ${context}\nWrite the FOUR possible endings, one per dominant style the player showed: assertive, diplomatic, avoidant, aggressive. Each is a title plus a 1-2 sentence narrative (under 35 words), with a "tone" of exactly "strong" (assertive, diplomatic), "growth" (avoidant) or "mixed" (aggressive) reflecting how well that style actually resolves the conversation. Return ONLY valid JSON, no markdown.\nSchema: {"assertive":{"title":"...","narrative":"...","tone":"strong"},"diplomatic":{...},"avoidant":{...},"aggressive":{...}}`,
            'Write the endings now.'
          ),
        fallback.endings
      )
    ]);

    try {
      return this.validateAndNormalize({ ...opening, q2, q3, q4, q5, endings }, date);
    } catch (err) {
      // A part came back malformed — swap in the built-in version of just that part.
      console.warn('Story assembly failed validation, patching with built-in scenes:', err);
      const safe = (v: any, fb: any) => {
        try {
          this.validateAndNormalize({ ...fallback, q2: v }, date); // cheap shape probe
          return v;
        } catch {
          return fb;
        }
      };
      return this.validateAndNormalize(
        { ...opening, q2: safe(q2, fallback.q2), q3: safe(q3, fallback.q3), q4: safe(q4, fallback.q4), q5: safe(q5, fallback.q5), endings: endings || fallback.endings },
        date
      );
    }
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
