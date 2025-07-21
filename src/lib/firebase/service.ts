
import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await addDoc(collection(db, "tools"), {
        ...tool,
        submittedAt: serverTimestamp(),
    });
    
    // We get a client-side estimate of the timestamp for optimistic updates.
    // The real server-side timestamp will be fetched on the next page load.
    return { ...tool, id: docRef.id, submittedAt: new Date() };
}

export async function getTools(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const q = query(toolsCollection, orderBy("submittedAt", "desc"));
    
    let toolsSnapshot = await getDocs(q);
    
    // If the collection is empty, seed it with initial data.
    if (toolsSnapshot.empty) {
        console.log("No tools found, seeding initial data.");
        const batch = writeBatch(db);
        for (const tool of initialTools) {
            const newDocRef = doc(toolsCollection);
            const seedData = {
                ...tool,
                // Convert string date from data file to Firestore Timestamp
                submittedAt: Timestamp.fromDate(new Date(tool.submittedAt)),
            };
            batch.set(newDocRef, seedData);
        }
        // Commit the batch to write all tools to the database.
        await batch.commit();

        // After seeding, fetch the data again to ensure we get the fresh data from the DB.
        toolsSnapshot = await getDocs(q);
    }

    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            // Convert Firestore Timestamp to JavaScript Date object
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

  // No need to await this for optimistic updates, but you could if you wanted to guarantee it finishes.
  await updateDoc(toolRef, updateData);
}
