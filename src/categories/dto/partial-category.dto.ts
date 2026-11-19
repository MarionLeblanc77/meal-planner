import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto.js';

export class PartialCategoryDto extends PartialType(CreateCategoryDto) {}
