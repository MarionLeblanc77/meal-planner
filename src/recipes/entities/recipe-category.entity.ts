import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, type Relation, JoinColumn } from "typeorm"
import { Recipe } from "./recipe.entity.js"
import { Category } from "../../categories/entities/category.entity.js"

@Entity()
export class RecipeToCategory {
    @PrimaryGeneratedColumn()
    public recipeToCategoryId: number

    @Column()
    public recipeId: number

    @Column()
    public categoryId: number

    @ManyToOne(() => Recipe, (recipe : Recipe) => recipe.categories, 
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
    @JoinColumn([{ name: 'recipe_id', referencedColumnName: 'id' }])
    public recipe: Recipe[];

    @ManyToOne(() => Category, (category : Category) => category.recipes,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
    @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
    public category: Category[];
}