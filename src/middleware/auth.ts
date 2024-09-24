// C:\Users\gertf\Desktop\FoodApp\backend\src\middleware\auth.ts

import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import Admin from '../models/admin';
import User from '../models/user';

// Extend the Express Request interface to include custom fields
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      role?: string; // Added role for admin/user differentiation
    }
  }
}

// Middleware for JWT verification
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// Middleware for decoding the JWT and attaching user info to the request
export const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;  // Decode the JWT token
    const auth0Id = decoded.sub;  // Extract the Auth0 ID from the token

    const user = await User.findOne({ auth0Id });  // Find the user by Auth0 ID

    if (!user) {
      return res.sendStatus(401);  // Unauthorized if no user found
    }

    req.userId = user._id.toString();  // Use the MongoDB user _id
    req.userEmail = user.email;
    next();
  } catch (error) {
    console.error("JWT parse error:", error);
    return res.sendStatus(401);
  }
};


// Middleware for verifying user role (admin/user)
export const verifyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.userId;  // Extract auth0Id from the JWT

    // Check in Admin collection first
    const admin = await Admin.findOne({ auth0Id });
    if (admin) {
      req.role = 'admin';
      return next();
    }

    // Check in User collection if not found in Admin
    const user = await User.findOne({ auth0Id });
    if (user) {
      req.role = user.role || 'user';  // Defaults to 'user' if no role
      return next();
    }

    return res.status(403).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error("Error verifying role:", error);
    return res.status(500).json({ message: 'Error verifying role' });
  }
};
