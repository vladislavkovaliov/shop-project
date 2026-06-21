import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyStatsResponse {
  @Field()
  date: Date;

  @Field(() => Int)
  orders: number;

  @Field()
  revenue: number;
}
