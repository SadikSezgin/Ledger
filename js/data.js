export const STORAGE_KEY = 'finance-ledger-v1';
export const DATA_VERSION = 1;
export const CATEGORIES = Object.freeze(['Rent/Housing', 'Food', 'Bills', 'Transport', 'Hobbies', 'Holidays', 'One-time Purchases', 'Investment', 'Credit Card Installments', 'Health', 'Other']);
export const CATEGORY_COLORS = Object.freeze({
  'Rent/Housing': '#1F3B2C', 'Food': '#2F6F4E', 'Bills': '#4C7A5C', 'Transport': '#7A8C6B',
  'Hobbies': '#B8862B', 'Holidays': '#D4A94C', 'One-time Purchases': '#A9762F', 'Investment': '#3C6E8F',
  'Credit Card Installments': '#A63A32', 'Health': '#8C4B3A', 'Other': '#8A8270'
});
export const INVESTMENT_CATEGORIES = Object.freeze(['Stock Market', 'Crypto', 'Gold', 'Other']);
export const INVESTMENT_COLORS = Object.freeze({ 'Stock Market': '#3C6E8F', 'Crypto': '#B8862B', 'Gold': '#C9A227', 'Other': '#8A8270' });

export let state = { transactions: [], budgets: {}, cards: [] };
export let dash = { periodType: 'month', offset: 0, trend: 'monthly', investTrend: 'monthly' };

export const charts = {
  pie: null,
  line: null,
  bar: null
};
