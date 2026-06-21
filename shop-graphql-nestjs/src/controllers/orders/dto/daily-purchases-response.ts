import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyPurchasesResponse {
  @Field()
  orderDate: Date;

  @Field(() => Int)
  purchases: number;
}
