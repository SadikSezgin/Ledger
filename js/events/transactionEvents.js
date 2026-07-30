import { addTransaction } from "../services/transactionServices.js";
import { showNotification } from "../ui/notifications.js";
import { refresh } from "../render.js";
import { uid, todayStr } from "../utils/helpers.js";
import {
    clearIncomeForm,
    clearPurchaseForm,
    clearInstallmentForm,
    clearHouseholdForm,
    clearInvestmentForm
} from "../utils/formHelpers.js";

const $ = (id) => document.getElementById(id);

$("inc-add").addEventListener("click", () => {

    const name = $("inc-name").value.trim();
    const amount = Number($("inc-amount").value);
    const date = $("inc-date").value || todayStr();
    const category = $("inc-category").value;
    const recurring = $("inc-recurring").checked;

    if (!name || !amount) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please enter a source name and amount."
        });
    }

    addTransaction({
        id: uid(),
        kind: "income",
        name,
        category,
        amount,
        date,
        recurring
    });

    refresh();
    clearIncomeForm();

});

$("pur-add").addEventListener("click", () => {

    const name = $("pur-name").value.trim();
    const amount = Number($("pur-amount").value);
    const date = $("pur-date").value || todayStr();
    const category = $("pur-category").value;
    const paymentMethod = $("pur-payment").value;
    const cardId = $("pur-card").value;

    if (!name || !amount) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please enter item name and amount."
        });
    }

    addTransaction({
        id: uid(),
        kind: "purchase",
        name,
        category,
        amount,
        date,
        paymentMethod,
        cardId
    });

    refresh();
    clearPurchaseForm();

});


$("ins-add").addEventListener("click", () => {

    const name = $("ins-name").value.trim();
    const totalAmount = Number($("ins-total").value);
    const count = Math.max(1, Number($("ins-count").value) || 1);
    const startDate = $("ins-date").value || todayStr();
    const category = $("ins-category").value;
    const cardId = $("ins-card").value;

    if (!name || !totalAmount) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please enter an item name and total amount."
        });
    }

    addTransaction({
        id: uid(),
        kind: "installment",
        name,
        category,
        totalAmount,
        count,
        startDate,
        cardId
    });

    refresh();
    clearInstallmentForm();

});


$("hh-add").addEventListener("click", () => {

    const name = $("hh-name").value.trim();
    const amount = Number($("hh-amount").value);
    const date = $("hh-date").value || todayStr();
    const category = $("hh-category").value;
    const recurring = $("hh-recurring").checked;

    if (!name || !amount) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please enter a name and amount."
        });
    }

    addTransaction({
        id: uid(),
        kind: "household",
        name,
        category,
        amount,
        date,
        recurring
    });

    refresh();
    clearHouseholdForm();

});


$("inv-add").addEventListener("click", () => {

    const name = $("inv-name").value.trim();
    const amount = Number($("inv-amount").value);
    const date = $("inv-date").value || todayStr();
    const category = $("inv-category").value;
    const location = $("inv-location").value;
    const recurring = $("inv-recurring").checked;

    if (!name || !amount) {
        return showNotification({
            type: "warning",
            title: "Missing Information",
            message: "Please enter a source name and amount."
        });
    }

    addTransaction({
        id: uid(),
        kind: "investment",
        name,
        category,
        location,
        amount,
        date,
        recurring
    });

    refresh();
    clearInvestmentForm();

});

