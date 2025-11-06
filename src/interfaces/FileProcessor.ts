import { UserData } from '../dto/UserDto';
import { FileSource } from '../entities/User';

export interface FileProcessor {
  process(buffer: Buffer): Promise<UserData[]>;
  supports(fileType: FileSource): boolean;
  validateFormat(buffer: Buffer): Promise<boolean>;
}
