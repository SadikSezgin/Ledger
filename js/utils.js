function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function isLastDayOfMonth(date){
  return date.getDate() === new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
}

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

function sumBy(list, keyFn){
  const map = {};
  list.forEach(item=>{ const k = keyFn(item); map[k] = (map[k]||0) + item.amount; });
  return map;
}

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
