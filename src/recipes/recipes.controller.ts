import { Controller, Get, Post, Put, Delete, Body, HttpCode, Param, Query, Render, Redirect } from '@nestjs/common';
import { CreateRecipeDto, Status } from './dto/create-recipe.dto.js';
import { UpdateRecipeDto } from './dto/update-recipe.dto.js';
import { RecipesService } from './recipes.service.js';

//TODO: add exception handling and validation for the controller methods

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @Render('recipes')
  async findAll() {
    return { recipesList: await this.recipesService.findAll() };
  }
  
  @Get(':id')
  @Render('recipe')
  async findOne(@Param('id') id: number) {
    const recipe = await this.recipesService.findOne(id);
    return {     
      recipe: {
      ...recipe,
      textStatus: recipe ? Status[recipe.status] : Status[0],
    }, };
  }

  // @Get()
  // findAllWith(@Query('name') name: string, @Query('basePortions') basePortions: number) : string {
  //   return `This action will return all recipes filtered by name: ${name} and base portions: ${basePortions}`;
  // }

  @Post()
  @Redirect('/recipes', 301)
  async create(@Body() createRecipeDto: CreateRecipeDto) {
    await this.recipesService.create(createRecipeDto);
    return;
  }

  @Get('/:id/edit')
  @Render('recipe-edit')
  async findOneToEdit(@Param('id') id: number) {
    return { recipe : await this.recipesService.findOne(id) };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  @Redirect()
  async update(@Param('id') id: number, @Body() updateRecipeDto: UpdateRecipeDto) {
    await this.recipesService.update(id, updateRecipeDto);
    return { statusCode: 301, url: '/recipes/' + id };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  // @Post(':id/delete')
  // async remove(@Param('id') id: number) : Promise<void> {
  //   return this.recipesService.remove(id);
  // }
}
