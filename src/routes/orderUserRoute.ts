// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\orderUserRoute.ts

import express from 'express';
import { getUserProfile, updateOrderDetails } from '../controllers/orderUserController';

const router = express.Router();

// Route to get user profile data
router.get('/user-profile', getUserProfile);

// Route to update order details
router.put('/order-details/:orderId', updateOrderDetails);

export default router;
