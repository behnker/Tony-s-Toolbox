/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';
// We are temporarily disabling this flow as the new API only supports one per route.
// import { generateShortDescriptionFlow } from '@/ai/flows/generate-short-description';

const handler = nextJsHandler(generateToolMetadataFlow);

export const GET = handler;
export const POST = handler;
