import { state, dash } from "./state/state.js";

import { uid, todayStr } from "./utils/helpers.js";

import { addCard } from "./ui/cards.js";

import { saveState } from "./storage/localStorage.js";

import { renderEverything } from "./render.js";

import { renderDashboard } from "./ui/dashboard.js";

import {
    renderTrend,
    renderInvestments
} from "./ui/charts.js";

const $ = (id) => document.getElementById(id);

export function refresh() {
    renderEverything();
    saveState();
}

// ----------------------------------------------------
// Navigation
// ----------------------------------------------------

document.querySelectorAll(".tab-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn")
            .forEach(b => b.classList.remove("active"));

        document.querySelectorAll(".page")
            .forEach(p => p.classList.remove("active"));

        btn.classList.add("active");

        $("page-" + btn.dataset.tab)
            .classList.add("active");

        if (btn.dataset.tab === "dashboard") {
            renderDashboard();
        }

    });

});

// ----------------------------------------------------
// Dashboard Controls
// ----------------------------------------------------

$("period-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#period-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.periodType = e.target.dataset.period;
    dash.offset = 0;

    renderDashboard();

});

$("period-prev").addEventListener("click", () => {
    dash.offset--;
    renderDashboard();
});

$("period-next").addEventListener("click", () => {
    dash.offset++;
    renderDashboard();
});

$("trend-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#trend-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.trend = e.target.dataset.trend;

    renderTrend();

});

$("invest-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#invest-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.investTrend = e.target.dataset.trend;

    renderInvestments();

});

// ----------------------------------------------------
// Income
// ----------------------------------------------------

$("inc-add").addEventListener("click", () => {

    const name = $("inc-name").value.trim();
    const amount = Number($("inc-amount").value);
    const date = $("inc-date").value || todayStr();
    const category = $("inc-category").value;
    const recurring = $("inc-recurring").checked;

    if (!name || !amount) {
        alert("Add a source name and amount.");
        return;
    }

    state.transactions.push({
        id: uid(),
        kind: "income",
        name,
        category,
        amount,
        date,
        recurring
    });

    refresh();

    $("inc-name").value = "";
    $("inc-amount").value = "";
    $("inc-recurring").checked = false;

});

// ----------------------------------------------------
// Purchases
// ----------------------------------------------------

$("pur-add").addEventListener("click", () => {

    const name = $("pur-name").value.trim();
    const amount = Number($("pur-amount").value);
    const date = $("pur-date").value || todayStr();
    const category = $("pur-category").value;
    const paymentMethod = $("pur-payment").value;
    const cardId = $("pur-card").value;

    if (!name || !amount) {
        alert("Add an item name and amount.");
        return;
    }

    state.transactions.push({
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

    $("pur-name").value = "";
    $("pur-amount").value = "";

});

// ----------------------------------------------------
// Installments
// ----------------------------------------------------

$("ins-add").addEventListener("click", () => {

    const name = $("ins-name").value.trim();
    const totalAmount = Number($("ins-total").value);
    const count = Math.max(1, Number($("ins-count").value) || 1);
    const startDate = $("ins-date").value || todayStr();
    const category = $("ins-category").value;
    const cardId = $("ins-card").value;

    if (!name || !totalAmount) {
        alert("Add an item name and total amount.");
        return;
    }

    state.transactions.push({
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

    $("ins-name").value = "";
    $("ins-total").value = "";
    $("ins-count").value = "1";

});

// ----------------------------------------------------
// Household
// ----------------------------------------------------

$("hh-add").addEventListener("click", () => {

    const name = $("hh-name").value.trim();
    const amount = Number($("hh-amount").value);
    const date = $("hh-date").value || todayStr();
    const category = $("hh-category").value;
    const recurring = $("hh-recurring").checked;

    if (!name || !amount) {
        alert("Add a name and amount.");
        return;
    }

    state.transactions.push({
        id: uid(),
        kind: "household",
        name,
        category,
        amount,
        date,
        recurring
    });

    refresh();

    $("hh-name").value = "";
    $("hh-amount").value = "";

});

// ----------------------------------------------------
// Investments
// ----------------------------------------------------

$("inv-add").addEventListener("click", () => {

    const name = $("inv-name").value.trim();
    const amount = Number($("inv-amount").value);
    const date = $("inv-date").value || todayStr();
    const category = $("inv-category").value;
    const location = $("inv-location").value;
    const recurring = $("inv-recurring").checked;

    if (!name || !amount) {
        alert("Add a source name and amount.");
        return;
    }

    state.transactions.push({
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

    $("inv-name").value = "";
    $("inv-amount").value = "";
    $("inv-recurring").checked = false;

});

// ----------------------------------------------------
// Cards
// ----------------------------------------------------

$("card-add").addEventListener("click", () => {

    const name = $("card-name").value.trim();
    const bank = $("card-bank").value.trim();
    const statementDay = Number($("card-statement").value);
    const graceDays = Number($("card-grace").value);
    const creditLimit = Number($("card-limit").value);

    if (!name || !bank || !statementDay) {
        alert("Please complete all required fields.");
        return;
    }

    addCard({
        name,
        bank,
        statementDay,
        graceDays,
        creditLimit
    });

    refresh();

    $("card-name").value = "";
    $("card-bank").value = "";
    $("card-limit").value = "";
    $("card-statement").value = "";
    $("card-grace").value = "10";

});

// ----------------------------------------------------
// Reset
// ----------------------------------------------------

$("reset-btn").addEventListener("click", () => {

    if (!confirm("This will permanently delete all your entries and budgets. Continue?")) {
        return;
    }

    state.transactions = [];
    state.budgets = {};
    state.cards = [];

    refresh();

});

// ----------------------------------------------------
// Misc
// ----------------------------------------------------

document.addEventListener("change", e => {

    if (e.target.id !== "pur-payment") return;

    $("pur-card-field").style.display =
        e.target.value === "card"
            ? ""
            : "none";

});