'use server';

/**
 * @fileOverview A flow to generate a short description for a tool if the submitted URL lacks sufficient metadata.
 *
 * - generateShortDescription - A function that generates a short description for a tool.
 * - GenerateShortDescriptionInput - The input type for the generateShortDescription function.
 * - GenerateShortDescriptionOutput - The return type for the generateShortDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShortDescriptionInputSchema = z.object({
  url: z.string().url().describe('The URL of the tool to describe.'),
  websiteContent: z.string().describe('The content of the website at the URL.'),
});
export type GenerateShortDescriptionInput = z.infer<typeof GenerateShortDescriptionInputSchema>;

const GenerateShortDescriptionOutputSchema = z.object({
  shortDescription: z.string().describe('A concise description of the tool.'),
});
export type GenerateShortDescriptionOutput = z.infer<typeof GenerateShortDescriptionOutputSchema>;

export async function generateShortDescription(input: GenerateShortDescriptionInput): Promise<GenerateShortDescriptionOutput> {
  return generateShortDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShortDescriptionPrompt',
  input: {schema: GenerateShortDescriptionInputSchema},
  output: {schema: GenerateShortDescriptionOutputSchema},
  prompt: `You are an expert at creating short, concise descriptions of AI tools based on their website content.

Given the following website content, generate a short description of the tool. The description should be no more than 50 words.

URL: {{{url}}}
Website Content: {{{websiteContent}}}`,
});

export const generateShortDescriptionFlow = ai.defineFlow(
  {
    name: 'generateShortDescriptionFlow',
    inputSchema: GenerateShortDescriptionInputSchema,
    outputSchema: GenerateShortDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
