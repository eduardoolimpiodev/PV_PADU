import { UserRepository } from '../repositories/UserRepository';
import { FileSource } from '../entities/User';

export interface UserStatistics {
  totalUsers: number;
  usersBySource: Record<FileSource, number>;
  mostRecentUpload: Date | null;
  oldestUpload: Date | null;
}

export interface SourceStatistics {
  source: FileSource;
  count: number;
  percentage: number;
}

export class StatisticsService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserStatistics(): Promise<UserStatistics> {
    const { users, total } = await this.userRepository.findAll(1, 1000000);
    
    const usersBySource: Record<FileSource, number> = {
      [FileSource.CSV]: 0,
      [FileSource.JSON]: 0,
      [FileSource.XML]: 0
    };

    let mostRecentUpload: Date | null = null;
    let oldestUpload: Date | null = null;

    users.forEach(user => {
      usersBySource[user.source]++;
      
      if (!mostRecentUpload || user.createdAt > mostRecentUpload) {
        mostRecentUpload = user.createdAt;
      }
      
      if (!oldestUpload || user.createdAt < oldestUpload) {
        oldestUpload = user.createdAt;
      }
    });

    return {
      totalUsers: total,
      usersBySource,
      mostRecentUpload,
      oldestUpload
    };
  }

  async getSourceStatistics(): Promise<SourceStatistics[]> {
    const stats = await this.getUserStatistics();
    const total = stats.totalUsers;

    return Object.entries(stats.usersBySource).map(([source, count]) => ({
      source: source as FileSource,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0
    }));
  }

  async getUserCountBySource(source: FileSource): Promise<number> {
    const users = await this.userRepository.findBySource(source);
    return users.length;
  }
}
