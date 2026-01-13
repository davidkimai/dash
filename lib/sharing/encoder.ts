import LZString from 'lz-string';
import { ShareableData, ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';
import { createAnonymizedId } from '@/lib/utils/anonymize';
import { LIMITS } from '@/constants/limits';

/**
 * Encode dashboard data into a shareable URL
 * Only includes aggregate statistics, no raw data or PII
 */
export function encodeShareableData(
  contributors: ContributorStats[],
  categories: CategoryStats[],
  globalMetrics: GlobalMetrics
): string {
  const now = Date.now();
  const expiryMs = LIMITS.SHARE_EXPIRY_HOURS * 60 * 60 * 1000;

  const shareableData: ShareableData = {
    version: '1.0',
    timestamp: now,
    expiry: now + expiryMs,
    global: globalMetrics,
    contributors: contributors.map((c) => ({
      id: createAnonymizedId(c.email),
      scores: {
        volumeScore: c.volumeScore,
        qualityScore: c.qualityScore,
        coverageScore: c.coverageScore,
        compositeScore: c.compositeScore,
        rank: c.rank,
      },
      stats: {
        submissions: c.totalSubmissions,
        deflectionRate: c.deflectionRate,
        categories: c.uniqueCategories.size,
      },
    })),
    categories: categories.map((cat) => ({
      name: cat.name,
      count: cat.count,
      percentage: cat.percentage,
      deflectionRate: cat.deflectionRate,
    })),
  };

  // Serialize and compress
  const json = JSON.stringify(shareableData);
  const compressed = LZString.compressToEncodedURIComponent(json);

  // Create URL with hash (never sent to server)
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share#${compressed}`;
  }

  return `#${compressed}`;
}

/**
 * Decode shareable URL hash into dashboard data
 */
export function decodeShareableData(hash: string): ShareableData | null {
  try {
    // Remove leading '#' if present
    const compressed = hash.startsWith('#') ? hash.slice(1) : hash;

    if (!compressed) {
      throw new Error('No data in URL');
    }

    // Decompress and parse
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) {
      throw new Error('Invalid compressed data');
    }

    const data: ShareableData = JSON.parse(json);

    // Validate version
    if (data.version !== '1.0') {
      throw new Error(`Unsupported version: ${data.version}`);
    }

    // Check expiry
    if (data.expiry && Date.now() > data.expiry) {
      throw new Error('Share link expired');
    }

    return data;
  } catch (error) {
    console.error('Failed to decode share data:', error);
    return null;
  }
}

/**
 * Check if share URL has expired
 */
export function isShareExpired(data: ShareableData): boolean {
  return data.expiry ? Date.now() > data.expiry : false;
}

/**
 * Get time remaining until expiry
 */
export function getTimeRemaining(data: ShareableData): string {
  if (!data.expiry) return 'No expiry';

  const now = Date.now();
  if (now > data.expiry) return 'Expired';

  const remainingMs = data.expiry - now;
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
