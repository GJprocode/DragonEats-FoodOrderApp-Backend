
// C:\Users\gertf\Desktop\FoodApp\backend\src\routes\cityRoutes.ts
// In your backend, create a new route to fetch cities
// backend\src\routes\cityRoutes.ts

import express from 'express';
import Restaurant from '../models/restaurant';

const router = express.Router();

// Endpoint to fetch unique cities
router.get('/', async (req, res) => {
  try {
    const cities = await Restaurant.distinct('city');
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
});

export default router;
