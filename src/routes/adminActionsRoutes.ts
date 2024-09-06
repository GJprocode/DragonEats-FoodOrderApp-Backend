import { Router } from "express";
import { getAdminRestaurants, updateRestaurantStatus } from "../controllers/AdminActionsController";
import { jwtCheck, jwtParse } from "../middleware/auth";  // Make sure these are correctly defined

const router = Router();

// Ensure JWT authentication and authorization
router.use(jwtCheck, jwtParse);

// Route to fetch all restaurants (for admin panel)
router.get('/admin/restaurants', getAdminRestaurants);

// Route to update restaurant status
router.post('/admin/update-status/:restaurantId', updateRestaurantStatus);

export default router;
