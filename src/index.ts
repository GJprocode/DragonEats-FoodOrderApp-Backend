// C:\Users\gertf\Desktop\FoodApp\backend\src\index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import cityRoutes from "./routes/cityRoutes";
import adminRoutes from "./routes/adminRoutes";
import orderRoute from "./routes/OrderRoute";
import { stripeWebhookHandler } from "./controllers/OrderController";


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"))
  .catch((err) => console.error("Database connection error:", err));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true, // Force HTTPS for all Cloudinary URLs
});

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development frontend
      "https://dragoneats-foodorderapp-frontend.onrender.com", // Production frontend URL
    ],
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// **Define the webhook route before body parsers**
app.post(
  "/api/order/checkout/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

// Parse JSON bodies (must be defined after the webhook route)
app.use(express.json());

// Health check route
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health ok!" });
});

// Define your API routes
app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", MyRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/cities", cityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/order", orderRoute);

// Start the server
app.listen(7000, () => {
  console.log("Server started on http://localhost:7000");
});
