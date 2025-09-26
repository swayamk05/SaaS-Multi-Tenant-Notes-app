import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Tenant from "./models/Tenant.js";

dotenv.config();

const clearDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Tenant.deleteMany({});
  console.log("Collections cleared!");
  process.exit();
};

clearDB();
