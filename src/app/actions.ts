
"use server";

import { z } from "zod";
import { extractMetadataFromUrl } from "@/ai/flows/extract-metadata";
import { extractImageFromUrl } from "@/ai/flows/extract-image-from-url";
import { generateShortDescription } from "@/ai/flows/generate-short-description";
import { addTool } from "@/lib/firebase/service";
import type { Tool } from "@/lib/types";

const formSchema = z.object({
  url: z.string().url(),
  submittedBy: z.string(),
  justification: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

async function getWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch website content: ${response.statusText}`);
    }
    const text = await response.text();
    // A simple way to clean up HTML and get text content.
    // This is not perfect and might be improved with a more robust library.
    return text.replace(/<style[^>]*>.*<\/style>/gs, '')
               .replace(/<script[^>]*>.*<\/script>/gs, '')
               .replace(/<[^>]+>/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();
  } catch (error) {
    console.error("Error fetching website content:", error);
    return "";
  }
}

export async function submitTool(
  values: FormValues
): Promise<{ success: boolean; data?: Tool; error?: string }> {
  const validation = formSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, error: "Invalid input." };
  }
  const { url } = validation.data;

  try {
    const [metadata, image] = await Promise.all([
      extractMetadataFromUrl({ url }),
      extractImageFromUrl({ url }),
    ]);

    let description = metadata.description;

    // If description is missing or too short, generate one.
    if (!description || description.split(' ').length < 5) {
      const websiteContent = await getWebsiteContent(url);
      if (websiteContent) {
        const generated = await generateShortDescription({ url, websiteContent });
        description = generated.shortDescription;
      }
    }
    
    if (!metadata.title || !description) {
        return { success: false, error: "Could not extract or generate sufficient metadata. Please try a different URL."}
    }

    const newToolData: Omit<Tool, 'id'> = {
      url: validation.data.url,
      name: metadata.title,
      description: description,
      categories: metadata.categories.length > 0 ? metadata.categories : ['general'],
      price: 'Freemium', 
      easeOfUse: 'Beginner', 
      submittedBy: validation.data.submittedBy,
      justification: validation.data.justification,
      submittedAt: new Date(),
      upvotes: 1,
      downvotes: 0,
      imageUrl: image.imageUrl,
    };

    const savedTool = await addTool(newToolData);

    return { success: true, data: savedTool };
  } catch (error) {
    console.error("Error submitting tool:", error);
    if (error instanceof Error && error.message.includes('deadline')) {
        return { success: false, error: 'The request timed out. The URL might be slow or inaccessible.' };
    }
    return { success: false, error: "Failed to extract metadata or image from the URL. Please ensure it's a valid and accessible page." };
  }
}
