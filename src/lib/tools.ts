
'use server';
/**
 * @fileOverview A Genkit tool for fetching website content and a tool for extracting metadata from HTML.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {GenerateToolMetadataOutputSchema} from '@/ai/flows/generate-tool-metadata';


export const getWebsiteContent = ai.defineTool(
  {
    name: 'getWebsiteContent',
    description: 'Fetches the full HTML content of a website.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    outputSchema: z.object({
      htmlContent: z.string().optional().describe('The full HTML content of the website.'),
      error: z.string().optional().describe('An error message if fetching failed.'),
    }),
  },
  async ({url}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.statusText}`);
      }
      
      const htmlContent = await response.text();
      
      return { htmlContent };

    } catch (error: any) {
      console.error(`Error fetching website content for ${url}:`, error);
      // Return a structured error to the LLM
      return {
        htmlContent: undefined,
        error: `Failed to retrieve content: ${error.message}`
    };
    }
  }
);

export const extractMetadataFromHtml = ai.defineTool(
    {
      name: 'extractMetadataFromHtml',
      description: 'Extracts tool metadata from the provided HTML content.',
      inputSchema: z.object({
        url: z.string().url(),
        htmlContent: z.string().optional(),
        justification: z.string(),
      }),
      outputSchema: GenerateToolMetadataOutputSchema,
    },
    async (input) => {
        const {output} = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            prompt: `You are an expert data extractor tasked with populating a catalogue of AI tools. Your job is to analyze the provided HTML of a tool's homepage and extract specific information.

Analyze the HTML content provided for the URL: ${input.url}

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
    *   **CRITICAL:** The returned URL MUST be absolute. If you find a relative path (e.g., "/images/logo.svg"), you MUST convert it to an absolute URL using the base domain ("${input.url}").
    *   **CRITICAL:** If you cannot find any suitable image URL after checking all sources, you **MUST** return \`null\` for this field. Do not guess and do not use the website's title.

If the provided website HTML content is empty or contains an error message, rely on your existing knowledge of the tool at the given URL and the user's justification ("${input.justification}") to fill in the fields as best as you can.

Website HTML Content:
\`\`\`html
${input.htmlContent}
\`\`\`
`,
            output: {
                format: 'json',
                schema: GenerateToolMetadataOutputSchema,
            }
        });

        if (!output) {
            throw new Error('Could not extract metadata from HTML.');
        }

        return output;
    }
  );
  
