const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const dotenv = require("dotenv");
const authRoutes = require("./route/authRoute");
const postRoutes = require("./route/postRoute");
const likeRoutes = require("./route/likeRoute");
const imageRoutes = require("./route/imageRoute");
const cors = require("cors");
dotenv.config();
const { connectDB } = require("./db/index");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.get("/hello/", (req, res) => {
  res.send("Hello Dev Here");
});
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", likeRoutes);
app.use("/api", imageRoutes);
app.use("/uploads", express.static("./uploads"));
app.listen(PORT, () => {
  console.log("Server is listening on port " + PORT);
});
