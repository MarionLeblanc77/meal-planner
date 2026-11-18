import type { SourceType } from '../types/imported-recipe.js';
import type { ImportInput } from '../handlers/source-handler.js';

export type DetectedSource =
  | { type: SourceType; mimeType?: string }
  | { type: 'unsupported'; reason: string };

/**
 * Decides which handler gets the input. For files we trust the bytes, not the
 * client-supplied mime type or extension.
 */
export function detectSource(input: ImportInput): DetectedSource {
  if (input.kind === 'url') return { type: 'website' };

  const sniffed = sniffMimeType(input.data);
  if (sniffed === 'application/pdf') return { type: 'pdf', mimeType: sniffed };
  if (sniffed === 'image/heic') {
    return {
      type: 'unsupported',
      reason: 'HEIC photos are not supported by most models — export the photo as JPEG and retry.',
    };
  }
  if (sniffed) return { type: 'image', mimeType: sniffed };
  return {
    type: 'unsupported',
    reason: `Unsupported file "${input.filename}" — upload a JPEG, PNG, WebP, GIF or PDF.`,
  };
}

export function sniffMimeType(data: Buffer): string | undefined {
  const hex = data.subarray(0, 12).toString('hex');
  const ascii = data.subarray(0, 12).toString('latin1');
  if (ascii.startsWith('%PDF-')) return 'application/pdf';
  if (hex.startsWith('ffd8ff')) return 'image/jpeg';
  if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) return 'image/gif';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (ascii.slice(4, 8) === 'ftyp' && /heic|heix|mif1|msf1/.test(ascii.slice(8, 12))) {
    return 'image/heic';
  }
  return undefined;
}
