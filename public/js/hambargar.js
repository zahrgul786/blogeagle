const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

mobileMenuButton.addEventListener("click", () => {
  const expanded = mobileMenuButton.getAttribute("aria-expanded") === "true";
  mobileMenuButton.setAttribute("aria-expanded", !expanded);
  mobileMenu.classList.toggle("hidden");
});

// User dropdown toggle
const userMenuButton = document.getElementById("user-menu-button");
const userMenu = document.getElementById("user-menu");

userMenuButton.addEventListener("click", () => {
  const expanded = userMenuButton.getAttribute("aria-expanded") === "true";
  userMenuButton.setAttribute("aria-expanded", !expanded);
  userMenu.classList.toggle("hidden");
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
    userMenuButton.setAttribute("aria-expanded", "false");
    userMenu.classList.add("hidden");
  }
});

// Back to top button
const backToTopButton = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.remove("opacity-0", "invisible");
    backToTopButton.classList.add("opacity-100", "visible");
  } else {
    backToTopButton.classList.remove("opacity-100", "visible");
    backToTopButton.classList.add("opacity-0", "invisible");
  }
});

backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// View toggle functionality
const gridViewButton = document.getElementById("grid-view");
const listViewButton = document.getElementById("list-view");
const articlesContainer = document.getElementById("articles-container");

gridViewButton.addEventListener("click", () => {
  articlesContainer.classList.remove("space-y-8");
  articlesContainer.classList.add(
    "grid",
    "gap-8",
    "md:grid-cols-2",
    "lg:grid-cols-3"
  );
  gridViewButton.classList.add("text-amber-600");
  listViewButton.classList.remove("text-amber-600");
});

listViewButton.addEventListener("click", () => {
  articlesContainer.classList.remove(
    "grid",
    "gap-8",
    "md:grid-cols-2",
    "lg:grid-cols-3"
  );
  articlesContainer.classList.add("space-y-8");
  listViewButton.classList.add("text-amber-600");
  gridViewButton.classList.remove("text-amber-600");
});

// Lazy loading images
document.addEventListener("DOMContentLoaded", function () {
  const lazyImages = [].slice.call(
    document.querySelectorAll('img[loading="lazy"]')
  );

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
});
