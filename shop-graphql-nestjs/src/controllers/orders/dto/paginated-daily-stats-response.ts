import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DailyStatsResponse } from './daily-stats-response';

@ObjectType()
export class PaginatedDailyStatsResponse {
  @Field(() => [DailyStatsResponse])
  items: DailyStatsResponse[];

  @Field(() => Int)
  total: number;
}
