import { state, dash } from "../state/state.js";
import { currentRange, periodLabel, getMonthRange } from "../services/dates.js";
import { expandExpenses, expandIncome } from "../services/recurring.js";
import { fmt, sumBy } from "../utils/helpers.js";
import { CATEGORY_COLORS, CATEGORIES } from "../utils/constants.js";
import { showToast } from "../storage/localStorage.js";
import { charts } from "../state/charts.js";
import { renderTrend, renderInvestments } from "./charts.js";

export function renderDashboard() {
  const { start, end } = currentRange();
  document.getElementById('period-label').textContent = periodLabel();

  const incomeList = expandIncome(start, end);
  const expenseList = expandExpenses(start, end);
  const totalIncome = incomeList.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseList.reduce((s, i) => s + i.amount, 0);
  document.getElementById('stat-income').textContent = fmt(totalIncome);
  document.getElementById('stat-expense').textContent = fmt(totalExpense);
  document.getElementById('stat-net').textContent = (totalIncome - totalExpense >= 0 ? '+' : '−') + fmt(Math.abs(totalIncome - totalExpense));

  // pie
  const byCat = sumBy(expenseList, i => i.category);
  const cats = Object.keys(byCat);
  if (charts.pie) { try { charts.pie.destroy(); } catch (e) { } }
  if (cats.length === 0) {
    document.getElementById('pie-legend').innerHTML = `<div class="empty">No expenses in this period.</div>`;
  } else {
    const sorted = [...cats].sort((a, b) => byCat[b] - byCat[a]);
    // Legend is built from data directly, independent of whether the chart library loaded —
    // so a Chart.js failure never hides your numbers, only the drawn circle.
    document.getElementById('pie-legend').innerHTML = sorted.map(c => `
      <div class="ledger-row">
        <span class="swatch" style="background:${CATEGORY_COLORS[c] || '#8A8270'}"></span>
        <span class="name">${c}</span>
        <span class="leader"></span>
        <span class="amt neg">${fmt(byCat[c])}</span>
      </div>`).join('');
    try {
      const pieCtx = document.getElementById('pie-chart').getContext('2d');
      charts.pie = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: cats, datasets: [{ data: cats.map(c => byCat[c]), backgroundColor: cats.map(c => CATEGORY_COLORS[c] || '#8A8270'), borderColor: '#F8F4E9', borderWidth: 2 }] },
        options: { plugins: { legend: { display: false } }, cutout: '62%', maintainAspectRatio: false }
      });
    } catch (e) {
      console.error('Pie chart failed to render', e);
      showToast('Chart failed to draw, but your data is safe.', true);
    }
  }

  try { renderTrend(); } catch (e) { console.error('Trend chart failed', e); }
  try { renderInvestments(); } catch (e) { console.error('Investment chart failed', e); }
  try { renderDashboardBudgets(); } catch (e) { console.error('Budget summary failed', e); }
}

export function renderDashboardBudgets() {
  const r = getMonthRange(0);
  const byCat = sumBy(expandExpenses(r.start, r.end), i => i.category);
  const withBudget = CATEGORIES.filter(c => state.budgets[c] > 0);
  const el = document.getElementById('dash-budgets');
  if (withBudget.length === 0) { el.innerHTML = `<div class="empty">No budgets set yet. Head to the Budgets tab.</div>`; return; }
  el.innerHTML = withBudget.map(c => {
    const spent = byCat[c] || 0, budget = state.budgets[c];
    const pct = Math.min(100, Math.round((spent / budget) * 100));
    return `<div class="budget-row">
      <div class="top"><span class="cat">${c}</span><span class="nums">${fmt(spent)} / ${fmt(budget)}</span></div>
      <div class="bar-track"><div class="bar-fill ${spent > budget ? 'over' : ''}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}
