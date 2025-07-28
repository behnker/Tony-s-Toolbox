/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';
import { generateShortDescriptionFlow } from '@/ai/flows/generate-short-description';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';

const handler = nextJsHandler(
  {}, // Pass an empty options object as the first argument
  generateShortDescriptionFlow,
  generateToolMetadataFlow
);

export const GET = handler;
export const POST = handler;
