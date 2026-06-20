import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
}