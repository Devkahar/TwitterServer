const e = require("express");
const Like = require("../model/likeModel");
const { getUserById } = require("./userController");

const createLike = async (post_id, user_id) => {
  const likeExist = await Like.findOne({ post_id, user_id });
  if (likeExist) {
    throw new Error("Already Liked Post");
  } else {
    const like = new Like({ post_id, user_id });
    return await like.save();
  }
};

const deleteLike = async (post_id, user_id) => {
  return await Like.findOneAndDelete({ post_id, user_id });
};

const getLikeCount = async (post_id) => {
  return await Like.find({ post_id }).count();
};

const getUserLikePost = async (post_id, user_id) => {
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
    data = data.filter((el) => el.post_id !== null);
    const newData = data.map(async (el) => {
      return {
        _id: el.post_id._id,
        text: el.post_id.text,
        like_count: el.post_id.like_count,
        repost_count: el.post_id.repost_count,
        ref_id: el.post_id.reply_to_id ? el.post_id.reply_to_id : null,
        image: el.post_id.image,
        author_id: await getUserById(el.post_id.author_id),
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
