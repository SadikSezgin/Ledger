import { state } from "./data.js";

import {
    isLastDayOfMonth,
    addMonthsClamped
} from "./utils.js";

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

export {
    expandExpenses,
    expandIncome,
    expandInvestments
};