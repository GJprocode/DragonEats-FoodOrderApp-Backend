// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\MyUserRoute.ts

import express from "express";
import MyUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

<<<<<<< HEAD
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
router.post("/", jwtCheck, MyUserController.createCurrentUser);
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, MyUserController.updateMyUser);
=======
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);  // Protected
router.post("/", jwtCheck, MyUserController.createCurrentUser);  // Protected
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, MyUserController.updateMyUser);  // Protected
>>>>>>> 6c92afd (fix auth issue localhost issue render.com)

export default router;
