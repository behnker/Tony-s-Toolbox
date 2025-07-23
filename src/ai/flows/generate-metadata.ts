'use server';

/**
 * @fileOverview Generates metadata for a tool based on its URL and a user's justification.
 *
 * - generateMetadata - A function that generates metadata for a tool.
 * - GenerateMetadataInput - The input type for the generateMetadata function.
 * - GenerateMetadataOutput - The return type for the generateMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL of the tool.'),
  justification: z.string().describe("The user's reason for recommending the tool."),
});
export type GenerateMetadataInput = z.infer<typeof GenerateMetadataInputSchema>;

const GenerateMetadataOutputSchema = z.object({
    title: z.string().describe('The name of the tool.'),
    description: z.string().describe('A short, clear description of the tool.'),
    categories: z.array(z.string()).describe('An array of relevant categories for the tool (e.g., "image-generation", "developer-tools", "copywriting", "diagramming", "whiteboard").'),
});
export type GenerateMetadataOutput = z.infer<typeof GenerateMetadataOutputSchema>;


export async function generateMetadata(input: GenerateMetadataInput): Promise<GenerateMetadataOutput> {
  return generateMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetadataPrompt',
  input: {schema: GenerateMetadataInputSchema},
  output: {schema: GenerateMetadataOutputSchema},
  prompt: `You are an expert at describing AI tools for a directory. Based on the provided URL and the user's justification, please generate the following information:

- A concise and accurate title for the tool.
- A clear, one or two-sentence description of what the tool does.
- An array of relevant categories (e.g., "image-generation", "developer-tools", "copywriting", "diagramming", "whiteboard").

Base your response ONLY on your existing knowledge of the tool at the given URL and the user's justification. Do not attempt to access the URL.

URL: {{{url}}}
User's Justification: "{{{justification}}}"
`,
});

const generateMetadataFlow = ai.defineFlow(
  {
    name: 'generateMetadataFlow',
    inputSchema: GenerateMetadataInputSchema,
    outputSchema: GenerateMetadataOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
