
'use server';
/**
 * @fileOverview A flow to generate metadata for a tool by fetching and analyzing its website content.
 *
 * - generateToolMetadata - A function that generates metadata for a tool.
 * - GenerateToolMetadataInput - The input type for the generateToolMetadata function.
 * - GenerateToolMetadataOutput - The return type for the generateToolMetadata function.
 */
import {config} from 'dotenv';
config();

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getWebsiteContent} from '@/lib/tools';
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
      websiteContent: z.object({
        htmlContent: z.string().optional(),
        error: z.string().optional(),
      }),
    }),
  },
  output: {
    format: 'json',
    schema: GenerateToolMetadataOutputSchema,
  },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert at extracting structured information from website HTML.

Your task is to generate a JSON object with the following fields for the tool at the given URL, using the provided HTML content.

- title: A concise and accurate title for the tool. Find it in the <title> tag.
- description: A clear, one or two-sentence description of what the tool does. Find it in the <meta name="description"> or <meta property="og:description"> tag.
- categories: An array of up to 3 relevant categories (e.g., "image-generation", "developer-tools", "copywriting").

If the provided website content is sparse or indicates an error, base your response on your existing knowledge of the tool at the given URL and the user's justification.

URL: {{{url}}}
User's Justification: "{{{justification}}}"
Website HTML Content:
{{{websiteContent.htmlContent}}}
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
    
    if (!output) {
      throw new Error("The AI model did not return any output.");
    }
    return output;
  }
);
