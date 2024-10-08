import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    cellphone: { type: String, required: true }, // Adding cellphone field
  },
  cartItems: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }, // Ensure this is Number
    },
  ],
  totalAmount: { type: Number, default: 0 },  // Default to 0
  status: {
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
    default: "placed",
  },
}, { timestamps: true });  // This adds `createdAt` and `updatedAt` automatically

const Order = mongoose.model("Order", orderSchema);
export default Order;
