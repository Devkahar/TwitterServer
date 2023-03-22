const User = require("../model/userModel");
const Follow = require("../model/followingModel");
const bcrypt = require("bcryptjs");
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
  const { name, password, email, bio, image } = req.body;
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
          email,
          name,
          password,
          avatar: image ?? "",
          bio: bio !== "" ? bio : "",
        });
        const userCreated = await user.save();
        if (userCreated) {
          const data = {
            _id: userCreated._id,
            name: userCreated.name,
            email: userCreated.email,
            image: userCreated.avatar ?? "",
            bio: userCreated.bio,
            token: generateToken(userCreated._id),
          };
          console.log(data);
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
        console.log("avatar ", user.avatar);
        res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.avatar ?? "",
          bio: user.bio,
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
const changePassword = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    let { _id, password } = req.body;
    password = await bcrypt.hash(password, salt);
    if (
      password &&
      (await User.findOneAndUpdate({ _id }, { password: password }))
    ) {
      res.status(201).json({ message: "Password Changes Successfully" });
    } else {
      throw new Error("Cannot Change password");
    }
  } catch (error) {
    res.status(401).json({ errorMeassge: error.message });
  }
};
const changeUserInfo = async (req, res) => {
  try {
    const { _id, name, email, bio, image } = req.body;
    const user = await User.findOneAndUpdate(
      { _id },
      { name, email, bio, avatar: image ?? "" },
      { returnOriginal: false }
    );
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.avatar ?? "",
        bio: user.bio,
      });
    } else {
      throw new Error("Cannot Change password");
    }
  } catch (error) {
    res.status(401).json({ errorMeassge: error.message });
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
          bio: el.bio,
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
    console.log(error);
    res.status(401).json({ errorMeassge: error.message });
  }
};
const createDummyUser = async () => {
  const user = new User({ email, name, password, bio: bio !== "" ? bio : "" });
  const userCreated = await user.save();
};

const isFollowing = async (_id, curr_id) => {
  if (_id === curr_id) return true;
  if (await Follow.findOne({ follower_id: curr_id, following_id: _id })) {
    return true;
  } else return false;
};
const getFollowingSuggestion = async (req, res) => {
  try {
    let { _id, page } = req.body;
    if (!_id) _id = null;
    console.log(_id);
    console.log(page);
    if (!page) page = 1;
    const suggestion = await User.find({})
      .sort({ createdAt: "desc" })
      .skip((page - 1) * 10)
      .limit(10);
    if (suggestion) {
      const following = suggestion.map((el) =>
        isFollowing(el._id.toString(), _id)
      );
      const followingComplete = await Promise.all(following);
      if (followingComplete) {
        console.log(followingComplete);
        const newData = [];
        for (let i = 0; i < suggestion.length; i++) {
          if (!followingComplete[i]) {
            newData.push({
              _id: suggestion[i]._id,
              name: suggestion[i].name,
              image: suggestion[i].avatar,
            });
          }
        }
        res.status(200).json({ data: newData });
      } else {
        throw Error("No Users Found");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ errorMeassge: error.message });
  }
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
  getFollowingSuggestion,
  changePassword,
  changeUserInfo,
};
