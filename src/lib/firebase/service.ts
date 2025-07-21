
import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await addDoc(collection(db, "tools"), {
        ...tool,
        submittedAt: serverTimestamp(),
    });
    
    // To return the full tool object, we would need to get the doc again to get the server-generated timestamp.
    // For simplicity, we'll return the tool with a client-side date, but the DB has the accurate server time.
    return { ...tool, id: docRef.id, submittedAt: new Date() };
}

export async function getTools(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const q = query(toolsCollection, orderBy("submittedAt", "desc"));
    
    let toolsSnapshot = await getDocs(q);
    
    // Seed data if the collection is empty
    if (toolsSnapshot.empty) {
        console.log("No tools found, seeding initial data.");
        const batch = [];
        for (const tool of initialTools) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...toolData } = tool;
            // Convert string date to Firestore Timestamp for seeding
            const seedData = {
                ...toolData,
                submittedAt: Timestamp.fromDate(new Date(tool.submittedAt)),
            };
            batch.push(addDoc(toolsCollection, seedData));
        }
        await Promise.all(batch);

        // After seeding, fetch the data again to ensure we have IDs and correct timestamps
        toolsSnapshot = await getDocs(q);
    }

    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            submittedAt: (data.submittedAt as Timestamp).toDate(),
        } as Tool;
    });

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
