
// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\RestaurantController.ts
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

// Function to search restaurants based on city, only approved restaurants are returned
export const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const selectedBusinessType = (req.query.selectedBusinessType as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    // Query to match restaurants in the given city with status "approved"
    let query: any = {
      city: { $regex: new RegExp(city, "i") },
      status: "approved", // Filter to return only approved restaurants
    };

    if (selectedBusinessType) {
      query["wholesale"] = selectedBusinessType === "Wholesale";
    }

    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));
      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Fetch only approved restaurants from the database
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    // Return the filtered restaurants with pagination
    res.json({
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error searching restaurants:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Function to get all distinct cities that have approved restaurants
export const getCities = async (req: Request, res: Response) => {
  try {
    // Fetch distinct cities from only approved restaurants
    const cities = await Restaurant.distinct("city", { status: "approved" });
    res.json(cities);
  } catch (error) {
    console.error("Error fetching approved cities:", error);
    res.status(500).json({ message: "Error fetching approved cities" });
  }
};

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  searchRestaurant,
  getCities,
  getRestaurant,
};
