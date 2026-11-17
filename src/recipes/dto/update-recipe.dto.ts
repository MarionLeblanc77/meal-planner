import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto.js';

export class PartialRecipeDto extends PartialType(CreateRecipeDto) {}