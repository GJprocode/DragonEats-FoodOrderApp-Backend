import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/user";

// Extend the Express Request interface to include the custom fields
declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id?: string; // Include auth0Id in the type declaration
      userEmail?: string;
    }
  }
}

// JWT Check middleware for Auth0
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// Parse JWT and add user information to the request
const jwtParse = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub;

    // Find the user by their Auth0 ID
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.sendStatus(401);
    }

    // Add the user information to the request object
    req.auth0Id = auth0Id; // Add auth0Id to the request object
    req.userId = user._id.toString();
    req.userEmail = user.email;
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};

// Only export the variables once
export { jwtCheck, jwtParse };
