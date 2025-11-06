export class FileProcessingError extends Error {
  constructor(message: string, public readonly fileType?: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export class FileValidationError extends Error {
  constructor(message: string, public readonly errors: string[]) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export class UnsupportedFileTypeError extends Error {
  constructor(fileType: string) {
    super(`Unsupported file type: ${fileType}`);
    this.name = 'UnsupportedFileTypeError';
  }
}

export class FileParsingError extends Error {
  constructor(message: string, public readonly line?: number) {
    super(message);
    this.name = 'FileParsingError';
  }
}
