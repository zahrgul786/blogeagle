document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("profileImageInput");
  const previewImage = document.getElementById("imagePreview");

  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});
