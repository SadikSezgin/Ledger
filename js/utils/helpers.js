export function uid() {
  return crypto.randomUUID();
}

export function fmt(n) {
  return '₺' + Number(n || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 });
}

export function todayStr() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

export function sumBy(list, keyFn) {
  const map = {};
  list.forEach(item => { const k = keyFn(item); map[k] = (map[k] || 0) + item.amount; });
  return map;
}

export function formatCardDate(date) {

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

}
