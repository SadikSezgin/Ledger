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

import { DATA_VERSION } from "./data.js";