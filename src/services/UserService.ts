import { UserRepository } from '../repositories/UserRepository';
import { FileProcessingService, FileUploadInfo } from './FileProcessingService';
import { UserData, UserCreateDto, UserResponseDto } from '../dto/UserDto';
import { FileSource, User } from '../entities/User';
import { FileValidationError } from '../exceptions/FileProcessingExceptions';

export interface ProcessFileResult {
  processedCount: number;
  skippedCount: number;
  errors: string[];
  users: UserResponseDto[];
}

export interface GetUsersResult {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  private userRepository: UserRepository;
  private fileProcessingService: FileProcessingService;

  constructor() {
    this.userRepository = new UserRepository();
    this.fileProcessingService = new FileProcessingService();
  }

  async processFileUpload(fileInfo: FileUploadInfo, fileType: FileSource): Promise<ProcessFileResult> {
    const userData = await this.fileProcessingService.processFile(fileInfo, fileType);
    
    const result: ProcessFileResult = {
      processedCount: 0,
      skippedCount: 0,
      errors: [],
      users: []
    };

    for (const user of userData) {
      try {
        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) {
          result.skippedCount++;
          result.errors.push(`User with email ${user.email} already exists`);
          continue;
        }

        const userCreateDto: UserCreateDto = {
          ...user,
          source: fileType
        };

        const savedUser = await this.userRepository.create(userCreateDto);
        result.users.push(this.mapToResponseDto(savedUser));
        result.processedCount++;
      } catch (error) {
        result.skippedCount++;
        result.errors.push(`Failed to save user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (result.processedCount === 0 && result.skippedCount > 0) {
      throw new FileValidationError('No users were processed successfully', result.errors);
    }

    return result;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<GetUsersResult> {
    const { users, total } = await this.userRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapToResponseDto(user)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async getUsersBySource(source: FileSource): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findBySource(source);
    return users.map(user => this.mapToResponseDto(user));
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.mapToResponseDto(user) : null;
  }

  async clearAllUsers(): Promise<void> {
    await this.userRepository.deleteAll();
  }

  getSupportedFileTypes(): FileSource[] {
    return this.fileProcessingService.getSupportedTypes();
  }

  detectFileType(filename: string): FileSource | null {
    return this.fileProcessingService.detectFileType(filename);
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      source: user.source,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
