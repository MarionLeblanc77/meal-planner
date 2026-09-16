import { Status } from "../dto/create-recipe.dto.js";

export interface Recipe {
  name: string;
  instructions?: string;
  basePortions?: number;
  status: Status;
}
