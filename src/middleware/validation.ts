import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
    req: Request, 
    res: Response,
    next: NextFunction) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
};

export const validateMyUserRequest = [
    body("name").isString().notEmpty().withMessage("Name must be a string"),
    body("adressLine1").isString().notEmpty().withMessage("AdressLine1 must be a string"),
    body("city").isString().notEmpty().withMessage("City must be a string"),
    body("country").isString().notEmpty().withMessage("Country must be a string"),
    handleValidationErrors,
];

export const validateMyRestaurantRequest = [

    body("restaurantName").notEmpty().withMessage("Restaurant name required"),
    body("city").notEmpty().withMessage("City name required"),
    body("country").notEmpty().withMessage("Country name required"),
    body("deliveryPrice").isFloat().withMessage("Delivery price must be a positive number"),
    body("estimatedDeliveryTime").isInt({min: 0}).withMessage("Estimated delivery time must be a positive integer"),
    body("cuisines").isArray().withMessage("Cuisines must be an array")
    .not().isEmpty().withMessage("Cuisines array cannot be empty"),
    body("menuItems").isArray().withMessage("Menu Items must be an array"),
    body("MenuItems.*.name").notEmpty().withMessage("Menu item is required"),
    body("MenuItems.*.price").isFloat({min: 0}).withMessage("Menu item is required and Price must be a positive number"),
    handleValidationErrors,
];