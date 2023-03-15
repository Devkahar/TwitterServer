const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  getAlluser,
  getUserDetail,
  createFollower,
  unFollow,
  getUserList,
} = require("../controller/userController");
const { signInRequired, attachId } = require("../middleware/authMiddleware");
router.post("/user/signup/", signUp);
router.post("/user/signin/", signIn);
router.post("/follow/", signInRequired, createFollower);
router.post("/unfollow/", signInRequired, unFollow);
router.get("/user/list/", getAlluser);
router.get("/user/search/:query", getUserList);
router.post("/user/info/:user_id", attachId, getUserDetail);
module.exports = router;
