// 데이터베이스의 모델

import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Field((type) => String) // for graphql
  @Column() // for database
  @IsString() // for DTO's validation
  @MinLength(5) // for DTO's validation
  name: string;

  @Field((type) => Boolean, { nullable: true }) // defaultValue: true로 설정하면 dto에 누락된 내용을 채워서 graphql 요청, nullable: true인 경우 누락된 내용을 보내지 않음
  @Column({ default: true }) // DB의 DDL에 디폴트 값 설정
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String, { defaultValue: 'abcdefg' })
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
