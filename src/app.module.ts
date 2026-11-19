import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { CategoriesModule } from './categories/categories.module.js';

@Module({
  imports: [
    RecipesModule,
    IngredientsModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.ENVIRONMENT === 'dev',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
