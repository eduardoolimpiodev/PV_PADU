import { FileProcessor } from '../interfaces/FileProcessor';
import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import { FileValidationResult } from '../types/FileTypes';

export abstract class BaseFileProcessor implements FileProcessor {
  abstract process(buffer: Buffer): Promise<UserData[]>;
  abstract supports(fileType: FileSource): boolean;
  abstract validateFormat(buffer: Buffer): Promise<boolean>;

  protected validateUserData(data: any): FileValidationResult {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email format is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected sanitizeUserData(data: any): UserData {
    return {
      name: data.name?.toString().trim() || '',
      email: data.email?.toString().trim().toLowerCase() || ''
    };
  }
}
