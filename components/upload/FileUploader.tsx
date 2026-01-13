'use client';

import { useCallback, useState } from 'react';
import { LIMITS } from '@/constants/limits';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export default function FileUploader({ onFileSelect, isProcessing = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find((f) => f.name.endsWith('.csv'));

      if (csvFile) {
        onFileSelect(csvFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center
        transition-all duration-200
        ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}
        ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-primary-400'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />

      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={`h-16 w-16 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            {isProcessing ? 'Processing...' : 'Drop CSV file here'}
          </p>
          <p className="text-sm text-gray-500">
            or{' '}
            <label htmlFor="file-upload" className="text-primary-500 hover:text-primary-700 cursor-pointer font-medium">
              browse files
            </label>
          </p>
        </div>

        <div className="text-xs text-gray-400">
          Maximum file size: {LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB
        </div>
      </div>
    </div>
  );
}
