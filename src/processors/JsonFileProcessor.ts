import { BaseFileProcessor } from './BaseFileProcessor';
import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import { FileProcessingError, FileParsingError } from '../exceptions/FileProcessingExceptions';

export class JsonFileProcessor extends BaseFileProcessor {
  supports(fileType: FileSource): boolean {
    return fileType === FileSource.JSON;
  }

  async validateFormat(buffer: Buffer): Promise<boolean> {
    try {
      const content = buffer.toString('utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data);
    } catch {
      return false;
    }
  }

  async process(buffer: Buffer): Promise<UserData[]> {
    const isValid = await this.validateFormat(buffer);
    if (!isValid) {
      throw new FileProcessingError('Invalid JSON format. Expected an array of user objects');
    }

    try {
      const content = buffer.toString('utf-8');
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        throw new FileProcessingError('JSON must contain an array of user objects');
      }

      const results: UserData[] = [];
      const errors: string[] = [];

      data.forEach((item, index) => {
        try {
          const validation = this.validateUserData(item);
          if (!validation.isValid) {
            errors.push(`Item ${index + 1}: ${validation.errors?.join(', ')}`);
            return;
          }

          const userData = this.sanitizeUserData(item);
          results.push(userData);
        } catch (error) {
          errors.push(`Item ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      if (errors.length > 0) {
        throw new FileParsingError(`JSON processing errors: ${errors.join('; ')}`);
      }

      if (results.length === 0) {
        throw new FileProcessingError('No valid user data found in JSON file');
      }

      return results;
    } catch (error) {
      if (error instanceof FileProcessingError || error instanceof FileParsingError) {
        throw error;
      }
      throw new FileParsingError(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
