const DATA_VERSION = 1;

const STORAGE_KEY = 'finance-ledger-v1';
const CATEGORIES = ['Rent/Housing','Food','Bills','Transport','Hobbies','Holidays','One-time Purchases','Investment','Credit Card Installments','Health','Other'];
const CATEGORY_COLORS = {
  'Rent/Housing':'#1F3B2C','Food':'#2F6F4E','Bills':'#4C7A5C','Transport':'#7A8C6B',
  'Hobbies':'#B8862B','Holidays':'#D4A94C','One-time Purchases':'#A9762F','Investment':'#3C6E8F',
  'Credit Card Installments':'#A63A32','Health':'#8C4B3A','Other':'#8A8270'
};
const INVESTMENT_CATEGORIES = ['Stock Market','Crypto','Gold','Other'];
const INVESTMENT_COLORS = { 'Stock Market':'#3C6E8F', 'Crypto':'#B8862B', 'Gold':'#C9A227', 'Other':'#8A8270' };

let state = { transactions: [], budgets: {}, cards: [] };
let dash = { periodType:'month', offset:0, trend:'monthly', investTrend:'monthly' };
let pieChart=null, lineChart=null, barChart=null;

let toastTimer = null;

export {
    STORAGE_KEY,
    CATEGORIES,
    CATEGORY_COLORS,
    INVESTMENT_CATEGORIES,
    INVESTMENT_COLORS,
    state,
    dash,
    pieChart,
    lineChart,
    barChart
};

