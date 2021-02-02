
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Resolver(of => Restaurant) // of => Restaurant는 생략 가능
export class RestaurantResolver {
    @Query(returns => [Restaurant])     // GraphQL에서의 array 표현 방식
    restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {  // GraphQL의 Args는 Typescript로 정의된 type을 따라감
        console.log(veganOnly);
        return [];
    }
    @Mutation(returns => Boolean)
    createRestaurant(
        @Args() createRestaurantDto: createRestaurantDto,
    ): boolean {
        return true;
    }
}
