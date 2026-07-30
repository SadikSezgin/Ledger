import { state } from "../state/state.js";
import { CATEGORY_COLORS} from "../utils/constants.js";
import { fmt } from "../utils/helpers.js";
import { saveState } from "../storage/localStorage.js";
import { renderEverything } from "../render.js";

export function ledgerRow(t) {
  const isInvestment = t.kind === 'investment';
  const color = isInvestment ? (INVESTMENT_COLORS[t.category] || '#3C6E8F') : (CATEGORY_COLORS[t.category] || '#8A8270');
  const amt = t.kind === 'income' ? Number(t.amount) : (t.kind === 'installment' ? Number(t.totalAmount) : Number(t.amount));
  const isIncome = t.kind === 'income';
  const sub = t.kind === 'installment'
    ? `${t.category} · ₺${Math.round(t.totalAmount / t.count).toLocaleString('tr-TR')}/mo × ${t.count}`
    : isInvestment
      ? `${t.category} · ${t.location}${t.recurring ? ' · monthly' : ''} · ${t.date}`
      : `${t.category}${t.recurring ? ' · monthly' : ''} · ${t.date}`;
  const amtClass = isIncome ? 'pos' : (isInvestment ? 'inv' : 'neg');
  const sign = isIncome ? '+' : (isInvestment ? '↗' : '−');
  return `
    <div class="ledger-row">
      <span class="swatch" style="background:${color}"></span>
      <span class="name" title="${t.name}">${t.name}<br><span style="font-size:11px;color:var(--ink-soft);font-weight:400;">${sub}</span></span>
      <span class="leader"></span>
      <span class="amt ${amtClass}">${sign}${fmt(amt)}</span>
      <button class="del" data-id="${t.id}" title="Delete">✕</button>
    </div>`;
}

export function renderList(containerId, kind) {
  const el = document.getElementById(containerId);
  const items = state.transactions.filter(t => t.kind === kind).sort((a, b) => new Date(b.date || b.startDate) - new Date(a.date || a.startDate));
  if (items.length === 0) { el.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
  el.innerHTML = items.map(t => ledgerRow(t)).join('');
  el.querySelectorAll('.del').forEach(btn => {
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
