import { db } from "../firebase.js";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function createUserProfile(user) {

    await setDoc(doc(db, "users", user.uid), {

        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        defaultWorkspaceId: null,

        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()

    });

}

export async function setDefaultWorkspace(uid, workspaceId) {

    await updateDoc(doc(db, "users", uid), {

        defaultWorkspaceId: workspaceId

    });

}

export async function updateLastLogin(uid) {

    await updateDoc(doc(db, "users", uid), {

        lastLoginAt: serverTimestamp()

    });

}

export async function getUserProfile(uid) {

    const snapshot = await getDoc(doc(db, "users", uid));

    if (!snapshot.exists()) {
        throw new Error("User profile not found.");
    }

    return snapshot.data();
}