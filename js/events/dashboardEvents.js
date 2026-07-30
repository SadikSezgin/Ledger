import { dash } from "../state/state.js";
import { renderDashboard } from "../ui/dashboard.js";
import { renderTrend, renderInvestments } from "../ui/charts.js";

const $ = (id) => document.getElementById(id);

$("period-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#period-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.periodType = e.target.dataset.period;
    dash.offset = 0;

    renderDashboard();

});

$("period-prev").addEventListener("click", () => {
    dash.offset--;
    renderDashboard();
});

$("period-next").addEventListener("click", () => {
    dash.offset++;
    renderDashboard();
});

$("trend-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#trend-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.trend = e.target.dataset.trend;

    renderTrend();

});

$("invest-seg").addEventListener("click", e => {

    if (e.target.tagName !== "BUTTON") return;

    document.querySelectorAll("#invest-seg button")
        .forEach(b => b.classList.remove("active"));

    e.target.classList.add("active");

    dash.investTrend = e.target.dataset.trend;

    renderInvestments();

});