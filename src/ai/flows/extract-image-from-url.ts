'use server';

/**
 * @fileOverview Extracts an image URL from a given web page URL using AI.
 *
 * - extractImageFromUrl - A function that extracts an image URL from a web page.
 * - ExtractImageFromUrlInput - The input type for the extractImageFromUrl function.
 * - ExtractImageFromUrlOutput - The return type for the extractImageFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractImageFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to extract the image from.'),
});
export type ExtractImageFromUrlInput = z.infer<typeof ExtractImageFromUrlInputSchema>;

const ExtractImageFromUrlOutputSchema = z.object({
  imageUrl: z.string().url().optional().describe('The most prominent image URL found on the page, like from an og:image tag.'),
});
export type ExtractImageFromUrlOutput = z.infer<typeof ExtractImageFromUrlOutputSchema>;

export async function extractImageFromUrl(input: ExtractImageFromUrlInput): Promise<ExtractImageFromUrlOutput> {
  return extractImageFromUrlFlow(input);
}

const extractImagePrompt = ai.definePrompt({
  name: 'extractImagePrompt',
  input: {schema: ExtractImageFromUrlInputSchema},
  output: {schema: ExtractImageFromUrlOutputSchema},
  prompt: `You are an expert in extracting the main image from a web page.

  Given a URL, you will find the most representative image for the tool or article on that page.
  Prioritize finding an 'og:image' meta tag first. If not available, find the main banner or logo.

  URL: {{{url}}}

  Return only the absolute URL to the image.
  `,
});

const extractImageFromUrlFlow = ai.defineFlow(
  {
    name: 'extractImageFromUrlFlow',
    inputSchema: ExtractImageFromUrlInputSchema,
    outputSchema: ExtractImageFromUrlOutputSchema,
  },
  async input => {
    const {output} = await extractImagePrompt(input);
    return output!;
  }
);
