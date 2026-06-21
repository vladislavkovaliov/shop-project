import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StatsOrderResponse {
  @Field(() => Int)
  total: number;

  @Field()
  totalThisMonth: number;

  @Field()
  averageCheck: number;
}
