/**
 * Contributor analytics types
 */
export interface ContributorStats {
  email: string;
  totalSubmissions: number;
  deflectionRate: number; // 0.0 - 1.0
  deflectionBreakdown: {
    full: number;
    partial: number;
    none: number;
  };
  uniqueCategories: Set<string>;
  uniquePolicyTypes: Set<string>;
  volumeScore: number; // Normalized 0-100
  qualityScore: number; // Normalized 0-100
  coverageScore: number; // Normalized 0-100
  compositeScore: number; // Weighted average
  rank: number;
}

/**
 * Category analytics types
 */
export interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  deflectionRate: number;
  contributors: Set<string>;
}

/**
 * Global metrics
 */
export interface GlobalMetrics {
  totalSubmissions: number;
  totalContributors: number;
  totalCategories: number;
  overallDeflectionRate: number;
  avgSubmissionsPerContributor: number;
  categoryBalanceScore: number; // Shannon entropy
}

/**
 * Shareable URL payload (aggregate only, no PII)
 */
export interface ShareableData {
  version: '1.0';
  timestamp: number;
  expiry: number;
  global: GlobalMetrics;
  contributors: Array<{
    id: string; // Anonymized
    scores: Pick<
      ContributorStats,
      'volumeScore' | 'qualityScore' | 'coverageScore' | 'compositeScore' | 'rank'
    >;
    stats: {
      submissions: number;
      deflectionRate: number;
      categories: number;
    };
  }>;
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
    deflectionRate: number;
  }>;
}
