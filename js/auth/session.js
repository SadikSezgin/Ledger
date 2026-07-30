import { auth } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { loadState } from "../storage/localStorage.js";
import { renderEverything } from "../render.js";

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

    onAuthStateChanged(auth, (user) => {

        loadingScreen.style.display = "none";

        if (user) {
                loadState();
                showDashboard();
                renderEverything();
        } else {
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
