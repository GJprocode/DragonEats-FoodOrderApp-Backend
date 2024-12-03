import cloudinary from 'cloudinary';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Ensure that MONGO_URI is defined and is a string
const MONGO_URI = process.env.MONGODB_CONNECTION_STRING;
if (!MONGO_URI) {
  throw new Error('MONGODB_CONNECTION_STRING is not defined in .env file');
}

// MongoDB Configuration
const client = new MongoClient(MONGO_URI);

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to extract the public ID from the Cloudinary URL
function extractPublicId(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1]; // Get the last part of the URL
  return filename.split('.')[0]; // Remove the file extension and return the public ID
}

// Function to fetch all images from Cloudinary
async function fetchAllCloudinaryImages() {
  let allImages: string[] = [];
  let nextCursor: string | undefined = undefined;

  do {
    const response = await cloudinary.v2.api.resources({
      type: 'upload',
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });

    allImages = allImages.concat(response.resources.map((image: { url: string }) => image.url.replace(/^https?:\/\//, '')));
    nextCursor = response.next_cursor || undefined;
  } while (nextCursor);

  console.log('Total Cloudinary Images Fetched:', allImages.length);
  console.log('Cloudinary Image URLs:', allImages);
  return allImages;
}

// Function to fetch all image URLs from MongoDB
async function fetchMongoDBImageURLs() {
  try {
    await client.connect();
    const db = client.db('test'); // Correctly connect to the 'test' database
    const collection = db.collection('restaurants'); // Correctly connect to the 'restaurants' collection

    const restaurants = await collection.find().toArray();

    if (restaurants.length === 0) {
      console.log('No restaurant documents found in MongoDB.');
      return [];
    }

    const restaurantImageUrls = restaurants.map(restaurant => {
      const restaurantImageUrl = restaurant.restaurantImageUrl?.replace(/^https?:\/\//, '');
      const menuItemImageUrls = restaurant.menuItems.map((item: any) => item.imageUrl?.replace(/^https?:\/\//, ''));
      return [restaurantImageUrl, ...menuItemImageUrls];
    });

    const flatImageUrls = restaurantImageUrls.flat().filter(Boolean) as string[];
    console.log('Total MongoDB Image URLs Fetched:', flatImageUrls.length);
    console.log('MongoDB Image URLs:', flatImageUrls);
    return flatImageUrls;
  } finally {
    await client.close();
  }
}

// Function to delete unmatched images from Cloudinary
async function deleteUnmatchedCloudinaryImages(cloudinaryUrls: string[], mongoDbUrls: string[]) {
  if (mongoDbUrls.length === 0) {
    console.log("No MongoDB URLs were fetched. Aborting cleanup to avoid data loss.");
    return;
  }

  // Convert all URLs to lowercase to ensure case-insensitive comparison
  const unmatchedUrls = cloudinaryUrls.filter(url => {
    const normalizedUrl = url.toLowerCase();
    return !mongoDbUrls.some(mongoUrl => mongoUrl.toLowerCase() === normalizedUrl);
  });

  console.log('Unmatched Cloudinary Images to be Deleted:', unmatchedUrls.length);
  console.log('Unmatched Cloudinary Image URLs:', unmatchedUrls);

  // Double-check before deletion
  if (unmatchedUrls.length === 0) {
    console.log("No unmatched images found. Nothing to delete.");
    return;
  }

  // Delete unmatched images
  for (const url of unmatchedUrls) {
    try {
      const publicId = extractPublicId(url);
      const result = await cloudinary.v2.uploader.destroy(publicId);
      if (result.result === 'ok') {
        console.log(`Successfully deleted unmatched image with URL: ${url}`);
      } else {
        console.log(`Failed to delete image with URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error deleting image with URL: ${url} -`, error);
    }
  }

  return fetchAllCloudinaryImages(); // Fetch the updated list after deletion
}

// Main function to run the cleanup process
(async () => {
  try {
    // Step 1: Fetch all images from Cloudinary
    const cloudinaryUrls = await fetchAllCloudinaryImages();

    // Step 2: Fetch all image URLs from MongoDB
    const mongoDbUrls = await fetchMongoDBImageURLs();

    // Log all URLs before processing
    console.log("Cloudinary URLs:", cloudinaryUrls);
    console.log("MongoDB URLs:", mongoDbUrls);

    // Step 3: Delete unmatched images from Cloudinary and fetch the updated list
    const finalCloudinaryUrls = await deleteUnmatchedCloudinaryImages(cloudinaryUrls, mongoDbUrls);

    // Step 4: Save the final state of Cloudinary and MongoDB to JSON files
    const currentDirectory = path.dirname(__filename);
    fs.writeFileSync(path.join(currentDirectory, 'finalCloudinaryImages.json'), JSON.stringify(finalCloudinaryUrls, null, 2));
    fs.writeFileSync(path.join(currentDirectory, 'finalMongoDBImages.json'), JSON.stringify(mongoDbUrls, null, 2));

    console.log('Cleanup complete. Updated JSON files have been generated.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
})();

// npx ts-node C:\Users\gertf\Desktop\FoodApp\backend\src\utils\cloudinaryMongoDBImageClean.ts
