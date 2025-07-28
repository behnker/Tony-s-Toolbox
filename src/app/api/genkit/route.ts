/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';
// The new API only supports one flow per route. The other flow can be
// exposed by creating a new file like `/api/genkit/short-description/route.ts`.
// import { generateShortDescriptionFlow } from '@/ai/flows/generate-short-description';

const handler = nextJsHandler(generateToolMetadataFlow);

export const GET = handler;
export const POST = handler;
