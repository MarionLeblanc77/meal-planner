import { IsString, IsOptional, IsInt, Length, IsEnum, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

export enum RecipeStatus {
  'Totry' = 0,
  'ToTryAgain' = 1,
  'Ok' = 2,
}

export class CreateRecipeDto {
  @IsString()
  @Length(1, 255)
  name: string;
  
  @IsOptional()
  @IsString()
  instructions?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  basePortions?: number;

  @Type(() => Number)
  @IsEnum(RecipeStatus)
  status: RecipeStatus;
  
  @IsArray()
  @IsOptional()
  ingredients: Ingredient[];
}