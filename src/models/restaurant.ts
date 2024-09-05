import mongoose, { Schema, Document } from 'mongoose';

interface Restaurant extends Document {
  restaurantName: string;
  city: string[];
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: {
    name: string;
    price: number;
    imageUrl: string;
  }[];
  restaurantImageUrl: string;
  status: string;
  contractType?: string;
  contractId?: string;
  lastUpdated?: Date;
  user: mongoose.Types.ObjectId; // This links the restaurant to the user
  wholesale?: boolean;
  email: string; // Ensure email field is always present
}

const RestaurantSchema: Schema = new Schema({
  restaurantName: { type: String, required: true },
  city: [{ type: String, required: true }],
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [
    {
      name: String,
      price: Number,
      imageUrl: String,
    },
  ],
  restaurantImageUrl: String,
  status: { type: String, required: true },
  contractType: { type: String },
  contractId: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  wholesale: { type: Boolean, default: false },
  email: { type: String, default: "" }, // Default email field to an empty string
});

export default mongoose.model<Restaurant>("Restaurant", RestaurantSchema);
  