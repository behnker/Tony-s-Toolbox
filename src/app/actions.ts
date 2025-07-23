
"use server";

import { z } from "zod";
import { extractMetadata } from "@/ai/flows/extract-metadata";
import { addTool, updateToolVotes, getTools as getToolsFromDb } from "@/lib/firebase/service";
import type { Tool } from "@/lib/types";
import { revalidatePath } from "next/cache";

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
  const { url, justification, submittedBy } = validation.data;

  try {
    const metadata = await extractMetadata({ url });

    const newToolData: Omit<Tool, 'id' | 'submittedAt'> = {
      url: url,
      name: metadata.title || 'Untitled Tool',
      description: metadata.description || 'No description available.',
      categories: metadata.categories && metadata.categories.length > 0 ? metadata.categories : ['general'],
      price: 'Freemium', 
      easeOfUse: 'Beginner', 
      submittedBy: submittedBy,
      justification: justification,
      upvotes: 1,
      downvotes: 0,
      imageUrl: metadata.imageUrl,
    };

    const savedTool = await addTool(newToolData);
    revalidatePath('/');
    return { success: true, data: savedTool };
  } catch (error) {
    console.error("Error submitting tool:", error);
    if (error instanceof Error && (error.message.includes('deadline') || error.message.includes('timeout') || error.message.includes('blocked'))) {
        return { success: false, error: 'The request timed out or was blocked. The URL might be slow, inaccessible, or preventing automated requests.' };
    }
    return { success: false, error: "Failed to process the URL. Please ensure it's a valid and accessible page." };
  }
}

export async function updateVote({toolId, upvoteIncrement, downvoteIncrement}: {toolId: string, upvoteIncrement: number, downvoteIncrement: number}) {
    try {
        await updateToolVotes(toolId, upvoteIncrement, downvoteIncrement);
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating vote:", error);
        return { success: false, error: "Failed to update vote." };
    }
    return { success: true };
}

export async function getTools(): Promise<Tool[]> {
    return getToolsFromDb();
}
