// src/controllers/RestaurantController.ts

import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

// Function to search restaurants based on city, only approved restaurants are returned
export const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const selectedBusinessType =
      (req.query.selectedBusinessType as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    const query: any = {
      status: "approved",
      "branchesInfo.cities": { $regex: new RegExp(`^${city}$`, "i") }, // Add city condition here
    };

    if (selectedBusinessType) {
      query["wholesale"] = selectedBusinessType === "Wholesale";
    }

    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
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

    // Fetch restaurants with pagination
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Compute total number of restaurants matching the query
    const totalRestaurants = await Restaurant.countDocuments(query);

    // Filter branches matching the city
    const resultsWithBranches = restaurants.map((restaurant) => ({
      ...restaurant,
      branches: restaurant.branchesInfo.filter(
        (branch) => branch.cities.toLowerCase() === city.toLowerCase()
      ),
    }));

    // Remove restaurants with no branches in the city
    const filteredRestaurants = resultsWithBranches.filter(
      (restaurant) => restaurant.branches.length > 0
    );

    // Compute total number of branches matching the city and filters
    const totalBranchesResult = await Restaurant.aggregate([
      { $match: query },
      { $unwind: "$branchesInfo" },
      {
        $match: {
          "branchesInfo.cities": { $regex: new RegExp(`^${city}$`, "i") },
        },
      },
      { $count: "totalBranches" },
    ]);

    const totalBranches =
      totalBranchesResult.length > 0
        ? totalBranchesResult[0].totalBranches
        : 0;

    // Include totalBranches in your response
    res.json({
      data: filteredRestaurants,
      pagination: {
        totalRestaurants: filteredRestaurants.length,
        totalBranches,
        page,
        pages: Math.ceil(totalRestaurants / pageSize),
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
    // Aggregate cities from approved restaurants' branches
    const cities = await Restaurant.aggregate([
      { $match: { status: "approved" } }, // Only include approved restaurants
      { $unwind: "$branchesInfo" }, // Unwind branchesInfo array to treat each branch separately
      { $group: { _id: "$branchesInfo.cities" } }, // Group by the cities from branchesInfo
      { $project: { city: "$_id" } }, // Project the city field from the grouped result
    ]);

    // Map and sort the cities alphabetically
    const distinctCities = cities
      .map((city: { city: string }) => city.city) // Extract city names
      .sort((a, b) => a.localeCompare(b)); // Sort cities alphabetically

    // Return the list of distinct cities
    res.json(distinctCities);
  } catch (error) {
    console.error("Error fetching cities:", error);
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
