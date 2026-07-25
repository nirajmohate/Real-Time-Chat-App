const mongoose = require("mongoose");

// Represents a "can we chat?" request from one user to another.
// A pair of users can only chat once there is an accepted request
// between them — this is the gate that stops open messaging.
const ChatRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A given sender -> receiver pair should only have one active request.
ChatRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("ChatRequests", ChatRequestSchema);
