// Escape the content properly for embedding inside JavaScript
const rawContent = document.getElementById("hiddenContent").value;  // Use quotes around EJS template

const editor = new toastui.Editor({
  el: document.querySelector("#editor"),
  height: "400px",
  initialEditType: "markdown", // You can also use 'wysiwyg'
  previewStyle: "vertical",
  initialValue: rawContent, // Set initial value from the content
});

// When the form is submitted, save the content from the editor to the hidden input field
document.querySelector("form").addEventListener("submit", function () {
  document.getElementById("hiddenContent").value = editor.getHTML(); // Save the HTML content
});

// Image preview functionality
document.querySelector("#imageUpload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    const imagePreview = document.querySelector("#imagePreview");
    imagePreview.src = reader.result;
    document.querySelector("#imagePreviewContainer").style.display = "block";
  };

  if (file) {
    reader.readAsDataURL(file); // Preview the selected image
  }
});
