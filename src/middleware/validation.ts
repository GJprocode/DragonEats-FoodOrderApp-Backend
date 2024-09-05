// src/middleware/validation.ts

import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
export const validateMyRestaurantRequest = [
  body("restaurantName").isString().notEmpty().withMessage("Restaurant name is required."),
  body("city").isArray().withMessage("City must be an array of strings."),
  body("city.*").isString().notEmpty().withMessage("Each city must be a valid string."),
  body("country").isString().notEmpty().withMessage("Country is required."),
  handleValidationErrors,
];
