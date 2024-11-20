// C:\Users\gertf\Desktop\FoodApp\backend\src\middleware\validation.ts

import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation Errors:", errors.array()); // Debugging
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for user input
export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name is required."),
  body("address").isString().notEmpty().withMessage("Address is required."),
  body("city").isString().notEmpty().withMessage("City is required."),
  body("country").isString().notEmpty().withMessage("Country is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  handleValidationErrors,
];

// Validation for restaurant creation/update 
// Validation for restaurant creation/update
export const validateMyRestaurantRequest = [
  body("restaurantName")
    .isString()
    .notEmpty()
    .withMessage("Restaurant name is required."),
  body("branchesInfo")
    .isArray({ min: 1 })
    .withMessage("'branchesInfo' must be a non-empty array."),
  body("branchesInfo.*.cities")
    .isString()
    .notEmpty()
    .withMessage("Each 'cities' field in 'branchesInfo' must be a valid string."),
  body("branchesInfo.*.branchName")
    .isString()
    .notEmpty()
    .withMessage("Each 'branchName' must be a valid string."),
  body("branchesInfo.*.latitude")
    .isNumeric()
    .withMessage("Each 'latitude' must be a valid number."),
  body("branchesInfo.*.longitude")
    .isNumeric()
    .withMessage("Each 'longitude' must be a valid number."),
  body("country").isString().notEmpty().withMessage("Country is required."),
  body("deliveryPrice")
    .isNumeric()
    .withMessage("Delivery price must be a valid number."),
  body("estimatedDeliveryTime")
    .isNumeric()
    .withMessage("Estimated delivery time must be a valid number."),
  handleValidationErrors,
];

