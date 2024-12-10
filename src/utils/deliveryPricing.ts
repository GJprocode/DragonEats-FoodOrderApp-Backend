

export type DeliveryPricing = {
    distance: string;
    time: string;
    price: string;
  };
  
  export const restaurantDeliveryPricing: DeliveryPricing[] = [
    { distance: "1 km", time: "10 mins", price: "$1.00" },
    { distance: "2 km", time: "15 mins", price: "$1.50" },
    { distance: "3 km", time: "20 mins", price: "$1.50" },
    { distance: "4 km", time: "25 mins", price: "$2.00" },
    { distance: "5 km", time: "30 mins", price: "$2.00" },
    { distance: "6 km", time: "35 mins", price: "$3.00" },
    { distance: "7 km", time: "40 mins", price: "$3.00" },
    { distance: "8 km", time: "45 mins", price: "$4.00" },
    { distance: "9 km", time: "50 mins", price: "$4.00" },
    { distance: "10 km", time: "55 mins", price: "$4.00" },
  ];
  
  export const wholesaleDeliveryPricing: DeliveryPricing[] = [
    { distance: "50 km", time: "1 day", price: "$10.00" },
    { distance: "100 km", time: "1 day", price: "$15.00" },
    { distance: "150 km", time: "1 day", price: "$20.00" },
    { distance: "200 km", time: "2 days", price: "$25.00" },
    { distance: "250 km", time: "2 days", price: "$30.00" },
    { distance: "300 km", time: "2 days", price: "$35.00" },
    { distance: "350 km", time: "3 days", price: "$40.00" },
    { distance: "400 km", time: "3 days", price: "$45.00" },
    { distance: "450 km", time: "4 days", price: "$50.00" },
    { distance: "500 km", time: "4 days", price: "$55.00" },
  ];


  export const getDeliveryPricing = (
    distance: number,
    type: "restaurant" | "wholesale"
  ) => {
    const pricingTable =
      type === "restaurant" ? restaurantDeliveryPricing : wholesaleDeliveryPricing;
  
    for (const row of pricingTable) {
      const maxDistance = parseFloat(row.distance.replace(" km", ""));
      if (distance <= maxDistance) {
        return { price: row.price, time: row.time };
      }
    }
  
    return { price: "Out of range", time: "-" }; // Fallback if no match
  };
      