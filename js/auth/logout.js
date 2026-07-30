import { logout } from "./auth.js";
import { showNotification } from "../ui/notifications.js";

const logoutButton = document.getElementById("logout-btn");

logoutButton?.addEventListener("click", handleLogout);

async function handleLogout() {

    try {

        await logout();

        showNotification({
            type: "success",
            title: "Signed Out",
            message: "You have been successfully signed out."
        });

    } catch (error) {

        showNotification({
            type: "error",
            title: "Logout Failed",
            message: error.message
        });

    }

}