import "express-session";

declare module "express-session" {
  interface SessionData {
    userLocation?: { latitude: number; longitude: number };
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
