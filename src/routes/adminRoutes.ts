// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\adminRoutes.ts

import express from "express";
import {
  getAdminRestaurants,
  updateRestaurantStatus,
  checkAdmin,
  getAdminContactInfo
} from '../controllers/AdminActionsController';
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

router.get('/restaurants', jwtCheck, jwtParse, getAdminRestaurants);
router.post('/update-status/:restaurantId', jwtCheck, jwtParse, updateRestaurantStatus);
router.get('/check-admin/:email', jwtCheck, jwtParse, checkAdmin);
router.get('/contact-info', jwtCheck, jwtParse, getAdminContactInfo);




export default router;
