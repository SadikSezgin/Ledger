import { db } from "../firebase.js";

import {
    collection,
    doc,
    setDoc,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function createWorkspace(user) {

    const workspaceRef = doc(collection(db, "workspaces"));

    const workspace = {
        id: workspaceRef.id,
        name: "Personal",
        ownerId: user.uid,
        createdAt: serverTimestamp()
    };

    await setDoc(workspaceRef, workspace);

    return workspace;

}

export async function getWorkspace(workspaceId) {

    const snapshot = await getDoc(doc(db, "workspaces", workspaceId));

    if (!snapshot.exists()) {
        throw new Error("Workspace not found.");
    }

    return snapshot.data();
}