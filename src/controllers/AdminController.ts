import { Request, Response } from "express";
import Admin from "../models/admin";

export const checkAdmin = async (req: Request, res: Response) => {
  const { email } = req.params;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.role === "admin") {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
