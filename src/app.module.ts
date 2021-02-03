import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';  // Apollo Server로 구현되어 있음
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      // Apollo Server 설정
      // Code first - *.graphql 파일을 만들지 않고, decorator와 Typescript class를 사용해서 GraphQL schema를 만든다.
      // autoSchemaFile을 메모리에 보관하고 싶다면 true로 한다.
      autoSchemaFile: true // join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      "type": "postgres",
      "host": "localhost",
      "port": 5432,
      "username": "gunggyeongmi",
      "password": "12345",
      "database": "nuber-eats",
      "synchronize": true,
      "logging": true,
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
