// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Tenant from "./models/Tenant.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/saas-notes";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function seed() {
  try {
    // Clear previous data
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create Tenant first
    const tenantX = await Tenant.create({
      name: "Tenant X",
      plan: "FREE"
    });

    // Create Admin user and link to tenant
    const adminPassword = await bcrypt.hash("adminPassword", 10);
    const adminUser = await User.create({
      name: "Admin X",
      email: "adminx@example.com",
      password: adminPassword,
      role: "ADMIN",
      tenant: tenantX._id
    });

    // Assign tenant owner (optional if you have a reference)
    tenantX.user = adminUser._id;
    await tenantX.save();

    // Create a Member user in same tenant
    const memberPassword = await bcrypt.hash("memberPassword", 10);
    await User.create({
      name: "Member X",
      email: "memberx@example.com",
      password: memberPassword,
      role: "MEMBER",
      tenant: tenantX._id
    });

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
