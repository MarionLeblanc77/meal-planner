import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportUrlDto } from './dto/import-url.dto.js';
import { ImporterService, type ImportResult } from './importer.service.js';

/** Hard upload cap; per-model limits are checked later in LlmService. */
const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;

/** Minimal shape of a multer file (avoids depending on @types/multer). */
interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Returns drafts for review — nothing is saved here.
 * The frontend saves the reviewed draft via POST /recipes.
 */
@Controller('importer')
export class ImporterController {
  constructor(private readonly importer: ImporterService) {}

  @Post('url')
  async fromUrl(@Body() body: ImportUrlDto): Promise<ImportResult> {
    return this.importer.importFromUrl(body.url);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  async fromFile(@UploadedFile() file: UploadedFileLike | undefined): Promise<ImportResult> {
    if (!file) throw new BadRequestException('Send the recipe as multipart field "file"');
    return this.importer.importFromFile(file);
  }
}
