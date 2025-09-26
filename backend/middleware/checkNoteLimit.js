// backend/middleware/checkNoteLimit.js
import Note from "../models/Note.js";

export default async function checkNoteLimit(req, res, next) {
  try {
    // Reload user from DB to get latest tenant info
    await req.user.populate("tenant").execPopulate();

    // Allow ADMIN or PRO users
    if (req.user.role === "ADMIN" || req.user.tenant.plan === "PRO") {
      return next();
    }

    // For MEMBER on FREE plan
    const noteCount = await Note.countDocuments({ tenant: req.user.tenant._id });
    if (noteCount >= 3) {
      return res.status(403).json({ message: "Free plan limit reached. Upgrade to PRO." });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error in note limit check" });
  }
}
