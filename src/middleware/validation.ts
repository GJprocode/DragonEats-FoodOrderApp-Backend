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
      body("branchesInfo").isArray().withMessage("Branches info must be an array."),
      body("branchesInfo.*.cities")
        .isString()
        .notEmpty()
        .withMessage("City name is required."),
      body("branchesInfo.*.branchName")
        .isString()
        .notEmpty()
        .withMessage("Branch name is required."),
      body("branchesInfo.*.latitude")
        .isNumeric()
        .withMessage("Latitude must be a valid number."),
      body("branchesInfo.*.longitude")
        .isNumeric()
        .withMessage("Longitude must be a valid number."),
      body("branchesInfo.*.deliveryPrice")
        .isNumeric()
        .optional()
        .withMessage("Delivery price must be a valid number."),
      body("branchesInfo.*.deliveryTime")
        .isNumeric()
        .optional()
        .withMessage("Delivery time must be a valid number."),
  ]      

