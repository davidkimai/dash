import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import { CSVRow } from '@/types/csv.types';
import { LIMITS } from '@/constants/limits';

export interface ParseResult {
  data: CSVRow[];
  errors: string[];
  meta: {
    rowCount: number;
    encoding: string;
    parseTime: number;
  };
}

/**
 * Parse CSV file with automatic encoding detection
 * Supports Windows-1252, UTF-8, Shift-JIS, and other encodings
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  const startTime = performance.now();

  // Validate file size
  if (file.size > LIMITS.MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Detect encoding
        const detectedEncoding = Encoding.detect(uint8Array);
        console.log(`[CSV Parser] Detected encoding: ${detectedEncoding}`);

        // Convert to UTF-8
        const unicodeArray = Encoding.convert(uint8Array, {
          to: 'UNICODE',
          from: detectedEncoding || 'AUTO',
        });

        // Convert to string
        const text = Encoding.codeToString(unicodeArray);

        // Parse with PapaParse
        Papa.parse<CSVRow>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => value.trim(),
          complete: (results) => {
            const parseTime = performance.now() - startTime;
            
            const errors: string[] = [];
            
            // Collect parsing errors
            if (results.errors.length > 0) {
              results.errors.forEach((error) => {
                errors.push(`Row ${error.row}: ${error.message}`);
              });
            }

            // Check row limit
            if (results.data.length > LIMITS.MAX_ROWS) {
              errors.push(
                `Dataset too large (${results.data.length} rows). Maximum allowed: ${LIMITS.MAX_ROWS}`
              );
            }

            resolve({
              data: results.data,
              errors,
              meta: {
                rowCount: results.data.length,
                encoding: detectedEncoding || 'Unknown',
                parseTime: Math.round(parseTime),
              },
            });
          },
          error: (error: Error) => {
            reject(new Error(`CSV parsing failed: ${error.message}`));
          },
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('File read failed'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate CSV structure and required fields
 */
export function validateCSVStructure(rows: CSVRow[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (rows.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  // Required columns
  const requiredColumns = ['Email', 'Category ', 'Targeted RAI Policy (Task Type)'];

  const firstRow = rows[0];
  const availableColumns = Object.keys(firstRow);

  // Check for required columns
  requiredColumns.forEach((col) => {
    if (!availableColumns.includes(col)) {
      errors.push(`Missing required column: "${col}"`);
    }
  });

  // Validate data quality
  let invalidRows = 0;
  rows.forEach((row, index) => {
    if (!row.Email || !row['Category ']) {
      invalidRows++;
      if (invalidRows <= 5) {
        // Only show first 5 errors
        errors.push(`Row ${index + 1}: Missing required data`);
      }
    }
  });

  if (invalidRows > 5) {
    errors.push(`... and ${invalidRows - 5} more rows with missing data`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
