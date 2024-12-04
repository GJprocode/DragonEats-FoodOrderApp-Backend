// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\MyUserRoute.ts

import express from "express";
import MyUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

// Route to get the current logged-in user
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);

// Route to create a new user
router.post("/", jwtCheck, MyUserController.createCurrentUser);

// Route to update user details
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, MyUserController.updateMyUser);

// Route to handle geolocation prompts and updates
router.post("/location", jwtCheck,  jwtParse, MyUserController.promptForLocation);


export default router;
