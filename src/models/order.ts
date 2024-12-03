// C:\Users\gertf\Desktop\FoodApp\backend\src\models\order.ts

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    restaurantName: { type: String, required: true },
    branchDetails: {
      branchName: { type: String, required: true },
      city: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    businessType: { type: Boolean, required: true, default: false }, // False: Restaurant, True: Wholesale
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    cartItems: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    deliveryDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      email: { type: String, required: true },
      cellphone: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true, default: 0 },
    paymentType: { type: String, default: "Stripe" }, // Default to Stripe
    paymentTransactionId: { type: String }, // To store payment provider transaction ID
    dateDelivered: { type: Date, default: null },
    dateResolved: { type: Date, default: null },
    rejectionMessage: { message: { type: String }, timestamp: { type: Date } },
    resolutionMessage: { message: { type: String }, timestamp: { type: Date } },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;




