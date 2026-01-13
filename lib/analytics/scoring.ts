import { ContributorStats, GlobalMetrics } from '@/types/analytics.types';
import { SCORING_WEIGHTS, FULL_DEFLECTION_WEIGHT, PARTIAL_DEFLECTION_WEIGHT } from '@/constants/scoring';

/**
 * Calculate deflection rate with weighted partial successes
 * Full = 1.0, Partial = 0.5, None = 0
 */
export function calculateDeflectionRate(breakdown: {
  full: number;
  partial: number;
  none: number;
}): number {
  const total = breakdown.full + breakdown.partial + breakdown.none;
  if (total === 0) return 0;

  const weightedSuccess =
    breakdown.full * FULL_DEFLECTION_WEIGHT + breakdown.partial * PARTIAL_DEFLECTION_WEIGHT;
  return weightedSuccess / total;
}

/**
 * Calculate composite score from volume, quality, and coverage metrics
 * Formula: 0.4*V + 0.4*Q + 0.2*C (all normalized 0-100)
 */
export function calculateCompositeScore(
  contributor: ContributorStats,
  globalMetrics: GlobalMetrics,
  allContributors: ContributorStats[]
): number {
  // Volume Score: Normalized against max contributor
  const maxSubmissions = Math.max(...allContributors.map((c) => c.totalSubmissions));
  const volumeScore = maxSubmissions > 0 ? (contributor.totalSubmissions / maxSubmissions) * 100 : 0;

  // Quality Score: Deflection success rate (0-1 converted to 0-100)
  const qualityScore = contributor.deflectionRate * 100;

  // Coverage Score: Unique categories against total available
  const maxCategories = globalMetrics.totalCategories;
  const coverageScore =
    maxCategories > 0 ? (contributor.uniqueCategories.size / maxCategories) * 100 : 0;

  // Composite with weights
  const composite =
    SCORING_WEIGHTS.volume * volumeScore +
    SCORING_WEIGHTS.quality * qualityScore +
    SCORING_WEIGHTS.coverage * coverageScore;

  return Math.round(composite * 10) / 10; // 1 decimal precision
}

/**
 * Assign normalized scores to contributor
 */
export function assignScores(
  contributor: ContributorStats,
  globalMetrics: GlobalMetrics,
  allContributors: ContributorStats[]
): ContributorStats {
  const maxSubmissions = Math.max(...allContributors.map((c) => c.totalSubmissions));
  const maxCategories = globalMetrics.totalCategories;

  const volumeScore = maxSubmissions > 0 ? (contributor.totalSubmissions / maxSubmissions) * 100 : 0;
  const qualityScore = contributor.deflectionRate * 100;
  const coverageScore =
    maxCategories > 0 ? (contributor.uniqueCategories.size / maxCategories) * 100 : 0;
  const compositeScore = calculateCompositeScore(contributor, globalMetrics, allContributors);

  return {
    ...contributor,
    volumeScore: Math.round(volumeScore * 10) / 10,
    qualityScore: Math.round(qualityScore * 10) / 10,
    coverageScore: Math.round(coverageScore * 10) / 10,
    compositeScore,
  };
}
