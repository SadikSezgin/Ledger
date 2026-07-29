import {
    expandIncome,
    expandExpenses,
    expandInvestments
} from "./recurring.js";

import {
    state,
    dash,
    charts,
    CATEGORIES,
    CATEGORY_COLORS,
    INVESTMENT_CATEGORIES,
    INVESTMENT_COLORS
} from "./data.js";

import {
    populateCardSelects,
    deleteCard,
} from "./cards.js";

import {
    saveState,
    showToast
} from "./storage.js";

import {
    fmt,
    sumBy,

    currentRange,
    periodLabel,

    getWeekRange,
    getMonthRange,
    getYearRange,

    calculateDueDate,
    formatCardDate,

    isLastDayOfMonth,
    addMonthsClamped
} from "./utils.js";

// ---------- rendering: lists ----------
export function ledgerRow(t){
  const isInvestment = t.kind==='investment';
  const color = isInvestment ? (INVESTMENT_COLORS[t.category] || '#3C6E8F') : (CATEGORY_COLORS[t.category] || '#8A8270');
  const amt = t.kind==='income' ? Number(t.amount) : (t.kind==='installment' ? Number(t.totalAmount) : Number(t.amount));
  const isIncome = t.kind==='income';
  const sub = t.kind==='installment'
    ? `${t.category} · ₺${Math.round(t.totalAmount/t.count).toLocaleString('tr-TR')}/mo × ${t.count}`
    : isInvestment
    ? `${t.category} · ${t.location}${t.recurring? ' · monthly':''} · ${t.date}`
    : `${t.category}${t.recurring? ' · monthly':''} · ${t.date}`;
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

export function renderList(containerId, kind){
  const el = document.getElementById(containerId);
  const items = state.transactions.filter(t=>t.kind===kind).sort((a,b)=> new Date(b.date||b.startDate) - new Date(a.date||a.startDate));
  if(items.length===0){ el.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
  el.innerHTML = items.map(t=>ledgerRow(t)).join('');
  el.querySelectorAll('.del').forEach(btn=>{
    btn.onclick = ()=>{
    deleteTransaction(btn.dataset.id);
    };
  });
}

// ---------- rendering: dashboard ----------
export function renderDashboard(){
  const {start,end} = currentRange();
  document.getElementById('period-label').textContent = periodLabel();

  const incomeList = expandIncome(start,end);
  const expenseList = expandExpenses(start,end);
  const totalIncome = incomeList.reduce((s,i)=>s+i.amount,0);
  const totalExpense = expenseList.reduce((s,i)=>s+i.amount,0);
  document.getElementById('stat-income').textContent = fmt(totalIncome);
  document.getElementById('stat-expense').textContent = fmt(totalExpense);
  document.getElementById('stat-net').textContent = (totalIncome-totalExpense>=0?'+':'−')+fmt(Math.abs(totalIncome-totalExpense));

  // pie
  const byCat = sumBy(expenseList, i=>i.category);
  const cats = Object.keys(byCat);
  if(charts.pie){ try{ charts.pie.destroy(); }catch(e){} }
  if(cats.length===0){
    document.getElementById('pie-legend').innerHTML = `<div class="empty">No expenses in this period.</div>`;
  } else {
    const sorted = [...cats].sort((a,b)=>byCat[b]-byCat[a]);
    // Legend is built from data directly, independent of whether the chart library loaded —
    // so a Chart.js failure never hides your numbers, only the drawn circle.
    document.getElementById('pie-legend').innerHTML = sorted.map(c=>`
      <div class="ledger-row">
        <span class="swatch" style="background:${CATEGORY_COLORS[c]||'#8A8270'}"></span>
        <span class="name">${c}</span>
        <span class="leader"></span>
        <span class="amt neg">${fmt(byCat[c])}</span>
      </div>`).join('');
    try{
      const pieCtx = document.getElementById('pie-chart').getContext('2d');
      charts.pie = new Chart(pieCtx, {
        type:'doughnut',
        data:{ labels:cats, datasets:[{ data:cats.map(c=>byCat[c]), backgroundColor:cats.map(c=>CATEGORY_COLORS[c]||'#8A8270'), borderColor:'#F8F4E9', borderWidth:2 }] },
        options:{ plugins:{ legend:{ display:false } }, cutout:'62%', maintainAspectRatio:false }
      });
    }catch(e){
      console.error('Pie chart failed to render', e);
      showToast('Chart failed to draw, but your data is safe.', true);
    }
  }

  try{ renderTrend(); }catch(e){ console.error('Trend chart failed', e); }
  try{ renderInvestments(); }catch(e){ console.error('Investment chart failed', e); }
  try{ renderDashboardBudgets(); }catch(e){ console.error('Budget summary failed', e); }
}

export function renderTrend(){
  const lineCtx = document.getElementById('line-chart').getContext('2d');
  if(charts.line) charts.line.destroy();
  let labels=[], incomeData=[], expenseData=[];
  if(dash.trend==='weekly'){
    for(let i=-7;i<=0;i++){
      const r = getWeekRange(i);
      labels.push(r.start.toLocaleDateString('en-GB',{day:'numeric',month:'short'}));
      incomeData.push(expandIncome(r.start,r.end).reduce((s,x)=>s+x.amount,0));
      expenseData.push(expandExpenses(r.start,r.end).reduce((s,x)=>s+x.amount,0));
    }
  } else {
    for(let i=-11;i<=0;i++){
      const r = getMonthRange(i);
      labels.push(r.start.toLocaleDateString('en-GB',{month:'short',year:'2-digit'}));
      incomeData.push(expandIncome(r.start,r.end).reduce((s,x)=>s+x.amount,0));
      expenseData.push(expandExpenses(r.start,r.end).reduce((s,x)=>s+x.amount,0));
    }
  }
  charts.line = new Chart(lineCtx, {
    type:'line',
    data:{ labels, datasets:[
      { label:'Income', data:incomeData, borderColor:'#2F6F4E', backgroundColor:'rgba(47,111,78,0.08)', tension:0.3, fill:true, pointRadius:3 },
      { label:'Expenses', data:expenseData, borderColor:'#A63A32', backgroundColor:'rgba(166,58,50,0.08)', tension:0.3, fill:true, pointRadius:3 }
    ]},
    options:{
      maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{ font:{family:'IBM Plex Sans'}, color:'#4B5750', boxWidth:12 } } },
      scales:{
        x:{ ticks:{ color:'#4B5750', font:{family:'IBM Plex Mono', size:10} }, grid:{ display:false } },
        y:{ ticks:{ color:'#4B5750', font:{family:'IBM Plex Mono', size:10}, callback:v=>'₺'+v.toLocaleString('tr-TR') }, grid:{ color:'#DCD3B6' } }
      }
    }
  });
}

export function renderInvestments(){
  const barCtx = document.getElementById('bar-chart').getContext('2d');
  if(charts.bar) charts.bar.destroy();
  let labels=[], ranges=[];

  if(dash.investTrend==='weekly'){
    for(let i=-7;i<=0;i++){
      const r = getWeekRange(i);
      labels.push(r.start.toLocaleDateString('en-GB',{day:'numeric',month:'short'}));
      ranges.push(r);
    }
  } else if (dash.investTrend==='monthly'){
    for(let i=-11;i<=0;i++){
      const r = getMonthRange(i);
      labels.push(r.start.toLocaleDateString('en-GB',{month:'short',year:'2-digit'}));
      ranges.push(r);
    }
  } else {
    for(let i=-3;i<=0;i++){
      const r = getYearRange(i);
      labels.push(r.start.toLocaleDateString('en-GB',{year:'numeric'}));
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
    type:'bar',
    data:{ labels, datasets },
    options:{
      maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{ font:{family:'IBM Plex Sans'}, color:'#4B5750', boxWidth:12 } } },
      scales:{
        x:{ stacked:true, ticks:{ color:'#4B5750', font:{family:'IBM Plex Mono', size:10} }, grid:{ display:false } },
        y:{ stacked:true, ticks:{ color:'#4B5750', font:{family:'IBM Plex Mono', size:10}, callback:v=>'₺'+v.toLocaleString('tr-TR') }, grid:{ color:'#DCD3B6' } }
      }
    }
  });
}

export function renderDashboardBudgets(){
  const r = getMonthRange(0);
  const byCat = sumBy(expandExpenses(r.start,r.end), i=>i.category);
  const withBudget = CATEGORIES.filter(c=>state.budgets[c] > 0);
  const el = document.getElementById('dash-budgets');
  if(withBudget.length===0){ el.innerHTML = `<div class="empty">No budgets set yet. Head to the Budgets tab.</div>`; return; }
  el.innerHTML = withBudget.map(c=>{
    const spent = byCat[c]||0, budget = state.budgets[c];
    const pct = Math.min(100, Math.round((spent/budget)*100));
    return `<div class="budget-row">
      <div class="top"><span class="cat">${c}</span><span class="nums">${fmt(spent)} / ${fmt(budget)}</span></div>
      <div class="bar-track"><div class="bar-fill ${spent>budget?'over':''}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

export function renderCards(){
    const container = document.getElementById("card-list");

    if(state.cards.length===0){

        container.innerHTML =
        `<div class="empty">
            No cards added.
        </div>`;

        return;

    }

    container.innerHTML =
    state.cards.map(card=>{

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

                ${card.creditLimit>0
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
        .forEach(btn=>{

            btn.onclick = () => {
            deleteCard(btn.dataset.card);
            saveState();
            renderEverything();
          };
        });

}

// ---------- rendering: budgets page ----------
export function renderBudgetForm(){
  const el = document.getElementById('budget-form');
  el.innerHTML = CATEGORIES.map(c=>`
    <div class="budget-input-row">
      <span class="cat">${c}</span>
      <input type="number" min="0" placeholder="0" data-cat="${c}" value="${state.budgets[c]||''}">
    </div>`).join('') + `<button class="btn" id="budget-save">Save budgets</button>`;
  document.getElementById('budget-save').addEventListener('click', ()=>{
    el.querySelectorAll('input').forEach(inp=>{
      const v = Number(inp.value)||0;
      if(v>0) state.budgets[inp.dataset.cat] = v; else delete state.budgets[inp.dataset.cat];
    });
    saveState(); renderBudgetsPage(); renderDashboardBudgets();
  });
}

export function renderBudgetProgress(){
  const r = getMonthRange(0);
  const byCat = sumBy(expandExpenses(r.start,r.end), i=>i.category);
  const withBudget = CATEGORIES.filter(c=>state.budgets[c] > 0);
  const el = document.getElementById('budget-progress');
  if(withBudget.length===0){ el.innerHTML = `<div class="empty">Set a budget to see progress here.</div>`; return; }
  el.innerHTML = withBudget.map(c=>{
    const spent = byCat[c]||0, budget = state.budgets[c];
    const pct = Math.min(100, Math.round((spent/budget)*100));
    const remaining = budget - spent;
    return `<div class="budget-row">
      <div class="top"><span class="cat">${c}</span><span class="nums">${fmt(spent)} / ${fmt(budget)}</span></div>
      <div class="bar-track"><div class="bar-fill ${spent>budget?'over':''}" style="width:${pct}%"></div></div>
      <div style="font-size:11.5px;color:${remaining<0?'var(--rust)':'var(--ink-soft)'};margin-top:4px;">
        ${remaining<0 ? 'Over by '+fmt(Math.abs(remaining)) : fmt(remaining)+' remaining'}
      </div>
    </div>`;
  }).join('');
}

export function renderBudgetsPage(){ renderBudgetForm(); renderBudgetProgress(); }

// ---------- installments list (custom, shows progress) ----------
export function renderInstallments(){
  const el = document.getElementById('ins-list');
  const items = state.transactions.filter(t=>t.kind==='installment').sort((a,b)=> new Date(b.startDate)-new Date(a.startDate));
  if(items.length===0){ el.innerHTML = `<div class="empty">No active installment plans.</div>`; return; }
  const today = new Date();
  el.innerHTML = items.map(t=>{
    const start = new Date(t.startDate);
    const startIsLastDay = isLastDayOfMonth(start);
    let paid = 0;
    for(let i=0;i<t.count;i++){
      const d = addMonthsClamped(start, i, startIsLastDay);
      if(d<=today) paid++;
    }
    const monthly = t.totalAmount/t.count;
    const pct = Math.round((paid/t.count)*100);
    return `<div class="budget-row">
      <div class="top">
        <span class="cat">${t.name} <span style="font-weight:400;color:var(--ink-soft);">· ${t.category}</span></span>
        <span class="nums">${fmt(monthly)}/mo</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-soft);margin-top:4px;">
        <span>${paid} of ${t.count} paid</span>
        <button class="del" data-id="${t.id}" style="font-size:12px;">Delete</button>
      </div>
    </div>`;
  }).join('');
  el.querySelectorAll('.del').forEach(btn=>{
    btn.onclick = ()=>{
    deleteTransaction(btn.dataset.id);
    };
  });
}

// ---------- master render ----------
export function renderEverything(){
  renderList('inc-list','income');
  renderList('pur-list','purchase');
  renderInstallments();
  renderList('hh-list','household');
  renderList('inv-list','investment');
  renderBudgetsPage();
  renderDashboard();
  renderCards();
  populateCardSelects();
}


