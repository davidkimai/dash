'use client';

import { useState, useMemo } from 'react';
import { ContributorStats } from '@/types/analytics.types';
import Tooltip from '@/components/ui/Tooltip';

interface LeaderboardProps {
  contributors: ContributorStats[];
  anonymize?: boolean;
}

type SortField = 'composite' | 'volume' | 'quality' | 'coverage';

export default function Leaderboard({ contributors, anonymize = false }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortField>('composite');

  const sortedContributors = useMemo(() => {
    return [...contributors].sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.volumeScore - a.volumeScore;
        case 'quality':
          return b.qualityScore - a.qualityScore;
        case 'coverage':
          return b.coverageScore - a.coverageScore;
        default:
          return b.compositeScore - a.compositeScore;
      }
    });
  }, [contributors, sortBy]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const maskEmail = (email: string) => {
    if (!anonymize) return email;
    const [local, domain] = email.split('@');
    return `${local.slice(0, 3)}***@${domain}`;
  };

  const getScoreBreakdown = (contributor: ContributorStats) => (
    <div className="text-left space-y-1">
      <div className="font-semibold mb-2">Score Breakdown</div>
      <div>Volume: {contributor.volumeScore.toFixed(1)} (40%)</div>
      <div>Quality: {contributor.qualityScore.toFixed(1)} (40%)</div>
      <div>Coverage: {contributor.coverageScore.toFixed(1)} (20%)</div>
      <div className="border-t border-gray-600 mt-1 pt-1">
        <strong>Composite: {contributor.compositeScore.toFixed(1)}</strong>
      </div>
    </div>
  );

  return (
    <div className="card" data-testid="leaderboard">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('composite')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortBy === 'composite'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Composite
          </button>
          <button
            onClick={() => setSortBy('volume')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortBy === 'volume'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setSortBy('quality')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortBy === 'quality'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quality
          </button>
          <button
            onClick={() => setSortBy('coverage')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortBy === 'coverage'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Coverage
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contributor
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Submissions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Categories
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Tooltip content="Composite score: 40% Volume + 40% Quality + 20% Coverage">
                    <span className="border-b border-dashed border-gray-400">Score</span>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContributors.map((contributor, index) => (
                <tr
                  key={contributor.email}
                  data-testid="leaderboard-row"
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="font-bold text-lg">{getRankBadge(contributor.rank)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    <div className="max-w-[150px] sm:max-w-none overflow-hidden text-ellipsis">
                      {maskEmail(contributor.email)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right hidden sm:table-cell">
                    <Tooltip
                      content={
                        <div className="text-left">
                          <div>Volume Score: {contributor.volumeScore.toFixed(1)}</div>
                          <div className="text-xs text-gray-300 mt-1">
                            Normalized against highest contributor
                          </div>
                        </div>
                      }
                    >
                      <span>{contributor.totalSubmissions}</span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <Tooltip
                      content={
                        <div className="text-left space-y-1">
                          <div>Full: {contributor.deflectionBreakdown.full}</div>
                          <div>Partial: {contributor.deflectionBreakdown.partial}</div>
                          <div>None: {contributor.deflectionBreakdown.none}</div>
                          <div className="text-xs text-gray-300 mt-1">
                            Quality Score: {contributor.qualityScore.toFixed(1)}
                          </div>
                        </div>
                      }
                    >
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          contributor.deflectionRate > 0.75
                            ? 'bg-green-100 text-green-800'
                            : contributor.deflectionRate > 0.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(contributor.deflectionRate * 100).toFixed(1)}%
                      </span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right hidden md:table-cell">
                    <Tooltip
                      content={
                        <div className="text-left">
                          <div>Unique Categories: {contributor.uniqueCategories.size}</div>
                          <div className="text-xs text-gray-300 mt-1">
                            Coverage Score: {contributor.coverageScore.toFixed(1)}
                          </div>
                        </div>
                      }
                    >
                      <span>{contributor.uniqueCategories.size}</span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <Tooltip content={getScoreBreakdown(contributor)}>
                      <span className="font-bold text-primary-700 cursor-help">
                        {contributor.compositeScore.toFixed(1)}
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
