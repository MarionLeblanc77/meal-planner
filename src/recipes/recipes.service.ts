
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity.js';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';

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

  async findOne(id: number): Promise<Recipe | null> {
    return await this.recipeRepository.findOneBy({ id });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto): Promise<void> {
    await this.recipeRepository.update(id, updateRecipeDto);
  }

  async remove(id: number): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}
