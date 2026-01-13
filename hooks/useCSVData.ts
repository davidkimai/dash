'use client';

import { useState, useCallback } from 'react';
import { CSVRow } from '@/types/csv.types';
import { ContributorStats, CategoryStats, GlobalMetrics } from '@/types/analytics.types';
import { parseCSV, validateCSVStructure } from '@/lib/parsers/csvParser';
import { processDataset } from '@/lib/analytics/aggregation';

interface UseCSVDataReturn {
  // State
  rawData: CSVRow[] | null;
  contributors: ContributorStats[];
  categories: CategoryStats[];
  globalMetrics: GlobalMetrics | null;
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  uploadCSV: (file: File) => Promise<void>;
  clearData: () => void;
}

export function useCSVData(): UseCSVDataReturn {
  const [rawData, setRawData] = useState<CSVRow[] | null>(null);
  const [contributors, setContributors] = useState<ContributorStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadCSV = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log(`[useCSVData] Parsing file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
      
      // Parse CSV
      const result = await parseCSV(file);
      
      console.log(`[useCSVData] Parsed ${result.meta.rowCount} rows in ${result.meta.parseTime}ms`);

      // Check for parsing errors
      if (result.errors.length > 0) {
        console.warn('[useCSVData] Parsing errors:', result.errors);
      }

      // Validate structure
      const validation = validateCSVStructure(result.data);
      if (!validation.valid) {
        throw new Error(`Invalid CSV structure:\n${validation.errors.join('\n')}`);
      }

      // Process dataset
      const processed = processDataset(result.data);
      
      console.log(`[useCSVData] Processed data:`, {
        contributors: processed.contributors.length,
        categories: processed.categories.length,
        totalSubmissions: processed.global.totalSubmissions,
      });

      // Update state
      setRawData(result.data);
      setContributors(processed.contributors);
      setCategories(processed.categories);
      setGlobalMetrics(processed.global);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process CSV file';
      console.error('[useCSVData] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setRawData(null);
    setContributors([]);
    setCategories([]);
    setGlobalMetrics(null);
    setError(null);
    console.log('[useCSVData] Data cleared');
  }, []);

  return {
    rawData,
    contributors,
    categories,
    globalMetrics,
    isProcessing,
    error,
    uploadCSV,
    clearData,
  };
}
