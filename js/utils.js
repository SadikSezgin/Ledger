import { CATEGORIES, dash } from "./data.js";

export function uid(){ 
  return crypto.randomUUID();
}

export function isLastDayOfMonth(date){
  return date.getDate() === new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
}

export function addMonthsClamped(date, n, forceLastDay){
  const targetMonthIndex = date.getMonth() + n;
  const daysInTargetMonth = new Date(date.getFullYear(), targetMonthIndex+1, 0).getDate();
  const day = forceLastDay ? daysInTargetMonth : Math.min(date.getDate(), daysInTargetMonth);
  return new Date(date.getFullYear(), targetMonthIndex, day);
}

export function fmt(n){
  return '₺' + Number(n||0).toLocaleString('tr-TR', {maximumFractionDigits:0});
}

export function todayStr(){ 
  const d = new Date();  

  return [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,'0'),
    String(d.getDate()).padStart(2,'0')
  ].join('-');
}

export function populateCategorySelects() {
    const selectIds = [
        "pur-category",
        "ins-category",
        "hh-category"
    ];

    const options = CATEGORIES
        .map(category => `<option value="${category}">${category}</option>`)
        .join("");

    selectIds.forEach(id => {
        const select = document.getElementById(id);

        if (!select) {
            console.warn(`Category select "${id}" not found.`);
            return;
        }

        select.innerHTML = options;
    });
}

export function setDefaultDates() {
    const inputIds = [
        "inc-date",
        "pur-date",
        "ins-date",
        "hh-date",
        "inv-date"
    ];

    const today = todayStr();

    inputIds.forEach(id => {
        const input = document.getElementById(id);

        if (!input) {
            console.warn(`Date input "${id}" not found.`);
            return;
        }

        input.value = today;
    });
}

// ---------- date range helpers ----------
export function startOfDay(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }

export function getWeekRange(offset){
  const now = new Date();
  const dow = (now.getDay()+6)%7; // Monday=0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate()-dow+offset*7);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()+6,23,59,59);
  return {start:startOfDay(monday), end:sunday};
}

export function getMonthRange(offset){
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth()+offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth()+offset+1, 0,23,59,59);
  return {start,end};
}

export function getYearRange(offset){
  const now = new Date();
  const start = new Date(now.getFullYear()+offset,0,1);
  const end = new Date(now.getFullYear()+offset,11,31,23,59,59);
  return {start,end};
}

export function currentRange(){
  if(dash.periodType==='week') return getWeekRange(dash.offset);
  if(dash.periodType==='year') return getYearRange(dash.offset);
  return getMonthRange(dash.offset);
}

export function periodLabel(){
  const r = currentRange();
  const opts = dash.periodType==='year' ? {year:'numeric'} : dash.periodType==='month' ? {month:'long',year:'numeric'} : {day:'numeric',month:'short'};
  if(dash.periodType==='week'){
    return r.start.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + ' – ' + r.end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }
  return r.start.toLocaleDateString('en-GB', opts);
}

export function sumBy(list, keyFn){
  const map = {};
  list.forEach(item=>{ const k = keyFn(item); map[k] = (map[k]||0) + item.amount; });
  return map;
}

export function calculateDueDate(statementDay, graceDays = 10) {

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

export function formatCardDate(date){

    return date.toLocaleDateString("en-GB",{
        day:"numeric",
        month:"short",
        year:"numeric"
    });

}
