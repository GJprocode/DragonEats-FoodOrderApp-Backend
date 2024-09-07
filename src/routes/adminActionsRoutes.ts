//  C:\Users\gertf\Desktop\FoodApp\backend\src\routes\adminActionsRoutes.ts
// src/routes/adminActionsRoutes.ts
import { Router } from "express";
import { getAdminRestaurants, updateRestaurantStatus } from "../controllers/AdminActionsController";
import { jwtCheck } from "../middleware/auth";

const router = Router();

router.use(jwtCheck);

router.get('/admin/restaurants', getAdminRestaurants);
router.post('/admin/update-status/:restaurantId', updateRestaurantStatus);

export default router;
