const STORAGE_KEY = 'finance-ledger-v1';
const CATEGORIES = ['Rent/Housing','Food','Bills','Transport','Hobbies','Holidays','One-time Purchases','Investment','Credit Card Installments','Health','Other'];
const CATEGORY_COLORS = {
  'Rent/Housing':'#1F3B2C','Food':'#2F6F4E','Bills':'#4C7A5C','Transport':'#7A8C6B',
  'Hobbies':'#B8862B','Holidays':'#D4A94C','One-time Purchases':'#A9762F','Investment':'#3C6E8F',
  'Credit Card Installments':'#A63A32','Health':'#8C4B3A','Other':'#8A8270'
};

let state = { transactions: [], budgets: {}, cards: [] };
let dash = { periodType:'month', offset:0, trend:'monthly', investTrend:'monthly' };
let pieChart=null, lineChart=null, barChart=null;

// ---------- storage ----------
let toastTimer = null;

function showToast(msg, isError) {
  const el = document.getElementById('save-toast');
  el.textContent = msg;
  el.classList.toggle('error', !!isError);
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, isError ? 6000 : 1400);
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      let parsed = JSON.parse(saved);

      // Migrate old data if needed
      parsed = migrateData(parsed);

      // Save migrated data back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      // Load state
      state.transactions = parsed.transactions || [];
      state.budgets = parsed.budgets || {};
      state.cards = parsed.cards || [];
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }

  renderEverything();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showToast("Saved");
  } catch (e) {
    console.error("Failed to save data", e);
    showToast("Failed to save.", true);
  }
}

const DATA_VERSION = 1;

function migrateData(data) {

  // Version 0 (or no version) -> Version 1
  if (!data.version || data.version < 1) {

    // Ensure all collections exist
    if (!Array.isArray(data.transactions)) {
      data.transactions = [];
    }

    if (!data.budgets || typeof data.budgets !== "object") {
      data.budgets = {};
    }

    if (!Array.isArray(data.cards)) {
      data.cards = [];
    }

    data.version = 1;
  }

  return data;
}

// ---------- helpers ----------
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
// True if `date` falls on the final calendar day of its month.
function isLastDayOfMonth(date){
  return date.getDate() === new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
}
// Adds `n` months to a date. If `forceLastDay` is true (the original date was a month-end),
// the result always lands on that target month's last day — so Jan 31 -> Feb 28 -> Mar 31,
// not Jan 31 -> Feb 28 -> Mar 28. Otherwise, the day is clamped down only to avoid overflow.
function addMonthsClamped(date, n, forceLastDay){
  const targetMonthIndex = date.getMonth() + n;
  const daysInTargetMonth = new Date(date.getFullYear(), targetMonthIndex+1, 0).getDate();
  const day = forceLastDay ? daysInTargetMonth : Math.min(date.getDate(), daysInTargetMonth);
  return new Date(date.getFullYear(), targetMonthIndex, day);
}
function fmt(n){
  return '₺' + Number(n||0).toLocaleString('tr-TR', {maximumFractionDigits:0});
}
function todayStr(){ return new Date().toISOString().slice(0,10); }
function populateCategorySelects(){
  ['pur-category','ins-category','hh-category'].forEach(id=>{
    const sel = document.getElementById(id);
    sel.innerHTML = CATEGORIES.map(c=>`<option>${c}</option>`).join('');
  });
}
function setDefaultDates(){
  ['inc-date','pur-date','ins-date','hh-date', 'inv-date'].forEach(id=>{
    document.getElementById(id).value = todayStr();
  });
}

// ---------- date range helpers ----------
function startOfDay(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function getWeekRange(offset){
  const now = new Date();
  const dow = (now.getDay()+6)%7; // Monday=0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate()-dow+offset*7);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+6,23,59,59);
  return {start:startOfDay(monday), end:sunday};
}
function getMonthRange(offset){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth()+offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth()+offset+1, 0,23,59,59);
  return {start,end};
}
function getYearRange(offset){
  const now = new Date();
  const start = new Date(now.getFullYear()+offset,0,1);
  const end = new Date(now.getFullYear()+offset,11,31,23,59,59);
  return {start,end};
}
function currentRange(){
  if(dash.periodType==='week') return getWeekRange(dash.offset);
  if(dash.periodType==='year') return getYearRange(dash.offset);
  return getMonthRange(dash.offset);
}
function periodLabel(){
  const r = currentRange();
  const opts = dash.periodType==='year' ? {year:'numeric'} : dash.periodType==='month' ? {month:'long',year:'numeric'} : {day:'numeric',month:'short'};
  if(dash.periodType==='week'){
    return r.start.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + ' – ' + r.end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }
  return r.start.toLocaleDateString('en-GB', opts);
}

// ---------- expansion (recurring / installments -> occurrences) ----------
function expandExpenses(rangeStart, rangeEnd){
  const out = [];
  //const today = new Date();
  state.transactions.forEach(t=>{
    if(t.kind==='purchase'){
      const d = new Date(t.date);
      if(d>=rangeStart && d<=rangeEnd) out.push({date:d, category:t.category, amount:Number(t.amount), name:t.name});
    } else if(t.kind==='household'){
      if(t.recurring){
        const orig = new Date(t.date);
        const lastDay = isLastDayOfMonth(orig);
        let cursor = new Date(orig.getFullYear(), orig.getMonth(), orig.getDate());
        const limit = rangeEnd;
        while(cursor <= limit){
          if(cursor >= rangeStart && cursor >= orig) out.push({date:new Date(cursor), category:t.category, amount:Number(t.amount), name:t.name});
          cursor = addMonthsClamped(cursor, 1, lastDay);
        }
      } else {
        const d = new Date(t.date);
        if(d>=rangeStart && d<=rangeEnd) out.push({date:d, category:t.category, amount:Number(t.amount), name:t.name});
      }
    } else if(t.kind==='installment'){
      const start = new Date(t.startDate);
      const startIsLastDay = isLastDayOfMonth(start);
      const monthly = Number(t.totalAmount)/Number(t.count);
      for(let i=0;i<t.count;i++){
        const d = addMonthsClamped(start, i, startIsLastDay);
        if(d>=rangeStart && d<=rangeEnd) out.push({date:d, category:t.category, amount:monthly, name:`${t.name} (${i+1}/${t.count})`});
      }
    }
  });
  return out;
}
function expandIncome(rangeStart, rangeEnd){
  const out = [];
  //const today = new Date();
  state.transactions.forEach(t=>{
    if(t.kind!=='income') return;
    if(t.recurring){
      const orig = new Date(t.date);
      const lastDay = isLastDayOfMonth(orig);
      let cursor = new Date(orig.getFullYear(), orig.getMonth(), orig.getDate());
      const limit = rangeEnd;
      while(cursor <= limit){
        if(cursor >= rangeStart && cursor >= orig) out.push({date:new Date(cursor), category:t.category, amount:Number(t.amount), name:t.name});
        cursor = addMonthsClamped(cursor, 1, lastDay);
      }
    } else {
      const d = new Date(t.date);
      if(d>=rangeStart && d<=rangeEnd) out.push({date:d, category:t.category, amount:Number(t.amount), name:t.name});
    }
  });
  return out;
}

function expandInvestments(rangeStart, rangeEnd){
  const out = [];
  const today = new Date();

  state.transactions.forEach(t => {
    if (t.kind !== 'investment') return;

    if (t.recurring) {
      const orig = new Date(t.date);
      const lastDay = isLastDayOfMonth(orig);
      let cursor = new Date(orig.getFullYear(), orig.getMonth(), orig.getDate());

      const limit = rangeEnd < today ? rangeEnd : today;

      while (cursor <= limit) {
        if (cursor >= rangeStart && cursor >= orig) {
          out.push({
            date: new Date(cursor),
            category: t.category,
            amount: Number(t.amount),
            name: t.name,
            location: t.location
          });
        }

        cursor = addMonthsClamped(cursor, 1, lastDay);
      }
    } else {
      const d = new Date(t.date);

      if (d >= rangeStart && d <= rangeEnd) {
        out.push({
          date: d,
          category: t.category,
          amount: Number(t.amount),
          name: t.name,
          location: t.location
        });
      }
    }
  });

  return out;
}

function populateCardSelects() {

    const selects = [
        document.getElementById("pur-card"),
        document.getElementById("ins-card")
    ];

    selects.forEach(select => {

        if(!select) return;

        select.innerHTML = "";

        state.cards.forEach(card => {

            const option = document.createElement("option");

            option.value = card.id;

            option.textContent = card.name;

            select.appendChild(option);

        });

    });

}

function sumBy(list, keyFn){
  const map = {};
  list.forEach(item=>{ const k = keyFn(item); map[k] = (map[k]||0) + item.amount; });
  return map;
}

// ---------- cards ----------
function calculateDueDate(statementDay, graceDays = 10) {

    const today = new Date();

    let statement = new Date(
        today.getFullYear(),
        today.getMonth(),
        statementDay
    );

    // invalid day (31 in February)

    if (statement.getMonth() !== today.getMonth()) {

        statement = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );
    }

    const due = new Date(statement);

    due.setDate(due.getDate() + graceDays);

    return due;

}

function formatCardDate(date){

    return date.toLocaleDateString("en-GB",{
        day:"numeric",
        month:"short",
        year:"numeric"
    });

}

function addCard(card){

    state.cards.push({

        id:uid(),

        name:card.name,

        bank:card.bank,

        statementDay:Number(card.statementDay),

        graceDays:Number(card.graceDays || 10),

        creditLimit:Number(card.creditLimit || 0)

    });

    saveState();

    renderCards();

}

function deleteCard(id){

    state.cards = state.cards.filter(c=>c.id!==id);

    saveState();

    renderCards();

}

function updateCard(updated){

    const card = state.cards.find(c=>c.id===updated.id);

    if(!card) return;

    card.name = updated.name;

    card.bank = updated.bank;

    card.statementDay = Number(updated.statementDay);

    card.graceDays = Number(updated.graceDays);

    card.creditLimit = Number(updated.creditLimit);

    saveState();

    renderCards();

}




// ---------- rendering: lists ----------
function ledgerRow(t, extraLabel){
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
function renderList(containerId, kind){
  const el = document.getElementById(containerId);
  const items = state.transactions.filter(t=>t.kind===kind).sort((a,b)=> new Date(b.date||b.startDate) - new Date(a.date||a.startDate));
  if(items.length===0){ el.innerHTML = `<div class="empty">Nothing here yet.</div>`; return; }
  el.innerHTML = items.map(t=>ledgerRow(t)).join('');
  el.querySelectorAll('.del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.transactions = state.transactions.filter(t=>t.id!==btn.dataset.id);
      saveState(); renderEverything();
    });
  });
}

// ---------- rendering: dashboard ----------
function renderDashboard(){
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
  if(pieChart){ try{ pieChart.destroy(); }catch(e){} }
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
      pieChart = new Chart(pieCtx, {
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

function renderTrend(){
  const lineCtx = document.getElementById('line-chart').getContext('2d');
  if(lineChart) lineChart.destroy();
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
  lineChart = new Chart(lineCtx, {
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

const INVESTMENT_CATEGORIES = ['Stock Market','Crypto','Gold','Other'];
const INVESTMENT_COLORS = { 'Stock Market':'#3C6E8F', 'Crypto':'#B8862B', 'Gold':'#C9A227', 'Other':'#8A8270' };

function renderInvestments(){
  const barCtx = document.getElementById('bar-chart').getContext('2d');
  if(barChart) barChart.destroy();
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

  barChart = new Chart(barCtx, {
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

function renderDashboardBudgets(){
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

function renderCards(){

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

            btn.onclick=()=>deleteCard(btn.dataset.card);

        });

}

// ---------- rendering: budgets page ----------
function renderBudgetForm(){
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
function renderBudgetProgress(){
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
function renderBudgetsPage(){ renderBudgetForm(); renderBudgetProgress(); }

// ---------- installments list (custom, shows progress) ----------
function renderInstallments(){
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
    btn.addEventListener('click', ()=>{
      state.transactions = state.transactions.filter(t=>t.id!==btn.dataset.id);
      saveState(); renderEverything();
    });
  });
}

// ---------- master render ----------
function renderEverything(){
  renderList('inc-list','income');
  renderList('pur-list','purchase');
  renderInstallments();
  renderList('hh-list','household');
  renderList('inv-list','investment');
  renderBudgetsPage();
  renderDashboard();
  renderCards();
  populateCardSelect();
}

// ---------- nav ----------
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='dashboard') renderDashboard();
  });
});

// ---------- period controls ----------
document.getElementById('period-seg').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#period-seg button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  dash.periodType = e.target.dataset.period;
  dash.offset = 0;
  renderDashboard();
});
document.getElementById('period-prev').addEventListener('click', ()=>{ dash.offset--; renderDashboard(); });
document.getElementById('period-next').addEventListener('click', ()=>{ dash.offset++; renderDashboard(); });
document.getElementById('trend-seg').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#trend-seg button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  dash.trend = e.target.dataset.trend;
  renderTrend();
});
document.getElementById('invest-seg').addEventListener('click', e=>{
  if(e.target.tagName!=='BUTTON') return;
  document.querySelectorAll('#invest-seg button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  dash.investTrend = e.target.dataset.trend;
  renderInvestments();
});

// ---------- add handlers ----------
document.getElementById('inc-add').addEventListener('click', ()=>{
  const name = document.getElementById('inc-name').value.trim();
  const amount = Number(document.getElementById('inc-amount').value);
  const date = document.getElementById('inc-date').value || todayStr();
  const category = document.getElementById('inc-category').value;
  const recurring = document.getElementById('inc-recurring').checked;
  if(!name || !amount){ alert('Add a source name and amount.'); return; }
  state.transactions.push({ id:uid(), kind:'income', name, category, amount, date, recurring });
  saveState(); renderEverything();
  document.getElementById('inc-name').value=''; document.getElementById('inc-amount').value='';
  document.getElementById('inc-recurring').checked=false;
});

document.getElementById('pur-add').addEventListener('click', ()=>{
  const name = document.getElementById('pur-name').value.trim();
  const amount = Number(document.getElementById('pur-amount').value);
  const date = document.getElementById('pur-date').value || todayStr();
  const category = document.getElementById('pur-category').value;
  if(!name || !amount){ alert('Add an item name and amount.'); return; }
  state.transactions.push({ id:uid(), kind:'purchase', name, category, amount, date });
  saveState(); renderEverything();
  document.getElementById('pur-name').value=''; document.getElementById('pur-amount').value='';
});

document.getElementById('ins-add').addEventListener('click', ()=>{
  const name = document.getElementById('ins-name').value.trim();
  const totalAmount = Number(document.getElementById('ins-total').value);
  const count = Math.max(1, Number(document.getElementById('ins-count').value)||1);
  const startDate = document.getElementById('ins-date').value || todayStr();
  const category = document.getElementById('ins-category').value;
  if(!name || !totalAmount){ alert('Add an item name and total amount.'); return; }
  state.transactions.push({ id:uid(), kind:'installment', name, category, totalAmount, count, startDate });
  saveState(); renderEverything();
  document.getElementById('ins-name').value=''; document.getElementById('ins-total').value=''; document.getElementById('ins-count').value='1';
});

document.getElementById('hh-add').addEventListener('click', ()=>{
  const name = document.getElementById('hh-name').value.trim();
  const amount = Number(document.getElementById('hh-amount').value);
  const date = document.getElementById('hh-date').value || todayStr();
  const category = document.getElementById('hh-category').value;
  const recurring = document.getElementById('hh-recurring').checked;
  if(!name || !amount){ alert('Add a name and amount.'); return; }
  state.transactions.push({ id:uid(), kind:'household', name, category, amount, date, recurring });
  saveState(); renderEverything();
  document.getElementById('hh-name').value=''; document.getElementById('hh-amount').value='';
});

document.getElementById('inv-add').addEventListener('click', ()=>{
  const name = document.getElementById('inv-name').value.trim();
  const amount = Number(document.getElementById('inv-amount').value);
  const date = document.getElementById('inv-date').value || todayStr();
  const category = document.getElementById('inv-category').value;
  const location = document.getElementById('inv-location').value;
  const recurring = document.getElementById('inv-recurring').checked;
  if(!name || !amount){ alert('Add a source name and amount.'); return; }
  state.transactions.push({ id:uid(), kind:'investment', name, category, location, amount, date, recurring });
  saveState(); renderEverything();
  document.getElementById('inv-name').value=''; document.getElementById('inv-amount').value='';
  document.getElementById('inv-recurring').checked=false;
});

document.getElementById("card-add").addEventListener("click",()=>{

    const name =
        document.getElementById("card-name").value.trim();

    const bank =
        document.getElementById("card-bank").value.trim();

    const statementDay =
        Number(document.getElementById("card-statement").value);

    const grace =
        Number(document.getElementById("card-grace").value);

    const limit =
        Number(document.getElementById("card-limit").value);

    if(!name || !bank || !statementDay){

        alert("Please complete all required fields.");

        return;

    }

    addCard({

        name,

        bank,

        statementDay,

        graceDays:grace,

        creditLimit:limit

    });

    document.getElementById("card-name").value="";
    document.getElementById("card-bank").value="";
    document.getElementById("card-limit").value="";
    document.getElementById("card-statement").value="";
    document.getElementById("card-grace").value="10";

});

document.getElementById('reset-btn').addEventListener('click', ()=>{
  if(confirm('This will permanently delete all your entries and budgets. Continue?')){
    state = {
    transactions: [],
    budgets: {}
};

localStorage.removeItem(STORAGE_KEY);
saveState();
renderEverything();
  }
});


document.addEventListener("change",function(e){

    if(e.target.id==="pur-payment"){

        document.getElementById("pur-card-field").style.display =
            e.target.value==="card"
            ? ""
            : "none";

    }

});

// ---------- init ----------
populateCategorySelects();
setDefaultDates();
loadState();
