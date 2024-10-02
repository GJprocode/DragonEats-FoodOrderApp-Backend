// backend/src/routes/OrderRoute.ts
import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";

const router = express.Router();

// Remove the webhook route from here
// router.post("/checkout/webhook", OrderController.stripeWebhookHandler);

// Apply auth middleware to routes below
router.use(jwtCheck, jwtParse);

// Protected routes
router.get("/", OrderController.getMyOrders);

router.post("/checkout/create-checkout-session", OrderController.createCheckoutSession);

export default router;
