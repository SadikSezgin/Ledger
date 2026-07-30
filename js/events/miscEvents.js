import { state } from "../state/state.js";
import { refresh } from "../render.js";

const $ = (id) => document.getElementById(id);

$("reset-btn").addEventListener("click", () => {

    if (!confirm("This will permanently delete all your entries and budgets. Continue?")) {
        return;
    }

    state.transactions = [];
    state.budgets = {};
    state.cards = [];

    refresh();

});

document.addEventListener("change", e => {

    if (e.target.id !== "pur-payment") return;

    $("pur-card-field").style.display =
        e.target.value === "card"
            ? ""
            : "none";

});
