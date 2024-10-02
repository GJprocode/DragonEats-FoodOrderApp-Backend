// backend/src/index.ts
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
import OrderController from "./controllers/OrderController";

const app = express();

// Add global error handlers
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Log environment variables presence
console.log("Environment variables loaded:");
console.log("MONGODB_CONNECTION_STRING is defined:", !!process.env.MONGODB_CONNECTION_STRING);
console.log("CLOUDINARY_CLOUD_NAME is defined:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("STRIPE_API_KEY is defined:", !!process.env.STRIPE_API_KEY);
console.log("STRIPE_WEBHOOK_SECRET is defined:", !!process.env.STRIPE_WEBHOOK_SECRET);
console.log("FRONTEND_URL is defined:", !!process.env.FRONTEND_URL);

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
  secure: true,
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://dragoneats-foodorderapp-frontend.onrender.com",
];

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Define the webhook route before body parsers
app.post(
  "/api/order/checkout/webhook",
  express.raw({ type: "application/json" }),
  OrderController.stripeWebhookHandler
);

// Parse JSON bodies (must be defined after the webhook route)
app.use(express.json());

// Health check route
app.get("/health", (req: Request, res: Response) => {
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
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
