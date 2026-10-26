import { IsString, IsOptional, IsInt, Length, IsEnum, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

export enum Status {
  'To try' = 0,
  'To try again' = 1,
  'OK' = 2,
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
  @IsEnum(Status)
  status: Status;
  
  @IsArray()
  @IsOptional()
  ingredients: Ingredient[];
}