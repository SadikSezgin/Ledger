import "./events.js";

import {
    populateCategorySelects,
    setDefaultDates
} from "./utils.js";

import {
    loadState
} from "./storage.js";

// ---------- init ----------
populateCategorySelects();
setDefaultDates();
loadState();