import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType, // Restaurant는 ObjectType인데 반해, createRestaurantDto은 InputType이어야 하므로, 3번째 인자를 전달해야 한다.
) {}
