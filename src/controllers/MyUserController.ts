import { Request, Response } from "express";
import User from "../models/user";
import { Session } from "express-session";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(currentUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id, email, userLocation } = req.body;

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      const auth0Ids = Array.isArray(existingUser.auth0Id)
        ? existingUser.auth0Id
        : [existingUser.auth0Id];

      if (!auth0Ids.includes(auth0Id)) {
        auth0Ids.push(auth0Id);
        existingUser.auth0Id = auth0Ids;
      }

      if (userLocation && userLocation.length === 2) {
        existingUser.userLocation = userLocation;
      }

      await existingUser.save();
      return res.status(200).json(existingUser);
    }

    const newUser = new User({
      auth0Id: [auth0Id],
      email,
      userLocation: userLocation || [],
      role: "user",
      ...req.body,
    });

    await newUser.save();
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const updateMyUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { name, address, city, country, cellphone } = req.body;

    // Access `userLocation` safely
    const userLocation = (req.session as Session & { userLocation?: { latitude: number; longitude: number } }).userLocation;


    const updateData: any = {
      name,
      address,
      city,
      country,
      cellphone,
    };

    if (userLocation) {
      updateData.userLocation = userLocation;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};




// Save or update location for a user
export const saveUserLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "Invalid latitude or longitude." });
    }

    if (!req.session) {
      return res.status(500).json({ message: "Session is not initialized." });
    }

    // Cast req.session to include custom properties
    const session = req.session as Session & { userLocation?: { latitude: number; longitude: number } };

    // Save location in session for non-logged-in users
    if (!req.userId) {
      session.userLocation = { latitude, longitude };
      return res.status(200).json({
        message: "Location saved to session.",
        location: session.userLocation,
      });
    }

    // Save location in database for logged-in users
    const user = await User.findByIdAndUpdate(
      req.userId,
      { userLocation: [latitude, longitude] }, // Update location in DB
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Location saved to database.",
      location: user.userLocation,
    });
  } catch (error) {
    console.error("Error saving location:", error);
    return res.status(500).json({ message: "Failed to save location." });
  }
};


// Step 7: Rollback ts-node and Related Dependencies (Optional)
// If none of the above resolves the issue, rollback your ts-node version:

// Uninstall ts-node:

// bash
// Copy code
// npm uninstall ts-node
// Install a specific working version:

// bash
// Copy code
// npm install ts-node@latest @types/node@latest --save-dev
