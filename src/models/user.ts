// src/models/user.ts

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: { type: [String], required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  address: String,
  city: String,
  country: String,
  cellphone: String,
  role: { type: String, default: "user" },
  userLocation: { type: [Number], default: [] }, // Latitude and longitude array
});

const User = mongoose.model("User", userSchema);
export default User;
