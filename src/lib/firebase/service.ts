
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
        console.log("No tools found, checking if seeding is needed.");
        toolsList = await seedInitialData();
    }

    return toolsList;
}

export async function seedInitialData(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const toolsSnapshot = await getDocs(toolsCollection);
    
    // Only seed if the collection is empty
    if (toolsSnapshot.empty) {
        console.log("Seeding initial data...");
        const seededTools: Tool[] = [];
        for (const tool of initialTools) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...toolData } = tool;
            const docRef = await addDoc(toolsCollection, toolData);
            seededTools.push({ ...tool, id: docRef.id });
        }
        console.log("Seeding complete.");
        // Return the freshly seeded tools, sorted by date
        return seededTools.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    console.log("Data already exists, skipping seed.");
    return [];
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
