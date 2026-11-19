import { Repository, ILike, In, Not } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { PartialIngredientDto } from './dto/partial-ingredient.dto.js';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient>{
    return await this.ingredientRepository.save(createIngredientDto);
  }

  async findAll(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find();
  }

  async search(searchIngredientDto: PartialIngredientDto): Promise<Ingredient[]> {
    return await this.ingredientRepository.findBy({ name: ILike(`%${searchIngredientDto.name}%`) });
  }

  async findTop10NotSelected(ingredients: Ingredient[]): Promise<Ingredient[]> {
    const ingredientIds = ingredients.map((ing) => ing.id);

    const query = this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoin('ingredient.recipes', 'recipe')
      .addSelect('COUNT(recipe.id)', 'recipeCount');

    if (ingredientIds.length > 0) {
      query.where('ingredient.id NOT IN (:...ingredientIds)');
    }

    query.groupBy('ingredient.id')
      .orderBy('recipeCount', 'DESC')
      .limit(10)
      .setParameters({ ingredientIds });
    
    return await query.getMany();
  }

  async findOne(id: number): Promise<Ingredient | null> {
    return await this.ingredientRepository.findOneBy({ id });
  }

  async update(id: number, updateIngredientDto: PartialIngredientDto): Promise<void> {
    await this.ingredientRepository.update(id, updateIngredientDto);
  }

  async remove(id: number): Promise<void> {
    await this.ingredientRepository.delete(id);
  }
}
