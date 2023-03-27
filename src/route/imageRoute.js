const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_APP,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_APP,
});
const upload = multer().single("image");
router.post("/image/upload", upload, (req, res, next) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  console.log("Bucket Name ", process.env.AWS_BUCKET_NAME);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME_APP,
    Key: `${uuid.v4()}.${fileType}`,
    Body: req.file.buffer,
  };
  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res
        .status(201)
        .json({ message: "Image Upload Successful", path: "/" + data.key });
    }
  });
});

module.exports = router;
