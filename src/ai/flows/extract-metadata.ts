'use server';

/**
 * @fileOverview Extracts metadata from a given URL using AI, with a fallback mechanism.
 *
 * - extractMetadata - A function that extracts metadata from a URL.
 * - ExtractMetadataInput - The input type for the extractMetadata function.
 * - ExtractMetadataOutput - The return type for the extractMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL to extract metadata from.'),
});
export type ExtractMetadataInput = z.infer<typeof ExtractMetadataInputSchema>;

const ExtractMetadataOutputSchema = z.object({
  title: z.string().optional().describe('The title of the web page.'),
  description: z.string().optional().describe('A short description of the web page.'),
  categories: z.array(z.string()).optional().describe('An array of relevant categories for the tool.'),
  imageUrl: z.string().url().optional().describe('The most prominent image URL found on the page.'),
});
export type ExtractMetadataOutput = z.infer<typeof ExtractMetadataOutputSchema>;

export async function extractMetadata(input: ExtractMetadataInput): Promise<ExtractMetadataOutput> {
  return extractMetadataFlow(input);
}

const knowledgePrompt = ai.definePrompt({
    name: 'knowledgePrompt',
    input: {schema: ExtractMetadataInputSchema},
    output: {schema: ExtractMetadataOutputSchema},
    prompt: `You are an expert in extracting metadata from web pages for an AI tool directory.

    Given a URL, you will extract the following information based ONLY on your existing knowledge about the tool at that URL. Do not access the URL.
    - The title of the tool or web page.
    - A short, clear description of the tool.
    - An array of categories that the tool belongs to (e.g., "image-generation", "video-generation", "developer-tools", "productivity", "copywriting", "llm").
    - A direct URL to an image representing the tool (logo, banner, etc).
  
    URL: {{{url}}}
    `,
});

const scrapePrompt = ai.definePrompt({
    name: 'scrapePrompt',
    input: {schema: ExtractMetadataInputSchema},
    output: {schema: ExtractMetadataOutputSchema},
    prompt: `You are an expert in extracting metadata from web pages for an AI tool directory.

    Given a URL, you will access the page and extract the following information:
    - The title of the tool or web page.
    - A short, clear description of the tool.
    - An array of categories that the tool belongs to (e.g., "image-generation", "video-generation", "developer-tools", "productivity", "copywriting", "llm").
    - The most representative image for the tool or article on that page. Prioritize finding an 'og:image' meta tag first. If not available, find the main banner or logo and return its absolute URL.

    URL: {{{url}}}
    `,
});

const extractMetadataFlow = ai.defineFlow(
  {
    name: 'extractMetadataFlow',
    inputSchema: ExtractMetadataInputSchema,
    outputSchema: ExtractMetadataOutputSchema,
  },
  async input => {
    try {
        const { output: knowledgeOutput } = await knowledgePrompt(input);
        if (knowledgeOutput && knowledgeOutput.title && knowledgeOutput.description) {
            return knowledgeOutput;
        }
    } catch (e) {
        console.log("Knowledge-based extraction failed, proceeding to scrape.", e)
    }

    const { output: scrapeOutput } = await scrapePrompt(input);
    return scrapeOutput!;
  }
);
