// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\adminRoutes.ts

import express from "express";
import { getAllRestaurants, updateRestaurantStatus } from '../controllers/MyRestaurantController';
import { checkAdmin, getAdminContactInfo } from "../controllers/AdminActionsController"; // Correct import

const router = express.Router();

// Route to fetch all restaurants for the admin panel
router.get('/api/admin/restaurants', getAllRestaurants);

// Route to update the status of a restaurant
router.post('/api/admin/update-status/:id', updateRestaurantStatus);

// Route to check if the current user is an admin
router.get('/check-admin/:email', checkAdmin);

// New route to get the admin email with required permissions
router.get('/admin-contact-info', getAdminContactInfo);

export default router;
