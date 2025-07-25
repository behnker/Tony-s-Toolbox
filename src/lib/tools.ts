/**
 * @fileOverview A Genkit tool for fetching website content.
 *
 * - getWebsiteContent - A tool that fetches the plain text content of a website.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const getWebsiteContent = ai.defineTool(
  {
    name: 'getWebsiteContent',
    description: 'Fetches the title, meta description, and a representative image URL of a website.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    outputSchema: z.object({
      title: z.string().describe('The title of the website.'),
      description: z.string().describe('The meta description of the website.'),
      imageUrl: z.string().optional().describe('The best-available image URL of the website (e.g., OpenGraph, Twitter, or high-res favicon).'),
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
      
      const text = await response.text();
      
      const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
      const descriptionMatch = text.match(/<meta\s+(?:name="description"|property="og:description")\s+content="([^"]*)"/i);

      const title = titleMatch?.[1] || 'No title found';
      const description = descriptionMatch?.[1] || 'No description found';

      // Enhanced image search logic
      const ogImageMatch = text.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
      const twitterImageMatch = text.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i);
      const appleIconMatch = text.match(/<link\s+rel="apple-touch-icon"\s+href="([^"]*)"/i);
      const highResFaviconMatch = text.match(/<link\s+rel="icon"\s+sizes="[^"]*"\s+href="([^"]*)"/i);
      const genericFaviconMatch = text.match(/<link\s+rel="icon"\s+href="([^"]*)"/i);

      let imageUrl: string | undefined = 
        ogImageMatch?.[1] || 
        twitterImageMatch?.[1] ||
        appleIconMatch?.[1] ||
        highResFaviconMatch?.[1] ||
        genericFaviconMatch?.[1];

      // Resolve relative URL to absolute
      if (imageUrl) {
        try {
          const absoluteUrl = new URL(imageUrl, url);
          imageUrl = absoluteUrl.href;
        } catch (e) {
            console.error(`Invalid image URL found: ${imageUrl}`, e);
            imageUrl = undefined;
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
