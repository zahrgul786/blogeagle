const editor = new toastui.Editor({
  el: document.querySelector("#editor"),
  height: "400px",
  initialEditType: "markdown", // You can also use 'wysiwyg'
  previewStyle: "vertical",
});

// ✅ FIXED: Use getHTML() instead of getMarkdown()
document.querySelector("form").addEventListener("submit", () => {
  document.querySelector("#hiddenContent").value = editor.getHTML();
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
    reader.readAsDataURL(file);
  }
});
