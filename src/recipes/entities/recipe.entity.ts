import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity.js';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255 })
  name: string;

  @Column("text", { nullable: true })
  instructions?: string;

  @Column("int", { nullable: true })
  basePortions?: number;

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.recipes)
  ingredients: Ingredient[];

  @Column("int")
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
