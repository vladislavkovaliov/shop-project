import { Field, Int, ObjectType } from "@nestjs/graphql";
import { GrowthResponse } from "./growth-response";

@ObjectType()
export class UserRegistrationTrendRespose {
    @Field(() => Int)
    currentPeriod: number;

    @Field(() => Int)
    previousPeriod: number;

    @Field(() => GrowthResponse)
    growth: GrowthResponse;
}