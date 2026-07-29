
export function populateCategorySelects() {
  const selectIds = [
    "pur-category",
    "ins-category",
    "hh-category"
  ];

  const options = CATEGORIES
    .map(category => `<option value="${category}">${category}</option>`)
    .join("");

  selectIds.forEach(id => {
    const select = document.getElementById(id);

    if (!select) {
      console.warn(`Category select "${id}" not found.`);
      return;
    }

    select.innerHTML = options;
  });
}

export function setDefaultDates() {
  const inputIds = [
    "inc-date",
    "pur-date",
    "ins-date",
    "hh-date",
    "inv-date"
  ];

  const today = todayStr();

  inputIds.forEach(id => {
    const input = document.getElementById(id);

    if (!input) {
      console.warn(`Date input "${id}" not found.`);
      return;
    }

    input.value = today;
  });
}
