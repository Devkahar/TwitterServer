const mongoose = require("mongoose");
const followSchema = mongoose.Schema(
  {
    follower_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    following_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Following = mongoose.model("Following", followSchema);
module.exports = Following;
