// In your backend, create a new route to fetch cities
import express from 'express';
import Restaurant from '../models/restaurant';

const router = express.Router();

router.get('/api/cities', async (req, res) => {
  try {
    // Fetch unique cities from the restaurant collection
    const cities = await Restaurant.distinct('city');
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
});

export default router;
