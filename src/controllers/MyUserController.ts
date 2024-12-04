import { Request, Response } from "express";
import User from "../models/user";

// Utility to handle responses
const handleError = (res: Response, error: unknown, message: string) => {
  console.error(error);
  res.status(500).json({ message });
};

// Utility to get `userLocation` from session
const getUserLocation = (req: Request) => req.session?.userLocation ?? null;

// Controller methods
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(currentUser);
  } catch (error) {
    handleError(res, error, "Something went wrong");
  }
};

export const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id, email, latitude, longitude } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      const auth0Ids = Array.isArray(existingUser.auth0Id)
        ? existingUser.auth0Id
        : [existingUser.auth0Id];

      if (!auth0Ids.includes(auth0Id)) {
        auth0Ids.push(auth0Id);
        existingUser.auth0Id = auth0Ids;
      }

      if (latitude && longitude) {
        existingUser.latitude = latitude;
        existingUser.longitude = longitude;
      }

      await existingUser.save();
      return res.status(200).json(existingUser);
    }

    // Create a new user
    const newUser = new User({
      auth0Id: [auth0Id],
      email,
      latitude,
      longitude,
      role: "user",
      ...req.body,
    });
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    handleError(res, error, "Error creating user");
  }
};

export const updateMyUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { name, address, city, country, cellphone } = req.body;
    const userLocation = getUserLocation(req);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        address,
        city,
        country,
        cellphone,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    handleError(res, error, "Failed to update user");
  }
};

export const promptForLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Invalid location data provided." });
    }

    const userId = req.userId;

    if (userId) {
      const user = await User.findByIdAndUpdate(
        userId,
        { latitude, longitude },
        { new: true }
      );
      return res.status(200).json({ message: "Location updated successfully.", user });
    }

    if (!req.session) {
      return res.status(500).json({ message: "Session is not initialized." });
    }

    req.session.userLocation = { latitude, longitude };
    res.status(200).json({
      message: "Location stored temporarily.",
      location: req.session.userLocation,
    });
  } catch (error) {
    handleError(res, error, "Failed to handle location data.");
  }
};

// Export controller
export default {
  getCurrentUser,
  createCurrentUser,
  updateMyUser,
  promptForLocation,
};
