document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(
    "input[name='selectedCategories']"
  );
  const selectedDisplay = document.getElementById("selectedDisplay");

  function updateSelected() {
    const selected = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    selectedDisplay.textContent = selected.length
      ? `You selected: ${selected.join(", ")}`
      : "";
  }

  checkboxes.forEach((cb) => cb.addEventListener("change", updateSelected));
  updateSelected(); // initial load
});



