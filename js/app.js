import "./events.js";

import {
    populateCategorySelects,
    setDefaultDates
} from "./utils.js";

import {
    loadState
} from "./storage.js";

import {
    renderEverything
} from "./render.js";

// ---------- init ----------
populateCategorySelects();
setDefaultDates();
loadState();
renderEverything();