
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
import {getWebsiteContent, extractMetadataFromHtml, GenerateToolMetadataOutputSchema} from '@/lib/tools';

const GenerateToolMetadataInputSchema = z.object({
  url: z.string().url().describe('The URL of the tool to describe.'),
  justification: z.string().describe("The user's reason for recommending the tool."),
});
export type GenerateToolMetadataInput = z.infer<typeof GenerateToolMetadataInputSchema>;
export type GenerateToolMetadataOutput = z.infer<typeof GenerateToolMetadataOutputSchema>;


export async function generateToolMetadata(input: GenerateToolMetadataInput): Promise<GenerateToolMetadataOutput> {
  return generateToolMetadataFlow(input);
}


const generateToolMetadataFlow = ai.defineFlow(
  {
    name: 'generateToolMetadataFlow',
    inputSchema: GenerateToolMetadataInputSchema,
    outputSchema: GenerateToolMetadataOutputSchema,
    tools: [getWebsiteContent, extractMetadataFromHtml]
  },
  async ({url, justification}) => {
    // 1. Fetch the raw HTML content of the website.
    const {htmlContent, error} = await getWebsiteContent({url});
    
    if (error) {
        console.error(`Failed to fetch website content for ${url}: ${error}`);
        // If fetching fails, we can still try to extract metadata with the justification.
    }
    
    // 2. Pass the HTML to the expert extraction tool.
    const metadata = await extractMetadataFromHtml({
        url,
        htmlContent,
        justification
    });

    return metadata;
  }
);
