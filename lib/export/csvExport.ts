import { ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';

/**
 * Export aggregate statistics as CSV (no raw data)
 */
export function exportAggregateCSV(
  contributors: ContributorStats[],
  categories: CategoryStats[],
  globalMetrics: GlobalMetrics
): void {
  const lines: string[] = [];

  // Header section
  lines.push('Blue Team Analytics Dashboard - Aggregate Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Global metrics
  lines.push('=== GLOBAL METRICS ===');
  lines.push('Metric,Value');
  lines.push(`Total Submissions,${globalMetrics.totalSubmissions}`);
  lines.push(`Total Contributors,${globalMetrics.totalContributors}`);
  lines.push(`Total Categories,${globalMetrics.totalCategories}`);
  lines.push(`Overall Deflection Rate,${(globalMetrics.overallDeflectionRate * 100).toFixed(2)}%`);
  lines.push(
    `Avg Submissions per Contributor,${globalMetrics.avgSubmissionsPerContributor.toFixed(2)}`
  );
  lines.push(`Category Balance Score,${globalMetrics.categoryBalanceScore.toFixed(2)}`);
  lines.push('');

  // Contributors leaderboard
  lines.push('=== CONTRIBUTORS LEADERBOARD ===');
  lines.push(
    'Rank,Contributor ID,Total Submissions,Deflection Rate,Unique Categories,Volume Score,Quality Score,Coverage Score,Composite Score'
  );
  contributors.forEach((c) => {
    const id = c.email.substring(0, 10) + '...'; // Partial anonymization
    lines.push(
      `${c.rank},${id},${c.totalSubmissions},${(c.deflectionRate * 100).toFixed(2)}%,${c.uniqueCategories.size},${c.volumeScore.toFixed(1)},${c.qualityScore.toFixed(1)},${c.coverageScore.toFixed(1)},${c.compositeScore.toFixed(1)}`
    );
  });
  lines.push('');

  // Category distribution
  lines.push('=== CATEGORY DISTRIBUTION ===');
  lines.push('Category,Count,Percentage,Contributors');
  categories
    .sort((a, b) => b.count - a.count)
    .forEach((cat) => {
      lines.push(
        `${cat.name},${cat.count},${cat.percentage.toFixed(2)}%,${cat.contributors.size}`
      );
    });

  // Create and download CSV
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-aggregate-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
