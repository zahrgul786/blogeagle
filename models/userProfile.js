const mongoose = require("mongoose");
const userProfile = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // optional, if each user can only have one profile
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  profileImage: {
    type: String,
    default: "/uploads/default-profile.jpg",
  },
});

const ProfileData = mongoose.model("UserProfileData", userProfile);
module.exports = ProfileData;
