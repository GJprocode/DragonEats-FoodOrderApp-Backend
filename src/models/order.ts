// // C:\Users\gertf\Desktop\FoodApp\backend\src\models\order.ts

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
//       enum: [
//         "placed",
//         "confirmed",
//         "paid",
//         "inProgress",
//         "outForDelivery",
//         "delivered",
//         "rejected",
//         "resolved",
//       ],
//       default: "placed",
//     },
//     rejectionMessage: { type: String, default: "" },
//     messages: [
//       {
//         status: { type: String, enum: ["rejected", "resolved"], required: true },
//         message: { type: String, required: true },
//         timestamp: { type: Date, default: Date.now },
//       },
//     ],
//     dateDelivered: { type: Date },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;
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
    rejectionMessage: { type: String, default: "" }, // Holds the specific rejection reason
    resolutionMessage: { type: String, default: "" }, // Holds the resolution reason
    messages: [
      {
        status: { type: String, enum: ["rejected", "resolved"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    dateDelivered: { type: Date },
  },
  { timestamps: true }
);

/**
 * Update order status with automated rejection and resolution messages.
 * Moves "resolved" or "delivered" orders to history.
 */
orderSchema.methods.updateStatus = async function (newStatus: string, options = {}) {
  if (newStatus === "rejected") {
    const rejectionMessage =
      this.status === "placed"
        ? "Out of stock, dragons flying to get ingredients."
        : "Refund pending.";

    this.rejectionMessage = rejectionMessage;
    this.messages.push({
      status: "rejected",
      message: rejectionMessage,
    });
  }

  if (newStatus === "resolved") {
    const resolutionMessage =
      this.status === "paid"
        ? "Underground dragons refunded successfully."
        : "Order cancelled due to stock issues and dragons' wings.";

    this.resolutionMessage = resolutionMessage;
    this.messages.push({
      status: "resolved",
      message: resolutionMessage,
    });

    // Move resolved orders to history
    this.status = "history";
  }

  if (newStatus === "delivered") {
    // Move delivered orders to history
    this.dateDelivered = new Date();
    this.status = "history";
  } else {
    this.status = newStatus;
  }

  await this.save();
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
