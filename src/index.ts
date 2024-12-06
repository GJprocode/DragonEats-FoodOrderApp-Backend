// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import session from "express-session";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import cityRoutes from "./routes/cityRoutes";
import adminRoutes from "./routes/adminRoutes";
import orderRoute from "./routes/OrderRoute";
import orderUserRoute from "./routes/orderUserRoute";
import OrderController from "./controllers/OrderController";
import helmet from "helmet";

const app = express();

// Add global error handlers
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

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

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
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
app.use("/api/order-user", orderUserRoute);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://js.stripe.com"],
        "frame-src": ["'self'", "https://js.stripe.com"],
        "connect-src": ["'self'", "https://api.stripe.com"],
      },
    },
  })
);

// Start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
