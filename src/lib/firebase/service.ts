
import { db } from "./client";
import { collection, addDoc, getDocs, Timestamp, orderBy, query } from "firebase/firestore";
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
    const toolsList = toolsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            submittedAt: (data.submittedAt as Timestamp).toDate(),
        } as Tool;
    });

    // Seed data if the collection is empty
    if (toolsList.length === 0) {
        return await seedInitialData();
    }

    return toolsList;
}

export async function seedInitialData(): Promise<Tool[]> {
    const toolsCollection = collection(db, "tools");
    const toolsSnapshot = await getDocs(toolsCollection);
    
    // Only seed if the collection is empty
    if (toolsSnapshot.empty) {
        console.log("Seeding initial data...");
        for (const tool of initialTools) {
            const { id, ...toolData } = tool;
            await addDoc(toolsCollection, toolData);
        }
        console.log("Seeding complete.");
        // Re-fetch after seeding
        const newToolsSnapshot = await getDocs(query(toolsCollection, orderBy("submittedAt", "desc")));
        return newToolsSnapshot.docs.map(doc => {
             const data = doc.data();
            return {
                ...data,
                id: doc.id,
                submittedAt: (data.submittedAt as Timestamp).toDate(),
            } as Tool;
        });
    }
    return [];
}
