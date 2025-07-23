import { db } from "./server";
import { collection, addDoc, getDocs, Timestamp, orderBy, query, doc, updateDoc, increment, FieldValue, writeBatch } from "firebase/firestore";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";

async function seedDatabase() {
    const toolsCollection = collection(db, "tools");
    const batch = db.batch();
    initialTools.forEach((tool) => {
        const newDocRef = doc(toolsCollection);
        const seedData = {
            ...tool,
            submittedAt: FieldValue.serverTimestamp(),
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
        toolsSnapshot = await getDocs(q);
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
    const docRef = await addDoc(collection(db, "tools"), {
        ...tool,
        submittedAt: FieldValue.serverTimestamp(),
    });
    
    return { ...tool, id: docRef.id, submittedAt: new Date() };
}

export async function updateToolVotes(toolId: string, upvoteIncrement: number, downvoteIncrement: number) {
  const toolRef = doc(db, "tools", toolId);
  
  const updateData: { [key: string]: any } = {};
  if (upvoteIncrement !== 0) {
    updateData.upvotes = FieldValue.increment(upvoteIncrement);
  }
  if (downvoteIncrement !== 0) {
    updateData.downvotes = FieldValue.increment(downvoteIncrement);
  }

  if (Object.keys(updateData).length > 0) {
    await updateDoc(toolRef, updateData);
  }
}
