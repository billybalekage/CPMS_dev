const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.DB_URL ||
    "mongodb://localhost:27017/cpms_db";

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connecté");
    return true;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectDB();
  }
};

module.exports = connectDB;
