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

function convertDocToTool(doc: FirebaseFirestore.DocumentSnapshot): Tool {
    const data = doc.data()!;
    
    const convertTimestamp = (ts: any): Date | undefined => {
        if (ts instanceof Timestamp) return ts.toDate();
        if (ts instanceof Date) return ts;
        return undefined;
    }

    return {
        id: doc.id,
        url: data.url,
        name: data.name,
        description: data.description,
        categories: data.categories,
        price: data.price,
        easeOfUse: data.easeOfUse,
        submittedBy: data.submittedBy,
        justification: data.justification,
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        imageUrl: data.imageUrl,
        submittedAt: convertTimestamp(data.submittedAt) || new Date(),
        lastUpdatedAt: convertTimestamp(data.lastUpdatedAt),
    };
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

    const toolsList = toolsSnapshot.docs.map(convertDocToTool);

    return toolsList;
}

export async function addTool(tool: Omit<Tool, 'id' | 'submittedAt'>): Promise<Tool> {
    const docRef = await db.collection("tools").add({
        ...tool,
        submittedAt: FieldValue.serverTimestamp(),
    });
    const newDoc = await docRef.get();
    return convertDocToTool(newDoc);
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

export async function getToolByUrl(url: string): Promise<Tool | null> {
    const toolsCollection = db.collection("tools");
    const q = toolsCollection.where("url", "==", url).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return convertDocToTool(doc);
}

export async function updateTool(toolId: string, toolData: Partial<Omit<Tool, 'id'>>): Promise<Tool> {
    const toolRef = db.collection("tools").doc(toolId);
    await toolRef.update(toolData);
    
    const updatedDoc = await toolRef.get();
    return convertDocToTool(updatedDoc);
}
