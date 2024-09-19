//  C:\Users\gertf\Desktop\FoodApp\backend\src\routes\adminActionsRoutes.ts

import { Router } from "express";
import { getAdminRestaurants, updateRestaurantStatus } from "../controllers/AdminActionsController";
import { jwtCheck } from "../middleware/auth";

const router = Router();

// router.use(jwtCheck);
// need to fix for proper security

router.get('/admin/restaurants', getAdminRestaurants);
router.post('/admin/update-status/:restaurantId', updateRestaurantStatus);

export default router;
