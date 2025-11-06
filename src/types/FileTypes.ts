import { FileSource } from '../entities/User';

export const SUPPORTED_FILE_TYPES = [
  FileSource.CSV,
  FileSource.JSON,
  FileSource.XML
] as const;

export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[number];

export interface ProcessingResult {
  success: boolean;
  data?: any[];
  errors?: string[];
  processedCount?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors?: string[];
}
