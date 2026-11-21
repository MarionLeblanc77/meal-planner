import { ILike, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { PartialCategoryDto } from './dto/partial-category.dto.js';

@Injectable()
export class CategoriesService {
   constructor(
      @InjectRepository(Category)
      private readonly categoryRepository: Repository<Category>,
    ) {}
    
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.categoryRepository.save(createCategoryDto);
  }

  async findAll(): Promise<Category[]>  {
    return await this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }
  
  async search(searchCategoryDto: PartialCategoryDto): Promise<Category[]> {
    return await this.categoryRepository.findBy({ name: ILike(`%${searchCategoryDto.name}%`) });
  }

  async findOne(id: number): Promise<Category | null> {
    return await this.categoryRepository.findOneBy({ id });
  }

  async update(id: number, updateCategoryDto: PartialCategoryDto): Promise<void> {
    await this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
