// C:\Users\gertf\Desktop\FoodApp\backend\src\models\restaurant.ts

import mongoose, { Schema, Document, Types } from "mongoose";

const menuItemSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
    default: () => new Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: String,
});

export type MenuItemType = {
  _id: Types.ObjectId;
  name: string;
  price: number;
  imageUrl?: string;
};

interface Restaurant extends Document {
  _id: Types.ObjectId;
  restaurantName: string;
  city: string[];
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: MenuItemType[]; // Use MenuItemType here
  restaurantImageUrl?: string;
  status: string;
  contractType?: string;
  contractId?: string;
  lastUpdated?: Date;
  user: Types.ObjectId;
  wholesale?: boolean;
  email: string;
}

const RestaurantSchema = new Schema({
  restaurantName: { type: String, required: true },
  city: [{ type: String, required: true }],
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  restaurantImageUrl: String,
  status: { type: String, required: true },
  contractType: String,
  contractId: String,
  lastUpdated: { type: Date, default: Date.now },
  user: { type: Types.ObjectId, ref: "User", required: true },
  wholesale: { type: Boolean, default: false },
  email: { type: String, default: "" },
});

export default mongoose.model<Restaurant>("Restaurant", RestaurantSchema);
