import express from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5mb
    },
});

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);


// /api/my/restaurant
router.post(
    "/", 
    upload.single("imageFile"), 
    validateMyRestaurantRequest, // request stuff first before validation stuff
    jwtCheck, //import jwtcheck function from middleware/auth, ensure we get a valid token in the request
    jwtParse, // fills in the current logged in users info out of the token and passes it onto the request
    // important to add above before rest of the stuff because the middleware is always going to run in order
    
    MyRestaurantController.createMyRestaurant
);

router.put(
    "/",
    upload.single("imageFile"), 
    validateMyRestaurantRequest, 
    jwtCheck, 
    jwtParse,
    MyRestaurantController.updateMyRestaurant
);

export default router;

// import express from "express";
// import multer from "multer";
// import MyRestaurantController from "../controllers/MyRestaurantController";
// import { jwtCheck, jwtParse } from "../middleware/auth";
// import { validateMyRestaurantRequest } from "../middleware/validation";

// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5mb
//     },
// });

// router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

// router.post(
//     "/", 
//     upload.single("imageFile"), 
//     validateMyRestaurantRequest, 
//     jwtCheck, 
//     jwtParse,
//     MyRestaurantController.createMyRestaurant
// );

// router.put(
//     "/",
//     upload.single("imageFile"), 
//     validateMyRestaurantRequest, 
//     jwtCheck, 
//     jwtParse,
//     MyRestaurantController.updateMyRestaurant
// );

// export default router;
