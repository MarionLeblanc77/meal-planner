import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity.js';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Recipe, (recipe) => recipe.categories)
  recipes: Recipe[];
}
