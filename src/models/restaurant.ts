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
  user: mongoose.Types.ObjectId; // Ensure this is always an ObjectId
  wholesale?: boolean;
  email: string;
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ObjectId reference to User
  wholesale: { type: Boolean, default: false },
  email: { type: String, default: "" },
});

export default mongoose.model<Restaurant>("Restaurant", RestaurantSchema);
