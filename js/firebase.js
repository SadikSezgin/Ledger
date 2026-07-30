import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvtPf4FwVSStBPY8KbcS6d7QIHvXZuIR8",
  authDomain: "ledger-175b1.firebaseapp.com",
  projectId: "ledger-175b1",
  storageBucket: "ledger-175b1.firebasestorage.app",
  messagingSenderId: "506120412725",
  appId: "1:506120412725:web:e8dcf4ccf4542faa549b7c",
  measurementId: "G-8D9GP2GRY4"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
    app,
    auth,
    db
};