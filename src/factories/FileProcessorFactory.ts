import { FileProcessor } from '../interfaces/FileProcessor';
import { FileSource } from '../entities/User';
import { CsvFileProcessor } from '../processors/CsvFileProcessor';
import { JsonFileProcessor } from '../processors/JsonFileProcessor';
import { XmlFileProcessor } from '../processors/XmlFileProcessor';

export class FileProcessorFactory {
  private static processors: Map<FileSource, FileProcessor> = new Map([
    [FileSource.CSV, new CsvFileProcessor()],
    [FileSource.JSON, new JsonFileProcessor()],
    [FileSource.XML, new XmlFileProcessor()]
  ]);

  static getProcessor(fileType: FileSource): FileProcessor {
    const processor = this.processors.get(fileType);
    if (!processor) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    return processor;
  }

  static getSupportedTypes(): FileSource[] {
    return Array.from(this.processors.keys());
  }

  static isSupported(fileType: string): boolean {
    return Object.values(FileSource).includes(fileType as FileSource);
  }
}
