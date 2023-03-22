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
  getFollowingSuggestion,
  changePassword,
  changeUserInfo,
} = require("../controller/userController");
const { signInRequired, attachId } = require("../middleware/authMiddleware");
router.post("/user/signup/", signUp);
router.post("/user/signin/", signIn);
router.post("/user/change/password", signInRequired, changePassword);
router.post("/user/change/info", signInRequired, changeUserInfo);
router.post("/follow/", signInRequired, createFollower);
router.post("/unfollow/", signInRequired, unFollow);
router.get("/user/list/", getAlluser);
router.get("/user/search/:query", getUserList);
router.post("/user/info/:user_id", attachId, getUserDetail);
router.post("/user/follow/suggestion/", attachId, getFollowingSuggestion);
module.exports = router;
