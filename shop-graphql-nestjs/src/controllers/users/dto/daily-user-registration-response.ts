import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DailyUserRegistrationResponse {
    @Field()
    createdAt: Date;

    @Field(() => Int)
    count: number;
}