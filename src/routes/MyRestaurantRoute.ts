//  C:\Users\gertf\Desktop\FoodApp\backend\src\routes\MyRestaurantRoute.ts

import express from "express";
import multer from "multer";
import { getMyRestaurant, createMyRestaurant, updateMyRestaurant } from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";
import  MyRestaurantController from "../controllers/MyRestaurantController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyRestaurantController.getMyRestaurantOrders
);

router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateRestaurantOrderStatus
);



const menuItemsFields = Array.from({ length: 40 }, (_, i) => ({
  name: `menuItems[${i}].menuItemImageFile`,
  maxCount: 1,
}));

const restaurantUpload = upload.fields([
  { name: "restaurantImageFile", maxCount: 1 },
  ...menuItemsFields,
]);

// GET restaurant for logged-in user actually no validation needed but works with jwt & parse, 
router.get("/",
   jwtCheck,
    jwtParse,
    getMyRestaurant);

// POST (create) a new restaurant
router.post(
  "/",
  restaurantUpload,
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  createMyRestaurant
);

// PUT (update) existing restaurant
router.put(
  "/",
  restaurantUpload,
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  updateMyRestaurant
);

export default router;

