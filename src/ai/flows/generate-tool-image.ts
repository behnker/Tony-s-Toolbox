
'use server';

/**
 * @fileOverview A flow to generate an image for a tool.
 *
 * - generateToolImage - A function that generates an image for a tool.
 * - GenerateToolImageInput - The input type for the generateToolImage function.
 * - GenerateToolImageOutput - The return type for the generateToolImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateToolImageInputSchema = z.object({
    name: z.string().describe('The name of the tool.'),
    categories: z.array(z.string()).describe('The categories of the tool.'),
});
export type GenerateToolImageInput = z.infer<typeof GenerateToolImageInputSchema>;

const GenerateToolImageOutputSchema = z.object({
    imageUrl: z.string().url().describe('The URL of the generated image as a data URI.'),
});
export type GenerateToolImageOutput = z.infer<typeof GenerateToolImageOutputSchema>;

export async function generateToolImage(input: GenerateToolImageInput): Promise<GenerateToolImageOutput> {
    return generateToolImageFlow(input);
}

const generateToolImageFlow = ai.defineFlow(
    {
        name: 'generateToolImageFlow',
        inputSchema: GenerateToolImageInputSchema,
        outputSchema: GenerateToolImageOutputSchema,
    },
    async (input) => {
        const {media} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a visually appealing, abstract, and modern graphic that represents a software tool with the following characteristics. The image should be suitable for a dark-themed app card background. Do not include any text in the image.

Name: ${input.name}
Categories: ${input.categories.join(', ')}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media || !media.url) {
            throw new Error('Image generation failed to return a valid image.');
        }

        return {
            imageUrl: media.url,
        };
    }
);
