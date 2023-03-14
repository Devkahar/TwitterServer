const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// function checkFileType(file, cb) {
//   const filetypes = /jpg|jpeg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb("Images only!");
//   }
// }

const upload = multer({ storage });
router.post("/image/upload", upload.single("image"), (req, res, next) => {
  res
    .status(201)
    .json({ message: "Image Upload Successful", path: `/${req.file.path}` });
});

module.exports = router;
