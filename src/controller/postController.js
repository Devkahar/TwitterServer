const Post = require("../model/postModel");
const {
  getLikeCount,
  getUserLikePost,
} = require("../controller/likeController");
const { dummyTweets, dummyUser } = require("../helper/dummydata");
// @desc Create New Post;
// @route POST api/post/create

const createTweet = async (author_id, text, reply_to_id, image) => {
  const post = new Post({ author_id, text, reply_to_id, image });
  return await post.save();
};
const createPost = async (req, res) => {
  const { _id, text, ref_id, image } = req.body;
  if (!ref_id) ref_id = null;
  if (text === "") {
    res.status(400).json({ errorMessage: "Post Body Should not be empty" });
  } else {
    try {
      const isPostCreated = await createTweet(_id, text, ref_id, image);
      if (isPostCreated) {
        res.status(201).json({
          message: "Post Created Successfully",
          postCreated: true,
        });
      } else {
        throw Error("Cannot Create Post");
      }
    } catch (error) {
      console.log("Error ", error);
      res.status(400).json({ errorMessage: error.message });
    }
  }
};

// @desc Update Post;
// @route POST api/post/update
const updatePost = async (req, res) => {
  const { _id, _postid, text } = req.body;
  if (text === "") {
    res.status(400).json({ errorMessage: "Post Body Should not be empty" });
  } else {
    try {
      const post = await Post.findOneAndUpdate(
        { _id: _postid, author_id: _id },
        {
          text,
        }
      );
      if (post) {
        res.status(201).json({
          message: "Post Updated Successfully",
          postUpdate: true,
        });
      } else {
        throw Error("Cannot Update Post");
      }
    } catch (error) {
      console.log("Error ", error);
      res.status(400).json({ errorMessage: error.message });
    }
  }
};

const deletePost = async (req, res) => {
  const { _id, _postid } = req.body;
  try {
    const post = await Post.findByIdAndDelete({ _id: _postid, author_id: _id });
    if (post) {
      res.status(201).json({
        message: "Post Deleted Successfully",
        postDeleted: true,
      });
    } else {
      throw new Error("Cannot Delete Post");
    }
  } catch (error) {
    res.status(400).json({ errorMessage: error.message });
  }
};

const createDummyPost = async function (_id, text) {
  const post = new Post({ author_id: _id, text });
  return await post.save();
};
const uploadTweets = async (req, res) => {
  try {
    let user = 0;
    const postCreate = dummyTweets.map(async (tweet, idx) => {
      if (idx > 10 && idx % 10 === 1) user++;
      return await createDummyPost(dummyUser[user]._id, tweet);
    });
    const posts = Promise.all(postCreate);
    if (posts) {
      res.status(201).json({ message: "Tweets Created" });
    } else {
      throw new Error("Tweets Were not Created");
    }
  } catch (error) {
    res.status(400).json({ errorMessage: error.message });
  }
};
const getLikes = async function (tweet) {
  const like_count = await getLikeCount(tweet._id);
};

const destructureAuthor = (author) => {
  return {
    name: author.name,
    _id: author.id,
    image: author.avatar,
  };
};
const destructureTweet = (tweet) => {
  return {
    _id: tweet._id,
    text: tweet.text,
    like_count: tweet.like_count,
    repost_count: tweet.repost_count,
    author: destructureAuthor(tweet.author_id),
    ref_id: tweet.reply_to_id ? tweet.reply_to_id : null,
    image: tweet.image,
  };
};
const getTweets = async (page, user_id) => {
  let data;
  if (user_id) {
    data = await Post.find({ author_id: user_id })
      .sort({ createdAt: "desc" })
      .limit(10)
      .skip((page - 1) * 10)
      .populate("author_id");
  } else {
    data = await Post.find()
      .sort({ createdAt: "desc" })
      .limit(10)
      .skip((page - 1) * 10)
      .populate("author_id");
  }
  return data;
};
const getAllTweets = async (req, res) => {
  try {
    const { page } = req.params;
    let { user_id } = req.body;
    const data = await getTweets(page, user_id);
    if (data) {
      console.log(data);
      if (!user_id) user_id = null;
      const getLike = data.map((tweet) => getLikeCount(tweet._id));
      const getUserLiked = data.map((tweet) =>
        getUserLikePost(tweet._id, user_id)
      );
      const userLikedComplete = await Promise.all(getUserLiked);
      const likeComplete = await Promise.all(getLike);
      if (likeComplete && userLikedComplete) {
        likeComplete.map((el) => {
          console.log(el);
        });
        const tweets = data.map((tweet, idx) => {
          return {
            ...destructureTweet(tweet),
            like_count: likeComplete[idx],
            like: userLikedComplete[idx],
          };
        });
        res.status(201).json({
          tweets,
        });
      } else {
        throw new Error("Cannot Fetch All tweets");
      }
    } else {
      throw new Error("Cannot Fetch All tweets");
    }
  } catch (error) {
    res.status(400).json({
      errorMessage: error.message,
    });
  }
};

const repost = (module.exports = {
  createPost,
  updatePost,
  deletePost,
  uploadTweets,
  getAllTweets,
});
