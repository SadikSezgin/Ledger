import { resetPassword } from "./auth.js";
import { showNotification } from "../ui/notifications.js";

const resetButton = document.getElementById("reset-password-btn");

resetButton?.addEventListener("click", handlePasswordReset);

async function handlePasswordReset() {

    const email = document
        .getElementById("reset-email")
        .value
        .trim();

    if (!email) {
        return showNotification({
            type: "warning",
            title: "Email Required",
            message: "Please enter your email address."
        });
    }

    if (!isValidEmail(email)) {
        return showNotification({
            type: "warning",
            title: "Invalid Email",
            message: "Please enter a valid email address."
        });
    }

    try {

        await resetPassword(email);

        showNotification({
            type: "success",
            title: "Reset Email Sent",
            message: "If an account exists for this email, a password reset link has been sent."
        });

        document.getElementById("reset-email").value = "";

    } catch (error) {

        showResetError(error);

    }

}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function showResetError(error) {

    switch (error.code) {

        case "auth/invalid-email":
            showNotification({
                type: "error",
                title: "Invalid Email",
                message: "Please enter a valid email address."
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
                title: "Reset Failed",
                message: error.message
            });
            break;

    }

}