import { state } from "../state/state.js";
import { uid, formatCardDate } from "../utils/helpers.js";
import { calculateDueDate } from "../services/dates.js";
import { saveState } from "../storage/localStorage.js";
import { renderEverything } from "../render.js";
import { fmt } from "../utils/helpers.js";


export function populateCardSelects() {

    const selects = [
        document.getElementById("pur-card"),
        document.getElementById("ins-card")
    ];

    selects.forEach(select => {

        if (!select) return;

        select.replaceChildren();

        state.cards.forEach(card => {

            const option = document.createElement("option");

            option.value = card.id;

            option.textContent = card.name;

            select.appendChild(option);

        });

    });

}

export function addCard(card) {
    state.cards.push({
        id: uid(),
        name: card.name,
        bank: card.bank,
        statementDay: Number(card.statementDay),
        graceDays: Number(card.graceDays || 10),
        creditLimit: Number(card.creditLimit || 0)
    });
}

export function deleteCard(id) {
    state.cards = state.cards.filter(c => c.id !== id);
}

export function updateCard(updated) {

    const card = state.cards.find(c => c.id === updated.id);

    if (index !== -1) {
        state.cards.splice(index, 1);
    }

    card.name = updated.name;
    card.bank = updated.bank;
    card.statementDay = Number(updated.statementDay);
    card.graceDays = Number(updated.graceDays);
    card.creditLimit = Number(updated.creditLimit);
}

export function renderCards() {
  const container = document.getElementById("card-list");

  if (state.cards.length === 0) {

    container.innerHTML =
      `<div class="empty">
            No cards added.
        </div>`;

    return;

  }

  container.innerHTML =
    state.cards.map(card => {

      const due = calculateDueDate(
        card.statementDay,
        card.graceDays
      );

      return `

        <div class="ledger-row">

            <span class="name">

                <strong>${card.name}</strong>

                <br>

                <span style="font-size:11px;color:var(--ink-soft);">

                    ${card.bank}

                    · Statement ${card.statementDay}

                    · Due ${formatCardDate(due)}

                </span>

            </span>

            <span class="leader"></span>

            <span class="amt">

                ${card.creditLimit > 0
          ? fmt(card.creditLimit)
          : "-"
        }

            </span>

            <button
                class="del"
                data-card="${card.id}">
                ✕
            </button>

        </div>

        `;

    }).join("");

  container
    .querySelectorAll("[data-card]")
    .forEach(btn => {

      btn.onclick = () => {
        deleteCard(btn.dataset.card);
        saveState();
        renderEverything();
      };
    });

}
