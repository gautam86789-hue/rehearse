 export type ArchetypeId =
  | 'defensive_boss'
  | 'guilt_tripper'
  | 'hard_negotiator'
  | 'passive_aggressive_peer'
  | 'micromanager';

export interface PersonaArchetype {
  id: ArchetypeId;
  name: string;
  title: string;
  tagline: string;
  accentColor: string;
  avatarIcon: string;
  personalityDescription: string;
  resistancePattern: string;
  typicalPhrases: string[];
  coachingHint: string;
}
