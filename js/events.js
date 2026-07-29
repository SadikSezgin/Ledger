import { state, dash, STORAGE_KEY } from "./data.js";

import { uid, todayStr } from "./utils.js";

import { addCard } from "./cards.js";

import { saveState} from "./storage.js";

import {
    renderEverything,
    renderDashboard,
    renderTrend,
    renderInvestments
} from "./render.js";

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

    saveState();
    renderEverything();

    document.getElementById("card-name").value="";
    document.getElementById("card-bank").value="";
    document.getElementById("card-limit").value="";
    document.getElementById("card-statement").value="";
    document.getElementById("card-grace").value="10";

});

document.getElementById("reset-btn").addEventListener("click", () => {

    if (!confirm("This will permanently delete all your entries and budgets. Continue?")) {
        return;
    }

    state.transactions = [];
    state.budgets = {};
    state.cards = [];

    saveState();
    renderEverything();

});

document.addEventListener("change",function(e){
    if(e.target.id==="pur-payment"){

        document.getElementById("pur-card-field").style.display =
            e.target.value==="card"
            ? ""
            : "none";
    }
});
