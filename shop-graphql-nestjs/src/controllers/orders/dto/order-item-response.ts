import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderItemResponse {
  @Field(() => Int)
  productId: number;

  @Field()
  title: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  price: number;
}
