import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ArgsType()
export class CategoryInput {
  @Field((type) => String)
  slug: string;
}

@ObjectType()
export class categoryOutput extends CoreOutput {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}
