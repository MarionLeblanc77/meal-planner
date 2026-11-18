import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { PartialCategoryDto } from './dto/partial-category.dto.js';
import { Category } from './entities/category.entity.js';

//TODO: add exception handling and validation for the controller methods
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) : Promise< Category>  {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() : Promise< Category[]>  {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) : Promise< Category>  {
    const category = await this.categoriesService.findOne(+id);
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  async update(@Param('id') id: number, @Body() updateCategoryDto: PartialCategoryDto): Promise<{ statusCode: number; url: string; }> {
    this.categoriesService.update(id, updateCategoryDto);
    return { statusCode: 301, url: '/categories/' + id }; 
  }

  @Delete(':id/delete')
  async remove(@Param('id') id: number) : Promise<void> {
    return this.categoriesService.remove(id);
  }
}
