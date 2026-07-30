import { getSession } from "../state/session.js";

export function getCurrentWorkspaceId() {

    const session = getSession();

    if (!session.workspaceId) {
        throw new Error("Workspace not initialized.");
    }

    return session.workspaceId;
}

export function getCurrentUid() {

    const session = getSession();

    if (!session.uid) {
        throw new Error("User not initialized.");
    }

    return session.uid;
}