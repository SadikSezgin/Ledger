import { login } from "./auth.js";
import { showNotification } from "../ui/notifications.js";

const loginButton = document.getElementById("login-btn");

loginButton?.addEventListener("click", handleLogin);

async function handleLogin() {

    const email = document
        .getElementById("login-email")
        .value
        .trim();

    const password = document
        .getElementById("login-password")
        .value;

    // Validation
    if (!email) {
        showNotification({
            type: "warning",
            title: "Email Required",
            message: "Please enter your email address."
        });
        return;
    }

    if (!isValidEmail(email)) {
        showNotification({
            type: "warning",
            title: "Invalid Email",
            message: "Please enter a valid email address."
        });
        return;
    }

    if (!password) {
        showNotification({
            type: "warning",
            title: "Password Required",
            message: "Please enter your password."
        });
        return;
    }

    try {

        await login(email, password);

        showNotification({
            type: "success",
            title: "Welcome",
            message: "You have successfully signed in."
        });

    } catch (error) {

        showLoginError(error);

    }

}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function showLoginError(error) {

    switch (error.code) {

        case "auth/invalid-email":
            showNotification({
                type: "error",
                title: "Invalid Email",
                message: "Please enter a valid email address."
            });
            break;

        case "auth/invalid-credential":
            showNotification({
                type: "error",
                title: "Login Failed",
                message: "Incorrect email or password."
            });
            break;

        case "auth/user-disabled":
            showNotification({
                type: "error",
                title: "Account Disabled",
                message: "This account has been disabled."
            });
            break;

        case "auth/too-many-requests":
            showNotification({
                type: "warning",
                title: "Too Many Attempts",
                message: "Please try again in a few minutes."
            });
            break;

        case "auth/network-request-failed":
            showNotification({
                type: "error",
                title: "Network Error",
                message: "Please check your internet connection."
            });
            break;

        default:
            showNotification({
                type: "error",
                title: "Unexpected Error",
                message: error.message
            });
            break;

    }

}