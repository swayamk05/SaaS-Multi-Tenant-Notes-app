// backend/setPassword.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function setPassword(email, newPlainPassword) {
  await mongoose.connect(MONGO_URI);
  const hashed = await bcrypt.hash(newPlainPassword, 10);
  const result = await User.findOneAndUpdate({ email }, { password: hashed }, { new: true });
  console.log("Updated:", result ? result.email : "user not found");
  process.exit(0);
}

// usage: node setPassword.js user@example.com newpass123
const [,, email, newPass] = process.argv;
if (!email || !newPass) {
  console.error("Usage: node setPassword.js <email> <newPassword>");
  process.exit(1);
}
setPassword(email, newPass);
