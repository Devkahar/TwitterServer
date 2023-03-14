const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  deletePost,
  uploadTweets,
  getAllTweets,
} = require("../controller/postController.js");
const { signInRequired } = require("../middleware/authMiddleware");
router.post("/post/create/", signInRequired, createPost);
router.post("/post/update/", signInRequired, updatePost);
router.post("/post/delete/", signInRequired, deletePost);
router.get("/post/upload/", uploadTweets);
router.post("/post/tweets/:page", getAllTweets);
module.exports = router;
