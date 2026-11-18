import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRecipeDto  {
    @IsOptional()
    @IsString()
    @Length(0, 255)
    name: string;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    ingredientIds?: number[];

    @IsOptional()
    @IsBoolean()
    hasAllIngredients?: boolean = false;
}