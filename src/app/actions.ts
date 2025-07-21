"use server";

import { z } from "zod";
import { extractMetadataFromUrl } from "@/ai/flows/extract-metadata";
import { extractImageFromUrl } from "@/ai/flows/extract-image-from-url";
import type { Tool } from "@/lib/types";

const formSchema = z.object({
  url: z.string().url(),
  submittedBy: z.string(),
  justification: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export async function submitTool(
  values: FormValues
): Promise<{ success: boolean; data?: Tool; error?: string }> {
  const validation = formSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const [metadata, image] = await Promise.all([
      extractMetadataFromUrl({ url: validation.data.url }),
      extractImageFromUrl({ url: validation.data.url }),
    ]);

    if (!metadata.title || !metadata.description) {
        return { success: false, error: "Could not extract sufficient metadata. Please try a different URL."}
    }

    const newTool: Tool = {
      id: crypto.randomUUID(),
      url: validation.data.url,
      name: metadata.title,
      description: metadata.description,
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

    return { success: true, data: newTool };
  } catch (error) {
    console.error("Error submitting tool:", error);
    if (error instanceof Error && error.message.includes('deadline')) {
        return { success: false, error: 'The request timed out. The URL might be slow or inaccessible.' };
    }
    return { success: false, error: "Failed to extract metadata or image from the URL. Please ensure it's a valid and accessible page." };
  }
}
