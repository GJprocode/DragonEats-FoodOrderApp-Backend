import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { calculateDistance } from "../utils/deliveryUtils";
import { getDeliveryPricing } from "../utils/deliveryPricing";

export const getBranchDeliveryDetails = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const userLocation = req.session?.userLocation;

    if (!userLocation) {
      return res.status(400).json({ message: "User location is required." });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const branchDetails = restaurant.branchesInfo.map((branch) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        branch.latitude,
        branch.longitude
      );

      const pricing = getDeliveryPricing(distance, restaurant.wholesale ? "wholesale" : "restaurant");

      return {
        ...branch,
        distance: distance.toFixed(2) + " km",
        deliveryPrice: pricing.price,
        deliveryTime: pricing.time,
      };
    });

    res.json({ branches: branchDetails });
  } catch (error) {
    console.error("Error fetching branch delivery details:", error);
    res.status(500).json({ message: "Failed to fetch branch delivery details." });
  }
};
