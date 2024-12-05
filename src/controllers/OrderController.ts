import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const STRIPE = new Stripe(STRIPE_API_KEY, {
  apiVersion: "2024-11-20.acacia",
});

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export const updateUserOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId).populate("user").populate("restaurant");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    const validTransitions: Record<
      "placed" | "confirmed" | "paid" | "inProgress" | "outForDelivery" | "delivered" | "rejected" | "resolved",
      string[]
    > = {
      placed: ["confirmed", "rejected"],
      confirmed: ["rejected"],
      paid: ["inProgress", "rejected"],
      inProgress: ["outForDelivery", "rejected"],
      outForDelivery: ["delivered", "rejected"],
      delivered: [],
      rejected: ["resolved"],
      resolved: [],
    };

    const orderStatus = order.status as keyof typeof validTransitions;

    if (!validTransitions[orderStatus]?.includes(status)) {
      return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }

    if (status === "rejected") {
      order.rejectionMessage = {
        message: req.body.message || "Order rejected by user",
        timestamp: new Date(),
      };
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating user order status:", error);
    res.status(500).json({ message: "Failed to update user order status" });
  }
};

export const updateOrderStatusFromStripe = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Assume Stripe event has validated the status transition
    order.status = "paid";
    order.totalAmount = req.body.amount_total || order.totalAmount;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status from Stripe:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    res.json(
      orders.map((order) => ({
        ...order.toObject(),
        branchName: order.branchDetails?.branchName || "",
      }))
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"] as string;
    event = STRIPE.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId found in session metadata.");
        return res.status(400).send("Missing orderId in session metadata.");
      }

      const order = await Order.findById(orderId);
      if (!order) {
        console.error("Order not found for orderId:", orderId);
        return res.status(404).send("Order not found.");
      }

      order.status = "paid";
      order.totalAmount = session.amount_total || 0;
      await order.save();

      console.log(`Order with ID ${orderId} has been updated to "paid".`);
    }
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  res.json({ received: true });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cartItems, deliveryDetails, restaurantId, branchDetails, orderId } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let existingOrder = orderId ? await Order.findById(orderId) : null;

    if (existingOrder && existingOrder.status !== "confirmed") {
      return res.status(400).json({
        message: "Order must be confirmed before proceeding to payment.",
      });
    }

    if (!existingOrder) {
      existingOrder = new Order({
        restaurant: restaurant._id,
        restaurantName: restaurant.restaurantName,
        branchDetails,
        user: new mongoose.Types.ObjectId(req.userId),
        status: "placed",
        deliveryDetails,
        cartItems,
        totalAmount: 0,
      });
    }

    const itemsTotal = cartItems.reduce(
      (total: number, item: { price: number; quantity: number }) => total + item.price * item.quantity,
      0
    );

    existingOrder.totalAmount = itemsTotal + restaurant.deliveryPrice;

    await existingOrder.save();

    const lineItems = cartItems.map((item: { name: any; price: number; quantity: any; }) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price),
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Fee" },
        unit_amount: Math.round(restaurant.deliveryPrice),
      },
      quantity: 1,
    });

    const session = await STRIPE.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: existingOrder._id.toString(),
        restaurantId: restaurant._id.toString(),
      },
      success_url: `${FRONTEND_URL}/order-status?success=true&orderId=${existingOrder._id}`,
      cancel_url: `${FRONTEND_URL}/order-status?cancelled=true&orderId=${existingOrder._id}`,
    });

    res.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Order.find({ restaurant: restaurant._id }).populate("user");

    res.json(
      orders.map((order) => ({
        ...order.toObject(),
        branchName: order.branchDetails?.branchName || "",
        city: order.branchDetails?.city || "",
      }))
    );
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
export default {
  updateUserOrderStatus,
  getMyOrders,
  createCheckoutSession,
  stripeWebhookHandler,
  getRestaurantOrders,
};
