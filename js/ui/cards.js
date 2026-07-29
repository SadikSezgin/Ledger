import { state } from "../data.js";
import { uid } from "../utils.js";

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