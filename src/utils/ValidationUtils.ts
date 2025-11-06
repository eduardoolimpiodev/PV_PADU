import { FileSource } from '../entities/User';

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidName(name: string): boolean {
    return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 255;
  }

  static sanitizeString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  static detectFileType(filename: string): FileSource | null {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return FileSource.CSV;
      case 'json':
        return FileSource.JSON;
      case 'xml':
        return FileSource.XML;
      default:
        return null;
    }
  }

  static isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
    return size > 0 && size <= maxSize;
  }
}
