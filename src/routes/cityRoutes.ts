
// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\cityRoutes.ts
// In your backend, create a new route to fetch cities
// backend\src\routes\cityRoutes.ts

import express from 'express';
import {getCities} from '../controllers/RestaurantController';

const router = express.Router();


// Route to fetch unique cities with approved restaurants
router.get('/', getCities);

export default router;
