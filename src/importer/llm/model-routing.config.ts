/**
 * Which OpenRouter model handles which importer task.
 * Every entry can be overridden from the environment without a code change,
 * e.g. IMPORTER_MODEL_IMAGE=google/gemini-3.6-flash
 *
 * Defaults are starting points only — the eval script
 * (npm run importer:eval) is how we decide which model is best per task.
 */
export type ImporterTask =
  | 'website-enrich' // JSON-LD found: flag oven temp / waits, summarise, compact tips
  | 'website-fallback' // no JSON-LD: extract from page text
  | 'image'
  | 'pdf'
  | 'translate'; // recipe text → target language (default English)

export interface ModelRoute {
  model: string;
  /** Largest file the model's provider accepts per image/file. Checked before upload. */
  maxFileBytes: number;
}

const MB = 1024 * 1024;

const DEFAULT_ROUTES: Record<ImporterTask, ModelRoute> = {
  'website-enrich': { model: 'anthropic/claude-haiku-5.5', maxFileBytes: 5 * MB },
  'website-fallback': { model: 'anthropic/claude-haiku-5.5', maxFileBytes: 5 * MB },
  image: { model: 'anthropic/claude-sonnet-5.5', maxFileBytes: 5 * MB },
  pdf: { model: 'anthropic/claude-sonnet-5.5', maxFileBytes: 32 * MB },
  translate: { model: 'anthropic/claude-haiku-5.5', maxFileBytes: 5 * MB },
};

const ENV_SUFFIX: Record<ImporterTask, string> = {
  'website-enrich': 'WEBSITE_ENRICH',
  'website-fallback': 'WEBSITE_FALLBACK',
  image: 'IMAGE',
  pdf: 'PDF',
  translate: 'TRANSLATE',
};

export function resolveRoute(
  task: ImporterTask,
  env: Record<string, string | undefined> = process.env,
): ModelRoute {
  const suffix = ENV_SUFFIX[task];
  const fallback = DEFAULT_ROUTES[task];
  const maxBytes = Number(env[`IMPORTER_MAX_BYTES_${suffix}`]);
  return {
    model: env[`IMPORTER_MODEL_${suffix}`] || fallback.model,
    maxFileBytes: maxBytes > 0 ? maxBytes : fallback.maxFileBytes,
  };
}
