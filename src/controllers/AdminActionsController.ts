// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\AdminActionsController.ts

import mongoose from "mongoose";
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  const { status, contractType, contractId } = req.body;
  const { restaurantId } = req.params;

  try {
    const objectId = mongoose.Types.ObjectId.isValid(restaurantId) ? restaurantId : new mongoose.Types.ObjectId(restaurantId);
    const restaurant = await Restaurant.findById(objectId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.status = status ?? restaurant.status;
    restaurant.contractType = contractType ?? "";
    restaurant.contractId = contractId ?? "";
    restaurant.lastUpdated = new Date();

    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};

export const countRestaurantsByStatus = async (req: Request, res: Response) => {
  try {
    const statusCounts = await Restaurant.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.status(200).json(statusCounts);
  } catch (error) {
    console.error("Error counting restaurants by status:", error);
    res.status(500).json({ message: "Error counting restaurants by status" });
  }
};

export const getAdminRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find().exec();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};
