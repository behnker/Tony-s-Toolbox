/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import { createNextJsHandler } from '@genkit-ai/next';
import { generateShortDescriptionFlow } from '@/ai/flows/generate-short-description';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';

export default createNextJsHandler({
  flows: [generateShortDescriptionFlow, generateToolMetadataFlow],
});
