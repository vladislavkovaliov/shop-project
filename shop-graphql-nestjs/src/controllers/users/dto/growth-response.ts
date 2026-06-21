import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GrowthResponse {
    @Field()
    value: number;

    @Field()
    sign: number;
}