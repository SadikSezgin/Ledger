export function clearIncomeForm() {

    document.getElementById("inc-name").value = "";
    document.getElementById("inc-amount").value = "";
    document.getElementById("inc-recurring").checked = false;

}

export function clearPurchaseForm() {

    document.getElementById("pur-name").value = "";
    document.getElementById("pur-amount").value = "";

}

export function clearInstallmentForm() {

    document.getElementById("ins-name").value = "";
    document.getElementById("ins-total").value = "";
    document.getElementById("ins-count").value = "1";

}

export function clearHouseholdForm() {

    document.getElementById("hh-name").value = "";
    document.getElementById("hh-amount").value = "";

}

export function clearInvestmentForm() {

    document.getElementById("inv-name").value = "";
    document.getElementById("inv-amount").value = "";
    document.getElementById("inv-recurring").checked = false;

}

export function clearCardForm() {

    document.getElementById("card-name").value = "";
    document.getElementById("card-bank").value = "";
    document.getElementById("card-limit").value = "";
    document.getElementById("card-statement").value = "";
    document.getElementById("card-grace").value = "10";

}