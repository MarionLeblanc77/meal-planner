
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './recipe.entity.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async findAll(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

  async findOne(id: number): Promise<Recipe | null> {
    return this.recipeRepository.findOneBy({ id });
  }

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = new Recipe();
    recipe.name = createRecipeDto.name;
    recipe.basePortions = createRecipeDto.basePortion;
    
    return this.recipeRepository.save(recipe);
  }

  async remove(id: number): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}
