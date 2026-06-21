import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { take } from 'rxjs';
import { SearchResponse } from './dto/search-response';
import { UserWithTotalSpentResponse } from './dto/user-with-total-spent-response';
import { DailyUserRegistrationResponse } from './dto/daily-user-registration-response';
import { UserRegistrationTrendRespose } from './dto/user-registration-trend-response';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  async searchByField(field: 'name' | 'email', value: string): Promise<User[]> {
    const LIMIT = 10; // INFO: not need to return all
    
    const users = await this.userRepository.query(`
      SELECT id, name, email FROM search_users_by_field('${field}', '${value}') LIMIT ${LIMIT}  
    `)

    return users;
  }

  async findTop3ByTotalSpent(): Promise<UserWithTotalSpentResponse[]> {
    const rows = await this.dataSource.query(`SELECT id, name, email, total_spent FROM user_total_spent LIMIT 3`);

    return rows.map(r => {
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        createdAt: r.created_at,
        totalSpent: Number(r.total_spent),
      };
    });
  }

  async findByMostExpensiveProduct(): Promise<User[]> {
    const rows = await this.dataSource.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.created_at
      FROM users u
      JOIN orders o ON o.user_id = u.id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.product_id = (SELECT id FROM products ORDER BY price DESC LIMIT 1)
    `);

    return rows.map(r => {
      return { 
        id: r.id,
        name: r.name, 
        email: r.email, 
        createdAt: r.created_at,
      };
    });
  }

  async findDailyRegistrations(): Promise<DailyUserRegistrationResponse[]> {
    const rows = await this.dataSource.query(`
      SELECT created_at, count FROM daily_user_registrations ORDER BY created_at DESC LIMIT 1
    `);

    return rows.map(r => {
      return {
        createdAt: r.created_at, 
        count: r.count,
      };
    });
  }

  async getRegistrationTrend(): Promise<{ 
    currentPeriod: UserRegistrationTrendRespose['currentPeriod']; 
    previousPeriod: UserRegistrationTrendRespose['previousPeriod'];
  }> {
    const rows = await this.dataSource.query(`
      SELECT
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END) AS current_period,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '28 days'
                  AND created_at < NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END) AS previous_period
      FROM users
      WHERE created_at >= NOW() - INTERVAL '28 days'
    `);

    return {
      currentPeriod: Number(rows[0]?.current_period ?? 0),
      previousPeriod: Number(rows[0]?.previous_period ?? 0),
    };
  }
}