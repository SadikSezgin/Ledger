import { db } from "../firebase.js";

import {
    collection,
    doc,
    setDoc,
    serverTimestamp
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