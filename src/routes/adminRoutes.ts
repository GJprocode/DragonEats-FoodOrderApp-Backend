// // src/routes/adminRoutes.ts
// import express from "express";
// import Restaurant from "../models/restaurant";
// import AdminAction from "../models/admin";

// const router = express.Router();

// // Update restaurant status and log admin action
// router.post("/api/admin/update-status/:id", async (req, res) => {
//   try {
//     const { status, contractType, contractId } = req.body;
//     const restaurant = await Restaurant.findById(req.params.id);

//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     // Update restaurant details
//     restaurant.status = status;
//     restaurant.contractType = contractType;
//     restaurant.contractId = contractId;
//     restaurant.lastUpdated = new Date();

//     await restaurant.save();

//     // Log the action in the AdminAction collection
//     const adminAction = new AdminAction({
//       restaurantId: restaurant._id,
//       adminEmail: req.userEmail, // You should extract this from the authenticated user session
//       status: status,
//       contractType: contractType,
//       contractId: contractId,
//       updatedAt: new Date(),
//     });

//     await adminAction.save();

//     res.status(200).json(restaurant);
//   } catch (error) {
//     console.error("Error updating restaurant status:", error);
//     res.status(500).json({ message: "Error updating restaurant status" });
//   }
// });

// export default router;
// src/routes/adminRoutes.ts
import express from "express";
import { getAllRestaurants, updateRestaurantStatus } from '../controllers/MyRestaurantController';

const router = express.Router();

// Route to fetch all restaurants for the admin panel
router.get('/api/admin/restaurants', getAllRestaurants);

// Route to update the status of a restaurant
router.post('/api/admin/update-status/:id', updateRestaurantStatus);

export default router;
