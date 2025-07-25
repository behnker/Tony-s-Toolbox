
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
  imageUrl: z.string().nullable().describe('The absolute URL of a relevant image for the tool, or null if none is found.'),
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
  prompt: `You are an expert data extractor tasked with populating a catalogue of AI tools. Your job is to analyze the provided HTML of a tool's homepage and extract specific information in a structured JSON format.

Analyze the HTML content provided for the URL: {{{url}}}

Follow these rules precisely:

1.  **Title:**
    *   Extract the content from the \`<title>\` tag. This is the tool's name.

2.  **Description:**
    *   **Priority 1:** Find the content of the \`<meta property="og:description">\` tag.
    *   **Priority 2:** If not found, use the content of the \`<meta name="description">\` tag.
    *   If neither meta description exists, return a concise, one-sentence summary based on the text content of the page's \`<h1>\` and the first meaningful \`<p>\` tag.

3.  **Categories:**
    *   Based on the description and title, provide an array of up to 3 relevant categories (e.g., "image-generation", "developer-tools", "copywriting").

4.  **Image URL:**
    *   Your primary goal is to find a URL for a logo or a representative image.
    *   **Priority 1:** Find the URL in the \`<meta property="og:image">\` tag.
    *   **Priority 2:** If not found, use the \`href\` from a \`<link rel="apple-touch-icon">\` tag.
    *   **Priority 3:** If not found, use the \`href\` from a \`<link rel="icon">\` tag.
    *   **CRITICAL:** The returned URL MUST be absolute. If you find a relative path (e.g., "/images/logo.svg"), you MUST convert it to an absolute URL using the base domain ("{{{url}}}").
    *   **CRITICAL:** If you cannot find any suitable image URL after checking all sources, you **MUST** return \`null\` for this field. Do not guess and do not use the website's title.

If the provided website HTML content is empty or contains an error message, rely on your existing knowledge of the tool at the given URL and the user's justification ("{{{justification}}}") to fill in the fields as best as you can.

Website HTML Content:
\`\`\`html
{{{websiteContent.htmlContent}}}
\`\`\`
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

