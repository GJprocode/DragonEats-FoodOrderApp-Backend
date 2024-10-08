
// backend/src/controllers/OrderController.ts
import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const STRIPE = new Stripe(STRIPE_API_KEY, {
  apiVersion: "2022-11-15" as any, // Use the correct API version
});

const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

  // Define the CheckoutSessionRequest type if it’s not imported from anywhere
  type CheckoutSessionRequest = {
    cartItems: {
      menuItemId: string;
      name: string;
      quantity: number; // Ensure this is a number
      price: number;
    }[];
    deliveryDetails: {
      email: string;
      name: string;
      address: string;
      city: string;
      country?: string; // Include any additional fields you use
      cellphone: string;
    };
    restaurantId: string;
  };

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    // console.log("Fetching orders for user:", req.userId);
      const orders = await Order.find({ user: req.userId })
        .populate("restaurant")
        .populate("user");

    // console.log("Fetched Orders:", orders);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;

  // console.log("Received Stripe webhook");
  try {
    const sig = req.headers["stripe-signature"] as string;

    // Log to ensure the signature is received
    console.log("Stripe signature:", sig ? "Present" : "Missing");

    // Use the raw body as provided by Stripe
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_ENDPOINT_SECRET
    );

    console.log("Stripe event constructed:", event.type);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      console.log("Processing checkout.session.completed for order:", orderId);

      if (orderId) {
        try {
          const order = await Order.findById(orderId);

          if (order) {
            order.totalAmount = session.amount_total || 0;
            order.status = "paid";
            await order.save();
            console.log(`Order ${orderId} status updated to 'paid'`);
          } else {
            console.error(`Order ${orderId} not found`);
          }
        } catch (err) {
          console.error(`Error updating order ${orderId}:`, err);
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    // console.log("Creating checkout session for user:", req.userId);
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    // console.log("CheckoutSessionRequest:", checkoutSessionRequest);

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      console.error("Restaurant not found:", checkoutSessionRequest.restaurantId);
      throw new Error("Restaurant not found");
    }

    // console.log("Restaurant found:", restaurant.restaurantName);

    const newOrder = new Order({
      restaurant: restaurant._id,
      user: new mongoose.Types.ObjectId(req.userId),
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });
    // console.log("Checkout Session Request Cart Items:", checkoutSessionRequest.cartItems);


    // console.log("New order created:", newOrder._id);

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    console.log("Line items for Stripe session:", lineItems);

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if (!session.url) {
      console.error("Error creating Stripe session: No URL returned");
      return res.status(500).json({ message: "Error creating Stripe session" });
    }

    // console.log("Stripe session created:", session.id);

    await newOrder.save();
    // console.log("New order saved to database:", newOrder._id);

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: error.raw?.message || error.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      console.error("Menu item not found:", cartItem.menuItemId);
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    // Ensure price is a number and convert to cents
    const menuItemPrice = typeof menuItem.price === "number"
      ? menuItem.price
      : parseFloat(menuItem.price);
    const unitAmountInCents = Math.round(menuItemPrice);

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: unitAmountInCents,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: Number(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  // Convert delivery price to cents
  const deliveryPriceInCents = Math.round(deliveryPrice);

  // console.log("Creating Stripe checkout session...");
  const sessionData = await STRIPE.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPriceInCents,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  console.log("Stripe session created with ID:", sessionData.id);

  return sessionData;
};

export default {
  getMyOrders,
  createCheckoutSession,
  stripeWebhookHandler,
};

