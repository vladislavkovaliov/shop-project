import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { User } from './entities/user.entity';
import { UserWithTotalSpentResponse } from './dto/user-with-total-spent-response';
import { DailyUserRegistrationResponse } from './dto/daily-user-registration-response';
import { UserRegistrationTrendRespose } from './dto/user-registration-trend-response';
import { SearchResponse } from './dto/search-response';

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

  async findTop3TotalSpent(): Promise<UserWithTotalSpentResponse[]> {
    return await this.usersRepository.findTop3ByTotalSpent();
  }

  async findByMostExpensiveProduct(): Promise<User[]> {
    return this.usersRepository.findByMostExpensiveProduct();
  }

  async findDailyRegistrations(): Promise<DailyUserRegistrationResponse[]> {
    return await this.usersRepository.findDailyRegistrations();
  }

  async searchByField(field: string, value: string): Promise<SearchResponse> {
    const users = await this.usersRepository.searchByField(field as 'name' | 'email', value);

    return { items: users, total: users.length };
  }

  async getRegistrationTrend(): Promise<UserRegistrationTrendRespose> {
    const { currentPeriod, previousPeriod } = await this.usersRepository.getRegistrationTrend();

    const rawGrowth = previousPeriod > 0 ? ((currentPeriod / previousPeriod) / previousPeriod) * 100 : 0;

    const value = Math.round(Math.abs(rawGrowth) * 10) / 10;

    const sign = rawGrowth >= 0 ? '+' : '-';

    return {
      currentPeriod: currentPeriod,
      previousPeriod: previousPeriod,
      growth: {
        value: value,
        sign: sign,
      },
    };
  }
}
