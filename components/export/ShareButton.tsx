'use client';

import { useState } from 'react';
import { ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';
import { encodeShareableData } from '@/lib/sharing/encoder';

interface ShareButtonProps {
  contributors: ContributorStats[];
  categories: CategoryStats[];
  globalMetrics: GlobalMetrics;
}

export default function ShareButton({ contributors, categories, globalMetrics }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = () => {
    const url = encodeShareableData(contributors, categories, globalMetrics);
    setShareUrl(url);

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Share Dashboard</h3>
        <p className="text-sm text-gray-500">
          Generate a shareable link with aggregate statistics only (no sensitive data)
        </p>
      </div>

      <button
        onClick={handleShare}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Generate Share Link
      </button>

      {shareUrl && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-1">
                {copied ? 'Link copied to clipboard!' : 'Share link generated'}
              </h4>
              <div className="mt-2 p-2 bg-white border border-green-300 rounded text-xs font-mono break-all">
                {shareUrl}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleShare}
                  className="text-xs text-green-700 hover:text-green-800 font-medium"
                >
                  Copy again
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:text-green-800 font-medium"
                >
                  Open in new tab →
                </a>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Link expires in 24 hours. Contains aggregate statistics only - no raw data or PII.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
