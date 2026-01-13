'use client';

import { useState } from 'react';
import { useCSVData } from '@/hooks/useCSVData';
import FileUploader from '@/components/upload/FileUploader';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import PolicyDonutChart from '@/components/charts/PolicyDonutChart';
import CoverageHeatmap from '@/components/charts/CoverageHeatmap';
import QualityGauge from '@/components/charts/QualityGauge';
import ShareButton from '@/components/export/ShareButton';
import ExportMenu from '@/components/export/ExportMenu';
import PrivacyIndicator from '@/components/privacy/PrivacyIndicator';

export default function HomePage() {
  const { rawData, contributors, categories, globalMetrics, isProcessing, error, uploadCSV, clearData } = useCSVData();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const hasData = contributors.length > 0;

  const handleClearData = () => {
    clearData();
    setShowClearConfirm(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Blue Team Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Privacy-first analytics for cybersecurity annotation teams
              </p>
            </div>
            {hasData && (
              <div className="flex gap-2">
                {globalMetrics && (
                  <ExportMenu
                    contributors={contributors}
                    categories={categories}
                    globalMetrics={globalMetrics}
                  />
                )}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Data
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear All Data?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will remove all processed data from memory. You&apos;ll need to upload a new CSV
                to continue.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error processing file</h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!hasData ? (
          <div className="space-y-6">
            <PrivacyIndicator />
            <div className="card">
              <FileUploader onFileSelect={uploadCSV} isProcessing={isProcessing} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Metrics */}
            {globalMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                  <div className="text-sm text-gray-500 mb-1">Total Submissions</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {globalMetrics.totalSubmissions.toLocaleString()}
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-500 mb-1">Contributors</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {globalMetrics.totalContributors}
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-500 mb-1">Categories Covered</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {globalMetrics.totalCategories}
                  </div>
                </div>
                <div className="card">
                  <div className="text-sm text-gray-500 mb-1">Deflection Rate</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {(globalMetrics.overallDeflectionRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div id="leaderboard">
              <Leaderboard contributors={contributors} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <CategoryBarChart categories={categories} />

              {/* RAI Policy Distribution */}
              {rawData && <PolicyDonutChart data={rawData} />}
            </div>

            {/* Quality Indicators */}
            {globalMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <QualityGauge globalMetrics={globalMetrics} />
                </div>
                <div className="lg:col-span-2">
                  {rawData && (
                    <CoverageHeatmap
                      contributors={contributors}
                      categories={categories}
                      rawData={rawData}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Share and Export */}
            {globalMetrics && (
              <ShareButton
                contributors={contributors}
                categories={categories}
                globalMetrics={globalMetrics}
              />
            )}

            {/* Privacy Indicator */}
            <PrivacyIndicator />

            {/* Upload New File */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Dataset</h3>
              <FileUploader onFileSelect={uploadCSV} isProcessing={isProcessing} />
            </div>
          </div>
        )}

        <footer className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>All data processed locally - Zero network calls</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
