// import { Request, Response } from "express";
// import Restaurant from "../models/restaurant";
// import cloudinary from "cloudinary";
// import mongoose from "mongoose";

// const getMyRestaurant = async (req: Request, res: Response) => {
//   try {
//     const restaurant = await Restaurant.findOne({ user: req.userId });
//     if(!restaurant) {
//       return res.status(404).json({ message: "restaurant not found"});
//     }

//   }  catch (error) {
//     console.log("error", error);
//     res.status(500).json({ message: "Error fecthing restaurant"});
//   }
// };


// const createMyRestaurant = async (req: Request, res: Response) => {
//   try {
//     const existingRestaurant = await Restaurant.findOne({ user: req.userId });
//     if (existingRestaurant) {
//       return res.status(409).json({ message: "User restaurant already exists" });
//     }

  
//     const imageUrl = await uploadImage(req.file as Express.Multer.File)

//       const restaurant = new Restaurant(req.body);
//       restaurant.imageUrl = imageUrl,
//       restaurant.user = new mongoose.Types.ObjectId(req.userId),
//       restaurant.lastUpdated = new Date(),
//       await restaurant.save();



//     const { restaurantName, city, country, deliveryPrice, estimatedDeliveryTime, cuisines, menuItems } = req.body;

//     // Ensure menuItems is an array and validate its content
//     if (!Array.isArray(menuItems) || menuItems.length === 0) {
//       return res.status(400).json({ message: "Menu items are required" });
//     }

//     menuItems.forEach((item: any) => {
//       if (!item.name || !item.price) {
//         return res.status(400).json({ message: "Each menu item requires a name and price" });
//       }
//     });

   
//     await restaurant.save();

//     res.status(201).send(restaurant);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// const updateMyRestaurant = async (req: Request, res:Response) => {
//   try {
//     const restaurant = await Restaurant.findOne({
//       user: req.userId,
//     });

//     if(!restaurant) {
//       return res.status(404).json({ message: " Restaurant not found" });
//     }

//     restaurant.restaurantName = req.body.restaurantName;
//     restaurant.city = req.body.city;
//     restaurant.country = req.body.country;
//     restaurant.deliveryPrice = req.body.deliveryPrice;
//     restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
//     restaurant.cuisines = req.body.cuisines;
//     restaurant.menuItems = req.body.menuItems;
//     restaurant.lastUpdated = new Date();

//     if(req.file) {
//       const imageUrl = await uploadImage(req.file as Express.Multer.File)
//       restaurant.imageUrl = imageUrl;
//     }

//     await restaurant.save();
//     res.status(200).send(restaurant);

//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({message: "Something went wrong"});

//   }
// };

// const uploadImage = async (file: Express.Multer.File) => {
//   const image = file;
//   const base64Image = Buffer.from(image.buffer).toString("base64");
//   const dataURI = `data:${image.mimetype};base64,${base64Image}`;

//   const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
//   return uploadResponse.url;
// }

// export default {
//   getMyRestaurant,
//   createMyRestaurant,
//   updateMyRestaurant,
// };



import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });
        if (existingRestaurant) {
            return res.status(409).json({ message: "User restaurant already exists" });
        }

        const imageUrl = await uploadImage(req.file as Express.Multer.File);

        const restaurant = new Restaurant({
            ...req.body,
            imageUrl,
            user: req.userId,
            lastUpdated: new Date(),
        });
        await restaurant.save();

        res.status(201).send(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if (req.file) {
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();
        res.status(200).send(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const uploadImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};

export default {
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
};

