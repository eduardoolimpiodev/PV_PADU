import { FileSource } from '../entities/User';
import { ValidationUtils } from '../utils/ValidationUtils';
import { FileValidationError } from '../exceptions/FileProcessingExceptions';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType: FileSource | null;
  fileSize: number;
}

export interface FileValidationOptions {
  maxFileSize?: number;
  allowedTypes?: FileSource[];
  strictTypeValidation?: boolean;
}

export class FileValidationService {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
  private readonly DEFAULT_ALLOWED_TYPES = [FileSource.CSV, FileSource.JSON, FileSource.XML];

  validateFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const {
      maxFileSize = this.DEFAULT_MAX_SIZE,
      allowedTypes = this.DEFAULT_ALLOWED_TYPES,
      strictTypeValidation = true
    } = options;

    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      detectedType: null,
      fileSize: buffer.length
    };

    result.detectedType = ValidationUtils.detectFileType(filename);

    this.validateFileSize(buffer.length, maxFileSize, result);
    this.validateFileName(filename, result);
    this.validateFileType(result.detectedType, allowedTypes, result);
    this.validateMimeType(mimeType, result.detectedType, result);
    
    if (strictTypeValidation) {
      this.validateFileContent(buffer, result.detectedType, result);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  private validateFileSize(size: number, maxSize: number, result: FileValidationResult): void {
    if (size === 0) {
      result.errors.push('File is empty');
    } else if (size > maxSize) {
      result.errors.push(`File size (${this.formatFileSize(size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`);
    }
  }

  private validateFileName(filename: string, result: FileValidationResult): void {
    if (!filename || filename.trim().length === 0) {
      result.errors.push('Filename is required');
      return;
    }

    if (filename.length > 255) {
      result.errors.push('Filename is too long (maximum 255 characters)');
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      result.errors.push('Filename contains invalid characters');
    }
  }

  private validateFileType(detectedType: FileSource | null, allowedTypes: FileSource[], result: FileValidationResult): void {
    if (!detectedType) {
      result.errors.push('Unable to determine file type from extension');
      return;
    }

    if (!allowedTypes.includes(detectedType)) {
      result.errors.push(`File type '${detectedType}' is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  private validateMimeType(mimeType: string, detectedType: FileSource | null, result: FileValidationResult): void {
    if (!mimeType) {
      result.warnings.push('MIME type not provided');
      return;
    }

    const expectedMimeTypes: Record<FileSource, string[]> = {
      [FileSource.CSV]: ['text/csv', 'application/csv', 'text/plain'],
      [FileSource.JSON]: ['application/json', 'text/json', 'text/plain'],
      [FileSource.XML]: ['application/xml', 'text/xml', 'text/plain']
    };

    if (detectedType && expectedMimeTypes[detectedType]) {
      const expected = expectedMimeTypes[detectedType];
      if (!expected.includes(mimeType)) {
        result.warnings.push(`MIME type '${mimeType}' doesn't match expected types for ${detectedType}: ${expected.join(', ')}`);
      }
    }
  }

  private validateFileContent(buffer: Buffer, detectedType: FileSource | null, result: FileValidationResult): void {
    if (!detectedType) return;

    const content = buffer.toString('utf-8', 0, Math.min(1024, buffer.length));

    switch (detectedType) {
      case FileSource.JSON:
        if (!content.trim().startsWith('[') && !content.trim().startsWith('{')) {
          result.warnings.push('File content does not appear to be valid JSON');
        }
        break;
      case FileSource.XML:
        if (!content.trim().startsWith('<')) {
          result.warnings.push('File content does not appear to be valid XML');
        }
        break;
      case FileSource.CSV:
        if (!content.includes(',') && !content.includes('\t')) {
          result.warnings.push('File content does not appear to be valid CSV (no delimiters found)');
        }
        break;
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
