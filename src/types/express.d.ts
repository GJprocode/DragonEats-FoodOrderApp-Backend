// C:\Users\gertf\Desktop\FoodApp\backend\src\types\express.d.ts

import { Request } from "express";

import "express-session";

declare module "express-session" {
  interface SessionData {
    userLocation?: { latitude: number; longitude: number }; // Add userLocation to session
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string; // MongoDB _id of the user
      userEmail?: string; // User's email
      auth0Id?: string; // Auth0 ID
    }
  }
}

