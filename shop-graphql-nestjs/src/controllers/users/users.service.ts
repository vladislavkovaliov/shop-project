import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UserRepository,
  ) {}

  async findWithCount(limit = 10, offset = 0): Promise<PaginatedUsersResponse> {
    const [items, total] = await this.usersRepository.findWithCount(limit, offset);
    return { items, total, hasMore: offset + limit < total };
  }

  async count(): Promise<number> {
    return await this.usersRepository.count()
  }

  async findWithCursor(cursor = 0, limit = 10): Promise<User[]> {
    return await this.usersRepository.findWithCursor(cursor, limit)
  }
}
