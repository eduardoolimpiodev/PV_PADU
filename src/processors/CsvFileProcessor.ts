import { BaseFileProcessor } from './BaseFileProcessor';
import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import { FileProcessingError, FileParsingError } from '../exceptions/FileProcessingExceptions';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

export class CsvFileProcessor extends BaseFileProcessor {
  supports(fileType: FileSource): boolean {
    return fileType === FileSource.CSV;
  }

  async validateFormat(buffer: Buffer): Promise<boolean> {
    try {
      const content = buffer.toString('utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) return false;
      
      const header = lines[0].toLowerCase();
      return header.includes('name') && header.includes('email');
    } catch {
      return false;
    }
  }

  async process(buffer: Buffer): Promise<UserData[]> {
    const isValid = await this.validateFormat(buffer);
    if (!isValid) {
      throw new FileProcessingError('Invalid CSV format. Expected headers: name, email');
    }

    return new Promise((resolve, reject) => {
      const results: UserData[] = [];
      const errors: string[] = [];
      let lineNumber = 1;

      const stream = Readable.from(buffer.toString('utf-8'));
      
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          lineNumber++;
          try {
            const validation = this.validateUserData(data);
            if (!validation.isValid) {
              errors.push(`Line ${lineNumber}: ${validation.errors?.join(', ')}`);
              return;
            }

            const userData = this.sanitizeUserData(data);
            results.push(userData);
          } catch (error) {
            errors.push(`Line ${lineNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject(new FileParsingError(`CSV parsing errors: ${errors.join('; ')}`));
          } else if (results.length === 0) {
            reject(new FileProcessingError('No valid user data found in CSV file'));
          } else {
            resolve(results);
          }
        })
        .on('error', (error) => {
          reject(new FileParsingError(`CSV parsing failed: ${error.message}`));
        });
    });
  }
}
