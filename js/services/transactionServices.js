import { state } from "../state/state.js";

export function addTransaction(transaction) {

    state.transactions.push(transaction);

}