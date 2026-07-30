import { showAuthPage } from "../auth/authRouter.js";

document.getElementById("go-register") ?.addEventListener("click", () => {

        showAuthPage("register-page");

    });

document .getElementById("go-reset")?.addEventListener("click", () => {
        showAuthPage("reset-password-page");
    });

document.getElementById("back-login-from-register")?.addEventListener("click", () => {

        showAuthPage("login-page");

    });

document.getElementById("back-login-from-reset")?.addEventListener("click", () => {

        showAuthPage("login-page");

    });