
import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await addDoc(collection(db, "tools"), {
        ...tool,
        submittedAt: serverTimestamp(),
    });
    
    // The serverTimestamp() will be null on the client until it's processed by the server.
    // We return a client-side date for optimistic updates. The real date will be fetched on reload.
    return { ...tool, id: docRef.id, submittedAt: new Date() };
}

export async function getTools(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const q = query(toolsCollection, orderBy("submittedAt", "desc"));
    
    let toolsSnapshot = await getDocs(q);
    
    if (toolsSnapshot.empty) {
        console.log("No tools found, seeding initial data.");
        const batch = writeBatch(db);
        initialTools.forEach((tool) => {
            const newDocRef = doc(toolsCollection);
            const seedData = {
                ...tool,
                submittedAt: Timestamp.fromDate(new Date(tool.submittedAt)),
            };
            batch.set(newDocRef, seedData);
        });
        await batch.commit();

        toolsSnapshot = await getDocs(q);
    }

    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        // This is the critical fix:
        // The `submittedAt` field could be a Firestore Timestamp or a JS Date (from optimistic update).
        // We ensure it's always a JS Date before returning.
        const submittedAt = data.submittedAt instanceof Timestamp 
            ? data.submittedAt.toDate() 
            : data.submittedAt;

        return {
            ...data,
            id: doc.id,
            submittedAt: submittedAt,
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
