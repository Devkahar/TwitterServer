const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  getAlluser,
  getUserDetail,
} = require("../controller/userController");
router.post("/user/signup/", signUp);
router.post("/user/signin/", signIn);
router.get("/user/list/", getAlluser);
router.get("/user/info/:user_id", getUserDetail);
module.exports = router;
