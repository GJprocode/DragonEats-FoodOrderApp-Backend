// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\MyRestaurantController.ts
// This controller handles the logic for creating, updating, 
// and retrieving restaurant data,
// including image uploads and handling menu items.
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import User from "../models/user";
import { checkImageForInappropriateContent } from "../utils/imageModerator";
import cloudinary from "cloudinary";

// Function to upload an image to Cloudinary
const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error uploading image:", error.message);
    } else {
      console.error("Unexpected error uploading image:", error);
    }
    throw new Error("Image upload failed");
  }
};

// Get all restaurants for the logged-in user
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

// Get restaurant details by the logged-in user
// Example of using `userId` in the controller
// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\MyRestaurantController.ts

export const getMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId; // Use req.userId set by jwtParse middleware
    
    if (!userId) {
      res.status(400).json({ message: "User ID not provided" });
      return;
    }

    const restaurant = await Restaurant.findOne({ user: userId }).exec();

    if (!restaurant) {
      res.status(200).json({
        restaurantName: "",
        city: [],
        country: "",
        deliveryPrice: 0,
        estimatedDeliveryTime: 0,
        cuisines: [],
        menuItems: [],
        restaurantImageUrl: "",
        user: userId,
        email: req.userEmail || "", // Use req.userEmail for email
        status: "pending",
        contractType: "",
        contractId: "",
        wholesale: false,
      });
      return;
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};


// Create a new restaurant
// Create a new restaurant
export const createMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId }).exec();
    if (existingRestaurant) {
      res.status(409).json({ message: "User restaurant already exists" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const restaurant = new Restaurant({
      ...req.body,
      user: new mongoose.Types.ObjectId(req.userId),
      email: user.email || "", // Save user's email
      lastUpdated: new Date(),
    });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.restaurantImageFile) {
      const fileBuffer = files.restaurantImageFile[0].buffer;
      await checkImageForInappropriateContent(fileBuffer);
      restaurant.restaurantImageUrl = await uploadImage(files.restaurantImageFile[0]);
    }

    if (files) {
      for (let i = 0; i < req.body.menuItems.length; i++) {
        const field = `menuItems[${i}].menuItemImageFile`;
        if (files[field]) {
          const fileBuffer = files[field][0].buffer;
          await checkImageForInappropriateContent(fileBuffer);
          const menuItemImageUrl = await uploadImage(files[field][0]);

          restaurant.menuItems[i] = {
            name: req.body.menuItems[i]?.name || "",
            price: req.body.menuItems[i]?.price || 0,
            imageUrl: menuItemImageUrl,
          };
        } else {
          restaurant.menuItems[i] = {
            name: req.body.menuItems[i]?.name || "",
            price: req.body.menuItems[i]?.price || 0,
            imageUrl: req.body.menuItems[i]?.imageUrl || "",
          };
        }
      }
    }

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating restaurant:", error.message);
      res.status(500).json({ message: "Error creating restaurant", error: error.message });
    } else {
      console.error("Unexpected error creating restaurant:", error);
      res.status(500).json({ message: "Unexpected error creating restaurant" });
    }
  }
};


// Update an existing restaurant
export const updateMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId }).exec();
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.wholesale = req.body.wholesale;
    restaurant.email = user.email || ""; // Update email field
    restaurant.lastUpdated = new Date();

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle restaurant image update
    if (files?.restaurantImageFile) {
      const fileBuffer = files.restaurantImageFile[0].buffer;
      await checkImageForInappropriateContent(fileBuffer);
      restaurant.restaurantImageUrl = await uploadImage(files.restaurantImageFile[0]);
    }

    // Handle menu items update
    restaurant.menuItems = []; // Clear the existing menuItems to update with the new ones
    if (files) {
      for (let i = 0; i < req.body.menuItems.length; i++) {
        const field = `menuItems[${i}].menuItemImageFile`;
        let menuItemImageUrl = req.body.menuItems[i].imageUrl;

        if (files[field]) {
          const fileBuffer = files[field][0].buffer;
          await checkImageForInappropriateContent(fileBuffer);
          menuItemImageUrl = await uploadImage(files[field][0]);
        }

        restaurant.menuItems.push({
          name: req.body.menuItems[i].name || "",
          price: req.body.menuItems[i].price || 0,
          imageUrl: menuItemImageUrl || "",
        });
      }
    }

    await restaurant.save();
    res.status(200).json(restaurant);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating restaurant:", error.message);
      res.status(500).json({ message: "Error updating restaurant", error: error.message });
    } else {
      console.error("Unexpected error updating restaurant:", error);
      res.status(500).json({ message: "Unexpected error updating restaurant" });
    }
  }
};

// Update the status of a restaurant
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

