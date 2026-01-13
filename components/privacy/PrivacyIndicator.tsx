'use client';

import { useState, useEffect } from 'react';

export default function PrivacyIndicator() {
  const [networkCalls, setNetworkCalls] = useState(0);

  useEffect(() => {
    // Monitor network requests (for development verification)
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;

    let requestCount = 0;

    // Override fetch
    window.fetch = function (...args) {
      const url = args[0]?.toString() || '';
      // Ignore Next.js internal calls and same-origin navigation
      if (!url.includes('/_next/') && !url.startsWith('/')) {
        requestCount++;
        setNetworkCalls(requestCount);
        console.warn('[Privacy Monitor] External network call detected:', url);
      }
      return originalFetch.apply(this, args);
    };

    // Override XMLHttpRequest
    const XHROpen = originalXHR.prototype.open;
    originalXHR.prototype.open = function (method: string, url: string) {
      if (!url.includes('/_next/') && !url.startsWith('/')) {
        requestCount++;
        setNetworkCalls(requestCount);
        console.warn('[Privacy Monitor] External XHR call detected:', url);
      }
      return XHROpen.apply(this, arguments as any);
    };

    return () => {
      window.fetch = originalFetch;
      originalXHR.prototype.open = XHROpen;
    };
  }, []);

  return (
    <div className="card bg-green-50 border-green-200">
      <div className="flex items-start gap-3">
        <svg className="h-6 w-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-green-900 mb-1">Privacy-First Processing</h3>
          <div className="text-sm text-green-800 space-y-1">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>All data processed in browser memory</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Zero network calls after page load</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No data stored in cookies or localStorage</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Data cleared on page refresh</span>
            </div>
          </div>
          {networkCalls > 0 && (
            <div className="mt-2 text-xs text-red-600 font-semibold">
              ⚠️ Warning: {networkCalls} external network {networkCalls === 1 ? 'call' : 'calls'}{' '}
              detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
