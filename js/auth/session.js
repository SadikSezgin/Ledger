import { auth } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { loadState } from "../storage/localStorage.js";
import { renderEverything } from "../render.js";
import { setSession, clearSession } from "../state/session.js";
import { getUserProfile } from "../services/userService.js";

export function currentUser() {

    return auth.currentUser;

}

export function initializeSession() {

    const loadingScreen = document.getElementById("loading-screen");
    const authScreen = document.getElementById("auth-screen");
    const appScreen = document.getElementById("app-screen");

    loadingScreen.style.display = "flex";
    authScreen.style.display = "none";
    appScreen.style.display = "none";

    onAuthStateChanged(auth, async (user) => {

        loadingScreen.style.display = "none";

        if (user) {

            const profile = await getUserProfile(user.uid);

            setSession(
                user.uid,
                profile.defaultWorkspaceId
            );

            loadState();

            showDashboard();

            renderEverything();

        } else {

            clearSession();
            showLogin();

        }

    });

    function showLogin() {

        authScreen.style.display = "";
        appScreen.style.display = "none";

    }

    function showDashboard() {

        authScreen.style.display = "none";
        appScreen.style.display = "";

    }

}

export function requireAuth() {

    return auth.currentUser !== null;

}

export function requireGuest() {

    return auth.currentUser === null;

}
