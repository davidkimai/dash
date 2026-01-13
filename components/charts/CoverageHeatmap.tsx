'use client';

import { ContributorStats, CategoryStats } from '@/types/analytics.types';
import { CSVRow } from '@/types/csv.types';

interface CoverageHeatmapProps {
  contributors: ContributorStats[];
  categories: CategoryStats[];
  rawData: CSVRow[];
}

export default function CoverageHeatmap({ contributors, categories, rawData }: CoverageHeatmapProps) {
  // Build contributor × category matrix
  const matrix = new Map<string, Map<string, number>>();

  rawData.forEach((row) => {
    const email = row.Email?.trim();
    const category = row['Category ']?.trim();
    
    if (email && category) {
      if (!matrix.has(email)) {
        matrix.set(email, new Map());
      }
      const contributorMap = matrix.get(email)!;
      contributorMap.set(category, (contributorMap.get(category) || 0) + 1);
    }
  });

  // Get top 10 categories by volume
  const topCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get top 8 contributors by composite score
  const topContributors = [...contributors]
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 8);

  // Find max count for color scaling
  const maxCount = Math.max(
    ...topContributors.map((contributor) => {
      const contributorMap = matrix.get(contributor.email);
      return Math.max(
        ...topCategories.map((cat) => contributorMap?.get(cat.name) || 0)
      );
    })
  );

  // Color intensity function
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity > 0.75) return 'bg-primary-700';
    if (intensity > 0.5) return 'bg-primary-500';
    if (intensity > 0.25) return 'bg-primary-300';
    return 'bg-primary-100';
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Coverage Heatmap</h2>
        <p className="text-sm text-gray-500 mt-1">
          Contributor coverage across top categories
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 border-b border-r">
                  Contributor
                </th>
                {topCategories.map((cat) => (
                  <th
                    key={cat.name}
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b min-w-[80px]"
                    title={cat.name}
                  >
                    <div className="truncate max-w-[80px]">
                      {cat.name.length > 12 ? cat.name.substring(0, 12) + '...' : cat.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topContributors.map((contributor) => {
                const contributorMap = matrix.get(contributor.email);
                return (
                  <tr key={contributor.email} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-2 text-sm font-mono border-r whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">#{contributor.rank}</span>
                        <span className="truncate max-w-[150px]" title={contributor.email}>
                          {maskEmail(contributor.email)}
                        </span>
                      </div>
                    </td>
                    {topCategories.map((cat) => {
                      const count = contributorMap?.get(cat.name) || 0;
                      return (
                        <td
                          key={`${contributor.email}-${cat.name}`}
                          className={`px-2 py-2 text-center text-xs border ${getColor(count)} transition-colors`}
                          title={`${contributor.email}\n${cat.name}\n${count} submissions`}
                        >
                          {count > 0 ? count : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <span>Intensity:</span>
        <div className="flex items-center gap-1">
          <div className="w-6 h-4 bg-gray-100 border"></div>
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-4 bg-primary-100 border"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-4 bg-primary-300 border"></div>
          <span>Med</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-4 bg-primary-500 border"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-4 bg-primary-700 border"></div>
          <span>Max</span>
        </div>
      </div>
    </div>
  );
}
