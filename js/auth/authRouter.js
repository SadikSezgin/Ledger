const pages = [
    "login-page",
    "register-page",
    "reset-password-page",
    "verify-email-page",
    "onboarding-page"
];

export function showAuthPage(pageId) {

    pages.forEach(id => {

        const page = document.getElementById(id);

        if (page) {
            page.style.display = id === pageId ? "" : "none";
        }

    });

}