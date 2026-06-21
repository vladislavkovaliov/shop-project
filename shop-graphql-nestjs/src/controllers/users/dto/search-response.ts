import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@ObjectType()
export class SearchResponse {
    @Field(() => [User])
    items: User[]

    @Field(() => Int)
    total: number;
}