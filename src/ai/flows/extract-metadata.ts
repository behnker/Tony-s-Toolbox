'use server';

/**
 * @fileOverview Extracts metadata from a given URL using AI.
 *
 * - extractMetadataFromUrl - A function that extracts metadata from a URL.
 * - ExtractMetadataFromUrlInput - The input type for the extractMetadataFromUrl function.
 * - ExtractMetadataFromUrlOutput - The return type for the extractMetadataFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMetadataFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to extract metadata from.'),
});
export type ExtractMetadataFromUrlInput = z.infer<typeof ExtractMetadataFromUrlInputSchema>;

const ExtractMetadataFromUrlOutputSchema = z.object({
  title: z.string().describe('The title of the web page.'),
  description: z.string().describe('A short description of the web page.'),
  categories: z.array(z.string()).describe('Categories the tool belongs to.'),
});
export type ExtractMetadataFromUrlOutput = z.infer<typeof ExtractMetadataFromUrlOutputSchema>;

export async function extractMetadataFromUrl(input: ExtractMetadataFromUrlInput): Promise<ExtractMetadataFromUrlOutput> {
  return extractMetadataFromUrlFlow(input);
}

const extractMetadataPrompt = ai.definePrompt({
  name: 'extractMetadataPrompt',
  input: {schema: ExtractMetadataFromUrlInputSchema},
  output: {schema: ExtractMetadataFromUrlOutputSchema},
  prompt: `You are an expert in extracting metadata from web pages.

  Given a URL, you will extract the title, description, and categories that the tool belongs to.

  URL: {{{url}}}
  Categories should be related to AI tools, such as "image generation", "text summarization", "SEO", etc.
  Return an array of strings, and write a short description for the tool.
  `,
});

const extractMetadataFromUrlFlow = ai.defineFlow(
  {
    name: 'extractMetadataFromUrlFlow',
    inputSchema: ExtractMetadataFromUrlInputSchema,
    outputSchema: ExtractMetadataFromUrlOutputSchema,
  },
  async input => {
    const {output} = await extractMetadataPrompt(input);
    return output!;
  }
);
