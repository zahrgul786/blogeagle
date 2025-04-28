  const mongoose = require("mongoose");

  const userCategorySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ Prevent multiple category entries per user
    },
    selectedCategories: {
      type: [String],
      default: [],
    },
  });

  const categoryData = mongoose.model("Category", userCategorySchema);

  module.exports = categoryData;
