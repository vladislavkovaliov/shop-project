import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@ObjectType()
export class PaginatedOrdersResponse {
  @Field(() => [Order])
  items: Order[];

  @Field(() => Int)
  total: number;
}
