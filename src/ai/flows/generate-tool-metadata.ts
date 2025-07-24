
'use server';
/**
 * @fileOverview A flow to generate metadata for a tool by fetching and analyzing its website content.
 *
 * - generateToolMetadata - A function that generates metadata for a tool.
 * - GenerateToolMetadataInput - The input type for the generateToolMetadata function.
 * - GenerateToolMetadataOutput - The return type for the generateToolMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getWebsiteContent, WebsiteContentSchema} from '@/lib/tools';
import { googleAI } from '@genkit-ai/googleai';

const GenerateToolMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL of the tool to describe.'),
  justification: z.string().describe("The user's reason for recommending the tool."),
});
export type GenerateToolMetadataInput = z.infer<typeof GenerateToolMetadataInputSchema>;

const GenerateToolMetadataOutputSchema = z.object({
  title: z.string().describe('The name of the tool.'),
  description: z.string().describe('A short, clear description of the tool.'),
  categories: z.array(z.string()).describe('An array of relevant categories for the tool (e.g., "image-generation", "developer-tools", "copywriting", "diagramming", "whiteboard").'),
  imageUrl: z.string().url().optional().describe('The URL of a relevant image (logo, banner, screenshot) for the tool.'),
});
export type GenerateToolMetadataOutput = z.infer<typeof GenerateToolMetadataOutputSchema>;


export async function generateToolMetadata(input: GenerateToolMetadataInput): Promise<GenerateToolMetadataOutput> {
  return generateToolMetadataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateToolMetadataPrompt',
  input: {
    schema: z.object({
      url: z.string().url(),
      justification: z.string(),
      websiteContent: WebsiteContentSchema.shape.output,
    }),
  },
  output: {schema: GenerateToolMetadataOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert at describing AI tools for a directory.

Your task is to generate the following information for the tool at the given URL, using the provided website content:
- A concise and accurate title for the tool. Use the title from the website content.
- A clear, one or two-sentence description of what the tool does. Use the description from the website content.
- An array of up to 3 relevant categories (e.g., "image-generation", "developer-tools", "copywriting", "diagramming", "whiteboard").
- The URL for a relevant image, like a logo, banner, or screenshot. Use the imageUrl from the website content.

If the provided website content is sparse or indicates an error, base your response on your existing knowledge of the tool at the given URL and the user's justification.

URL: {{{url}}}
User's Justification: "{{{justification}}}"
Website Content:
Title: {{{websiteContent.title}}}
Description: {{{websiteContent.description}}}
Image URL: {{{websiteContent.imageUrl}}}
`,
});

const generateToolMetadataFlow = ai.defineFlow(
  {
    name: 'generateToolMetadataFlow',
    inputSchema: GenerateToolMetadataInputSchema,
    outputSchema: GenerateToolMetadataOutputSchema,
  },
  async input => {
    // We call the tool directly here instead of letting the LLM do it.
    // This is more efficient as we always need this information.
    const websiteContent = await getWebsiteContent(input);
    
    const {output} = await prompt({
      ...input,
      websiteContent,
    });
    return output!;
  }
);
