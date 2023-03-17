const Post = require("../model/postModel");
const Like = require("../model/likeModel");
const {
  getLikeCount,
  getUserLikePost,
  getLikePosts,
} = require("../controller/likeController");
const { dummyTweets, dummyUser } = require("../helper/dummydata");
// @desc Create New Post;
// @route POST api/post/create

const createTweet = async (
  author_id,
  text,
  orig_post_id,
  reply_to_id,
  image
) => {
  const post = new Post({ author_id, text, orig_post_id, reply_to_id, image });
  return await post.save();
};
const createPost = async (req, res) => {
  let { _id, text, retweet_id, reply_id, image } = req.body;
  if (!reply_id) reply_id = null;
  if (!retweet_id) retweet_id = null;
  if (!retweet_id && text === "") {
    res.status(400).json({ errorMessage: "Post Body Should not be empty" });
  } else {
    try {
      const isPostCreated = await createTweet(
        _id,
        text,
        retweet_id,
        reply_id,
        image
      );
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
  const { _id, post_id, text, image } = req.body;
  if (text === "") {
    res.status(400).json({ errorMessage: "Post Body Should not be empty" });
  } else {
    try {
      const post = await Post.findOneAndUpdate(
        { _id: post_id, author_id: _id },
        {
          text,
          image,
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
  const { _id, post_id } = req.body;
  try {
    const post = await Post.findByIdAndDelete({ _id: post_id, author_id: _id });
    if (post && (await Like.deleteMany({ post_id }))) {
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
  console.log(tweet);
  return {
    _id: tweet._id,
    text: tweet.text,
    like_count: tweet.like_count,
    repost_count: tweet.repost_count,
    author: destructureAuthor(tweet.author_id),
    retweet: tweet.reply_to_id ? destructureTweet(tweet.reply_to_id) : null,
    reply_tweet: tweet.orig_post_id
      ? destructureTweet(tweet.orig_post_id)
      : null,
    image: tweet.image,
    createdAt: tweet.createdAt,
  };
};
const getTweets = async (page, user_id, like, replies) => {
  let data;
  if (user_id && like) {
    data = await getLikePosts(page, user_id);
  } else if (user_id && replies) {
    data = await Post.find({ author_id: user_id, reply_to_id: { $ne: null } })
      .sort({ createdAt: "desc" })
      .limit(10)
      .skip((page - 1) * 10)
      .populate("author_id")
      .populate("orig_post_id")
      .populate("reply_to_id");
  } else if (user_id) {
    data = await Post.find({
      author_id: user_id,
      reply_to_id: null,
      orig_post_id: null,
    })
      .sort({ createdAt: "desc" })
      .limit(10)
      .skip((page - 1) * 10)
      .populate("author_id")
      .populate("orig_post_id")
      .populate("reply_to_id");
  } else {
    data = await Post.find({ reply_to_id: null, orig_post_id: null })
      .sort({ createdAt: "desc" })
      .limit(10)
      .skip((page - 1) * 10)
      .populate("author_id")
      .populate("orig_post_id")
      .populate("reply_to_id");
  }
  return data;
};
const getRetweetCount = async (post_id) => {
  return await Post.find({ orig_post_id: post_id }).count();
};
const getReplyCount = async (post_id) => {
  return await Post.find({ reply_to_id: post_id }).count();
};

const getAllTweets = async (req, res) => {
  try {
    const { page } = req.params;
    let { user_id, _id, like, replies } = req.body;
    const data = await getTweets(page, user_id, like, replies);
    if (data) {
      // console.log(data);
      if (!_id) _id = null;
      // console.log(_id);
      const getLike = data.map((tweet) => getLikeCount(tweet._id));
      const getUserLiked = data.map((tweet) => getUserLikePost(tweet._id, _id));
      const userLikedComplete = await Promise.all(getUserLiked);
      const likeComplete = await Promise.all(getLike);
      const replyCount = data.map((tweet) => getReplyCount(tweet._id));
      const replyCountComplete = await Promise.all(replyCount);
      const retweetCount = data.map((tweet) => getRetweetCount(tweet._id));
      const retweetCountComplete = await Promise.all(retweetCount);
      if (
        likeComplete &&
        userLikedComplete &&
        replyCountComplete &&
        retweetCountComplete
      ) {
        likeComplete.map((el) => {
          // console.log(el);
        });
        const tweets = data.map((tweet, idx) => {
          return {
            ...destructureTweet(tweet),
            like_count: likeComplete[idx],
            like: userLikedComplete[idx],
            repost_count: retweetCountComplete[idx],
            reply_count: replyCountComplete[idx],
          };
        });
        res.status(201).json({ tweets });
      } else {
        throw new Error("Cannot Fetch All tweets");
      }
    } else {
      throw new Error("Cannot Fetch All tweets");
    }
  } catch (error) {
    console.log(error);
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
