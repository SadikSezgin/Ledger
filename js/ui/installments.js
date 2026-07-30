import { state } from "../state/state.js";
import { isLastDayOfMonth, addMonthsClamped } from "../services/dates.js";
import { ledgerRow } from "./transactions.js";
import { saveState } from "../storage/localStorage.js";
import { renderEverything } from "../render.js";


export function renderInstallments() {
    const el = document.getElementById("ins-list");

    const items = state.transactions
        .filter(t => t.kind === "installment")
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    if (items.length === 0) {
        el.innerHTML = `<div class="empty">No active installment plans.</div>`;
        return;
    }

    const today = new Date();

    el.innerHTML = items.map(t => {

        const start = new Date(t.startDate);
        const startIsLastDay = isLastDayOfMonth(start);

        let paid = 0;

        for (let i = 0; i < t.count; i++) {
            const d = addMonthsClamped(start, i, startIsLastDay);
            if (d <= today) paid++;
        }

        const pct = Math.round((paid / t.count) * 100);

        return `
        <div class="installment-item">

            ${ledgerRow(t)}

            <div class="bar-track">
                <div class="bar-fill" style="width:${pct}%"></div>
            </div>

            <div class="installment-progress">
                ${paid} of ${t.count} paid
            </div>

        </div>
        `;

    }).join("");

    el.querySelectorAll(".del").forEach(btn => {
        btn.onclick = () => {

            const index = state.transactions.findIndex(
                t => t.id === btn.dataset.id
            );

            if (index !== -1) {
                state.transactions.splice(index, 1);
            }

            saveState();
            renderEverything();
        };
    });
}
