// C:\Users\gertf\Desktop\FoodApp\backend\src\controllers\orderUserController.ts

import { Request, Response } from 'express';
import User from '../models/user';
import Order from '../models/order';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Assume user ID comes from a request parameter or hardcoded for testing
    const userId = req.query.userId as string;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};


export const updateOrderDetails = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const updatedDetails = req.body;
    try {
      const order = await Order.findByIdAndUpdate(orderId, updatedDetails, { new: true });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error updating order details', error });
    }
  };

  export const getOrderDetails = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId).populate("restaurant user");
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Unable to fetch order details" });
    }
  };
  