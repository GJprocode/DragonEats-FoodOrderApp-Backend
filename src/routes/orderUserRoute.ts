// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\orderUserRoute.ts

import express from 'express';
import { getOrderDetails, getUserProfile, updateOrderDetails } from '../controllers/orderUserController';

const router = express.Router();

// Route to get user profile data
router.get('/user-profile', getUserProfile);

// Route to update order details
router.put('/order-details/:orderId', updateOrderDetails);

// route: fetch the status for a specific user order to ensure the frontend reflects the correct status updates.
router.get("/order-details/:orderId", getOrderDetails);


export default router;
