
"use server";

import { z } from "zod";
import { generateMetadata } from "@/ai/flows/generate-metadata";
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

  let metadata;
  try {
    metadata = await generateMetadata({ url, justification });
  } catch (error) {
    console.error("AI metadata generation failed, creating tool with fallback data.", error);
    // Do not fail the entire submission. Create a fallback tool.
    metadata = {
        title: new URL(url).hostname, // Use hostname as a fallback title
        description: justification, // Use user's justification as description
        categories: ['general'], // Assign a default category
    };
  }

  try {
    const newToolData: Omit<Tool, 'id' | 'submittedAt'> = {
      url: url,
      name: metadata.title || new URL(url).hostname,
      description: metadata.description || 'No description available.',
      categories: metadata.categories && metadata.categories.length > 0 ? metadata.categories : ['general'],
      price: 'Freemium', 
      easeOfUse: 'Beginner', 
      submittedBy: submittedBy,
      justification: justification,
      upvotes: 1,
      downvotes: 0,
      imageUrl: undefined, // Always start with no image, can be updated later.
    };

    const savedTool = await addTool(newToolData);
    revalidatePath('/');
    return { success: true, data: savedTool };

  } catch (error) {
    console.error("Error submitting tool to database:", error);
    return { success: false, error: "Failed to save the tool to the database. Please try again." };
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
