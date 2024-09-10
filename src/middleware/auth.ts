// C:\Users\gertf\Desktop\FoodApp\backend\src\middleware\auth.ts

import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/user";

// Extend the Express Request interface to include the custom fields
declare global {
  namespace Express {
    interface Request {
      userId: string;
      userEmail?: string;
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const user = await User.findOne({ auth0Id: decoded.sub });

    if (!user) {
      return res.sendStatus(401);
    }

    req.userId = user._id.toString();
    req.userEmail = user.email;
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
