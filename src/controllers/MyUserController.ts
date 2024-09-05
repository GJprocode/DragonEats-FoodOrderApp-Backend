//  C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\MyUserController.ts

import { Request, Response } from "express";
import User from "../models/user";

// Handler functions for business logic

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).send(); // If the user already exists, return a 200 status with no content.
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const updateMyUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { name, address, city, country } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        address,
        city,
        country,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
  updateMyUser,
};
