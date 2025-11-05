import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, FileSource } from '../entities/User';
import { UserCreateDto } from '../dto/UserDto';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(userData: UserCreateDto): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async createMany(usersData: UserCreateDto[]): Promise<User[]> {
    const users = this.repository.create(usersData);
    return await this.repository.save(users);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { users, total };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findBySource(source: FileSource): Promise<User[]> {
    return await this.repository.find({ where: { source } });
  }

  async deleteAll(): Promise<void> {
    await this.repository.clear();
  }
}
