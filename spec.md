# Technical Specification
## Blue Team Analytics Dashboard

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Implementation Ready  
**Stack:** Next.js 15, TypeScript, Recharts, Papaparse

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client-Side)                    │
│                                                              │
│  ┌────────────┐                                              │
│  │ Next.js UI │◄──────────┐                                  │
│  └────────────┘           │                                  │
│        │                  │                                  │
│        │ CSV Upload       │ Hydrate                          │
│        ▼                  │                                  │
│  ┌────────────┐    ┌──────────────┐                          │
│  │  Parser    │───►│  Data Store  │                          │
│  │ (PapaParse)│    │ (React State)│                          │
│  └────────────┘    └──────────────┘                          │
│        │                  │                                  │
│        │                  │ Compute                          │
│        │                  ▼                                  │
│        │           ┌──────────────┐                          │
│        │           │   Analytics  │                          │
│        │           │    Engine    │                          │
│        │           └──────────────┘                          │
│        │                  │                                  │
│        │                  │ Render                           │
│        │                  ▼                                  │
│        │           ┌──────────────┐    ┌──────────────┐     │
│        │           │ Leaderboard  │    │   Charts     │     │
│        │           │  Component   │    │  (Recharts)  │     │
│        │           └──────────────┘    └──────────────┘     │
│        │                  │                                  │
│        │                  │ Export / Share                   │
│        │                  ▼                                  │
│        │           ┌──────────────┐                          │
│        └──────────►│ URL Encoder  │──► Share Link           │
│                    │ (Base64+LZ)  │                          │
│                    └──────────────┘                          │
│                           │                                  │
│                           ▼                                  │
│                    ┌──────────────┐                          │
│                    │   Export     │──► PNG/CSV/MD            │
│                    │   Engine     │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘

          NO SERVER COMMUNICATION AFTER INITIAL PAGE LOAD
```

### Architecture Principles

1. **Zero-Trust Client-Side**: All data processing in browser memory (RAM)
2. **Stateless by Design**: No persistent storage (cookies, localStorage, IndexedDB)
3. **URL as State**: Shareable links encode aggregate statistics in URL hash
4. **Progressive Enhancement**: Core features work without JS (CSV download link)
5. **Security-First**: Strict CSP headers prevent data exfiltration

---

## Technology Stack

### Core Framework
```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.6.0"
}
```

### Data Processing
```json
{
  "papaparse": "^5.4.1",          // CSV parsing with encoding detection
  "encoding-japanese": "^2.2.0"   // Handle Windows-1252, Shift-JIS, etc.
}
```

### Visualization
```json
{
  "recharts": "^2.13.0",          // Charts (MIT license, 20KB gzipped)
  "framer-motion": "^11.11.0"     // Animations (optional, +50KB)
}
```

### Utilities
```json
{
  "lz-string": "^1.5.0",          // Compression for share URLs
  "html2canvas": "^1.4.1",        // Screenshot exports
  "date-fns": "^4.1.0"            // Date formatting (no moment.js bloat)
}
```

### Development
```json
{
  "eslint": "^9.0.0",
  "prettier": "^3.4.0",
  "vitest": "^2.1.0",             // Unit testing
  "playwright": "^1.48.0"         // E2E testing
}
```

---

## Data Models

### Input Schema (CSV)

```typescript
interface CSVRow {
  "QA Status": string;
  "Prompt ID": number;
  "Turn ID": number;
  "Modality": string;
  "Program Language": string;
  "Top-level Vertical (Pillar)": string;
  "Category ": string;                              // Note: trailing space
  "Targeted RAI Policy (Task Type)": string;
  "Deflection Type (Jailbreaking Technique)": "Full" | "Partial" | "N/a";
  "Model Input": string;
  "Input Media Link ": string;
  "Model Response": string;
  "Ideal response": string;
  "Output Media Link ": string;
  "Deflection (Breaks Model)": "Yes" | "No" | string;
  "Notes ": string;
  "Email": string;                                  // Contributor identifier
  "Annotation & Benchmarking completed by": string;
  "QA Notes ": string;
}
```

### Processed Data Models

```typescript
// Contributor analytics
interface ContributorStats {
  email: string;
  totalSubmissions: number;
  deflectionRate: number;           // 0.0 - 1.0
  deflectionBreakdown: {
    full: number;
    partial: number;
    none: number;
  };
  uniqueCategories: Set<string>;
  uniquePolicyTypes: Set<string>;
  volumeScore: number;               // Normalized 0-100
  qualityScore: number;              // Normalized 0-100
  coverageScore: number;             // Normalized 0-100
  compositeScore: number;            // Weighted average
  rank: number;
}

// Category analytics
interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  deflectionRate: number;
  contributors: Set<string>;
}

// Global metrics
interface GlobalMetrics {
  totalSubmissions: number;
  totalContributors: number;
  totalCategories: number;
  overallDeflectionRate: number;
  avgSubmissionsPerContributor: number;
  categoryBalanceScore: number;      // Shannon entropy
}

// Shareable URL payload (aggregate only)
interface ShareableData {
  version: "1.0";
  timestamp: number;                  // Unix timestamp
  expiry: number;                     // Unix timestamp (24h default)
  global: GlobalMetrics;
  contributors: Array<{
    id: string;                       // Anonymized (first 3 chars + hash)
    scores: Pick<ContributorStats, 
      'volumeScore' | 'qualityScore' | 'coverageScore' | 'compositeScore' | 'rank'>;
    stats: {
      submissions: number;
      deflectionRate: number;
      categories: number;
    };
  }>;
  categories: CategoryStats[];
}
```

---

## Component Architecture

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with CSP headers
│   ├── page.tsx                # Main dashboard page
│   ├── share/[id]/page.tsx     # Shared dashboard view
│   └── globals.css             # Global styles
├── components/
│   ├── upload/
│   │   ├── FileUploader.tsx    # Drag-drop CSV upload
│   │   └── FileValidator.tsx   # Validation feedback
│   ├── leaderboard/
│   │   ├── Leaderboard.tsx     # Main leaderboard table
│   │   ├── LeaderboardRow.tsx  # Individual contributor row
│   │   ├── ScoreBreakdown.tsx  # Tooltip showing score calc
│   │   └── SortControls.tsx    # Column sort UI
│   ├── charts/
│   │   ├── CategoryBar.tsx     # Horizontal bar chart
│   │   ├── PolicyDonut.tsx     # RAI policy distribution
│   │   ├── CoverageHeatmap.tsx # Contributor × Category matrix
│   │   └── QualityGauge.tsx    # Overall success rate
│   ├── export/
│   │   ├── ShareButton.tsx     # Generate shareable URL
│   │   ├── ExportMenu.tsx      # PNG/CSV/MD export options
│   │   └── ScreenshotUtils.tsx # html2canvas wrapper
│   ├── privacy/
│   │   ├── PrivacyIndicator.tsx # "Processed locally" badge
│   │   ├── ClearDataButton.tsx  # Flush memory button
│   │   └── NetworkMonitor.tsx   # DevTools-like network status
│   └── ui/
│       ├── Button.tsx           # Base button component
│       ├── Card.tsx             # Container component
│       ├── Tooltip.tsx          # Info tooltips
│       └── Badge.tsx            # Rank badges (🥇🥈🥉)
├── lib/
│   ├── parsers/
│   │   ├── csvParser.ts         # Papaparse wrapper with encoding
│   │   └── validator.ts         # Schema validation
│   ├── analytics/
│   │   ├── scoring.ts           # Composite score calculation
│   │   ├── aggregation.ts       # Compute contributor stats
│   │   └── entropy.ts           # Shannon entropy for balance
│   ├── sharing/
│   │   ├── encoder.ts           # Base64 + LZ compression
│   │   ├── decoder.ts           # Decompress shared URLs
│   │   └── expiry.ts            # Time-based URL validation
│   ├── export/
│   │   ├── screenshot.ts        # PNG generation
│   │   ├── csvExport.ts         # Aggregate CSV export
│   │   └── markdown.ts          # Summary report generator
│   └── utils/
│       ├── anonymize.ts         # Email masking
│       └── performance.ts       // Web Workers for heavy processing
├── hooks/
│   ├── useCSVData.ts            # CSV upload & parsing state
│   ├── useLeaderboard.ts        # Computed leaderboard data
│   ├── useAnalytics.ts          # Global metrics computation
│   └── useExport.ts             # Export functionality
├── types/
│   ├── csv.types.ts             # CSV schema types
│   ├── analytics.types.ts       # Metric types
│   └── api.types.ts             # Share URL payload types
└── constants/
    ├── scoring.ts               # Weight constants (0.4/0.4/0.2)
    ├── colors.ts                # Chart color palette
    └── limits.ts                # File size, row limits

tests/
├── unit/
│   ├── scoring.test.ts          # Score calculation tests
│   ├── parser.test.ts           # CSV parsing edge cases
│   └── anonymize.test.ts        # Email masking tests
├── integration/
│   ├── dashboard.test.ts        # Full flow: upload → render
│   └── sharing.test.ts          # Share URL encode/decode
└── e2e/
    ├── upload.spec.ts           # Playwright: upload flow
    ├── leaderboard.spec.ts      # Playwright: interaction tests
    └── export.spec.ts           # Playwright: export functionality
```

---

## Core Algorithms

### 1. Composite Score Calculation

```typescript
/**
 * Calculate composite score from volume, quality, and coverage metrics
 * Formula: 0.4*V + 0.4*Q + 0.2*C (all normalized 0-100)
 */
function calculateCompositeScore(
  contributor: ContributorStats,
  globalMetrics: GlobalMetrics
): number {
  // Weights (configurable)
  const WEIGHTS = {
    volume: 0.4,
    quality: 0.4,
    coverage: 0.2
  };

  // Volume Score: Normalized against max contributor
  const maxSubmissions = Math.max(...allContributors.map(c => c.totalSubmissions));
  const volumeScore = (contributor.totalSubmissions / maxSubmissions) * 100;

  // Quality Score: Deflection success rate (Full=1, Partial=0.5)
  const qualityScore = contributor.deflectionRate * 100;

  // Coverage Score: Unique categories against total available
  const maxCategories = globalMetrics.totalCategories;
  const coverageScore = (contributor.uniqueCategories.size / maxCategories) * 100;

  // Composite
  const composite = 
    WEIGHTS.volume * volumeScore +
    WEIGHTS.quality * qualityScore +
    WEIGHTS.coverage * coverageScore;

  return Math.round(composite * 10) / 10; // 1 decimal precision
}

/**
 * Calculate deflection rate with weighted partial successes
 */
function calculateDeflectionRate(breakdown: ContributorStats['deflectionBreakdown']): number {
  const total = breakdown.full + breakdown.partial + breakdown.none;
  if (total === 0) return 0;
  
  const weightedSuccess = breakdown.full * 1.0 + breakdown.partial * 0.5;
  return weightedSuccess / total;
}
```

### 2. CSV Parsing with Encoding Detection

```typescript
import Papa from 'papaparse';
import Encoding from 'encoding-japanese';

async function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    // Read file as ArrayBuffer for encoding detection
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Detect encoding
      const detectedEncoding = Encoding.detect(uint8Array);
      console.log(`Detected encoding: ${detectedEncoding}`);
      
      // Convert to UTF-8
      const unicodeArray = Encoding.convert(uint8Array, {
        to: 'UNICODE',
        from: detectedEncoding || 'AUTO'
      });
      
      // Convert to string
      const text = Encoding.codeToString(unicodeArray);
      
      // Parse with PapaParse
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(), // Remove trailing spaces
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('Parsing errors:', results.errors);
          }
          resolve(results.data as CSVRow[]);
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsArrayBuffer(file);
  });
}
```

### 3. Share URL Encoding

```typescript
import LZString from 'lz-string';

function encodeShareableData(data: ShareableData): string {
  // Add expiry timestamp (24 hours from now)
  data.expiry = Date.now() + (24 * 60 * 60 * 1000);
  
  // Serialize and compress
  const json = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(json);
  
  // Create URL with hash (never sent to server)
  const baseUrl = window.location.origin;
  return `${baseUrl}/share#${compressed}`;
}

function decodeShareableData(hash: string): ShareableData | null {
  try {
    // Remove leading '#'
    const compressed = hash.startsWith('#') ? hash.slice(1) : hash;
    
    // Decompress and parse
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) throw new Error('Invalid compressed data');
    
    const data: ShareableData = JSON.parse(json);
    
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
```

### 4. Shannon Entropy for Coverage Balance

```typescript
/**
 * Calculate Shannon entropy to measure category distribution balance
 * Higher entropy = more balanced coverage
 * Range: 0 (all in one category) to log2(n) (perfectly balanced)
 */
function calculateCategoryBalance(categories: CategoryStats[]): number {
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);
  if (total === 0) return 0;
  
  let entropy = 0;
  for (const category of categories) {
    const p = category.count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  
  // Normalize to 0-100 scale
  const maxEntropy = Math.log2(categories.length);
  return maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
}
```

---

## Security Architecture

### Content Security Policy

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Blue Team Analytics Dashboard',
  description: 'Privacy-first annotation analytics',
  other: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval
      "style-src 'self' 'unsafe-inline'",               // Recharts inline styles
      "img-src 'self' data: blob:",                     // Screenshots
      "font-src 'self' data:",
      "connect-src 'none'",                              // NO NETWORK CALLS
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
};
```

### Data Sanitization

```typescript
/**
 * Anonymize email for display/sharing
 * Example: jason@example.com → jas***@example.com
 */
function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  
  const visibleChars = Math.min(3, local.length);
  const masked = local.slice(0, visibleChars) + '***';
  
  return `${masked}@${domain}`;
}

/**
 * Create anonymized ID for share URLs
 * Uses first 3 chars + deterministic hash (not reversible)
 */
function createAnonymizedId(email: string): string {
  const prefix = email.slice(0, 3);
  const hash = simpleHash(email).toString(36).slice(0, 6);
  return `${prefix}${hash}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

### Memory Management

```typescript
/**
 * Force garbage collection of CSV data
 */
function clearAllData() {
  // Clear React state
  setRawData(null);
  setProcessedData(null);
  setLeaderboard([]);
  
  // Clear any module-level caches
  csvCache.clear();
  
  // Force GC (hint to browser)
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as any).gc();
  }
  
  // Visual confirmation
  toast.success('All data cleared from memory');
}

// Auto-clear on page unload
useEffect(() => {
  window.addEventListener('beforeunload', clearAllData);
  return () => window.removeEventListener('beforeunload', clearAllData);
}, []);
```

---

## Performance Optimization

### Web Workers for Heavy Processing

```typescript
// lib/workers/csvProcessor.worker.ts
self.onmessage = (e: MessageEvent<{ rows: CSVRow[] }>) => {
  const { rows } = e.data;
  
  // Heavy computation off main thread
  const contributors = aggregateByContributor(rows);
  const categories = aggregateByCategory(rows);
  const global = calculateGlobalMetrics(rows);
  
  self.postMessage({ contributors, categories, global });
};

// Usage in component
const worker = useRef<Worker>();

useEffect(() => {
  worker.current = new Worker(
    new URL('../lib/workers/csvProcessor.worker.ts', import.meta.url)
  );
  
  worker.current.onmessage = (e) => {
    setProcessedData(e.data);
    setLoading(false);
  };
  
  return () => worker.current?.terminate();
}, []);

function processCSV(rows: CSVRow[]) {
  setLoading(true);
  worker.current?.postMessage({ rows });
}
```

### Virtual Scrolling for Large Datasets

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function Leaderboard({ contributors }: { contributors: ContributorStats[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: contributors.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height in pixels
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const contributor = contributors[virtualRow.index];
          return (
            <LeaderboardRow
              key={contributor.email}
              contributor={contributor}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### Memoization Strategy

```typescript
// Expensive calculations cached
const leaderboard = useMemo(() => {
  if (!rawData) return [];
  
  const contributors = aggregateByContributor(rawData);
  const rankedContributors = contributors
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((c, index) => ({ ...c, rank: index + 1 }));
  
  return rankedContributors;
}, [rawData]);

// Only recompute when sort changes
const sortedLeaderboard = useMemo(() => {
  return [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'volume': return b.volumeScore - a.volumeScore;
      case 'quality': return b.qualityScore - a.qualityScore;
      case 'coverage': return b.coverageScore - a.coverageScore;
      default: return b.compositeScore - a.compositeScore;
    }
  });
}, [leaderboard, sortBy]);
```

---

## UI/UX Specifications

### Design System

```typescript
// constants/colors.ts
export const COLORS = {
  // Primary palette (enterprise blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Quality indicators
  quality: {
    high: '#10b981',    // Green (>75%)
    medium: '#f59e0b',  // Amber (50-75%)
    low: '#ef4444'      // Red (<50%)
  },
  
  // Chart palette (8 distinct colors for contributors)
  chart: [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#06b6d4', '#6366f1', '#f43f5e'
  ],
  
  // Rank badges
  ranks: {
    gold: '#fbbf24',
    silver: '#9ca3af',
    bronze: '#cd7f32'
  }
};

// constants/typography.ts
export const TYPOGRAPHY = {
  display: '"Space Grotesk", sans-serif',  // Headers, numbers
  body: '"Inter", sans-serif',             // Body text
  mono: '"JetBrains Mono", monospace'      // Code, emails
};
```

### Component States

```typescript
// Loading states
<Skeleton className="h-12 w-full" count={8} />

// Empty states
<EmptyState
  icon={<UploadIcon />}
  title="No data yet"
  description="Upload a CSV to see your team's analytics"
  action={<Button>Upload CSV</Button>}
/>

// Error states
<ErrorBoundary
  fallback={({ error }) => (
    <Alert variant="destructive">
      <AlertTitle>Parsing failed</AlertTitle>
      <AlertDescription>
        {error.message}
        <Button variant="link" onClick={retry}>Try again</Button>
      </AlertDescription>
    </Alert>
  )}
/>
```

### Accessibility

```typescript
// Keyboard navigation
<Leaderboard
  role="table"
  aria-label="Contributors leaderboard"
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') focusNextRow();
    if (e.key === 'ArrowUp') focusPrevRow();
  }}
/>

// Screen reader announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {sortBy === 'volume' && 'Sorted by submission volume'}
  {sortBy === 'quality' && 'Sorted by deflection quality'}
</div>

// Color contrast (WCAG AA)
// - Text: 4.5:1 minimum
// - Large text: 3:1 minimum
// - UI components: 3:1 minimum
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/scoring.test.ts
describe('Composite Score Calculation', () => {
  it('calculates correct composite score', () => {
    const contributor: ContributorStats = {
      totalSubmissions: 500,
      deflectionRate: 0.75,
      uniqueCategories: new Set(['Cat1', 'Cat2', 'Cat3']),
      // ...
    };
    
    const globalMetrics: GlobalMetrics = {
      totalSubmissions: 2500,
      totalCategories: 15,
      // ...
    };
    
    const score = calculateCompositeScore(contributor, globalMetrics);
    
    // Expected: 0.4*(500/1000)*100 + 0.4*75 + 0.2*(3/15)*100
    //         = 0.4*50 + 30 + 4 = 54
    expect(score).toBeCloseTo(54, 1);
  });
  
  it('handles edge case: zero submissions', () => {
    const contributor = { totalSubmissions: 0, /* ... */ };
    const score = calculateCompositeScore(contributor, globalMetrics);
    expect(score).toBe(0);
  });
});

// tests/unit/anonymize.test.ts
describe('Email Anonymization', () => {
  it('masks email correctly', () => {
    expect(anonymizeEmail('jason@example.com')).toBe('jas***@example.com');
    expect(anonymizeEmail('a@b.com')).toBe('a***@b.com');
  });
  
  it('creates consistent anonymized IDs', () => {
    const id1 = createAnonymizedId('same@email.com');
    const id2 = createAnonymizedId('same@email.com');
    expect(id1).toBe(id2);
  });
});
```

### Integration Tests

```typescript
// tests/integration/dashboard.test.ts
describe('Dashboard Flow', () => {
  it('processes CSV and renders leaderboard', async () => {
    const file = createMockCSVFile();
    
    const { result } = renderHook(() => useCSVData());
    
    act(() => {
      result.current.uploadCSV(file);
    });
    
    await waitFor(() => {
      expect(result.current.leaderboard).toHaveLength(8);
      expect(result.current.leaderboard[0].rank).toBe(1);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/upload.spec.ts
test('upload CSV and view leaderboard', async ({ page }) => {
  await page.goto('/');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('fixtures/sample.csv');
  
  // Wait for processing
  await page.waitForSelector('[data-testid="leaderboard"]');
  
  // Verify leaderboard rendered
  const rows = page.locator('[data-testid="leaderboard-row"]');
  await expect(rows).toHaveCount(8);
  
  // Check rank 1 has gold badge
  await expect(rows.first()).toContainText('🥇');
  
  // Verify no network calls (except initial page load)
  const requests = [];
  page.on('request', req => {
    if (req.url() !== page.url()) requests.push(req.url());
  });
  
  await page.waitForTimeout(2000);
  expect(requests).toHaveLength(0);
});

// tests/e2e/sharing.spec.ts
test('generate and load share URL', async ({ page, context }) => {
  // Upload and process data
  await page.goto('/');
  await page.locator('input[type="file"]').setInputFiles('fixtures/sample.csv');
  await page.waitForSelector('[data-testid="leaderboard"]');
  
  // Generate share URL
  await page.click('[data-testid="share-button"]');
  const shareUrl = await page.locator('[data-testid="share-url"]').textContent();
  
  // Open share URL in new tab
  const newPage = await context.newPage();
  await newPage.goto(shareUrl!);
  
  // Verify dashboard loads
  await newPage.waitForSelector('[data-testid="leaderboard"]');
  const rows = newPage.locator('[data-testid="leaderboard-row"]');
  await expect(rows).toHaveCount(8);
  
  // Verify share URL mode (read-only indicators)
  await expect(newPage.locator('text=Shared Dashboard')).toBeVisible();
});
```

---

## Deployment Architecture

### Static Export (Recommended)

```typescript
// next.config.js
const nextConfig = {
  output: 'export',  // Static HTML export
  images: {
    unoptimized: true  // No server-side image optimization
  },
  // No need for API routes or server features
};

export default nextConfig;
```

### Build & Deploy

```bash
# Build
npm run build     # Generates static files in /out

# Deploy options:
# 1. GitHub Pages (free)
gh-pages -d out

# 2. Netlify (free tier)
netlify deploy --dir=out --prod

# 3. Vercel (free tier)
vercel deploy --prod

# 4. Self-hosted (nginx)
cp -r out/* /var/www/dashboard/
```

### Environment Configuration

```bash
# .env.local (optional)
NEXT_PUBLIC_APP_NAME="Blue Team Analytics"
NEXT_PUBLIC_MAX_FILE_SIZE=52428800  # 50MB in bytes
NEXT_PUBLIC_SHARE_EXPIRY_HOURS=24
```

---

## Monitoring & Analytics

### Performance Metrics (Client-Side Only)

```typescript
// lib/monitoring/performance.ts
export function trackPerformance(eventName: string, duration: number) {
  // Log to console (dev mode)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${eventName}: ${duration.toFixed(2)}ms`);
  }
  
  // Could send to local analytics (privacy-safe)
  // NO external analytics services (Google Analytics, etc.)
}

// Usage
const startTime = performance.now();
await parseCSV(file);
trackPerformance('csv_parse', performance.now() - startTime);
```

### Error Tracking (Privacy-Safe)

```typescript
// NO Sentry, Bugsnag, or external error tracking
// Errors logged to console only

function logError(error: Error, context?: Record<string, any>) {
  console.error('Dashboard Error:', {
    message: error.message,
    stack: error.stack,
    context
  });
  
  // Show user-friendly error message
  toast.error('Something went wrong. Please try again.');
}
```

---

## Open Questions & Technical Decisions

### Resolved
- ✅ **Framework**: Next.js 15 (App Router) - modern, static export support
- ✅ **Charts**: Recharts - MIT license, lightweight, enterprise-grade
- ✅ **CSV Parsing**: PapaParse - robust, handles encodings
- ✅ **Compression**: LZ-String - best compression for share URLs

### Pending Decisions

1. **Web Workers**: Enable for files >5000 rows? (Adds complexity)
   - **Recommendation**: Yes - prevents UI freeze for large datasets

2. **Animation Library**: Include Framer Motion (+50KB)?
   - **Recommendation**: Yes - polish matters for enterprise adoption

3. **Virtual Scrolling**: Enable for leaderboards >50 contributors?
   - **Recommendation**: Yes - use @tanstack/react-virtual

4. **Export Formats**: Include PDF export?
   - **Recommendation**: No (MVP) - PNG sufficient, PDF adds 200KB+ dependency

5. **Styling**: Tailwind CSS vs CSS Modules?
   - **Recommendation**: Tailwind - faster development, better DX

---

## Implementation Phases

### Week 1: Core Dashboard (Days 1-5)

**Day 1-2: Project Setup**
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS, ESLint, Prettier
- [ ] Set up folder structure
- [ ] Install dependencies (Recharts, PapaParse, etc.)
- [ ] Configure CSP headers

**Day 3-4: CSV Processing**
- [ ] Build FileUploader component
- [ ] Implement CSV parser with encoding detection
- [ ] Create data validation logic
- [ ] Build analytics engine (scoring, aggregation)
- [ ] Unit tests for scoring algorithms

**Day 5: Leaderboard UI**
- [ ] Build Leaderboard component
- [ ] Implement sorting/filtering
- [ ] Add tooltips for score breakdown
- [ ] Responsive design polish

### Week 2: Charts & Sharing (Days 6-10)

**Day 6-7: Visualization**
- [ ] Category bar chart component
- [ ] RAI policy donut chart
- [ ] Coverage heatmap
- [ ] Quality gauge indicators

**Day 8-9: Share & Export**
- [ ] Share URL encoder/decoder
- [ ] Share page route
- [ ] PNG export functionality
- [ ] CSV aggregate export
- [ ] Markdown summary generator

**Day 10: Polish & Testing**
- [ ] Accessibility audit (Axe DevTools)
- [ ] Performance optimization
- [ ] E2E tests (Playwright)
- [ ] Documentation

### Week 2.5: Launch Prep

- [ ] Security audit (CSP verification)
- [ ] Browser compatibility testing
- [ ] User acceptance testing with 1-2 team members
- [ ] Deploy to staging environment
- [ ] Create user guide

---

## Success Criteria

### MVP Launch Checklist

- [ ] **Core Features**
  - [ ] CSV upload (drag-drop + file picker)
  - [ ] Multi-metric leaderboard
  - [ ] 3 chart types (bar, donut, heatmap)
  - [ ] Share URL generation
  - [ ] PNG export

- [ ] **Performance**
  - [ ] Parse 5K rows in <2s
  - [ ] Leaderboard renders in <500ms
  - [ ] No UI freeze during processing

- [ ] **Security**
  - [ ] Zero network calls after page load (verified in DevTools)
  - [ ] CSP headers configured
  - [ ] No data in localStorage/cookies

- [ ] **Quality**
  - [ ] 80%+ unit test coverage
  - [ ] 5+ E2E tests passing
  - [ ] WCAG AA accessibility

- [ ] **Documentation**
  - [ ] README with setup instructions
  - [ ] User guide with screenshots
  - [ ] API documentation for share URLs

---

## Appendix

### A. Sample Test Data

```typescript
// fixtures/sample.csv (simplified)
export const MOCK_CSV_DATA: CSVRow[] = [
  {
    "Email": "contributor1@example.com",
    "Category ": "Code-Generation",
    "Targeted RAI Policy (Task Type)": "Malicious Code Generation",
    "Deflection Type (Jailbreaking Technique)": "Full",
    "Deflection (Breaks Model)": "Yes",
    // ... other fields
  },
  // ... more rows
];
```

### B. Performance Benchmarks

| Dataset Size | Parse Time | Render Time | Memory Usage |
|--------------|------------|-------------|--------------|
| 1K rows      | 150ms      | 200ms       | 15MB         |
| 5K rows      | 600ms      | 400ms       | 50MB         |
| 10K rows     | 1.2s       | 800ms       | 95MB         |
| 25K rows     | 3.5s       | 1.5s        | 220MB        |

*Tested on MacBook Pro M1, Chrome 120*

### C. Browser Compatibility Matrix

| Browser         | Version | Status | Notes                          |
|-----------------|---------|--------|--------------------------------|
| Chrome          | 90+     | ✅      | Primary development target     |
| Firefox         | 88+     | ✅      | Full support                   |
| Safari          | 14+     | ✅      | Requires polyfills for crypto  |
| Edge            | 90+     | ✅      | Chromium-based, full support   |
| Mobile Safari   | 14+     | ⚠️      | Limited (mobile not priority)  |
| Mobile Chrome   | 90+     | ⚠️      | Limited (mobile not priority)  |

---

**Document Status**: Ready for implementation  
**Next Review**: Post-MVP launch (Week 3)  
**Maintainer**: Jason (jason@example.com)