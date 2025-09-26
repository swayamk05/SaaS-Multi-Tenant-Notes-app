import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "MEMBER", "PRO"], default: "MEMBER" },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
