// // order.ts
// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     deliveryDetails: {
//       email: { type: String, required: true },
//       name: { type: String, required: true },
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       cellphone: { type: String, required: true },
//     },
//     cartItems: [
//       {
//         menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
//         quantity: { type: Number, required: true },
//         name: { type: String, required: true },
//         price: { type: Number, required: true },
//       },
//     ],
//     totalAmount: { type: Number, default: 0 },
//     status: {
//       type: String,
//       enum: ["placed", "confirmed", "paid", "inProgress", "outForDelivery", "delivered"],
//       default: "placed",
//     },
//     dateDelivered: { type: Date },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;



// order.ts

import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryDetails: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      cellphone: { type: String, required: true },
    },
    cartItems: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["placed", "confirmed", "paid", "inProgress", "outForDelivery", "delivered", "rejected"],
      default: "placed",
    },
    rejectionMessage: { type: String }, // New field
    dateDelivered: { type: Date },
  },
  { timestamps: true }
);


const Order = mongoose.model("Order", orderSchema);
export default Order;