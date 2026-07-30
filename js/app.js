import { initializeSession } from "./auth/session.js";

import "./firebase.js";

import "./auth/login.js";
import "./auth/register.js";
import "./auth/resetPassword.js";
import "./auth/logout.js";

import "./events/navigationEvents.js";
import "./events/dashboardEvents.js";
import "./events/transactionEvents.js";
import "./events/cardEvents.js";
import "./events/authEvents.js";
import "./events/miscEvents.js";

initializeSession();