import "./events.js";
import "./firebase.js";
import "./auth/login.js";

import { state } from "./state/state.js";
import { initializeSession } from "./auth/session.js";
import { populateCategorySelects, setDefaultDates } from "./ui/forms.js";
import { loadState } from "./storage/localStorage.js";
import { renderEverything } from "./render.js";

initializeSession();