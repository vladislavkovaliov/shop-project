import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GrowthResponse } from '../../users/dto/growth-response';

@ObjectType()
export class OrdersTrendResponse {
  @Field(() => Int)
  currentPeriod: number;

  @Field(() => Int)
  previousPeriod: number;

  @Field(() => GrowthResponse)
  growth: GrowthResponse;
}
