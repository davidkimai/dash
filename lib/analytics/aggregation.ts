import { CSVRow } from '@/types/csv.types';
import { ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';
import { calculateDeflectionRate, assignScores } from './scoring';

/**
 * Aggregate data by contributor
 */
export function aggregateByContributor(rows: CSVRow[]): Map<string, ContributorStats> {
  const contributorMap = new Map<string, ContributorStats>();

  rows.forEach((row) => {
    const email = row.Email?.trim();
    if (!email) return;

    if (!contributorMap.has(email)) {
      contributorMap.set(email, {
        email,
        totalSubmissions: 0,
        deflectionRate: 0,
        deflectionBreakdown: {
          full: 0,
          partial: 0,
          none: 0,
        },
        uniqueCategories: new Set(),
        uniquePolicyTypes: new Set(),
        volumeScore: 0,
        qualityScore: 0,
        coverageScore: 0,
        compositeScore: 0,
        rank: 0,
      });
    }

    const stats = contributorMap.get(email)!;
    stats.totalSubmissions++;

    // Track deflections
    const deflectionType = row['Deflection Type (Jailbreaking Technique)'];
    if (deflectionType === 'Full') {
      stats.deflectionBreakdown.full++;
    } else if (deflectionType === 'Partial') {
      stats.deflectionBreakdown.partial++;
    } else {
      stats.deflectionBreakdown.none++;
    }

    // Track coverage
    const category = row['Category ']?.trim();
    if (category) {
      stats.uniqueCategories.add(category);
    }

    const policyType = row['Targeted RAI Policy (Task Type)']?.trim();
    if (policyType) {
      stats.uniquePolicyTypes.add(policyType);
    }
  });

  // Calculate deflection rates
  contributorMap.forEach((stats) => {
    stats.deflectionRate = calculateDeflectionRate(stats.deflectionBreakdown);
  });

  return contributorMap;
}

/**
 * Aggregate data by category
 */
export function aggregateByCategory(rows: CSVRow[]): Map<string, CategoryStats> {
  const categoryMap = new Map<string, CategoryStats>();

  rows.forEach((row) => {
    const category = row['Category ']?.trim();
    if (!category) return;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        count: 0,
        percentage: 0,
        deflectionRate: 0,
        contributors: new Set(),
      });
    }

    const stats = categoryMap.get(category)!;
    stats.count++;

    const email = row.Email?.trim();
    if (email) {
      stats.contributors.add(email);
    }
  });

  // Calculate percentages
  const total = rows.length;
  categoryMap.forEach((stats) => {
    stats.percentage = (stats.count / total) * 100;
  });

  return categoryMap;
}

/**
 * Calculate global metrics
 */
export function calculateGlobalMetrics(
  rows: CSVRow[],
  contributors: Map<string, ContributorStats>,
  categories: Map<string, CategoryStats>
): GlobalMetrics {
  const totalSubmissions = rows.length;
  const totalContributors = contributors.size;
  const totalCategories = categories.size;

  // Overall deflection rate
  let totalFull = 0;
  let totalPartial = 0;
  let totalNone = 0;

  contributors.forEach((stats) => {
    totalFull += stats.deflectionBreakdown.full;
    totalPartial += stats.deflectionBreakdown.partial;
    totalNone += stats.deflectionBreakdown.none;
  });

  const overallDeflectionRate = calculateDeflectionRate({
    full: totalFull,
    partial: totalPartial,
    none: totalNone,
  });

  // Average submissions per contributor
  const avgSubmissionsPerContributor =
    totalContributors > 0 ? totalSubmissions / totalContributors : 0;

  // Category balance (Shannon entropy)
  const categoryBalanceScore = calculateCategoryBalance(Array.from(categories.values()));

  return {
    totalSubmissions,
    totalContributors,
    totalCategories,
    overallDeflectionRate,
    avgSubmissionsPerContributor,
    categoryBalanceScore,
  };
}

/**
 * Process full dataset and return ranked leaderboard
 */
export function processDataset(rows: CSVRow[]): {
  contributors: ContributorStats[];
  categories: CategoryStats[];
  global: GlobalMetrics;
} {
  const contributorMap = aggregateByContributor(rows);
  const categoryMap = aggregateByCategory(rows);
  const globalMetrics = calculateGlobalMetrics(rows, contributorMap, categoryMap);

  // Assign scores
  const contributorsArray = Array.from(contributorMap.values());
  const contributorsWithScores = contributorsArray.map((c) =>
    assignScores(c, globalMetrics, contributorsArray)
  );

  // Rank by composite score
  const rankedContributors = contributorsWithScores
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((c, index) => ({ ...c, rank: index + 1 }));

  return {
    contributors: rankedContributors,
    categories: Array.from(categoryMap.values()),
    global: globalMetrics,
  };
}

/**
 * Calculate Shannon entropy for category distribution balance
 * Higher entropy = more balanced coverage
 * Range: 0 (all in one category) to log2(n) (perfectly balanced)
 */
function calculateCategoryBalance(categories: CategoryStats[]): number {
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const category of categories) {
    const p = category.count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-100 scale
  const maxEntropy = Math.log2(categories.length);
  return maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
}
