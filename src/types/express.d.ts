// C:\Users\gertf\Desktop\FoodApp\backend\src\types\express.d.ts

import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;   // MongoDB _id of the user (linked to the restaurants collection)
      userEmail?: string; // User's email for convenience
      auth0Id?: string;   // Auth0 ID, if you need it for specific operations
    }
  }
}