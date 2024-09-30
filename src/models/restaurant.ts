// C:\Users\gertf\Desktop\FoodApp\backend\src\models\restaurant.ts
// below new for orders
import mongoose, { Schema, Document, InferSchemaType } from "mongoose";
const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

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
  user: mongoose.Types.ObjectId;
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
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  wholesale: { type: Boolean, default: false },
  email: { type: String, default: "" },
});

export default mongoose.model<Restaurant>("Restaurant", RestaurantSchema);
