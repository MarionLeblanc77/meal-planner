import { Controller, Get, Post, Put, Delete, Body, HttpCode, Param, Query, Render } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { RecipesService } from './recipes.service.js';
import { Recipe } from './recipe.entity.js';

//TODO: add exception handling and validation for the controller methods

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @Render('recipes')
  async findAll() {
    const recipesList = await this.recipesService.findAll();
    return { recipesList };
  }
  
  @Get(':id')
  async findOne(@Param('id') id: number) : Promise<Recipe | null> {
    console.log('id', id);
    return this.recipesService.findOne(id);
  }

  @Get()
  findAllWith(@Query('name') name: string, @Query('basePortions') basePortions: number) : string {
    return `This action will return all recipes filtered by name: ${name} and base portions: ${basePortions}`;
  }

  @Post()
  @HttpCode(204)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    console.log('createRecipeDto', createRecipeDto);
    return this.recipesService.create(createRecipeDto);;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateRecipeDto: UpdateRecipeDto) {
    return `This action updates the #${id} recipe`;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) : Promise<void> {
    return this.recipesService.remove(id);
  }
}
