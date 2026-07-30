import { addCard } from "../ui/cards.js";
import { showNotification } from "../ui/notifications.js";
import { refresh } from "../render.js";
import { clearCardForm } from "../utils/formHelpers.js";

const $ = (id) => document.getElementById(id);

$("card-add").addEventListener("click", () => {

    const name = $("card-name").value.trim();
    const bank = $("card-bank").value.trim();
    const statementDay = Number($("card-statement").value);
    const graceDays = Number($("card-grace").value);
    const creditLimit = Number($("card-limit").value);

    if (!name || !bank || !statementDay) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please complete all required fields."
        });
    }

    addCard({
        name,
        bank,
        statementDay,
        graceDays,
        creditLimit
    });

    refresh();
    clearCardForm();

});
