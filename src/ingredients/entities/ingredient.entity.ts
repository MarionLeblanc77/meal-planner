import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity.js';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  name: string;
  
  @Column("boolean")  
  onSeason: boolean;

  @ManyToMany(() => Recipe, (recipe) => recipe.ingredients)
  recipes: Recipe[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
