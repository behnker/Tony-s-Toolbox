import { db } from "./server";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

async function seedDatabase() {
    console.log("Seeding database...");
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
    console.log("Database seeded.");
}

function convertDocToTool(doc: FirebaseFirestore.DocumentSnapshot): Tool {
    const data = doc.data()!;
    
    const convertTimestamp = (ts: unknown): Date | undefined => {
        if (!ts) return undefined;
        if (ts instanceof Timestamp) return ts.toDate();
        // Handle cases where it might already be a Date object or a string
        if (ts instanceof Date) return ts;
        try {
            const date = new Date(ts as string);
            if (!isNaN(date.getTime())) return date;
        } catch (_e) {
             // Ignore invalid date strings
        }
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
    
    let toolsSnapshot;
    try {
        console.log("Fetching tools...");
        toolsSnapshot = await q.get();
        if (toolsSnapshot.empty) {
            console.log("No tools found, seeding initial data.");
            await seedDatabase();
            toolsSnapshot = await q.get();
        }
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 5) { // 5 = NOT_FOUND, collection doesn't exist
            console.log("Tools collection not found, seeding initial data.");
            await seedDatabase();
            toolsSnapshot = await q.get();
        } else {
            console.error("Error fetching tools, possibly due to auth issue. Returning empty list.", error);
            // If we can't fetch tools, we can't run the app.
            // Instead of crashing, return an empty array.
            return [];
        }
    }

    const toolsList = toolsSnapshot.docs.map(convertDocToTool);
    console.log(`Found ${toolsList.length} tools.`);

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
  
  const updateData: Record<string, FieldValue | number> = {};
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
    
    // Create a mutable copy and filter out undefined values
    const serializableData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(toolData)) {
      if (value !== undefined) {
        serializableData[key] = value;
      }
    }
    
    if (serializableData.lastUpdatedAt instanceof Date) {
        serializableData.lastUpdatedAt = Timestamp.fromDate(serializableData.lastUpdatedAt);
    }

    await toolRef.update(serializableData);
    
    const updatedDoc = await toolRef.get();
    return convertDocToTool(updatedDoc);
}
