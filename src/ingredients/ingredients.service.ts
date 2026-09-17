import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { UpdateIngredientDto } from './dto/update-ingredient.dto.js';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<void>{
    await this.ingredientRepository.save(createIngredientDto);
  }

  async findAll(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find();
  }

  async findOne(id: number): Promise<Ingredient | null> {
    return await this.ingredientRepository.findOneBy({ id });
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto): Promise<void> {
    await this.ingredientRepository.update(id, updateIngredientDto);
  }

  async remove(id: number): Promise<void> {
    await this.ingredientRepository.delete(id);
  }
}
