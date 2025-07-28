/**
 * @fileoverview A Genkit route handler for Next.js.
 */
import nextJsHandler from '@genkit-ai/next';

// Import the flows for their side effects, which registers them with Genkit.
import '@/ai/flows/generate-short-description';
import '@/ai/flows/generate-tool-metadata';

// The handler automatically discovers the imported flows.
const handler = nextJsHandler();

export const GET = handler;
export const POST = handler;
