/**
 * CSV Row Schema - matches input data structure
 */
export interface CSVRow {
  'QA Status': string;
  'Prompt ID': number;
  'Turn ID': number;
  'Modality': string;
  'Program Language': string;
  'Top-level Vertical (Pillar)': string;
  'Category ': string; // Note: trailing space in original data
  'Targeted RAI Policy (Task Type)': string;
  'Deflection Type (Jailbreaking Technique)': 'Full' | 'Partial' | 'N/a' | string;
  'Model Input': string;
  'Input Media Link ': string;
  'Model Response': string;
  'Ideal response': string;
  'Output Media Link ': string;
  'Deflection (Breaks Model)': 'Yes' | 'No' | string;
  'Notes ': string;
  'Email': string;
  'Annotation & Benchmarking completed by': string;
  'QA Notes ': string;
}
