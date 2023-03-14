const Like = require("../model/likeModel");

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
};
