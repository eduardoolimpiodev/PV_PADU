import { UserResponseDto } from '../dto/UserDto';
import { FileSource } from '../entities/User';
import * as xml2js from 'xml2js';

export type OutputFormat = 'json' | 'csv' | 'xml';

export class OutputFormatterService {
  formatUsers(users: UserResponseDto[], format: OutputFormat = 'json'): string {
    switch (format) {
      case 'csv':
        return this.formatAsCsv(users);
      case 'xml':
        return this.formatAsXml(users);
      case 'json':
      default:
        return this.formatAsJson(users);
    }
  }

  private formatAsJson(users: UserResponseDto[]): string {
    return JSON.stringify(users, null, 2);
  }

  private formatAsCsv(users: UserResponseDto[]): string {
    if (users.length === 0) {
      return 'id,name,email,source,createdAt,updatedAt\n';
    }

    const headers = 'id,name,email,source,createdAt,updatedAt';
    const rows = users.map(user => {
      return [
        user.id,
        this.escapeCsvField(user.name),
        this.escapeCsvField(user.email),
        user.source,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  private formatAsXml(users: UserResponseDto[]): string {
    const xmlData = {
      users: {
        user: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          source: user.source,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))
      }
    };

    const builder = new xml2js.Builder({
      rootName: 'users',
      headless: false,
      renderOpts: { pretty: true, indent: '  ' }
    });

    return builder.buildObject(xmlData.users);
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  getContentType(format: OutputFormat): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'xml':
        return 'application/xml';
      case 'json':
      default:
        return 'application/json';
    }
  }

  getFileExtension(format: OutputFormat): string {
    switch (format) {
      case 'csv':
        return '.csv';
      case 'xml':
        return '.xml';
      case 'json':
      default:
        return '.json';
    }
  }

  isValidFormat(format: string): format is OutputFormat {
    return ['json', 'csv', 'xml'].includes(format);
  }
}
