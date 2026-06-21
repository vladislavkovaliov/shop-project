import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { AuthGuard } from '../../guards/auth.guard'
import { UseGuards } from '@nestjs/common';
import { CursorUserResponse } from './dto/cursor-user-response';
import { SearchResponse } from './dto/search-response';
import { UserWithTotalSpentResponse } from './dto/user-with-total-spent-response';
import { DailyUserRegistrationResponse } from './dto/daily-user-registration-response';

@Resolver(() => User)
@UseGuards(AuthGuard)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => PaginatedUsersResponse)
  async users(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedUsersResponse> {
    return this.userService.findWithCount(limit, offset);
  }

  @Query(() => CursorUserResponse)
  async usersCursor(
    @Args('cursor', { type: () => Int, defaultValue: 0 }) cursor: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<CursorUserResponse> {
    const users = await this.userService.findWithCursor(cursor, limit);

    const nextCursor = users[users.length - 1].id;

    return {
      users: users,
      nextCursor: nextCursor,
    };
  }

  @Query(() => Int)
  async usersCount(): Promise<number> {
    return this.userService.count()
  }

  @Query(() => SearchResponse)
  async searchUsers(
    @Args('field', { type: () => String }) field: string,
    @Args('value', { type: () => String }) value: string,
  ): Promise<SearchResponse> {
    return this.userService.searchByField(field, value);
  }

  @UseGuards(AuthGuard)
  @Query(() => [UserWithTotalSpentResponse])
  async top3Users(): Promise<UserWithTotalSpentResponse[]> {
    return this.userService.findTop3TotalSpent();
  }

  @UseGuards(AuthGuard)
  @Query(() => [User])
  async usersByMostExpensiveProduct(): Promise<User[]> {
    return this.userService.findByMostExpensiveProduct();
  }

  @UseGuards(AuthGuard)
  @Query(() => [DailyUserRegistrationResponse])
  async dailyRegistrations(): Promise<DailyUserRegistrationResponse[]> {
    return this.userService.findDailyRegistrations();
  }
}
