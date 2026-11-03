import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, type Relation, JoinColumn } from "typeorm"
import { Recipe } from "./recipe.entity.js"
import { Ingredient } from "../../ingredients/entities/ingredient.entity.js"

@Entity()
export class RecipeToIngredient {
    @PrimaryGeneratedColumn()
    public recipeToIngredientId: number

    @Column()
    public recipeId: number

    @Column()
    public ingredientId: number

    @ManyToOne(() => Recipe, (recipe : Recipe) => recipe.ingredients, 
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
    @JoinColumn([{ name: 'recipe_id', referencedColumnName: 'id' }])
    public recipe: Recipe[];

    @ManyToOne(() => Ingredient, (ingredient : Ingredient) => ingredient.recipes,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
    @JoinColumn([{ name: 'ingredient_id', referencedColumnName: 'id' }])
    public ingredient: Ingredient[];
}