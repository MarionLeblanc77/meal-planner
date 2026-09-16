import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import hbs from 'hbs';
import { AppModule } from './app.module.js';

import "reflect-metadata";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    routeConflictPolicy: { duplicate: 'warn', shadow: 'warn' },
    routeResolutionStrategy: 'specificity',
  });
  app.setLocal('layout', 'layouts/app');
  
  app.useStaticAssets(join(import.meta.dirname, '..', 'public'));
  app.setBaseViewsDir(join(import.meta.dirname, '..', 'views'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(import.meta.dirname, '..', 'views', 'partials'))
  hbs.registerHelper('eq', (a, b) => a === b);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
await bootstrap();
