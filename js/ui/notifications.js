let container;

/**
 * Displays a notification.
 *
 * @param {Object} options
 * @param {"success"|"error"|"warning"|"info"} options.type
 * @param {string} options.title
 * @param {string} options.message
 * @param {number} [options.duration=4000]
 */
export function showNotification({
    type = "info",
    title = "",
    message = "",
    duration = 4000
}) {

    createContainer();

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>

            <button class="notification-close" aria-label="Close">
                &times;
            </button>
        </div>

        <div class="notification-message">
            ${message}
        </div>
    `;

    notification
        .querySelector(".notification-close")
        .addEventListener("click", () => removeNotification(notification));

    container.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add("show");
    });

    setTimeout(() => {
        removeNotification(notification);
    }, duration);

}

function removeNotification(notification) {

    notification.classList.remove("show");

    setTimeout(() => {
        notification.remove();
    }, 250);

}

function createContainer() {

    if (container) return;

    container = document.getElementById("notification-container");

    if (container) return;

    container = document.createElement("div");
    container.id = "notification-container";

    document.body.appendChild(container);

}