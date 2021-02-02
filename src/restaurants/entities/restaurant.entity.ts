// 데이터베이스의 모델

import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";

@ObjectType()
export class Restaurant {
    @Field(type => String)
    name: string;

    @Field(type => Boolean)
    isVegan: boolean;

    @Field(type => String)
    address: string;

    @Field(type => String)
    ownerName: string;
}
