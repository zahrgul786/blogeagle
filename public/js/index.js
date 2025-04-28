document
  .getElementById("toggleAdvanced")
  .addEventListener("click", function () {
    const advancedOptions = document.getElementById("advancedOptions");
    const arrow = document.getElementById("advancedArrow");

    // Toggle the advanced search section's max-height
    if (
      advancedOptions.style.maxHeight === "0px" ||
      advancedOptions.style.maxHeight === ""
    ) {
      advancedOptions.style.maxHeight = "1000px"; // Expand to a fixed height or more
      arrow.classList.add("rotate-180");
    } else {
      advancedOptions.style.maxHeight = "0px"; // Collapse
      arrow.classList.remove("rotate-180");
    }
  });
document
  .getElementById("toggleAdvanced")
  .addEventListener("click", function () {
    const advancedOptions = document.getElementById("advancedOptions");
    const arrow = document.getElementById("advancedArrow");
    advancedOptions.classList.toggle("max-h-0"); // Hide by default
    advancedOptions.classList.toggle("max-h-screen"); // Adjust max-height dynamically
    arrow.classList.toggle("rotate-180"); // Rotate the arrow icon
  });
 // Toggle sort dropdown
  document.getElementById('sortDropdownBtn')?.addEventListener('click', () => {
    document.getElementById('sortDropdown')?.classList.toggle('hidden');
  });