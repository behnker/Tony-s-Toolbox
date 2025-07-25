
"use server";

import { z } from "zod";
import { generateToolMetadata } from "@/ai/flows/generate-tool-metadata";
import { addTool, updateToolVotes, getTools as getToolsFromDb, getToolByUrl, updateTool } from "@/lib/firebase/service";
import type { Tool } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase/firestore";

const formSchema = z.object({
  url: z.string().url(),
  submittedBy: z.string(),
  justification: z.string(),
});

type FormValues = z.infer<typeof formSchema>;


export async function submitTool(
  values: FormValues
): Promise<{ success: boolean; data?: Tool; error?: string; message?: string }> {
  const validation = formSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, error: "Invalid input." };
  }
  const { url, justification, submittedBy } = validation.data;

  const existingTool = await getToolByUrl(url);

  let metadata;
  try {
    metadata = await generateToolMetadata({ url, justification });
  } catch (error: any) {
    console.error("AI metadata generation failed, using fallback data.", error);
    // Create a fallback tool.
    metadata = {
        title: new URL(url).hostname,
        description: justification,
        categories: ['general'],
        imageUrl: undefined,
    };
  }

  try {
    if (existingTool) {
      // Update existing tool
      const updatedToolData: Partial<Omit<Tool, 'id' | 'submittedAt'>> = {};

      if (metadata.title) updatedToolData.name = metadata.title;
      if (metadata.description) updatedToolData.description = metadata.description;
      if (metadata.categories && metadata.categories.length > 0) updatedToolData.categories = metadata.categories;
      if (metadata.imageUrl) updatedToolData.imageUrl = metadata.imageUrl;
      
      if (Object.keys(updatedToolData).length === 0) {
        return { success: true, data: existingTool, message: `${existingTool.name} is already up-to-date.` };
      }

      updatedToolData.lastUpdatedAt = new Date();
      
      const updatedTool = await updateTool(existingTool.id, updatedToolData);
      revalidatePath('/');
      return { success: true, data: updatedTool, message: `${updatedTool.name} has been updated.` };

    } else {
      // Add new tool
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
        ...(metadata.imageUrl && { imageUrl: metadata.imageUrl }),
      };

      const savedTool = await addTool(newToolData);
      revalidatePath('/');
      return { success: true, data: savedTool, message: `${savedTool.name} has been added.` };
    }
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

export async function refreshTool(
    { toolId, url, justification }: { toolId: string; url: string; justification: string }
  ): Promise<{ success: boolean; data?: Tool; error?: string; message?: string }> {
    try {
      // 1. Fetch new metadata from the AI flow
      const metadata = await generateToolMetadata({ url, justification: justification || "Manual data refresh" });
  
      // 2. Prepare the data for an update, only including fields that have new values
      const updatedToolData: Partial<Omit<Tool, 'id' | 'submittedAt'>> = {};
  
      if (metadata.title) updatedToolData.name = metadata.title;
      if (metadata.description) updatedToolData.description = metadata.description;
      if (metadata.categories && metadata.categories.length > 0) updatedToolData.categories = metadata.categories;
      if (metadata.imageUrl) updatedToolData.imageUrl = metadata.imageUrl;
  
      // If there's no new data, don't update
      if (Object.keys(updatedToolData).length === 0) {
        return { success: true, message: "Tool is already up to date." };
      }
  
      updatedToolData.lastUpdatedAt = Timestamp.now();
  
      // 3. Update the tool in the database
      const updatedTool = await updateTool(toolId, updatedToolData);
      revalidatePath('/');
      
      return { success: true, data: updatedTool, message: `${updatedTool.name} has been successfully updated.` };
  
    } catch (error) {
      console.error("Error refreshing tool:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, error: `Failed to refresh tool data. Reason: ${errorMessage}` };
    }
  }
  
