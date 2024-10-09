// backend/src/routes/OrderRoute.ts
import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";

const router = express.Router();

// Apply auth middleware to routes below
router.use(jwtCheck, jwtParse);

router.patch("/order/:orderId/confirm", OrderController.confirmOrder);


// Protected routes
router.get("/", OrderController.getMyOrders);

router.post("/checkout/create-checkout-session",
    OrderController.
    createCheckoutSession);

export default router;
