import { Controller, Get, Post, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto.js';
import { PartialRecipeDto } from './dto/partial-recipe.dto.js';
import { Recipe } from './entities/recipe.entity.js';
import { RecipesService } from './recipes.service.js';
import { SearchRecipeDto } from './dto/search-recipe.dto.js';

//TODO: add exception handling and validation for the controller methods
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto) : Promise<void>  {
    await this.recipesService.create(createRecipeDto);
    return;
  }

  @Get()
  async findAll() : Promise<Recipe[]> {
    return await this.recipesService.findAll();
  }
  
  @Post('search')
  async search(@Body() searchRecipeDto: SearchRecipeDto) : Promise<Recipe[]>  {
    return this.recipesService.search(searchRecipeDto);
  }
  
  @Get(':id')
  async findOne(@Param('id') id: number) : Promise<Recipe> {
    const recipe = await this.recipesService.findOne(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe #${id} not found`);
    } else { 
      return recipe 
    };
  }

  @Get('/:id/edit')
  async findOneToEdit(@Param('id') id: number) : Promise<{ recipe: Recipe | null }> {
    return { recipe : await this.recipesService.findOne(id) };
  }

  // TODO : see if it is interesting to use @Put instead of @Post if frontend updates to smt that can differentiate
  @Post(':id/edit')
  async update(@Param('id') id: number, @Body() updateRecipeDto: PartialRecipeDto) : Promise<void> {
    await this.recipesService.update(id, updateRecipeDto);
    return;
  }

  @Delete(':id/delete')
  async remove(@Param('id') id: number) : Promise<void> {
    return this.recipesService.remove(id);
  }
}
