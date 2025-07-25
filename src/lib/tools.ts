
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
