// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\AdminActionsController.ts

import mongoose from "mongoose";
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import User from "../models/user";  // Import User model if you want to verify user existence
import Admin from "../models/admin"; // Admin model is in models/admin.ts

export const getAdminRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find(); // Fetch all restaurants
    res.status(200).json(restaurants); // Send back the restaurants in the response
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  const { status, contractType, contractId } = req.body;
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Ensure the user field is properly cast to ObjectId
    if (typeof restaurant.user === "string") {
      // Validate user before assigning ObjectId (Optional but recommended)
      const user = await User.findById(restaurant.user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      restaurant.user = new mongoose.Types.ObjectId(user._id);
    }

    // Allow empty fields for contractType and contractId
    restaurant.status = status || restaurant.status;
    restaurant.contractType = contractType !== undefined ? contractType : restaurant.contractType;
    restaurant.contractId = contractId !== undefined ? contractId : restaurant.contractId;
    restaurant.lastUpdated = new Date();

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};
// Ensure that other necessary exports are correctly declared
export const countRestaurantsByStatus = async (req: Request, res: Response) => {
  try {
    const statusCounts = await Restaurant.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.status(200).json(statusCounts);
  } catch (error) {
    console.error("Error counting restaurants by status:", error);
    res.status(500).json({ message: "Error counting restaurants by status" });
  }
};

// Check if the user is an admin by their email
export const checkAdmin = async (req: Request, res: Response) => {
  const { email } = req.params;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.role === "admin") {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// New function to fetch the admin email with the required permissions
export const getAdminContactInfo = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findOne({
      role: "admin",
      permissions: { $all: ["update_terms", "update_privacy"] }
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({ email: admin.email });
  } catch (error) {
    console.error("Error fetching admin contact info:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};