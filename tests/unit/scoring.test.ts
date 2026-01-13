import { describe, it, expect } from 'vitest';
import { calculateDeflectionRate, calculateCompositeScore, assignScores } from '@/lib/analytics/scoring';
import { ContributorStats, GlobalMetrics } from '@/types/analytics.types';

describe('Scoring Algorithms', () => {
  describe('calculateDeflectionRate', () => {
    it('calculates correct deflection rate with full deflections only', () => {
      const breakdown = { full: 10, partial: 0, none: 0 };
      const rate = calculateDeflectionRate(breakdown);
      expect(rate).toBe(1.0);
    });

    it('calculates correct deflection rate with partial deflections', () => {
      const breakdown = { full: 5, partial: 10, none: 5 };
      // (5 * 1.0 + 10 * 0.5) / 20 = 10/20 = 0.5
      const rate = calculateDeflectionRate(breakdown);
      expect(rate).toBe(0.5);
    });

    it('calculates correct deflection rate with no deflections', () => {
      const breakdown = { full: 0, partial: 0, none: 10 };
      const rate = calculateDeflectionRate(breakdown);
      expect(rate).toBe(0.0);
    });

    it('handles zero total submissions', () => {
      const breakdown = { full: 0, partial: 0, none: 0 };
      const rate = calculateDeflectionRate(breakdown);
      expect(rate).toBe(0);
    });

    it('calculates mixed deflection scenario correctly', () => {
      const breakdown = { full: 3, partial: 4, none: 3 };
      // (3 * 1.0 + 4 * 0.5) / 10 = 5/10 = 0.5
      const rate = calculateDeflectionRate(breakdown);
      expect(rate).toBe(0.5);
    });
  });

  describe('calculateCompositeScore', () => {
    const createMockContributor = (
      submissions: number,
      deflectionRate: number,
      categories: number
    ): ContributorStats => ({
      email: 'test@example.com',
      totalSubmissions: submissions,
      deflectionRate,
      deflectionBreakdown: { full: 0, partial: 0, none: 0 },
      uniqueCategories: new Set(Array.from({ length: categories }, (_, i) => `cat${i}`)),
      uniquePolicyTypes: new Set(),
      volumeScore: 0,
      qualityScore: 0,
      coverageScore: 0,
      compositeScore: 0,
      rank: 0,
    });

    it('calculates correct composite score', () => {
      const contributor = createMockContributor(500, 0.75, 6);
      const globalMetrics: GlobalMetrics = {
        totalSubmissions: 1000,
        totalContributors: 2,
        totalCategories: 12,
        overallDeflectionRate: 0.5,
        avgSubmissionsPerContributor: 500,
        categoryBalanceScore: 80,
      };
      const allContributors = [contributor, createMockContributor(1000, 0.5, 8)];

      const score = calculateCompositeScore(contributor, globalMetrics, allContributors);

      // Volume: (500/1000) * 100 = 50
      // Quality: 0.75 * 100 = 75
      // Coverage: (6/12) * 100 = 50
      // Composite: 0.4*50 + 0.4*75 + 0.2*50 = 20 + 30 + 10 = 60
      expect(score).toBeCloseTo(60, 1);
    });

    it('handles top performer correctly', () => {
      const topContributor = createMockContributor(1000, 1.0, 12);
      const globalMetrics: GlobalMetrics = {
        totalSubmissions: 1500,
        totalContributors: 2,
        totalCategories: 12,
        overallDeflectionRate: 0.75,
        avgSubmissionsPerContributor: 750,
        categoryBalanceScore: 80,
      };
      const allContributors = [topContributor, createMockContributor(500, 0.5, 6)];

      const score = calculateCompositeScore(topContributor, globalMetrics, allContributors);

      // Volume: 100 (max)
      // Quality: 100 (perfect deflection)
      // Coverage: 100 (all categories)
      // Composite: 0.4*100 + 0.4*100 + 0.2*100 = 100
      expect(score).toBe(100);
    });

    it('handles zero submissions edge case', () => {
      const contributor = createMockContributor(0, 0, 0);
      const globalMetrics: GlobalMetrics = {
        totalSubmissions: 1000,
        totalContributors: 2,
        totalCategories: 12,
        overallDeflectionRate: 0.5,
        avgSubmissionsPerContributor: 500,
        categoryBalanceScore: 80,
      };
      const allContributors = [contributor, createMockContributor(1000, 0.5, 8)];

      const score = calculateCompositeScore(contributor, globalMetrics, allContributors);

      expect(score).toBe(0);
    });
  });

  describe('assignScores', () => {
    it('assigns all scores correctly', () => {
      const contributor: ContributorStats = {
        email: 'test@example.com',
        totalSubmissions: 500,
        deflectionRate: 0.75,
        deflectionBreakdown: { full: 375, partial: 125, none: 0 },
        uniqueCategories: new Set(['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6']),
        uniquePolicyTypes: new Set(['policy1', 'policy2']),
        volumeScore: 0,
        qualityScore: 0,
        coverageScore: 0,
        compositeScore: 0,
        rank: 0,
      };

      const globalMetrics: GlobalMetrics = {
        totalSubmissions: 1000,
        totalContributors: 2,
        totalCategories: 12,
        overallDeflectionRate: 0.5,
        avgSubmissionsPerContributor: 500,
        categoryBalanceScore: 80,
      };

      const allContributors = [contributor];

      const result = assignScores(contributor, globalMetrics, allContributors);

      expect(result.volumeScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeCloseTo(75, 1);
      expect(result.coverageScore).toBeCloseTo(50, 1);
      expect(result.compositeScore).toBeGreaterThan(0);
    });
  });
});
