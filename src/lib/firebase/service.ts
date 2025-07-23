import { db } from "./server";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

async function seedDatabase() {
    const toolsCollection = db.collection("tools");
    const batch = db.batch();
    initialTools.forEach((tool) => {
        const newDocRef = toolsCollection.doc();
        const seedData = {
            ...tool,
            submittedAt: FieldValue.serverTimestamp(),
        };
        batch.set(newDocRef, seedData);
    });
    await batch.commit();
}


export async function getTools(): Promise<Tool[]> {
    const toolsCollection = db.collection("tools");
    const q = toolsCollection.orderBy("submittedAt", "desc");
    
    let toolsSnapshot = await q.get();
    
    if (toolsSnapshot.empty) {
        console.log("No tools found, seeding initial data.");
        await seedDatabase();
        toolsSnapshot = await q.get();
    }

    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        let submittedAt;

        if (data.submittedAt instanceof Timestamp) {
            submittedAt = data.submittedAt.toDate();
        } else if (data.submittedAt instanceof Date) {
            submittedAt = data.submittedAt;
        } else {
            submittedAt = new Date();
        }

        return {
            ...data,
            id: doc.id,
            submittedAt: submittedAt,
        } as Tool;
    });

    return toolsList;
}

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await db.collection("tools").add({
        ...tool,
        submittedAt: FieldValue.serverTimestamp(),
    });
    
    return { ...tool, id: docRef.id, submittedAt: new Date() };
}

export async function updateToolVotes(toolId: string, upvoteIncrement: number, downvoteIncrement: number) {
  const toolRef = db.collection("tools").doc(toolId);
  
  const updateData: { [key: string]: any } = {};
  if (upvoteIncrement !== 0) {
    updateData.upvotes = FieldValue.increment(upvoteIncrement);
  }
  if (downvoteIncrement !== 0) {
    updateData.downvotes = FieldValue.increment(downvoteIncrement);
  }

  if (Object.keys(updateData).length > 0) {
    await toolRef.update(updateData);
  }
}
