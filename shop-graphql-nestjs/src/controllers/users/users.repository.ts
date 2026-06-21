import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { take } from 'rxjs';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findWithCount(limit = 10, offset = 0): Promise<[User[], number]> {
    return this.userRepository.findAndCount({
      skip: offset,
      take: limit,
    });
  }

  async findWithCursor(cursor = 0, limit = 10): Promise<User[]> {
    const result = await this.userRepository.find({
      where: cursor > 0 ? { id: MoreThan(cursor) } : {},
      take: limit,
      order: { id: 'ASC' },
    });

    return result;
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }
}