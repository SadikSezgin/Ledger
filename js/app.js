import "./events.js";

import {
    populateCategorySelects,
    setDefaultDates
} from "./ui/forms.js";

import {
    loadState
} from "./storage/localStorage.js";

import {
    renderEverything
} from "./render.js";

// ---------- init ----------
populateCategorySelects();
setDefaultDates();
loadState();
renderEverything();