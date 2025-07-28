/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';

// By importing the flow files, you register them with the Genkit registry.
import '@/ai/flows/generate-short-description';
import '@/ai/flows/generate-tool-metadata';

// The handler will automatically discover and serve the flows from the registry.
const handler = nextJsHandler();

export const GET = handler;
export const POST = handler;
