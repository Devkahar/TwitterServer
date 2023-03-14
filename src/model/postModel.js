const mongoose = require("mongoose");
const postSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    like_count: {
      type: Number,
      default: 0,
    },
    repost_count: {
      type: Number,
      default: 0,
    },
    orig_post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reply_to_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
