//  C:\Users\gertf\Desktop\FoodApp\backend\src\routes\MyRestaurantRoute.ts



import express from "express";
import multer from "multer";
import {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  updateRestaurantOrderStatus,
  getMyRestaurantOrders,
} from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Define menuItemsFields with the correct field names using dot notation
const menuItemsFields = Array.from({ length: 40 }, (_, i) => ({
  name: `menuItems[${i}].menuItemImageFile`, // Matches frontend with dot notation
  maxCount: 1,
}));

// Define the fields Multer should handle
const restaurantUpload = upload.fields([
  { name: "restaurantImageFile", maxCount: 1 }, // Matches frontend
  ...menuItemsFields,
]);

// GET restaurant for logged-in user
router.get("/", jwtCheck, jwtParse, getMyRestaurant);

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

// PATCH (update order status)
router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  updateRestaurantOrderStatus
);


// GET (fetch orders)
router.get(
  "/order",
  jwtCheck,
  jwtParse,
  getMyRestaurantOrders
);

export default router;
