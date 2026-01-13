'use client';

import { useEffect, useState } from 'react';
import { ShareableData } from '@/types/analytics.types';
import { decodeShareableData, getTimeRemaining } from '@/lib/sharing/encoder';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import QualityGauge from '@/components/charts/QualityGauge';

export default function SharePage() {
  const [shareData, setShareData] = useState<ShareableData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Get hash from URL
    const hash = window.location.hash;
    
    if (!hash) {
      setError('No share data found in URL');
      return;
    }

    // Decode share data
    const data = decodeShareableData(hash);
    
    if (!data) {
      setError('Failed to load share data. The link may be invalid or corrupted.');
      return;
    }

    setShareData(data);
    setTimeRemaining(getTimeRemaining(data));

    // Update time remaining every minute
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(data));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Convert ShareableData contributors to ContributorStats format for display
  const getDisplayContributors = () => {
    if (!shareData) return [];
    
    return shareData.contributors.map((c) => ({
      email: c.id, // Use anonymized ID
      totalSubmissions: c.stats.submissions,
      deflectionRate: c.stats.deflectionRate,
      deflectionBreakdown: {
        full: 0,
        partial: 0,
        none: 0,
      },
      uniqueCategories: new Set<string>(),
      uniquePolicyTypes: new Set<string>(),
      volumeScore: c.scores.volumeScore,
      qualityScore: c.scores.qualityScore,
      coverageScore: c.scores.coverageScore,
      compositeScore: c.scores.compositeScore,
      rank: c.scores.rank,
    }));
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="card">
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-red-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!shareData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const contributors = getDisplayContributors();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Blue Team Analytics Dashboard
              </h1>
              <p className="text-gray-600">Shared Team Performance Report</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Your Own
            </a>
          </div>

          {/* Share info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-500 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">Shared Dashboard</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This is a read-only view containing aggregate statistics only. No sensitive data
                  is included.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Generated: {new Date(shareData.timestamp).toLocaleString()} • {timeRemaining}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Global Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Total Submissions</div>
              <div className="text-3xl font-bold text-gray-900">
                {shareData.global.totalSubmissions.toLocaleString()}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Contributors</div>
              <div className="text-3xl font-bold text-gray-900">
                {shareData.global.totalContributors}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Categories Covered</div>
              <div className="text-3xl font-bold text-gray-900">
                {shareData.global.totalCategories}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Deflection Rate</div>
              <div className="text-3xl font-bold text-gray-900">
                {(shareData.global.overallDeflectionRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <Leaderboard contributors={contributors} anonymize={true} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBarChart 
              categories={shareData.categories.map(cat => ({
                ...cat,
                contributors: new Set<string>()
              }))} 
            />
            <QualityGauge globalMetrics={shareData.global} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Privacy-first analytics - No raw data or PII shared</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
