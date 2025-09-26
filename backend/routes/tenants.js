// backend/routes/tenant.js
import express from "express";
import bcrypt from "bcryptjs";
import { protect, adminOnly } from "../middleware/auth.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";

const router = express.Router();

// Admin: GET all users in the same tenant
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ tenant: req.user.tenant._id }).select("-password").populate("tenant");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Admin: CREATE user with tenant association
router.post("/users", protect, adminOnly, async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    role: role.toUpperCase(),
    password: hashedPassword,
    tenant: req.user.tenant._id, // associate with admin's tenant
  });

  res.status(201).json(newUser);
});

// Admin: DELETE user in same tenant
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, tenant: req.user.tenant._id });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Admin: UPGRADE user's tenant plan
router.post("/users/:userId/upgrade", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("tenant");
    if (!user) return res.status(404).json({ message: "User not found" });

    let tenant = user.tenant;

    if (!tenant) {
      // create new tenant if not exist
      tenant = await Tenant.create({
        name: `${user.name || user.email}'s Tenant`,
        plan: "PRO",
      });
      user.tenant = tenant._id;
      await user.save();
    } else {
      // upgrade existing tenant
      tenant.plan = "PRO";
      await tenant.save();
    }

    // send updated user info with populated tenant
    const updatedUser = await User.findById(user._id).populate("tenant");

    res.json({ message: "User upgraded to PRO", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upgrade user", error: err.message });
  }
});

export default router;
