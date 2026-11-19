
import { ILike, Repository } from 'typeorm';
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
    const query = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredient')
      .leftJoinAndSelect('recipe.categories', 'category');

    const name = searchRecipeDto.name;
    if (name && name.trim() !== '') {
      query.where({ name: ILike(`%${name}%`) });
    }

    const ingredientIds = [...new Set(searchRecipeDto.ingredientIds ?? [])];
    const hasAllIngredients = searchRecipeDto.hasAllIngredients;
    if (ingredientIds.length > 0) {
      if (hasAllIngredients) {
        query.andWhere('recipe.id IN (:...ingredientIds)', { ingredientIds });
      } else {
        query.andWhere((qb) => {
          const matchingRecipes = qb
            .subQuery()
            .select('matchedRecipe.id')
            .from(Recipe, 'matchedRecipe')
            .innerJoin('matchedRecipe.ingredients', 'matchedIngredient')
            .where('matchedIngredient.id IN (:...ingredientIds)')
            .groupBy('matchedRecipe.id')
            .having('COUNT(DISTINCT matchedIngredient.id) = :ingredientCount')
            .getQuery();

          return `recipe.id IN ${matchingRecipes}`;
        })
        .setParameters({
          ingredientIds,
          ingredientCount: ingredientIds.length,
        })
      }
    }

    const categoryIds = [...new Set(searchRecipeDto.categoryIds ?? [])];
    const hasAllCategories = searchRecipeDto.hasAllCategories;
    if (categoryIds.length > 0) {
      if (hasAllCategories) {
        query.andWhere('recipe.id IN (:...categoryIds)', { categoryIds });
      } else {
        query.andWhere((qb) => {
          const matchingRecipes = qb
            .subQuery()
            .select('matchedRecipe.id')
            .from(Recipe, 'matchedRecipe')
            .innerJoin('matchedRecipe.categories', 'matchedCategory')
            .where('matchedCategory.id IN (:...categoryIds)')
            .groupBy('matchedRecipe.id')
            .having('COUNT(DISTINCT matchedCategory.id) = :categoryCount')
            .getQuery();

          return `recipe.id IN ${matchingRecipes}`;
        })
        .setParameters({
          categoryIds,
          categoryCount: categoryIds.length,
        })
      }
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Recipe | null> {
    return await this.recipeRepository.findOne({
      where: { id },
      relations: { ingredients: true, categories: true },
    });
  }

  async update(id: number, updateRecipeDto: PartialRecipeDto): Promise<void> {
    await this.recipeRepository.save({ id, ...updateRecipeDto });
  }

  async remove(id: number): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}
