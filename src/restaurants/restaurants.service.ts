import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, categoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    const newRestaurant = this.restaurants.create(createRestaurantInput);
    newRestaurant.owner = owner;
    newRestaurant.category = await this.categories.getOrCreate(
      createRestaurantInput.categoryName,
    );
    try {
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        { loadRelationIds: true },
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      const editRestaurant: Partial<Restaurant> = {
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
      };

      if (editRestaurantInput.categoryName) {
        editRestaurant.category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save(editRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit restaurant' };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete restaurant' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<categoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        order: { isPromoted: 'DESC' },
        take: 25,
        skip: (page - 1) * 25,
      });
      const totalResults = await this.countRestaurant(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Restaurant',
      };
    }
  }

  async searchRestaurantByName({
    page,
    query,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) },
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not search restaurants',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
        {
          loadRelationIds: true,
        },
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't create a dish",
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't edit a dish",
        };
      }
      await this.dishes.save({
        id: editDishInput.dishId,
        ...editDishInput,
      });
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't delete a dish",
        };
      }
      await this.dishes.delete(dishId);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }
}
