const express = require("express");
const router = express.Router();
const multer = require("multer");
// const AWS = require("aws-sdk");
const uuid = require("uuid");
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    let myFile = file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    cb(null, `${uuid.v4()}.${fileType}`);
  },
});
const upload = multer({ storage });
router.post("/image/upload", upload.single("image"), (req, res, next) => {
  res
    .status(201)
    .json({ message: "Image Upload Successful", path: `/${req.file.path}` });
});

module.exports = router;
