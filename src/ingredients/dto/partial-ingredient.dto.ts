import { PartialType } from '@nestjs/mapped-types';
import { CreateIngredientDto } from './create-ingredient.dto.js';

export class PartialIngredientDto extends PartialType(CreateIngredientDto) {}
