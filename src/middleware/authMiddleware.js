const jwt = require("jsonwebtoken");
const signInRequired = (req, res, next) => {
  console.log("We are here ", req.headers.authorization);
  if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        const sigoutRequired = true;
        res.status(401).json({ sigoutRequired });
      } else {
        req.body._id = user.id;
        next();
      }
    });
  } else {
    return res.status(500).json({
      message: "Auth required",
    });
  }
};

const attachId = (req, res, next) => {
  console.log("We are here ", req.headers.authorization);
  if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (user) {
        req.body._id = user.id;
      }
      next();
    });
  } else {
    next();
  }
};
module.exports = {
  signInRequired,
  attachId,
};
