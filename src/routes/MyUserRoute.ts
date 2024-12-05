import express from "express";
import {
  getCurrentUser,
  createCurrentUser,
  updateMyUser,
//   promptForLocation,
  saveUserLocation,
} from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

// Route to get the current logged-in user
router.get("/", jwtCheck, jwtParse, getCurrentUser);

// Route to create a new user
router.post("/", jwtCheck, createCurrentUser);

// Route to update user details
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, updateMyUser);

// Route to handle geolocation prompts and updates
router.post("/location", jwtCheck, jwtParse, saveUserLocation);

export default router;
