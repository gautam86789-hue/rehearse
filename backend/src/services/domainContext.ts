import { ArchetypeId } from '../types/index.js';

// Audience-specific fluency injected into LLM prompts so the AI counterpart's
// language matches the user's actual world, rather than generic corporate
// phrasing — this is the "familiarity" signal for the founder/investor
// audience segment. Extend this map as new audience-specific archetypes land.
const DOMAIN_CONTEXT: Partial<Record<ArchetypeId, string>> = {
  skeptical_investor:
    'You are fluent in venture capital and startup finance. Use precise, realistic language naturally where it fits: SAFE notes, priced rounds, cap table, dilution, liquidation preference, pro-rata rights, runway, burn rate, CAC payback, unit economics, TAM/SAM/SOM, down round, term sheet, board seat, option pool shuffle. Reference specific metrics the way an experienced investor would — not generic corporate speak.',
  startup_cofounder:
    'You are fluent in early-stage startup operating reality. Use precise, realistic language naturally where it fits: runway, burn rate, vesting and cliffs, equity split, pivot, product-market fit, cap table, board control, founder vesting acceleration. Reference specific startup dynamics the way a real technical or business co-founder would — not generic corporate speak.'
};

export function getDomainContext(archetypeId: ArchetypeId): string {
  return DOMAIN_CONTEXT[archetypeId] || '';
}
