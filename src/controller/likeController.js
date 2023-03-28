const e = require("express");
const Like = require("../model/likeModel");
const { getUserById } = require("./userController");
const likeCountCache = new Map();
const userLikeCache = new Map();
const createLike = async (post_id, user_id) => {
  let key = post_id.toString();
  let userLikeKey = key + user_id.toString();
  if (userLikeCache.has(userLikeKey) && userLikeCache.get(userLikeKey))
    return true;
  const likeExist = await Like.findOne({ post_id, user_id });
  if (likeExist) {
    throw new Error("Already Liked Post");
  } else {
    const like = new Like({ post_id, user_id });
    const res = await like.save();

    if (res) {
      if (likeCountCache.has(key)) {
        likeCountCache.set(key, likeCountCache.get(key) + 1);
      }
      userLikeCache.set(userLikeKey, true);
    }
    return res;
  }
};

const deleteLike = async (post_id, user_id) => {
  let key = post_id.toString();
  let userLikeKey = key + user_id.toString();
  userLikeCache.set(userLikeKey, false);
  const data = await Like.findOneAndDelete({ post_id, user_id });
  if (data) {
    if (likeCountCache.has(key)) {
      likeCountCache.set(key, likeCountCache.get(key) - 1);
    }
  }
  return data;
};

const getLikeCount = async (post_id) => {
  let key = post_id.toString();
  console.log(key);
  if (likeCountCache.has(key)) {
    return likeCountCache.get(key);
  }
  const data = await Like.find({ post_id }).count();
  if (data >= 0) {
    likeCountCache.set(key, data);
  }
  return data;
};

const getUserLikePost = async (post_id, user_id) => {
  let key = post_id.toString();
  let userLikeKey = key + user_id.toString();
  if (likeCountCache.has(userLikeKey)) return userLikeKey.get(userLikeKey);
  if (await Like.findOne({ user_id, post_id })) {
    return true;
  } else {
    return false;
  }
};
const getLikePosts = async (page, user_id) => {
  let data = await Like.find({ user_id })
    .sort({ createdAt: "desc" })
    .limit(10)
    .skip((page - 1) * 10)
    .populate("post_id");

  if (data) {
    console.log(...data);
    data = data.filter((el) => el.post_id);
    const newData = data.map(async (el) => {
      return {
        _id: el.post_id._id,
        text: el.post_id.text,
        like_count: el.post_id.like_count,
        repost_count: el.post_id.repost_count,
        ref_id: el.post_id.reply_to_id ? el.post_id.reply_to_id : null,
        image: el.post_id.image,
        author_id: await getUserById(el.post_id.author_id),
        createdAt: el.post_id.createdAt,
        updatedAt: el.post_id.updatedAt,
      };
    });
    const prom = Promise.all(newData);
    if (prom) {
      return prom;
    }
  }
};
const likePost = async (req, res) => {
  const { post_id, _id } = req.body;
  try {
    const isLikeCreated = await createLike(post_id, _id);
    if (isLikeCreated) {
      console.log("User Like Save");
      res.status(201).json({ message: "Like" });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: error });
  }
};

const unlikePost = async (req, res) => {
  const { post_id, _id } = req.body;
  try {
    const unlike = await deleteLike(post_id, _id);
    if (unlike) {
      res.status(201).json({ message: "UnLike" });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: error });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getLikeCount,
  getUserLikePost,
  getLikePosts,
};
