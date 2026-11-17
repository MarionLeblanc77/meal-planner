import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { PartialIngredientDto } from './dto/partial-ingredient.dto.js';
import { Ingredient } from './entities/ingredient.entity.js';

//TODO: add exception handling and validation for the controller methods
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  async create(@Body() createIngredientDto: CreateIngredientDto) : Promise< Ingredient> {
    return await this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  async findAll() : Promise<Ingredient[]>  {
    return await this.ingredientsService.findAll();
  }

  @Post('search')
  async search(@Body() searchIngredientDto: PartialIngredientDto) : Promise<Ingredient[]>  {
    return this.ingredientsService.search(searchIngredientDto);
  }
  
  @Get(':id')
  // @Render('ingredient')
  async findOne(@Param('id') id: number) : Promise<Ingredient> {
    const ingredient = await this.ingredientsService.findOne(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient #${id} not found`);
    }
    return ingredient;
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  // @Redirect()
  async update(@Param('id') id: number, @Body() updateIngredientDto: PartialIngredientDto) : Promise<{ statusCode: number; url: string; }> {
    this.ingredientsService.update(id, updateIngredientDto);
    return { statusCode: 301, url: '/ingredients/' + id };
  }

  @Delete(':id/delete')
  async remove(@Param('id') id: number) : Promise<void>  {
    return this.ingredientsService.remove(id);
  }
}
