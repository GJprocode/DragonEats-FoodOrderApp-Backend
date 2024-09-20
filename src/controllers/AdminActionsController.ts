// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\AdminActionsController.ts
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import Admin from "../models/admin";

export const getAdminRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
};

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  const { status, contractType, contractId } = req.body;
  const { restaurantId } = req.params;

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, {
      status,
      contractType,
      contractId,
      lastUpdated: new Date()
    }, { new: true });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant); 
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};

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
    res.status(500).json({ message: "Internal server error" });
  }
};


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
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getAdminRestaurants, updateRestaurantStatus, checkAdmin, getAdminContactInfo }; 