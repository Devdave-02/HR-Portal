import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now }, // auto adds date/time
  refreshToken: { type: String, default: null },
});


export default mongoose.model("User", userSchema);
