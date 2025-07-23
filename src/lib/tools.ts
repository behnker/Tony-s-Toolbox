'use server';
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
    description: 'Fetches the title and meta description of a website.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('The title and meta description of the website.'),
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
      
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      const descriptionMatch = text.match(/<meta\s+name="description"\s+content="(.*?)"/);
      const ogDescriptionMatch = text.match(/<meta\s+property="og:description"\s+content="(.*?)"/);

      const title = titleMatch ? titleMatch[1] : 'No title found';
      const description = descriptionMatch ? descriptionMatch[1] : (ogDescriptionMatch ? ogDescriptionMatch[1] : 'No description found');

      return {content: `Title: ${title}\nDescription: ${description}`};

    } catch (error: any) {
      console.error(`Error fetching website content for ${url}:`, error);
      // Return a structured error to the LLM
      return {content: `Failed to retrieve content: ${error.message}`};
    }
  }
);
