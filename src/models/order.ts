// C:\Users\gertf\Desktop\FoodApp\backend\src\models\order.ts

// C:\Users\gertf\Desktop\FoodApp\backend\src\models\order.ts

import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true, // Ensures every order is linked to a restaurant
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensures every order is linked to a user
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "paid",
        "inProgress",
        "outForDelivery",
        "delivered",
        "rejected",
        "resolved",
      ],
      default: "placed",
    },
    rejectionMessage: {
      message: { type: String, default: "" },
      timestamp: { type: Date, default: null },
    },
    resolutionMessage: {
      message: { type: String, default: "" },
      timestamp: { type: Date, default: null },
    },
    dateDelivered: { type: Date, default: null },
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Ensures it's always defined
    },
    cartItems: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Store price in cents for consistency
      },
    ],
    deliveryDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      email: { type: String, required: true },
      cellphone: { type: String, required: true },
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

const Order = mongoose.model("Order", orderSchema);
export default Order;




