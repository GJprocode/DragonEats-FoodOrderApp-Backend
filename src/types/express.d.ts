// C:\Users\gertf\Desktop\FoodApp\backend\src\types\express.d.ts

// import { Request } from "express";

// declare module "express" {
//   export interface Request {
//     user?: { email: string; id: string };  // This must match the shape you're using
//   }
// }

import express from "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userEmail?: string;
    }
  }
}
