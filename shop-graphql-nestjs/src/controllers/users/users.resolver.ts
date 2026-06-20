import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { PaginatedUsersResponse } from './dto/paginated-users-response';
import { AuthGuard } from '../../guards/auth.guard'
import { UseGuards } from '@nestjs/common';

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
}
