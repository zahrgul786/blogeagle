
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.7s ease";

    setTimeout(() => {
      loader.style.display = "none";
    }, 900); // Delay to remove from DOM after fade out
  });

