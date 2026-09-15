import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller.js';
import { RecipesService } from './recipes.service.js';
import { Recipe } from './recipe.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe])],
  providers: [RecipesService],
  controllers: [RecipesController],
})

export class RecipesModule {}