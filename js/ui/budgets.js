import { state } from "../state/state.js";
import { CATEGORIES } from "../utils/constants.js";
import { getMonthRange } from "../services/dates.js";
import { fmt } from "../utils/helpers.js";
import { saveState } from "../storage/localStorage.js";
import { renderDashboardBudgets } from "./dashboard.js";
import { sumBy } from "../utils/helpers.js";
import { expandExpenses } from "../services/recurring.js";


export function renderBudgetForm() {
  const el = document.getElementById('budget-form');
  el.innerHTML = CATEGORIES.map(c => `
    <div class="budget-input-row">
      <span class="cat">${c}</span>
      <input type="number" min="0" placeholder="0" data-cat="${c}" value="${state.budgets[c] || ''}">
    </div>`).join('') + `<button class="btn" id="budget-save">Save budgets</button>`;
  document.getElementById('budget-save').addEventListener('click', () => {
    el.querySelectorAll('input').forEach(inp => {
      const v = Number(inp.value) || 0;
      if (v > 0) state.budgets[inp.dataset.cat] = v; else delete state.budgets[inp.dataset.cat];
    });
    saveState(); 
    renderBudgetsPage();
    renderDashboardBudgets();
  });
}

export function renderBudgetProgress() {
  const r = getMonthRange(0);
  const byCat = sumBy(expandExpenses(r.start, r.end), i => i.category);
  const withBudget = CATEGORIES.filter(c => state.budgets[c] > 0);
  const el = document.getElementById('budget-progress');
  if (withBudget.length === 0) { el.innerHTML = `<div class="empty">Set a budget to see progress here.</div>`; return; }
  el.innerHTML = withBudget.map(c => {
    const spent = byCat[c] || 0, budget = state.budgets[c];
    const pct = Math.min(100, Math.round((spent / budget) * 100));
    const remaining = budget - spent;
    return `<div class="budget-row">
      <div class="top"><span class="cat">${c}</span><span class="nums">${fmt(spent)} / ${fmt(budget)}</span></div>
      <div class="bar-track"><div class="bar-fill ${spent > budget ? 'over' : ''}" style="width:${pct}%"></div></div>
      <div style="font-size:11.5px;color:${remaining < 0 ? 'var(--rust)' : 'var(--ink-soft)'};margin-top:4px;">
        ${remaining < 0 ? 'Over by ' + fmt(Math.abs(remaining)) : fmt(remaining) + ' remaining'}
      </div>
    </div>`;
  }).join('');
}

export function renderBudgetsPage() { 
    renderBudgetForm(); 
    renderBudgetProgress(); 
}
