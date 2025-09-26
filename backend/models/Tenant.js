import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
  noteLimit: { type: Number, default: 3 }, // Free users limited to 3 notes
});

export default mongoose.model("Tenant", tenantSchema);
