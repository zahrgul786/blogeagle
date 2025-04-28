
  // Toggle reply forms
  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.closest('.comment-group').querySelector('.reply-form');
      form.classList.toggle('hidden');
    });
  });

  // Cancel reply
  document.querySelectorAll('.cancel-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.reply-form').classList.add('hidden');
    });
  });

  // Smooth scroll to comment form when URL has #comments
  if (window.location.hash === '#comments') {
    document.querySelector('#comments').scrollIntoView({ behavior: 'smooth' });
  }


 document.addEventListener('DOMContentLoaded', function() {
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', function() {
        // Fetch remaining comments via AJAX or show them if already loaded
        fetch(`/blog/<%= blog.id %>/comments?skip=10`)
          .then(response => response.json())
          .then(comments => {
            const container = document.getElementById('comments-container');
            
            // Render the additional comments
            comments.forEach(comment => {
              // Create HTML for each comment and append to container
              // (You'll need to implement this based on your comment structure)
            });
            
            // Remove the show more button
            showMoreBtn.remove();
          })
          .catch(error => console.error('Error loading more comments:', error));
      });
    }
  });



  // Toggle like status (like/unlike)
// Function to handle like toggling


 const likeButton = document.getElementById("likeButton");
  const likeButtonRed = document.getElementById("likeButtonRed");

  // Handle the like toggle on click
  likeButton.addEventListener("click", function() {
    // Toggle the hearts
    if (likeButton.classList.contains("hidden")) {
      likeButton.classList.remove("hidden");
      likeButtonRed.classList.add("hidden");
    } else {
      likeButton.classList.add("hidden");
      likeButtonRed.classList.remove("hidden");
    }
  });

  // Form submission and AJAX
  document.querySelectorAll(".like-form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form submission

      const whiteHeart = form.querySelector("#likeButton");
      const redHeart = form.querySelector("#likeButtonRed");
      const likeCountElement = form.closest(".like-section").querySelector(".like-count span");

      // Send the like request via AJAX
      const formData = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Toggle hearts visibility based on like status
            if (data.liked) {
              whiteHeart.classList.add("hidden"); // Hide white heart
              redHeart.classList.remove("hidden"); // Show red heart
            } else {
              whiteHeart.classList.remove("hidden"); // Show white heart
              redHeart.classList.add("hidden"); // Hide red heart
            }

            // Update like count instantly (without page reload)
            likeCountElement.textContent = `${data.likes} Likes`;
          }
        })
        .catch((error) => {
          console.error("Error liking post:", error);
        });
    });
  });





  document.addEventListener("DOMContentLoaded", () => {
    const showMoreCommentsBtn = document.getElementById("show-more-comments-btn");
    if (showMoreCommentsBtn) {
      showMoreCommentsBtn.addEventListener("click", () => {
        document.querySelectorAll(".comment-group").forEach(comment => {
          comment.style.display = "block"; // Show all comments
        });
        showMoreCommentsBtn.style.display = "none"; // Hide the "Show More" button
      });
    }

    // Handle reply functionality
    document.querySelectorAll(".reply-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const replyForm = e.target.closest(".comment-group").querySelector(".reply-form");
        replyForm.classList.remove("hidden");
      });
    });

    // Handle cancel reply
    document.querySelectorAll(".cancel-reply").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const replyForm = e.target.closest(".reply-form");
        replyForm.classList.add("hidden");
      });
    });
  });

