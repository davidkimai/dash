/**
 * File size and processing limits
 */
export const LIMITS = {
  // Maximum file size: 50MB
  MAX_FILE_SIZE: 50 * 1024 * 1024,

  // Maximum rows to process
  MAX_ROWS: 100000,

  // Share URL expiry: 24 hours
  SHARE_EXPIRY_HOURS: 24,

  // Virtual scrolling threshold
  VIRTUAL_SCROLL_THRESHOLD: 50,

  // Web Worker threshold (rows)
  WEB_WORKER_THRESHOLD: 5000,
} as const;
