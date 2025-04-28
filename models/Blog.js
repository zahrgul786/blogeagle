const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfileData",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  /// new added on 24/april/2025
  views: {
    type: Number,
    default: 0,
  },
  viewedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfileData", // or use sessionId if you don't use user accounts
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfileData", // ya jo bhi tumhara user model ka naam hai
    },
  ],
  default: [],

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfileData",
      },
      text: String,

      createdAt: {
        type: Date,
        default: Date.now,
      },
      replies: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserProfileData", // ✅ correct this from "user" to "UserProfileData"
          },
          text: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
