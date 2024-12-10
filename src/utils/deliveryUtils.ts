// C:\Users\gertf\Desktop\FoodApp\frontend\src\lib\deliveryUtils.ts

import { getDeliveryPricing } from "./deliveryPricing";



export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const calculateDeliveryDetails = (
  branchesInfo: { latitude: number; longitude: number }[],
  userLocation: { latitude: number; longitude: number },
  type: "restaurant" | "wholesale"
) => {
  if (!branchesInfo || branchesInfo.length === 0 || !userLocation) {
    throw new Error("Invalid input data for delivery calculation.");
  }

  const distances = branchesInfo.map((branch) => ({
    distance: calculateDistance(
      branch.latitude,
      branch.longitude,
      userLocation.latitude,
      userLocation.longitude
    ),
    branch,
  }));

  const nearestBranch = distances.reduce((prev, curr) =>
    curr.distance < prev.distance ? curr : prev
  );

  const pricing = getDeliveryPricing(nearestBranch.distance, type);

  return {
    ...pricing,
    distance: nearestBranch.distance.toFixed(2) + " km",
  };
};
