import dotenv from "dotenv";
import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import Restaurant from "../models/Restaurant.js";
import DeliveryZone from "../models/DeliveryZone.js";
import Item from "../models/Item.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

await Customer.create({
  _id: "CUST-12",
  name: "Anas Ahmed",
  location: { lat: 24.90, lng: 66.99 },
  zone: "Suburban"
});

await Restaurant.create({
  _id: "REST-09",
  name: "Burger King DHA",
  location: { lat: 24.80, lng: 67.02 },
  zone: "Urban"
});

await DeliveryZone.insertMany([
  { zone: "Urban", baseFee: 25, perKmRate: 2.5 },
  { zone: "Suburban", baseFee: 35, perKmRate: 3.2 },
  { zone: "Remote", baseFee: 50, perKmRate: 4.5 }
]);

await Item.insertMany([
  { _id: "ITEM-101", name: "Whopper", price: 450 },
  { _id: "ITEM-303", name: "Fries", price: 300 }
]);

console.log("Seed completed");
process.exit();