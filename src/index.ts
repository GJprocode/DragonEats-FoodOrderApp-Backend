import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config"; // Ensure .env is loaded
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import cityRoutes from './routes/cityRoutes';
import adminRoutes from "./routes/adminRoutes"; 
import adminActionRoutes from "./routes/adminActionsRoutes";  // Import admin routes

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
app.use(cityRoutes);
app.use(adminRoutes);
// app.use(actionadmin); where is this implimnetations?

app.listen(7000, () => {
  console.log("Server started on http://localhost:7000");
});
