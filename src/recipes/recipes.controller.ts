import { Controller, Get, Post, Put, Delete, Body, HttpCode, Param, Query, Render, Redirect, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto, Status } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { RecipesService } from './recipes.service.js';
import { Recipe } from './entities/recipe.entity.js';

interface RecipeViewModel extends Recipe {
  textStatus: string;
}

//TODO: add exception handling and validation for the controller methods
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @Redirect('/recipes', 301)
  async create(@Body() createRecipeDto: CreateRecipeDto) : Promise<void>  {
    await this.recipesService.create(createRecipeDto);
    return;
  }

  @Get()
  @Render('recipes')
  async findAll() : Promise<{ recipesList: Recipe[] }> {
    return { recipesList: await this.recipesService.findAll() };
  }
  
  @Get(':id')
  @Render('recipe')
  async findOne(@Param('id') id: number) : Promise<{ recipe: RecipeViewModel }> {
    const recipe = await this.recipesService.findOne(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe #${id} not found`);
    }
    return {     
      recipe: {
      ...recipe,
      textStatus: recipe ? Status[recipe.status] : Status[0],
    }, };
  }

  // TODO: do the route for ingredient filter
  // @Get()
  // findAllWith(@Query('name') name: string, @Query('basePortions') basePortions: number) : string {
  //   return `This action will return all recipes filtered by name: ${name} and base portions: ${basePortions}`;
  // }

  @Get('/:id/edit')
  @Render('recipe-edit')
  async findOneToEdit(@Param('id') id: number) : Promise<{ recipe: Recipe | null }> {
    return { recipe : await this.recipesService.findOne(id) };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  @Redirect()
  async update(@Param('id') id: number, @Body() updateRecipeDto: UpdateRecipeDto) : Promise<{ statusCode: number; url: string; }> {
    await this.recipesService.update(id, updateRecipeDto);
    return { statusCode: 301, url: '/recipes/' + id };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  // @Post(':id/delete')
  // async remove(@Param('id') id: number) : Promise<void> {
  //   return this.recipesService.remove(id);
  // }
}
