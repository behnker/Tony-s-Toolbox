
import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

export async function addTool(tool: Omit<Tool, 'id'>): Promise<Tool> {
    const docRef = await addDoc(collection(db, "tools"), tool);
    return { ...tool, id: docRef.id };
}

export async function getTools(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const q = query(toolsCollection, orderBy("submittedAt", "desc"));
    const toolsSnapshot = await getDocs(q);
    
    let toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            submittedAt: (data.submittedAt as Timestamp).toDate(),
        } as Tool;
    });

    // Seed data if the collection is empty
    if (toolsList.length === 0) {
        console.log("No tools found, seeding initial data.");
        for (const tool of initialTools) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...toolData } = tool;
            await addDoc(toolsCollection, toolData);
        }
        // After seeding, fetch the data again to ensure we have IDs and correct timestamps
        const newSnapshot = await getDocs(q);
        toolsList = newSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                submittedAt: (data.submittedAt as Timestamp).toDate(),
            } as Tool;
        });
    }

    return toolsList;
}


export async function updateToolVotes(toolId: string, upvoteIncrement: number, downvoteIncrement: number) {
  const toolRef = doc(db, "tools", toolId);
  
  const updateData: { [key: string]: any } = {};
  if (upvoteIncrement !== 0) {
    updateData.upvotes = increment(upvoteIncrement);
  }
  if (downvoteIncrement !== 0) {
    updateData.downvotes = increment(downvoteIncrement);
  }

  await updateDoc(toolRef, updateData);
}
