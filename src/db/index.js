const mongoose = require("mongoose");
exports.connectDB = async () => {
  try {
    console.log(process.env.DB_NAME);
    const conn = await mongoose.connect(
      `mongodb+srv://root:${process.env.PASSWORD}@cluster0.nd6mr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
