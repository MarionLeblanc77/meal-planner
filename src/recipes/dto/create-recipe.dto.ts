import { IsString, IsOptional, IsInt, Length, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TrialStatus } from '../entities/recipe.entity.js';

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
  @IsEnum(TrialStatus)
  status: TrialStatus;
}