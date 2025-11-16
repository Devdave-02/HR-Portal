import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  firstLoginAt: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },

  refreshToken: { type: String, default: null },
});

export default mongoose.model("User", userSchema);
