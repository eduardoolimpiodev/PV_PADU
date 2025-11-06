import { FileProcessorFactory } from '../factories/FileProcessorFactory';
import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import { ValidationUtils } from '../utils/ValidationUtils';
import { UnsupportedFileTypeError, FileValidationError } from '../exceptions/FileProcessingExceptions';

export interface FileUploadInfo {
  buffer: Buffer;
  originalName: string;
  size: number;
  mimeType: string;
}

export class FileProcessingService {
  async processFile(fileInfo: FileUploadInfo, fileType: FileSource): Promise<UserData[]> {
    this.validateFileInfo(fileInfo);
    
    if (!FileProcessorFactory.isSupported(fileType)) {
      throw new UnsupportedFileTypeError(fileType);
    }

    const processor = FileProcessorFactory.getProcessor(fileType);
    
    const isValidFormat = await processor.validateFormat(fileInfo.buffer);
    if (!isValidFormat) {
      throw new FileValidationError(`Invalid ${fileType.toUpperCase()} format`, [
        `File does not match expected ${fileType.toUpperCase()} structure`
      ]);
    }

    return await processor.process(fileInfo.buffer);
  }

  detectFileType(filename: string): FileSource | null {
    return ValidationUtils.detectFileType(filename);
  }

  getSupportedTypes(): FileSource[] {
    return FileProcessorFactory.getSupportedTypes();
  }

  private validateFileInfo(fileInfo: FileUploadInfo): void {
    const errors: string[] = [];

    if (!fileInfo.buffer || fileInfo.buffer.length === 0) {
      errors.push('File is empty');
    }

    if (!ValidationUtils.isValidFileSize(fileInfo.size)) {
      errors.push('File size exceeds maximum allowed size (10MB)');
    }

    if (!fileInfo.originalName || fileInfo.originalName.trim().length === 0) {
      errors.push('File name is required');
    }

    if (errors.length > 0) {
      throw new FileValidationError('File validation failed', errors);
    }
  }
}
