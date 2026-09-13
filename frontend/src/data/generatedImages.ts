import { ImageSourcePropType } from 'react-native';

// Central lookup for Gemini-generated (or placeholder, until swapped in)
// images. React Native's bundler needs static require() paths, so every
// expected file is declared here up front — dropping a real generated image
// in at the same filename replaces the placeholder automatically, no code
// change needed.

const ARCHETYPE_IMAGES: Record<string, ImageSourcePropType> = {
  defensive_boss: require('../../assets/generated/archetypes/defensive_boss.jpg'),
  guilt_tripper: require('../../assets/generated/archetypes/guilt_tripper.jpg'),
  hard_negotiator: require('../../assets/generated/archetypes/hard_negotiator.jpg'),
  passive_aggressive_peer: require('../../assets/generated/archetypes/passive_aggressive_peer.jpg'),
  micromanager: require('../../assets/generated/archetypes/micromanager.jpg'),
  skeptical_investor: require('../../assets/generated/archetypes/skeptical_investor.jpg'),
  startup_cofounder: require('../../assets/generated/archetypes/startup_cofounder.jpg')
};

const SCENARIO_IMAGES: Record<string, ImageSourcePropType> = {
  'scenario-01-salary-raise': require('../../assets/generated/scenarios/scenario-01-salary-raise.jpg'),
  'scenario-02-critical-feedback': require('../../assets/generated/scenarios/scenario-02-critical-feedback.jpg'),
  'scenario-03-weekend-boundaries': require('../../assets/generated/scenarios/scenario-03-weekend-boundaries.jpg'),
  'scenario-04-scope-creep': require('../../assets/generated/scenarios/scenario-04-scope-creep.jpg'),
  'scenario-05-credit-stealing': require('../../assets/generated/scenarios/scenario-05-credit-stealing.jpg'),
  'scenario-06-micromanagement': require('../../assets/generated/scenarios/scenario-06-micromanagement.jpg'),
  'scenario-07-saying-no-vp': require('../../assets/generated/scenarios/scenario-07-saying-no-vp.jpg'),
  'scenario-08-layoff-conversation': require('../../assets/generated/scenarios/scenario-08-layoff-conversation.jpg'),
  'scenario-talk-to-manager': require('../../assets/generated/scenarios/scenario-talk-to-manager.jpg'),
  'scenario-talk-to-cofounder': require('../../assets/generated/scenarios/scenario-talk-to-cofounder.jpg'),
  'scenario-talk-to-investor': require('../../assets/generated/scenarios/scenario-talk-to-investor.jpg')
};

const PUZZLE_HERO_IMAGES: ImageSourcePropType[] = [
  require('../../assets/generated/puzzles/puzzle-weekend-favor.jpg'),
  require('../../assets/generated/puzzles/puzzle-budget-freeze.jpg')
];

// Feature-card illustrations (Home practice tiles + Practice hub modes),
// generated via scripts/generate-feature-illustrations.mjs. Empty until that
// script successfully produces files under assets/generated/features/ — only
// ids confirmed present on disk get a require() line here (Metro errors on
// require() of a missing file, so a failed/ungenerated id must never be
// referenced). ThemedFeatureCard renders its icon+color fallback for any id
// not in this map, so leaving it sparse is always safe.
const FEATURE_IMAGES: Record<string, ImageSourcePropType> = {};

export function getArchetypeAvatarImage(archetypeId: string): ImageSourcePropType | null {
  return ARCHETYPE_IMAGES[archetypeId] || null;
}

export function getScenarioHeroImage(scenarioId: string): ImageSourcePropType | null {
  return SCENARIO_IMAGES[scenarioId] || null;
}

export function getPuzzleHeroImage(puzzleId: string): ImageSourcePropType {
  // Puzzle ids are date-based and change daily, so rather than mapping exact
  // ids, alternate between the available hero images deterministically by id
  // so the same puzzle always shows the same image within a day.
  let hash = 0;
  for (let i = 0; i < puzzleId.length; i++) hash = (hash * 31 + puzzleId.charCodeAt(i)) >>> 0;
  return PUZZLE_HERO_IMAGES[hash % PUZZLE_HERO_IMAGES.length];
}

export function getFeatureIllustration(featureId: string): ImageSourcePropType | null {
  return FEATURE_IMAGES[featureId] || null;
}
