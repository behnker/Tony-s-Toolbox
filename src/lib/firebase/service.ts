import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

async function seedDatabase() {
    const toolsCollection = collection(db, "tools");
    const batch = writeBatch(db);
    initialTools.forEach((tool) => {
        const newDocRef = doc(toolsCollection);
        // The `submittedAt` is now a Date object from initialTools, so no parsing is needed.
        const seedData = {
            ...tool,
            submittedAt: Timestamp.now(),
        };
        batch.set(newDocRef, seedData);
    });
    await batch.commit();
}


export async function getTools(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const q = query(toolsCollection, orderBy("submittedAt", "desc"));
    
    let toolsSnapshot = await getDocs(q);
    
    if (toolsSnapshot.empty) {
        console.log("No tools found, seeding initial data.");
        await seedDatabase();
        // After seeding, fetch the data again to ensure we get the correct format
        toolsSnapshot = await getDocs(q);
    }

    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        // This is the critical fix:
        // Ensure submittedAt is a valid Date object, whether it's a Timestamp or already a Date.
        // This prevents the .toDate() error on a value that is not a Timestamp.
        const submittedAt = data.submittedAt instanceof Timestamp 
            ? data.submittedAt.toDate() 
            : data.submittedAt; // If it's not a timestamp, assume it's a JS Date or other valid format

        return {
            ...data,
            id: doc.id,
            submittedAt: new Date(submittedAt), // Ensure it is always a JS Date object
        } as Tool;
    });

    return toolsList;
}

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await addDoc(collection(db, "tools"), {
        ...tool,
        submittedAt: serverTimestamp(),
    });
    
    // The serverTimestamp() will be null on the client until it's processed by the server.
    // We return a client-side date for optimistic updates. The real date will be fetched on reload.
    return { ...tool, id: docRef.id, submittedAt: new Date() };
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

  if (Object.keys(updateData).length > 0) {
    await updateDoc(toolRef, updateData);
  }
}
