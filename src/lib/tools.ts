/**
 * @fileOverview A Genkit tool for fetching website content.
 *
 * - getWebsiteContent - A tool that fetches the plain text content of a website.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WebsiteContentSchema = z.object({
    input: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    output: z.object({
      title: z.string().describe('The title of the website.'),
      description: z.string().describe('The meta description of the website.'),
      imageUrl: z.string().url().optional().describe('The OpenGraph image URL of the website.'),
      error: z.string().optional().describe('An error message if fetching failed.'),
    }),
});
export { WebsiteContentSchema };

export const getWebsiteContent = ai.defineTool(
  {
    name: 'getWebsiteContent',
    description: 'Fetches the title, meta description, and OpenGraph image of a website.',
    inputSchema: WebsiteContentSchema.shape.input,
    outputSchema: WebsiteContentSchema.shape.output,
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
      
      const text = await response.text();
      
      const titleMatch = text.match(/<title>([^<]*)<\/title>/);
      const descriptionMatch = text.match(/<meta\s+name="description"\s+content="([^"]*)"/);
      const ogDescriptionMatch = text.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
      const ogImageMatch = text.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
      const faviconMatch = text.match(/<link\s+rel="icon"\s+href="([^"]*)"/);

      const title = titleMatch ? titleMatch[1] : 'No title found';
      const description = descriptionMatch ? descriptionMatch[1] : (ogDescriptionMatch ? ogDescriptionMatch[1] : 'No description found');
      let imageUrl = ogImageMatch ? ogImageMatch[1] : undefined;

      // If no OG image, try favicon
      if (!imageUrl && faviconMatch) {
        try {
          // Resolve relative favicon URL to absolute
          const faviconUrl = new URL(faviconMatch[1], url);
imageUrl = faviconUrl.href;
        } catch (e) {
          // Ignore invalid favicon URLs
        }
      }

      return { title, description, imageUrl };

    } catch (error: any) {
      console.error(`Error fetching website content for ${url}:`, error);
      // Return a structured error to the LLM
      return {
        title: 'Error',
        description: `Failed to retrieve content: ${error.message}`,
        error: `Failed to retrieve content: ${error.message}`
    };
    }
  }
);
