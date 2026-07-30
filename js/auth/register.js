import { register } from "./auth.js";
import { showNotification } from "../ui/notifications.js";

const registerButton = document.getElementById("register-btn");
registerButton?.addEventListener("click", () => {
    handleRegister();
});
async function handleRegister() {

    const email = document
        .getElementById("register-email")
        .value
        .trim();

    const password = document
        .getElementById("register-password")
        .value;

    const confirmPassword = document
        .getElementById("register-confirm-password")
        .value;

    // Validation
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

    if (!password) {
        return showNotification({
            type: "warning",
            title: "Password Required",
            message: "Please enter a password."
        });
    }

    if (password.length < 6) {
        return showNotification({
            type: "warning",
            title: "Weak Password",
            message: "Password must be at least 6 characters long."
        });
    }
document.querySelector("#notification-container")
    if (!confirmPassword) {
        return showNotification({
            type: "warning",
            title: "Confirm Password",
            message: "Please confirm your password."
        });
    }

    if (password !== confirmPassword) {
        return showNotification({
            type: "warning",
            title: "Passwords Don't Match",
            message: "Please make sure both passwords are identical."
        });
    }

    try {

        await register(email, password);

        showNotification({
            type: "success",
            title: "Account Created",
            message: "Your account has been created successfully."
        });

        // Redirect after successful registration
        window.location.href = "/";

    } catch (error) {

       console.error(error);

        showRegisterError(error);

    }

}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function showRegisterError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            showNotification({
                type: "error",
                title: "Email Already Registered",
                message: "An account with this email already exists."
            });
            break;

        case "auth/invalid-email":
            showNotification({
                type: "error",
                title: "Invalid Email",
                message: "Please enter a valid email address."
            });
            break;

        case "auth/weak-password":
            showNotification({
                type: "error",
                title: "Weak Password",
                message: "Choose a stronger password."
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
                title: "Registration Failed",
                message: error.message
            });
            break;

    }

}