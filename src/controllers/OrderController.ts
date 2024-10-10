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

// type CheckoutSessionRequest = {
//   cartItems: {
//     menuItemId: string;
//     name: string;
//     quantity: number;
//     price: number;
//   }[];
//   deliveryDetails: {
//     email: string;
//     name: string;
//     address: string;
//     city: string;
//     country?: string;
//     cellphone: string;
//   };
//   restaurantId: string;
// };

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Unable to update order status" });
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
    event = STRIPE.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);

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
      await existingOrder.save();
    }

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
