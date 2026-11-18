import { IsString, IsOptional, Length, IsBoolean, IsArray } from 'class-validator';
import { Recipe } from '../../recipes/entities/recipe.entity.js';

export class CreateCategoryDto {
    @IsString()
    @Length(1, 255)
    name: string;
    
    @IsArray()
    @IsOptional()
    recipes: Recipe[];
}
