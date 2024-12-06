import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import User from "../models/user";
import cloudinary from "cloudinary";
import Order from "../models/order";

// Function to upload an image to Cloudinary
const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
      secure: true,
    });
    return uploadResponse.secure_url;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error uploading image:", error.message);
    } else {
      console.error("Unexpected error uploading image:", error);
    }
    throw new Error("Image upload failed");
  }
};

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

export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      console.log("No userId provided");
      return res.status(400).json({ message: "User ID not provided" });
    }

    let restaurant = await Restaurant.findOne({ user: userId });

    if (!restaurant) {
      console.log("No restaurant found for user:", userId, "Creating a new one.");
      restaurant = new Restaurant({
        user: new mongoose.Types.ObjectId(userId),
        restaurantName: "New Restaurant",
        branchesInfo: [
          {
            cities: "Default City",
            branchName: "Default Branch",
            latitude: 0.0,
            longitude: 0.0,
            deliveryPrice: 0,
            deliveryTime: 0,
          },
        ],
        country: "Default Country",
        cuisines: [],
        menuItems: [],
        restaurantImageUrl: "",
        status: "submitted",
      });

      await restaurant.save();
    }

    // console.log("Raw restaurant from DB:", restaurant);

    // Convert the entire restaurant document to a plain object once
    const restaurantObj = restaurant.toObject();

    const formattedRestaurant = {
      ...restaurantObj,
      branchesInfo: restaurantObj.branchesInfo.map((branch: any) => ({
        ...branch,
        deliveryPrice: branch.deliveryPrice != null ? branch.deliveryPrice / 100 : 0,
        deliveryTime: branch.deliveryTime != null ? branch.deliveryTime : 0,
      })),
      menuItems: restaurantObj.menuItems.map((menuItem: any) => ({
        ...menuItem,
        name: menuItem.name || "Unnamed Item",
        price: menuItem.price / 100,
        imageUrl: menuItem.imageUrl || "/path/to/placeholder-image.jpg",
      })),
    };

    // Convert to pure JSON object
    const finalRestaurant = JSON.parse(JSON.stringify(formattedRestaurant));
    // console.log("Final pure JSON restaurant sent to frontend:", finalRestaurant);

    res.json(finalRestaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

export const createMyRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = new Restaurant({
      ...req.body,
      user: new mongoose.Types.ObjectId(req.userId),
      email: req.userEmail || "",
      lastUpdated: new Date(),
    });

    await restaurant.save();

    const restaurantObj = restaurant.toObject();
    const formattedResponse = {
      ...restaurantObj,
      branchesInfo: restaurantObj.branchesInfo.map((branch: any) => ({
        ...branch,
        deliveryPrice: branch.deliveryPrice / 100,
      })),
      menuItems: restaurantObj.menuItems.map((menuItem: any) => ({
        ...menuItem,
        price: menuItem.price / 100,
      })),
    };

    const finalResponse = JSON.parse(JSON.stringify(formattedResponse));
    res.status(201).json(finalResponse);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Error creating restaurant" });
  }
};

export const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      console.log("No restaurant found for user:", req.userId);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName || restaurant.restaurantName;
    restaurant.country = req.body.country || restaurant.country;
    restaurant.cuisines = Array.isArray(req.body.cuisines) ? req.body.cuisines : restaurant.cuisines;
    restaurant.wholesale = typeof req.body.wholesale === "boolean" ? req.body.wholesale : restaurant.wholesale;
    restaurant.cellphone = req.body.cellphone || restaurant.cellphone;

    if (Array.isArray(req.body.branchesInfo)) {
      restaurant.branchesInfo = req.body.branchesInfo.map((branch: any, index: number) => ({
        _id: branch._id || (restaurant.branchesInfo[index]?._id || new mongoose.Types.ObjectId()),
        cities: branch.cities || restaurant.branchesInfo[index]?.cities || "Default City",
        branchName: branch.branchName || restaurant.branchesInfo[index]?.branchName || `Branch ${index + 1}`,
        latitude: typeof branch.latitude === "number" ? branch.latitude : (restaurant.branchesInfo[index]?.latitude || 0),
        longitude: typeof branch.longitude === "number" ? branch.longitude : (restaurant.branchesInfo[index]?.longitude || 0),
        deliveryPrice: branch.deliveryPrice != null ? Math.round(branch.deliveryPrice * 100) : (restaurant.branchesInfo[index]?.deliveryPrice || 0),
        deliveryTime: branch.deliveryTime != null ? branch.deliveryTime : (restaurant.branchesInfo[index]?.deliveryTime || 0),
      }));
    }

    if (Array.isArray(req.body.menuItems)) {
      restaurant.menuItems = req.body.menuItems.map((menuItem: any, i: number) => ({
        _id: menuItem._id || (restaurant.menuItems[i]?._id || new mongoose.Types.ObjectId()),
        name: menuItem.name || restaurant.menuItems[i]?.name || "Unnamed Item",
        price: menuItem.price != null ? Math.round(menuItem.price * 100) : (restaurant.menuItems[i]?.price || 0),
        imageUrl: menuItem.imageUrl || restaurant.menuItems[i]?.imageUrl || "/path/to/placeholder-image.jpg",
      }));
    }

    restaurant.lastUpdated = new Date();
    await restaurant.save();

    const restaurantObj = restaurant.toObject();
    const formattedResponse = {
      ...restaurantObj,
      branchesInfo: restaurantObj.branchesInfo.map((branch: any) => ({
        ...branch,
        deliveryPrice: branch.deliveryPrice / 100,
      })),
      menuItems: restaurantObj.menuItems.map((menuItem: any) => ({
        ...menuItem,
        price: menuItem.price / 100,
      })),
    };

    const finalResponse = JSON.parse(JSON.stringify(formattedResponse));
    res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
};



// The other controller functions remain unchanged, but we won't omit them here:
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

    // Filter by date if provided (using `dateDelivered`)
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

export const updateRestaurantOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId).populate("restaurant").populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant || restaurant.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    const validTransitions: Record<string, string[]> = {
      placed: ["confirmed", "rejected"],
      confirmed: ["rejected"],
      paid: ["inProgress", "rejected"],
      inProgress: ["outForDelivery", "rejected"],
      outForDelivery: ["delivered", "rejected"],
      delivered: [],
      rejected: ["resolved"],
      resolved: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }

    if (status === "rejected") {
      order.rejectionMessage = {
        message: ["placed", "confirmed"].includes(order.status)
          ? "Out of stock, dragons flying to get ingredients."
          : "Refund pending.",
        timestamp: new Date(),
      };
    }

    if (status === "resolved") {
      const isBeforePay = order.rejectionMessage?.message === "Out of stock, dragons flying to get ingredients.";
      order.resolutionMessage = {
        message: isBeforePay
          ? "Order resolved before payment, no refund needed."
          : "Order resolved after payment, refund paid.",
        timestamp: new Date(),
      };
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating restaurant order status:", error);
    res.status(500).json({ message: "Failed to update restaurant order status" });
  }
};

export default {
  updateRestaurantOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  uploadImage,
};
