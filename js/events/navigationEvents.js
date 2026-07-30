import { renderDashboard } from "../ui/dashboard.js";
import { renderEverything } from "../render.js";
import { saveState } from "../storage/localStorage.js";

const $ = (id) => document.getElementById(id);

document.querySelectorAll(".tab-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn")
            .forEach(b => b.classList.remove("active"));

        document.querySelectorAll(".page")
            .forEach(p => p.classList.remove("active"));

        btn.classList.add("active");

        $("page-" + btn.dataset.tab)
            .classList.add("active");

        if (btn.dataset.tab === "dashboard") {
            renderDashboard();
        }

    });

});

