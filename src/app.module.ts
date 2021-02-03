import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';  // Apollo Server로 구현되어 있음
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.ENV}`,
      ignoreEnvFile: process.env.ENV === 'prod',
    }),
    GraphQLModule.forRoot({
      // Apollo Server 설정
      // Code first - *.graphql 파일을 만들지 않고, decorator와 Typescript class를 사용해서 GraphQL schema를 만든다.
      // autoSchemaFile을 메모리에 보관하고 싶다면 true로 한다.
      autoSchemaFile: true // join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      "type": "postgres",
      "host": process.env.DB_HOST,
      "port": +process.env.DB_PORT,
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "database": process.env.DB_DATABASE,
      "synchronize": true,
      "logging": true,
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
