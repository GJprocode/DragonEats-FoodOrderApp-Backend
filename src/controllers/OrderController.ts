import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const STRIPE = new Stripe(STRIPE_API_KEY, {
  apiVersion: "2022-11-15" as any,
});

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
    country?: string;
    cellphone: string;
  };
  restaurantId: string;
};

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

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error("Order ID not found in the session metadata.");
          return res.status(400).json({ message: "Order ID missing in session metadata" });
        }

        try {
          const order = await Order.findById(orderId);
          if (!order) {
            return res.status(404).json({ message: "Order not found" });
          }

          order.totalAmount = session.amount_total || 0;
          order.status = "paid";
          await order.save();
        } catch (error) {
          console.error("Error updating order:", error);
          return res.status(500).json({ message: "Error updating order status" });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  res.json({ received: true });
};


export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const newOrder = new Order({
      restaurant: restaurant._id,
      user: new mongoose.Types.ObjectId(req.userId),
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
      const menuItem = restaurant.menuItems.find(
        (item) => item._id.toString() === cartItem.menuItemId.toString()
      );

      if (!menuItem) {
        throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
      }

      const menuItemPrice = Math.round(menuItem.price); // Convert price to cents.
      return {
        price_data: {
          currency: "usd",
          unit_amount: menuItemPrice,
          product_data: {
            name: menuItem.name,
          },
        },
        quantity: cartItem.quantity,
      };
    });

    const session = await STRIPE.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Delivery",
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(restaurant.deliveryPrice ), // Convert to cents
              currency: "usd",
            },
          },
        },
      ],
      metadata: {
        orderId: newOrder._id.toString(),
        restaurantId: restaurant._id.toString(),
      },
      success_url: `${FRONTEND_URL}/order-status?success=true`,
      cancel_url: `${FRONTEND_URL}/order-status?cancelled=true`,
    });
    

    await newOrder.save();
    res.json({ url: session.url }); // Comment this out or replace it for testing.

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: error.raw?.message || error.message });
  }
};

// Update the export syntax
export default {
  getMyOrders,
  updateOrderStatus,
  createCheckoutSession,
  stripeWebhookHandler,
};
