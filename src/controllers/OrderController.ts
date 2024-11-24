// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\OrderController.ts

import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const STRIPE = new Stripe(STRIPE_API_KEY, {
  apiVersion: "2024-09-30.acacia",
});

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;


// backend/src/controllers/orderController.ts
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status, message } = req.body;

  try {
    console.log("Received request to update order:", { orderId, status, message });

    const order = await Order.findById(orderId);

    if (!order) {
      console.log("Order not found for ID:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Current order status:", order.status);

    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      placed: ["confirmed", "rejected"],
      confirmed: ["rejected"],
      paid: ["inProgress", "rejected"],
      inProgress: ["outForDelivery", "rejected"],
      outForDelivery: ["delivered", "rejected"],
      delivered: [],
      rejected: ["resolved"],
      resolved: [],
    };

    // Validate transition
    if (!validTransitions[order.status]?.includes(status)) {
      console.log(`Invalid status transition from ${order.status} to ${status}`);
      return res.status(400).json({
        error: `Invalid transition from ${order.status} to ${status}`,
      });
    }

    // Define default messages
    const defaultMessages = {
      rejected: {
        beforePay: "Out of stock, dragons flying to get ingredients.",
        afterPay: "Refund pending.",
      },
      resolved: {
        beforePay: "Order cancelled due to stock issues and dragons' wings.",
        afterPay: "Underground dragons refunded successfully.",
      },
    };

    // Determine message context
    const isBeforePay = ["placed", "confirmed"].includes(order.status);
    let finalMessage = message;

    if (!finalMessage) {
      if (status === "rejected") {
        finalMessage = isBeforePay
          ? defaultMessages.rejected.beforePay
          : defaultMessages.rejected.afterPay;
      } else if (status === "resolved") {
        finalMessage = isBeforePay
          ? defaultMessages.resolved.beforePay
          : defaultMessages.resolved.afterPay;
      }
    }

    console.log("Final message to save:", finalMessage);

    // Append message if rejection or resolution
    if (status === "rejected" || status === "resolved") {
      console.log("Appending message to order:", {
        status,
        message: finalMessage,
        timestamp: new Date(),
      });
      order.messages.push({
        status,
        message: finalMessage,
        timestamp: new Date(),
      });
    }

    // Update the status
    order.status = status;
    console.log("Updating order status to:", status);

    await order.save();
    console.log("Order updated successfully:", order);

    res.status(200).json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};







// Get user orders
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"] as string;
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_ENDPOINT_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId found in session metadata.");
        return res.status(400).send("Missing orderId in session metadata.");
      }

      // Fetch the existing order using the orderId from the session metadata
      const order = await Order.findById(orderId);
      if (!order) {
        console.error("Order not found for orderId:", orderId);
        return res.status(404).send("Order not found.");
      }

      // Update the order status to "paid"
      order.status = "paid";
      order.totalAmount = session.amount_total || 0; // Use Stripe's amount_total
      await order.save();

      console.log(`Order with ID ${orderId} has been updated to "paid".`);
    }
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  res.json({ received: true });
};



// Create Stripe checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cartItems, deliveryDetails, restaurantId, orderId } = req.body;

    // Fetch the restaurant information
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log("Restaurant not found:", restaurantId);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Fetch the existing order by ID if provided
    let existingOrder;
    if (orderId) {
      existingOrder = await Order.findById(orderId);
    }

    // Ensure the existing order is in a "confirmed" state
    if (existingOrder && existingOrder.status !== "confirmed") {
      return res.status(400).json({
        message: "Order must be confirmed before proceeding to payment.",
      });
    }

    // If no order found or ID not provided, create a new one as "placed"
    if (!existingOrder) {
      existingOrder = new Order({
        restaurant: restaurant._id,
        user: new mongoose.Types.ObjectId(req.userId),
        status: "placed",
        deliveryDetails,
        cartItems,
        createdAt: new Date(),
      });
    }

    // Calculate the total amount in cents before saving the order
    // Assuming cartItems is an array of objects where each item has 'price' and 'quantity'
    const itemsTotal = cartItems.reduce(
      (total: number, item: { price: number; quantity: number }) => {
        return total + item.price * item.quantity;
      },
      0
    );

    const totalWithDelivery = itemsTotal + restaurant.deliveryPrice;

    // Update the total amount on the order (in cents)
    existingOrder.totalAmount = totalWithDelivery;

    // Save or update the order
    await existingOrder.save();

    // Prepare line items for Stripe
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a separate line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
        },
        unit_amount: Math.round(restaurant.deliveryPrice),
      },
      quantity: 1,
    });

    // Create a Stripe session
    const session = await STRIPE.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: existingOrder._id.toString(),
        restaurantId: restaurant._id?.toString() || "",
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

export default {
  getMyOrders,
  updateOrderStatus,
  createCheckoutSession,
  stripeWebhookHandler,
};
