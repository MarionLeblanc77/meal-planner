import { Controller, Get, Post, Body, Patch, Param, Delete, Render, Redirect } from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { CreateIngredientDto } from './dto/create-ingredient.dto.js';
import { UpdateIngredientDto } from './dto/update-ingredient.dto.js';
import { Ingredient } from './entities/ingredient.entity.js';

//TODO: add exception handling and validation for the controller methods
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Redirect('/ingredients', 301)
  async create(@Body() createIngredientDto: CreateIngredientDto) : Promise<void> {
    await this.ingredientsService.create(createIngredientDto);
    return;
  }

  @Get()
  @Render('ingredients')
  async findAll() : Promise<{ ingredientsList: Ingredient[] }>  {
    return { ingredientsList: await this.ingredientsService.findAll() };
  }

  @Get(':id')
  @Render('ingredient')
  async findOne(@Param('id') id: number) : Promise<{ ingredient: Ingredient | null }> {
    return { ingredient: await this.ingredientsService.findOne(id) };
  }
  
  @Get('/:id/edit')
  @Render('ingredient-edit')
  async findOneToEdit(@Param('id') id: number): Promise<{ ingredient: Ingredient | null }> {
    return { ingredient : await this.ingredientsService.findOne(id) };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  @Redirect()
  async update(@Param('id') id: number, @Body() updateIngredientDto: UpdateIngredientDto) : Promise<{ statusCode: number; url: string; }> {
    this.ingredientsService.update(id, updateIngredientDto);
    return { statusCode: 301, url: '/ingredients/' + id };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  // @Post(':id/delete')
  // remove(@Param('id') id: string) : Promise<void>  {
  //   return this.ingredientsService.remove(id);
  // }
}
