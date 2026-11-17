
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { PartialRecipeDto } from './dto/partial-recipe.dto.js';
import { SearchRecipeDto } from './dto/search-recipe.dto.js';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<void> {
    await this.recipeRepository.save(createRecipeDto);
  }

  async findAll(): Promise<Recipe[]> {
    return await this.recipeRepository.find();
  }
  
  async search(searchRecipeDto: SearchRecipeDto): Promise<Recipe[]> {
    const where: FindOptionsWhere<Recipe> = {};
    const name = searchRecipeDto.name;

    if (name && name.trim() !== '') {
      where.name = ILike(`%${name}%`);
    }

    if (searchRecipeDto.ingredientIds?.length) {
      where.ingredients = { id: In(searchRecipeDto.ingredientIds) };
    }

    return await this.recipeRepository.findBy(where);
  }

  async findOne(id: number): Promise<Recipe | null> {
    return await this.recipeRepository.findOne({
      where: { id },
      relations: { ingredients: true },
    });
  }

  async update(id: number, updateRecipeDto: PartialRecipeDto): Promise<void> {
    await this.recipeRepository.save({ id, ...updateRecipeDto });
  }

  async remove(id: number): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}
