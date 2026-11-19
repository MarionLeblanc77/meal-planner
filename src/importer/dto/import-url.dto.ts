import { IsUrl } from 'class-validator';

export class ImportUrlDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;
}
