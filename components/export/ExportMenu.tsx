'use client';

import { useState } from 'react';
import { ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';
import { captureElementAsPNG } from '@/lib/export/screenshot';
import { exportAggregateCSV } from '@/lib/export/csvExport';
import { downloadMarkdownSummary } from '@/lib/export/markdown';

interface ExportMenuProps {
  contributors: ContributorStats[];
  categories: CategoryStats[];
  globalMetrics: GlobalMetrics;
}

export default function ExportMenu({ contributors, categories, globalMetrics }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportPNG = async (elementId: string, filename: string) => {
    setExporting('png');
    try {
      await captureElementAsPNG(elementId, filename);
    } catch (error) {
      alert('Failed to export PNG. Please try again.');
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const handleExportCSV = () => {
    setExporting('csv');
    try {
      exportAggregateCSV(contributors, categories, globalMetrics);
    } catch (error) {
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const handleExportMarkdown = () => {
    setExporting('markdown');
    try {
      downloadMarkdownSummary(contributors, categories, globalMetrics);
    } catch (error) {
      alert('Failed to export Markdown. Please try again.');
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Export Options
              </div>

              <button
                onClick={() => handleExportPNG('leaderboard', 'leaderboard.png')}
                disabled={!!exporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {exporting === 'png' ? 'Exporting...' : 'Export as PNG'}
              </button>

              <button
                onClick={handleExportCSV}
                disabled={!!exporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exporting === 'csv' ? 'Exporting...' : 'Export Aggregate CSV'}
              </button>

              <button
                onClick={handleExportMarkdown}
                disabled={!!exporting}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                {exporting === 'markdown' ? 'Exporting...' : 'Export Summary (MD)'}
              </button>

              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-3 py-2 text-xs text-gray-500">
                  All exports contain aggregate data only. No raw submissions or PII included.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
