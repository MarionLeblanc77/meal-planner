import { IsString, IsOptional, Length, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { Recipe } from '../../recipes/entities/recipe.entity.js';

export class CreateIngredientDto {
    @IsString()
    @Length(1, 255)
    name: string;
    
    @IsOptional()
    @IsBoolean ()
    onSeason: boolean;

    @IsArray()
    @IsOptional()
    recipes: Recipe[];
}
