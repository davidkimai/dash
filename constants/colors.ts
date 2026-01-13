/**
 * Chart color palettes
 */
export const COLORS = {
  // Primary palette (enterprise blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },

  // Quality indicators
  quality: {
    high: '#10b981', // Green (>75%)
    medium: '#f59e0b', // Amber (50-75%)
    low: '#ef4444', // Red (<50%)
  },

  // Chart palette (8 distinct colors for contributors)
  chart: [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f97316',
    '#10b981',
    '#06b6d4',
    '#6366f1',
    '#f43f5e',
  ],

  // Rank badges
  ranks: {
    gold: '#fbbf24',
    silver: '#9ca3af',
    bronze: '#cd7f32',
  },
} as const;
