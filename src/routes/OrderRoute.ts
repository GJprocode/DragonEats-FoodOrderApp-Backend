import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";

const router = express.Router();

// Apply auth middleware to routes below
router.use(jwtCheck, jwtParse);

// Fetch user orders
router.get("/", OrderController.getMyOrders);

// Update order status
router.patch("/order/:orderId/status", OrderController.updateOrderStatus);

// Create checkout session
router.post("/checkout/create-checkout-session", OrderController.createCheckoutSession);

export default router;
