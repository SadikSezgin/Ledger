import { renderDashboard } from "./ui/dashboard.js";
import { renderCards } from "./ui/cards.js";
import { renderInstallments } from "./ui/installments.js";
import { renderBudgetsPage } from "./ui/budgets.js";
import { renderList } from "./ui/transactions.js";
import { populateCardSelects } from "./ui/cards.js";

// ---------- master render ----------
export function renderEverything() {
  renderList('inc-list', 'income');
  renderList('pur-list', 'purchase');
  renderInstallments();
  renderList('hh-list', 'household');
  renderList('inv-list', 'investment');
  renderBudgetsPage();
  renderDashboard();
  renderCards();
  populateCardSelects();
}


