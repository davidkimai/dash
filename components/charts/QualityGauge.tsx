'use client';

import { GlobalMetrics } from '@/types/analytics.types';

interface QualityGaugeProps {
  globalMetrics: GlobalMetrics;
}

export default function QualityGauge({ globalMetrics }: QualityGaugeProps) {
  const deflectionRate = globalMetrics.overallDeflectionRate * 100;
  const balanceScore = globalMetrics.categoryBalanceScore;

  const getQualityColor = (rate: number) => {
    if (rate >= 75) return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500' };
    if (rate >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-500' };
  };

  const deflectionColors = getQualityColor(deflectionRate);
  const balanceColors = getQualityColor(balanceScore);

  // Calculate progress for visual gauge
  const getProgressWidth = (value: number) => `${Math.min(value, 100)}%`;

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Quality Indicators</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overall deflection success and category coverage balance
        </p>
      </div>

      <div className="space-y-6">
        {/* Deflection Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Deflection Success Rate</span>
            <span className={`text-2xl font-bold ${deflectionColors.text}`}>
              {deflectionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                deflectionRate >= 75
                  ? 'bg-green-500'
                  : deflectionRate >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: getProgressWidth(deflectionRate) }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Full deflections + 50% partial deflections / total submissions
          </div>
        </div>

        {/* Category Balance Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Category Balance Score</span>
            <span className={`text-2xl font-bold ${balanceColors.text}`}>
              {balanceScore.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                balanceScore >= 75
                  ? 'bg-green-500'
                  : balanceScore >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: getProgressWidth(balanceScore) }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Shannon entropy measure - higher means more balanced coverage
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-gray-500 mb-1">Avg Submissions/Contributor</div>
            <div className="text-xl font-bold text-gray-900">
              {globalMetrics.avgSubmissionsPerContributor.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Categories</div>
            <div className="text-xl font-bold text-gray-900">
              {globalMetrics.totalCategories}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
