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
    description: 'Fetches the plain text content of a website, including meta tags.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to fetch.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('The plain text content of the website.'),
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
      // This is a very simple text extractor. A more robust solution would use a library like Cheerio.
      const text = await response.text();
      const bodyText = text.replace(/<style[^>]*>.*<\/style>/gs, '')
                           .replace(/<script[^>]*>.*<\/script>/gs, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
      return {content: bodyText};
    } catch (error: any) {
      console.error(`Error fetching website content for ${url}:`, error);
      // Return a structured error to the LLM
      return {content: `Failed to retrieve content: ${error.message}`};
    }
  }
);
