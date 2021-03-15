import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishChoise } from 'src/restaurants/entities/dish.entity';

import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItemOption extends CoreEntity {
  @Field((type) => String)
  name: string;

  @Field((type) => DishChoise, { nullable: true })
  choise?: DishChoise;

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Dish, { nullable: true })
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
