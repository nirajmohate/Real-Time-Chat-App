const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  // Users this account can chat with — only populated once a chat
  // request has been sent AND accepted. This is what makes chat
  // private instead of "everyone can message everyone".
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: [],
    },
  ],
});

module.exports = mongoose.model("Users", userSchema);
