import mongoose from "mongoose";

// Define the schema for menu items
const menuItemsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// Define the schema for restaurants
const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }], // Cuisines will be an array of strings
  menuItems: [menuItemsSchema], // Embedded schema for menu items
  imageUrl: { type: String, required: true }, // URL from Cloudinary for the image
  lastUpdated: { type: Date, required: true }, // Helps with analytics and metrics
});

// Create the model based on the schema
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
