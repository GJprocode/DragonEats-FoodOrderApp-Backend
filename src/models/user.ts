// C:\Users\gertf\Desktop\FoodApp\backend\src\models\user.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: [String], // Store multiple auth0Ids
    required: true
  },
  email: {
    type: String,
    unique: true, // Ensure email uniqueness
    required: true
  },
  name: String,
  address: String,
  city: String,
  country: String,
  role: {
    type: String,
    default: "user" // Default role is 'user'
  }
});

const User = mongoose.model("User", userSchema);
export default User;
