// // C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\AdminActionsController.ts
// // src/controllers/AdminActionsController.ts
// import { Request, Response } from "express";
// import Restaurant from "../models/restaurant";

// export const getAdminRestaurants = async (req: Request, res: Response) => {
//   try {
//     const restaurants = await Restaurant.find(); // Fetch all restaurants
//     res.status(200).json(restaurants); // Send back the restaurants in the response
//   } catch (error) {
//     console.error("Error fetching restaurants:", error);
//     res.status(500).json({ message: "Error fetching restaurants" });
//   }
// };

// export const updateRestaurantStatus = async (req: Request, res: Response) => {
//   const { status, contractType, contractId } = req.body;
//   const { restaurantId } = req.params;

//   try {
//     const restaurant = await Restaurant.findById(restaurantId);

//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     restaurant.status = status ?? restaurant.status;
//     restaurant.contractType = contractType ?? restaurant.contractType;
//     restaurant.contractId = contractId ?? restaurant.contractId;
//     restaurant.lastUpdated = new Date();

//     await restaurant.save();
//     res.status(200).json(restaurant);
//   } catch (error) {
//     console.error("Error updating restaurant:", error);
//     res.status(500).json({ message: "Error updating restaurant" });
//   }
// };

// // Ensure that other necessary exports are correctly declared
// export const countRestaurantsByStatus = async (req: Request, res: Response) => {
//   try {
//     const statusCounts = await Restaurant.aggregate([
//       { $group: { _id: "$status", count: { $sum: 1 } } },
//     ]);
//     res.status(200).json(statusCounts);
//   } catch (error) {
//     console.error("Error counting restaurants by status:", error);
//     res.status(500).json({ message: "Error counting restaurants by status" });
//   }
// };
// src/controllers/AdminActionsController.ts
// src/controllers/AdminActionsController.ts
// src/controllers/AdminActionsController.ts
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

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

    restaurant.status = status ?? restaurant.status;
    restaurant.contractType = contractType ?? restaurant.contractType;
    restaurant.contractId = contractId ?? restaurant.contractId;
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
