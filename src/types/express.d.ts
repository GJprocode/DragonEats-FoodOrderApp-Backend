// types/express.d.ts or similar

import { Request } from "express";

declare module "express" {
  export interface Request {
    userId?: string; // Modify this if you use another field like `user`
  }
}
