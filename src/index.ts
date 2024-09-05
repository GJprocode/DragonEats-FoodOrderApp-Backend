// src/index.ts

import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import cityRoutes from './routes/cityRoutes'; // Adjust the path as necessary
import adminRoutes from "./routes/adminRoutes"; // Adjust the path as needed

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"))
  .catch(err => console.error('Database connection error:', err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health ok!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", MyRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use(cityRoutes); // check where is the path, it works
app.use( adminRoutes); // check

app.listen(7000, () => {
  console.log("Server started on http://localhost:7000");
});
