/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';
import { generateShortDescriptionFlow } from '@/ai/flows/generate-short-description';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';

export const { GET, POST } = nextJsHandler({
  flows: [generateShortDescriptionFlow, generateToolMetadataFlow],
});
