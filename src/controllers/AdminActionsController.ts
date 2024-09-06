import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import AdminAction from "../models/adminpanelactions"; // Ensure you have this schema

// Get all restaurants
export const getAdminRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find().exec();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

// Update restaurant status, contractType, and contractId
export const updateRestaurantStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, contractType, contractId } = req.body;
    const restaurantId = req.params.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    restaurant.status = status;
    restaurant.contractType = contractType || restaurant.contractType;
    restaurant.contractId = contractId || restaurant.contractId;
    restaurant.lastUpdated = new Date();

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};

