// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect route: verifies JWT and attaches fresh user to req
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user with tenant info
    const user = await User.findById(decoded.id).populate("tenant");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // attach fresh user with tenant info
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin-only middleware
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN")
    return res.status(403).json({ message: "Forbidden" });
  next();
};

// Tenant access middleware
export const tenantAccess = (req, res, next) => {
  if (!req.user || !req.user.tenant)
    return res.status(401).json({ message: "Unauthorized" });
  req.tenantId = req.user.tenant._id;
  next();
};
