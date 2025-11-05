import { FileSource } from '../entities/User';

export interface UserData {
  name: string;
  email: string;
}

export interface UserCreateDto extends UserData {
  source: FileSource;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  source: FileSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadDto {
  fileType: 'csv' | 'json' | 'xml';
}

export interface UsersQueryDto {
  format?: 'json' | 'csv' | 'xml';
  page?: number;
  limit?: number;
}
