import { charts } from '../state/charts.js';
import { expandInvestments, expandExpenses, expandIncome } from '../services/recurring.js';
import { getWeekRange, getMonthRange, getYearRange } from '../services/dates.js';
import { INVESTMENT_CATEGORIES, INVESTMENT_COLORS } from '../utils/constants.js';
import { state, dash } from '../state/state.js';

export function renderTrend() {
  const lineCtx = document.getElementById('line-chart').getContext('2d');
  if (charts.line) charts.line.destroy();
  let labels = [], incomeData = [], expenseData = [];
  if (dash.trend === 'weekly') {
    for (let i = -7; i <= 0; i++) {
      const r = getWeekRange(i);
      labels.push(r.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      incomeData.push(expandIncome(r.start, r.end).reduce((s, x) => s + x.amount, 0));
      expenseData.push(expandExpenses(r.start, r.end).reduce((s, x) => s + x.amount, 0));
    }
  } else {
    for (let i = -11; i <= 0; i++) {
      const r = getMonthRange(i);
      labels.push(r.start.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }));
      incomeData.push(expandIncome(r.start, r.end).reduce((s, x) => s + x.amount, 0));
      expenseData.push(expandExpenses(r.start, r.end).reduce((s, x) => s + x.amount, 0));
    }
  }
  charts.line = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels, datasets: [
        { label: 'Income', data: incomeData, borderColor: '#2F6F4E', backgroundColor: 'rgba(47,111,78,0.08)', tension: 0.3, fill: true, pointRadius: 3 },
        { label: 'Expenses', data: expenseData, borderColor: '#A63A32', backgroundColor: 'rgba(166,58,50,0.08)', tension: 0.3, fill: true, pointRadius: 3 }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { family: 'IBM Plex Sans' }, color: '#4B5750', boxWidth: 12 } } },
      scales: {
        x: { ticks: { color: '#4B5750', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#4B5750', font: { family: 'IBM Plex Mono', size: 10 }, callback: v => '₺' + v.toLocaleString('tr-TR') }, grid: { color: '#DCD3B6' } }
      }
    }
  });
}

export function renderInvestments() {
  const barCtx = document.getElementById('bar-chart').getContext('2d');
  if (charts.bar) charts.bar.destroy();
  let labels = [], ranges = [];

  if (dash.investTrend === 'weekly') {
    for (let i = -7; i <= 0; i++) {
      const r = getWeekRange(i);
      labels.push(r.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      ranges.push(r);
    }
  } else if (dash.investTrend === 'monthly') {
    for (let i = -11; i <= 0; i++) {
      const r = getMonthRange(i);
      labels.push(r.start.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }));
      ranges.push(r);
    }
  } else {
    for (let i = -3; i <= 0; i++) {
      const r = getYearRange(i);
      labels.push(r.start.toLocaleDateString('en-GB', { year: 'numeric' }));
      ranges.push(r);
    }
  }

  // One dataset per category, stacked — each period's bar shows its category breakdown.
  const datasets = INVESTMENT_CATEGORIES.map(cat => ({
    label: cat,
    data: ranges.map(r =>
      expandInvestments(r.start, r.end)
        .filter(x => x.category === cat)
        .reduce((sum, x) => sum + x.amount, 0)),
    backgroundColor: INVESTMENT_COLORS[cat] || '#8A8270',
    borderRadius: 4
  }));

  charts.bar = new Chart(barCtx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { font: { family: 'IBM Plex Sans' }, color: '#4B5750', boxWidth: 12 } } },
      scales: {
        x: { stacked: true, ticks: { color: '#4B5750', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { display: false } },
        y: { stacked: true, ticks: { color: '#4B5750', font: { family: 'IBM Plex Mono', size: 10 }, callback: v => '₺' + v.toLocaleString('tr-TR') }, grid: { color: '#DCD3B6' } }
      }
    }
  });
}
