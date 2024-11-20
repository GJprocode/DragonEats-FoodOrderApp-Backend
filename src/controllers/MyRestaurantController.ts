// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\MyRestaurantController.ts

import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import User from "../models/user";
import { checkImageForInappropriateContent } from "../utils/imageModerator";
import cloudinary from "cloudinary";
import Order from "../models/order";

// Function to upload an image to Cloudinary
const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
      secure: true // Ensure HTTPS is used for the returned URL
    });
    return uploadResponse.secure_url;//// Use the HTTPS secure_url
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error uploading image:", error.message);
    } else {
      console.error("Unexpected error uploading image:", error);
    }
    throw new Error("Image upload failed");
  }
};

// Fetch all restaurants
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find().exec();
    res.status(200).json(restaurants);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching restaurants:", error.message);
      res.status(500).json({ message: "Error fetching restaurants", error: error.message });
    } else {
      console.error("Unexpected error fetching restaurants:", error);
      res.status(500).json({ message: "Unexpected error fetching restaurants" });
    }
  }
};

// Fetch a specific restaurant for the logged-in user
// Controller to fetch or create restaurant
// Get logged-in user's restaurant
export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Assuming userId is added via middleware
    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    // Find the restaurant linked to the user
    let restaurant = await Restaurant.findOne({ user: userId });

    // If no restaurant exists, create a new one with default values
    if (!restaurant) {
      restaurant = new Restaurant({
        user: new mongoose.Types.ObjectId(userId),
        restaurantName: "New Restaurant",
        branchesInfo: [
          {
            cities: "Default City",
            branchName: "Default Branch",
            latitude: 0.0,
            longitude: 0.0,
          },
        ],
        country: "Default Country",
        deliveryPrice: 2000, // Default as cents ($20.00)
        estimatedDeliveryTime: 0,
        cuisines: [],
        menuItems: [], // Ensure empty menuItems array is created
        restaurantImageUrl: "",
        status: "submitted",
      });

      await restaurant.save();
    }

    // Format `menuItems` properly
    const formattedRestaurant = {
      ...restaurant.toObject(),
      deliveryPrice: restaurant.deliveryPrice / 100, // Convert delivery price to dollars
      menuItems: restaurant.menuItems.map((menuItem) => ({
        ...menuItem,
        name: menuItem.name || "Unnamed Item", // Fallback for missing names
        price: menuItem.price / 100, // Convert menu item prices to dollars
        imageUrl: menuItem.imageUrl || "/path/to/placeholder-image.jpg", // Fallback for missing image URLs
      })),
    };

    res.json(formattedRestaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};








// Create a new restaurant for the logged-in user
export const createMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = new Restaurant({
      ...req.body,
      deliveryPrice: Math.round(req.body.deliveryPrice * 100), // Convert to cents
      branchesInfo: req.body.branchesInfo.map((branch: any) => ({
        cities: branch.cities,
        branchName: branch.branchName,
        latitude: branch.latitude,
        longitude: branch.longitude,
      })),
      user: new mongoose.Types.ObjectId(req.userId),
      email: req.userEmail || "",
      lastUpdated: new Date(),
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

export const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update the delivery price and other fields
    restaurant.deliveryPrice = Math.round(req.body.deliveryPrice * 100); // Convert to cents
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.country = req.body.country;
    restaurant.cuisines = req.body.cuisines;
    restaurant.wholesale = req.body.wholesale;
    restaurant.cellphone = req.body.cellphone;

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};







// Update restaurant status (for admin use)
export const updateRestaurantStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.params.id;
    const { status, contractType, contractId } = req.body;

    const restaurant = await Restaurant.findById(restaurantId).exec();
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    restaurant.status = status;
    restaurant.contractType = contractType;
    restaurant.contractId = contractId;
    restaurant.lastUpdated = new Date();

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating restaurant status:", error.message);
      res.status(500).json({ message: "Error updating restaurant status", error: error.message });
    } else {
      console.error("Unexpected error updating restaurant status:", error);
      res.status(500).json({ message: "Unexpected error updating restaurant status" });
    }
  }
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query;
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const query: any = { restaurant: restaurant._id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by date if provided (using `createdAt` or `dateDelivered`)
    if (date) {
      const dateObj = new Date(date as string);
      const nextDay = new Date(dateObj);
      nextDay.setDate(dateObj.getDate() + 1);

      query.dateDelivered = {
        $gte: dateObj,
        $lt: nextDay,
      };
    }

    const orders = await Order.find(query).populate("restaurant").populate("user");

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    // Update the order status and set dateDelivered if the status is 'delivered'
    order.status = status;
    if (status === "delivered") {
      order.dateDelivered = new Date(); // Set the current date and time for delivery
    }
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to update order status" });
  }
};





export default {
  updateOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  uploadImage,
};
