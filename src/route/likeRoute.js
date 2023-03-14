const express = require('express');
const router = express.Router();
const {likePost,unlikePost} = require('../controller/likeController');
const {signInRequired} = require('../middleware/authMiddleware');


router.post('/post/like/',signInRequired,likePost);
router.post('/post/unlike/',signInRequired,unlikePost);
module.exports = router;