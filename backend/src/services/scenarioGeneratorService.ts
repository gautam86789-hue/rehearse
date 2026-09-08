import { v4 as uuidv4 } from 'uuid';
import { LLMService, llmService } from './llmService.js';
import { Scenario, ScenarioBrief, ArchetypeId } from '../types/index.js';
import { ARCHETYPES } from '../db/seedData.js';

export interface GenerateScenarioInput {
  situation: string;
  counterpartRole?: string;
  counterpartArchetype?: ArchetypeId;
  targetGoal?: string;
}

export class ScenarioGeneratorService {
  constructor(private llm: LLMService = llmService) {}

  async generateCustomScenario(input: GenerateScenarioInput): Promise<Scenario> {
    const archetypeId: ArchetypeId = input.counterpartArchetype || this.detectArchetypeFromSituation(input.situation);
    const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.defensive_boss;
    const counterpartRole = input.counterpartRole || 'Department Manager';

    const systemPrompt = `You are an executive communication coach and scenario designer for Rehearse.
The user is dreading a high-stakes conversation and described their real-world situation.
Generate a structured, realistic Scenario Brief for a roleplay session.

Archetype of Counterpart: ${archetype.title} (${archetype.personalityDescription})
Counterpart Resistance Pattern: ${archetype.resistancePattern}

You MUST return a valid JSON object strictly matching this schema:
{
  "title": "A punchy 4-7 word title for this scenario",
  "category": "negotiation" | "feedback" | "boundaries" | "managing_up" | "difficult_decisions" | "crisis",
  "counterpartName": "A realistic name (e.g. Marcus, Elena, David, Julian, Rachel)",
  "difficulty": "Beginner" | "Intermediate" | "High Stakes",
  "userGoal": "A sharp 1-sentence statement of what the user needs to achieve",
  "brief": {
    "counterpartPosition": "The counterpart's initial mindset and hidden resistance",
    "probablePushbackPatterns": [
      "Pushback strategy 1",
      "Pushback strategy 2",
      "Pushback strategy 3"
    ],
    "whatGoodLooksLike": "Concrete criteria for a masterclass execution of this conversation",
    "keyPhrasesToAvoid": [
      "Phrase 1 that sounds weak or apologetic",
      "Phrase 2 that derails boundaries",
      "Phrase 3 that invites defensiveness"
    ],
    "recommendedOpeningFormula": "A clear, actionable formula for the user's first opening sentence"
  }
}`;

    const userPrompt = `Situation: "${input.situation}"
Counterpart Role: "${counterpartRole}"
User's Target Goal: "${input.targetGoal || 'Handle this conversation with strength, clarity, and composure'}"

Generate the complete Scenario Brief JSON now.`;

    try {
      const rawResponse = await this.llm.generateCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { temperature: 0.6, responseFormat: 'json' }
      );

      const parsed = this.cleanAndParseJSON(rawResponse);

      const scenario: Scenario = {
        id: `custom-scenario-${uuidv4().slice(0, 8)}`,
        title: parsed.title || 'Custom Rehearsal Scenario',
        category: parsed.category || 'negotiation',
        counterpartRole,
        counterpartName: parsed.counterpartName || archetype.name,
        counterpartArchetype: input.counterpartArchetype || archetypeId,
        difficulty: parsed.difficulty || 'High Stakes',
        estimatedMinutes: 5,
        situation: input.situation,
        userGoal: parsed.userGoal || input.targetGoal || 'Navigate this high-stakes discussion successfully.',
        brief: parsed.brief || this.getFallbackBrief(archetypeId, counterpartRole),
        isCurated: false,
        createdAt: new Date().toISOString()
      };

      return scenario;
    } catch (err) {
      console.warn('LLM scenario generation failed, using intelligent fallback brief:', err);
      return this.buildFallbackScenario(input, archetypeId, counterpartRole);
    }
  }

  private detectArchetypeFromSituation(situation: string): ArchetypeId {
    const s = situation.toLowerCase();
    if (
      s.includes('saturday') ||
      s.includes('sunday') ||
      s.includes('weekend') ||
      s.includes('after hours') ||
      s.includes('burnout') ||
      s.includes('guilt') ||
      s.includes('overtime') ||
      s.includes('letting the team down') ||
      s.includes('sacrifice') ||
      s.includes('favor')
    ) {
      return 'guilt_tripper';
    }
    if (
      s.includes('raise') ||
      s.includes('salary') ||
      s.includes('promotion') ||
      s.includes('budget') ||
      s.includes('scope') ||
      s.includes('comp') ||
      s.includes('equity') ||
      s.includes('bonus')
    ) {
      return 'hard_negotiator';
    }
    if (
      s.includes('credit') ||
      s.includes('snide') ||
      s.includes('behind my back') ||
      s.includes('passive') ||
      s.includes('attribution') ||
      s.includes('stole')
    ) {
      return 'passive_aggressive_peer';
    }
    if (
      s.includes('micromanag') ||
      s.includes('check in') ||
      s.includes('oversight') ||
      s.includes('updates') ||
      s.includes('hourly') ||
      s.includes('sync')
    ) {
      return 'micromanager';
    }
    return 'defensive_boss';
  }

  private cleanAndParseJSON(text: string): any {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    return JSON.parse(jsonMatch[0]);
  }

  private getFallbackBrief(archetypeId: ArchetypeId, role: string): ScenarioBrief {
    const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.defensive_boss;
    return {
      counterpartPosition: `The ${role} will defend their current priorities, question your urgency, and test your conviction.`,
      probablePushbackPatterns: [
        'Citing competing organizational constraints and timing',
        'Reframing the problem as a shared team sacrifice',
        'Offering non-committal vague future reviews'
      ],
      whatGoodLooksLike: 'State your ask in the first sentence with zero apologies, ground your position in measurable impact, and hold your boundary when pushed.',
      keyPhrasesToAvoid: [
        '"Sorry to bother you with this..."',
        '"I guess if there is no other choice..."',
        '"I know you probably disagree but..."'
      ],
      recommendedOpeningFormula: 'Concise factual context (1 sentence) → Direct, unhedged proposal (1 sentence) → Clear call for decision (1 sentence).'
    };
  }

  private buildFallbackScenario(input: GenerateScenarioInput, archetypeId: ArchetypeId, counterpartRole: string): Scenario {
    const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.defensive_boss;
    return {
      id: `custom-scenario-${uuidv4().slice(0, 8)}`,
      title: `Addressing Situation with ${counterpartRole}`,
      category: 'difficult_decisions',
      counterpartRole,
      counterpartName: archetype.name,
      counterpartArchetype: archetypeId,
      difficulty: 'High Stakes',
      estimatedMinutes: 5,
      situation: input.situation,
      userGoal: input.targetGoal || `Resolve this challenge with ${counterpartRole} while maintaining firm boundaries.`,
      brief: this.getFallbackBrief(archetypeId, counterpartRole),
      isCurated: false,
      createdAt: new Date().toISOString()
    };
  }
}

export const scenarioGeneratorService = new ScenarioGeneratorService();
