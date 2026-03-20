const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
}

try {
  connectDB();
  console.log("Pinged to the MongoDB");
} catch (err) {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
}

module.exports = connectDB;
