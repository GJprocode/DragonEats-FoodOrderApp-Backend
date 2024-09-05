// src/routes/RestaurantRoute.ts

import express from "express";
import { param } from "express-validator";
import RestaurantController, { getCities } from "../controllers/RestaurantController";
import { handleValidationErrors } from "../middleware/validation";

const router = express.Router();

// Get a restaurant by its ID (public access)
router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("RestaurantId parameter must be a valid string"),
  handleValidationErrors,
  RestaurantController.getRestaurant
);

// Search for restaurants in a specific city (public access)
router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  handleValidationErrors,
  RestaurantController.searchRestaurant
);

// Route to get available cities
router.get("/cities", getCities);

export default router;
