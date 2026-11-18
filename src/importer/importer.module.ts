import { Module } from '@nestjs/common';
import { IngredientsModule } from '../ingredients/ingredients.module.js';
import { ImageHandler } from './handlers/image.handler.js';
import { PdfHandler } from './handlers/pdf.handler.js';
import { WebsiteHandler } from './handlers/website.handler.js';
import { ImporterController } from './importer.controller.js';
import { ImporterService } from './importer.service.js';
import { LlmService } from './llm/llm.service.js';
import { TranslationService } from './translation.service.js';

@Module({
  imports: [IngredientsModule],
  controllers: [ImporterController],
  providers: [
    ImporterService,
    LlmService,
    TranslationService,
    WebsiteHandler,
    ImageHandler,
    PdfHandler,
  ],
  exports: [ImporterService],
})
export class ImporterModule {}
