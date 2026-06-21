import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@ObjectType()
export class CursorUserResponse {
    @Field(() => [User])
    users: User[]

    @Field(() => Int)
    nextCursor: number
}