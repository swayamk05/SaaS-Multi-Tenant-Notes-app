// backend/routes/admin.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET users in admin's tenant
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ tenant: req.user.tenant._id }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Admin GET users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE user in same tenant (admin provides password)
router.post("/users", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashed,
      role: (role || "MEMBER").toUpperCase(),
      tenant: req.user.tenant._id,
    });

    // Do not return password
    const { password: _p, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a user (only in same tenant)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ _id: req.params.id, tenant: req.user.tenant._id });
    if (!deleted) return res.status(404).json({ message: "User not found in your tenant" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPGRADE: set tenant plan to PRO for this user's tenant (admin only)
// backend/routes/admin.js or tenants.js
router.post("/:userId/upgrade", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find existing tenant
    let tenant = await Tenant.findOne({ user: user._id });

    if (!tenant) {
      // Create tenant with required fields
      tenant = await Tenant.create({
        user: user._id,
        name: `${user.name || user.email}'s Tenant`, // provide a name
        plan: "PRO"
      });
    } else {
      tenant.plan = "PRO";
      await tenant.save();
    }

    res.json({ message: "User upgraded to PRO" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upgrade user", error: err.message });
  }
});


export default router;
