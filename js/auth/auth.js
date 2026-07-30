import { auth } from "../firebase.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    createUserProfile,
    setDefaultWorkspace,
    updateLastLogin
} from "../services/userService.js";

import {
    createWorkspace
} from "../services/workspaceService.js";

export async function login(email, password) {

    const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateLastLogin(credential.user.uid);

    return credential.user;

}

export async function register(email, password) {

    console.log("Starting Firebase registration...");

    const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    console.log("Firebase user created:", credential.user);

    const user = credential.user;

    await createUserProfile(user);
    
    console.log("Profile created");

    const workspace = await createWorkspace(user);
    
    console.log("Workspace created");


    await setDefaultWorkspace(
        user.uid,
        workspace.id
    );

    console.log("Registration complete");

    return user;

}

export async function resetPassword(email) {
    return await sendPasswordResetEmail(
        auth,
        email
    );
}

export async function logout() {
    return await signOut(auth);
}