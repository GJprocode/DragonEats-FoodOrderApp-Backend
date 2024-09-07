// src/routes/adminActionsRoutes.ts
import { Router } from "express";
import { getAdminRestaurants, updateRestaurantStatus, countRestaurantsByStatus } from "../controllers/AdminActionsController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = Router();

router.use(jwtCheck, jwtParse);

router.get('/admin/restaurants', getAdminRestaurants);
router.post('/admin/update-status/:restaurantId', updateRestaurantStatus);
router.get('/admin/count-status', countRestaurantsByStatus);

export default router;
