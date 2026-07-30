import { state, dash } from "./state/state.js";

import { uid, todayStr } from "./utils/helpers.js";

import { addCard } from "./ui/cards.js";

import { saveState } from "./storage/localStorage.js";

import { renderEverything } from "./render.js";

import { renderDashboard } from "./ui/dashboard.js";

import {
    renderTrend,
    renderInvestments
} from "./ui/charts.js";

const $ = (id) => document.getElementById(id);



// ----------------------------------------------------
// Misc
// ----------------------------------------------------



