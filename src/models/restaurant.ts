// src/models/restaurant.ts

import mongoose, { Schema, Document, Types } from "mongoose";

// Define the MenuItem schema and type
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

// Define the BranchInfo schema and type
const branchInfoSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
    default: () => new Types.ObjectId(),
  },
  cities: { type: String, required: true, index: true },
  branchName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export type BranchInfoType = {
  _id: Types.ObjectId;
  cities: string;
  branchName: string;
  latitude: number;
  longitude: number;
};

// Define the Restaurant interface
interface Restaurant extends Document {
  _id: Types.ObjectId;
  restaurantName: string;
  branchesInfo: BranchInfoType[];
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItems: MenuItemType[];
  restaurantImageUrl?: string;
  status: "submitted" | "pending" | "approved" | "rejected";
  contractType?: string;
  contractId?: string;
  lastUpdated?: Date;
  user: Types.ObjectId;
  wholesale?: boolean;
  email: string;
  cellphone?: string;
}

// Define the Restaurant schema
const RestaurantSchema = new Schema({
  restaurantName: { type: String, required: true },
  branchesInfo: [branchInfoSchema],
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  restaurantImageUrl: String,
  status: {
    type: String,
    required: true,
    enum: ["submitted", "pending", "approved", "rejected"],
  },
  contractType: String,
  contractId: String,
  lastUpdated: { type: Date, default: Date.now },
  user: { type: Types.ObjectId, ref: "User", required: true },
  wholesale: { type: Boolean, default: false },
  email: { type: String, default: "" },
  cellphone: { type: String, default: "" },
});

// Export the Restaurant model
export default mongoose.model<Restaurant>("Restaurant", RestaurantSchema);
