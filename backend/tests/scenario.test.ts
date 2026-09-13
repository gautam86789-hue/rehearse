import { scenarioGeneratorService } from '../src/services/scenarioGeneratorService.js';
import { CURATED_SCENARIOS, ARCHETYPES } from '../src/db/seedData.js';

describe('Scenario Generation & Curated Library', () => {
  test('should have 8 or more curated executive scenarios', () => {
    expect(CURATED_SCENARIOS.length).toBeGreaterThanOrEqual(8);
    CURATED_SCENARIOS.forEach((scenario) => {
      expect(scenario.title).toBeDefined();
      expect(scenario.counterpartArchetype).toBeDefined();
      expect(scenario.brief.counterpartPosition).toBeDefined();
      expect(scenario.brief.whatGoodLooksLike).toBeDefined();
    });
  });

  test('should have all 5 key archetypes configured', () => {
    const archetypeKeys = Object.keys(ARCHETYPES);
    expect(archetypeKeys).toContain('defensive_boss');
    expect(archetypeKeys).toContain('guilt_tripper');
    expect(archetypeKeys).toContain('hard_negotiator');
    expect(archetypeKeys).toContain('passive_aggressive_peer');
    expect(archetypeKeys).toContain('micromanager');
  });

  test('should generate a structured scenario brief from raw user situation', async () => {
    const custom = await scenarioGeneratorService.generateCustomScenario({
      situation: 'My boss wants me to work every Saturday this month and acts like I am letting the team down if I say no.',
      counterpartRole: 'Engineering Manager',
      targetGoal: 'Protect weekends without risking my standing'
    });

    expect(custom).toBeDefined();
    expect(custom.id).toContain('custom-scenario-');
    expect(custom.brief).toBeDefined();
    expect(custom.brief.counterpartPosition).toBeDefined();
    expect(custom.brief.probablePushbackPatterns.length).toBeGreaterThan(0);
    expect(custom.counterpartArchetype).toBe('guilt_tripper');
  }, 20000);
});
