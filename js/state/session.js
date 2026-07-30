export const session = {
    uid: null,
    workspaceId: null
};

export function setSession(uid, workspaceId) {
    session.uid = uid;
    session.workspaceId = workspaceId;
}

export function clearSession() {
    session.uid = null;
    session.workspaceId = null;
}

export function getSession() {
    return session;
}
