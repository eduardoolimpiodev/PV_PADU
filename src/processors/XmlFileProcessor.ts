import { BaseFileProcessor } from './BaseFileProcessor';
import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import { FileProcessingError, FileParsingError } from '../exceptions/FileProcessingExceptions';
import * as xml2js from 'xml2js';

export class XmlFileProcessor extends BaseFileProcessor {
  supports(fileType: FileSource): boolean {
    return fileType === FileSource.XML;
  }

  async validateFormat(buffer: Buffer): Promise<boolean> {
    try {
      const content = buffer.toString('utf-8');
      const parser = new xml2js.Parser();
      await parser.parseStringPromise(content);
      return content.includes('<users>') || content.includes('<user>');
    } catch {
      return false;
    }
  }

  async process(buffer: Buffer): Promise<UserData[]> {
    const isValid = await this.validateFormat(buffer);
    if (!isValid) {
      throw new FileProcessingError('Invalid XML format. Expected <users> root element with <user> children');
    }

    try {
      const content = buffer.toString('utf-8');
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true,
        trim: true
      });

      const result = await parser.parseStringPromise(content);
      
      let users = [];
      if (result.users && result.users.user) {
        users = Array.isArray(result.users.user) ? result.users.user : [result.users.user];
      } else if (result.user) {
        users = Array.isArray(result.user) ? result.user : [result.user];
      } else {
        throw new FileProcessingError('No user data found in XML. Expected <users><user>...</user></users> structure');
      }

      const results: UserData[] = [];
      const errors: string[] = [];

      users.forEach((user: any, index: number) => {
        try {
          const validation = this.validateUserData(user);
          if (!validation.isValid) {
            errors.push(`User ${index + 1}: ${validation.errors?.join(', ')}`);
            return;
          }

          const userData = this.sanitizeUserData(user);
          results.push(userData);
        } catch (error) {
          errors.push(`User ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      if (errors.length > 0) {
        throw new FileParsingError(`XML processing errors: ${errors.join('; ')}`);
      }

      if (results.length === 0) {
        throw new FileProcessingError('No valid user data found in XML file');
      }

      return results;
    } catch (error) {
      if (error instanceof FileProcessingError || error instanceof FileParsingError) {
        throw error;
      }
      throw new FileParsingError(`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
