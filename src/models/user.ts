//  C:\Users\gertf\Desktop\FoodApp\backend\src\models\user.ts

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: { type: [String], required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  address: String,
  city: String,
  country: String,
  cellphone: { type: String },
  role: { type: String, default: "user" },
  latitude: { type: Number, default: null }, // Add latitude
  longitude: { type: Number, default: null }, // Add longitude
});


const User = mongoose.model("User", userSchema);
export default User;
