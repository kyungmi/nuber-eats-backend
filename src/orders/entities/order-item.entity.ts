import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishOption } from 'src/restaurants/entities/dish.entity';

import { Column, Entity, ManyToOne } from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Dish, { nullable: true })
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
