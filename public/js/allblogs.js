// Confirm before deleting
function confirmDelete(blogId, blogTitle) {
  Swal.fire({
    title: "Delete Blog?",
    html: `Are you sure you want to delete <strong>"${blogTitle}"</strong>?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      document.querySelector(`form[action="/blog/${blogId}/delete"]`).submit();
    }
  });
}

// Search functionality
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector('input[type="text"]');
  const blogCards = document.querySelectorAll(".blog-card");

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    blogCards.forEach((card) => {
      const title = card.querySelector("h2").textContent.toLowerCase();
      const content = card.querySelector("p").textContent.toLowerCase();
      const author = card
        .querySelector(".text-gray-600")
        .textContent.toLowerCase();

      if (title.includes(searchTerm)) {
        card.style.display = "block";
      } else if (content.includes(searchTerm)) {
        card.style.display = "block";
      } else if (author.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});
