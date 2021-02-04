// 데이터베이스의 모델

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  @MinLength(5)
  name: string;

  @Field((type) => Boolean)
  @Column()
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field((type) => String)
  @Column()
  @IsString()
  categoryName: string;
}
