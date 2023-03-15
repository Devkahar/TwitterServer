const User = require("../model/userModel");
const Follow = require("../model/followingModel");
const {
  validateEmail,
  validatePassword,
  generateToken,
} = require("../helper/authHelper");
const e = require("express");

// @desc    Register a new user
// @route   POST /api/user/signup
const signUp = async (req, res) => {
  // console.log(req);
  const { name, password, email, bio } = req.body;
  if (validateEmail(email) && validatePassword(password) && name !== "") {
    try {
      const userExisit = await User.findOne({
        $or: [{ name: name, email: email }],
      });
      if (userExisit) {
        errorMeassge = "User Already Exist";
        res.status(401).json({ errorMeassge });
      } else {
        const user = new User({
          _id: user._id,
          email,
          name,
          password,
          bio: bio !== "" ? bio : "",
        });
        const userCreated = await user.save();
        if (userCreated) {
          const data = {
            name: userCreated.name,
            email: userCreated.email,
            token: generateToken(userCreated._id),
          };
          res.status(201).json({ ...data });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ errorMeassge: error.message });
    }
  } else {
    const errorMeassge = "Cannot Create user.";
    res.status(401).json({ errorMeassge });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password))) {
        res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        errorMeassge = "Enter Valid Login Details 3";
        res.status(401).json({ errorMeassge });
      }
    } catch (error) {
      res.status(401).json({ errorMeassge: error.message });
    }
  } else {
    errorMeassge = "Enter Valid Login Details";
    res.status(401).json({ errorMeassge });
  }
};
const getAlluser = async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      const userList = users.map((el) => {
        return {
          _id: el._id,
          name: el.name,
          email: el.email,
        };
      });
      res.status(201).json({
        userList,
      });
    } else {
      throw new Error("Cannot find All user");
    }
  } catch (error) {
    res.status(401).json({ errorMeassge: error.message });
  }
};
const getUserById = async (_id) => {
  return await User.findOne({ _id });
};

const searchUsers = async (query, page = 1) => {
  const search = {
    name: {
      $regex: query,
      $options: "i",
    },
  };
  return await User.find({ ...search })
    .limit(10)
    .skip(page - 1);
};
const getUserList = async (req, res) => {
  try {
    const { query } = req.params;
    const data = await searchUsers(query);
    if (data) {
      res.status(201).json({
        data,
      });
    } else {
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ errorMeassge: error.message });
  }
};
const getUserDetail = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { _id } = req.body;
    console.log(user_id, _id);
    const user = await getUserById(user_id);
    const followers = await Follow.find({ following_id: user_id }).count();
    const isFollowing = await Follow.find({
      follower_id: _id,
      following_id: user_id,
    }).count();
    const following = await Follow.find({
      follower_id: user_id,
    }).count();
    console.log(isFollowing);
    if (user && followers >= 0 && isFollowing >= 0 && following >= 0) {
      console.log(isFollowing);
      const userInfo = {
        _id: user._id,
        name: user.name,
        image: user.avatar,
        bio: user.bio,
        followers,
        isFollowing: isFollowing > 0,
        following,
      };
      res.status(201).json({
        userDetails: userInfo,
      });
    } else {
      throw new Error("Cannot find user");
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ errorMeassge: error.message });
  }
};
const createFollower = async (req, res) => {
  try {
    const { _id, user_id } = req.body;
    console.log("Cre", _id, user_id);
    const follow = new Follow({
      follower_id: _id,
      following_id: user_id,
    });
    if (await follow.save()) {
      res.status(201).send({ message: "Following" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ errorMeassge: error.message });
  }
};
const unFollow = async (req, res) => {
  try {
    const { _id, user_id } = req.body;
    const unFollow = await Follow.findOneAndDelete({
      follower_id: _id,
      following_id: user_id,
    });
    if (unFollow) {
      res.status(201).send({ message: "Unfollow" });
    }
  } catch (error) {
    console.log();
    res.status(401).json({ errorMeassge: error.message });
  }
};
const createDummyUser = async () => {
  const user = new User({ email, name, password, bio: bio !== "" ? bio : "" });
  const userCreated = await user.save();
};
module.exports = {
  signUp,
  signIn,
  getAlluser,
  getUserDetail,
  getUserById,
  createFollower,
  unFollow,
  getUserList,
};
