import dotenv from "dotenv";
import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import Restaurant from "../models/Restaurant.js";
import DeliveryZone from "../models/DeliveryZone.js";
import Item from "../models/Item.js";
import Promo from "../models/Promo.js";

dotenv.config();

console.log('🌱 Starting database seed...');

await mongoose.connect(process.env.MONGO_URI);

// Clear existing data
console.log('🗑️  Clearing existing data...');
await Customer.deleteMany({});
await Restaurant.deleteMany({});
await DeliveryZone.deleteMany({});
await Item.deleteMany({});
await Promo.deleteMany({});

// Create Customers
console.log('👥 Creating customers...');
const customer1 = await Customer.create({
  name: "Anas Ahmed",
  email: "anas@example.com",
  location: { lat: 24.90, lon: 66.99 },
  zone: "zone_1",
  firstOrderCompleted: false
});

const customer2 = await Customer.create({
  name: "Sarah Khan",
  email: "sarah@example.com",
  location: { lat: 24.85, lon: 67.01 },
  zone: "zone_2",
  firstOrderCompleted: true
});

console.log(`✅ Created customers: ${customer1._id}, ${customer2._id}`);

// Create Restaurants
console.log('🍔 Creating restaurants...');
const restaurant1 = await Restaurant.create({
  name: "Burger King DHA",
  location: { lat: 24.80, lon: 67.02 },
  cuisine: "Fast Food"
});

const restaurant2 = await Restaurant.create({
  name: "Pizza Hut Clifton",
  location: { lat: 24.82, lon: 67.03 },
  cuisine: "Italian"
});

console.log(`✅ Created restaurants: ${restaurant1._id}, ${restaurant2._id}`);

// Create Delivery Zones
console.log('📍 Creating delivery zones...');
await DeliveryZone.insertMany([
  { zone: "zone_1", baseFee: 2.0, perKmRate: 0.5 },
  { zone: "zone_2", baseFee: 2.5, perKmRate: 0.6 },
  { zone: "zone_3", baseFee: 3.0, perKmRate: 0.7 }
]);

console.log('✅ Created delivery zones');

// Create Items
console.log('🍽️  Creating menu items...');
const item1 = await Item.create({
  name: "Whopper Burger",
  price: 12.50,
  restaurantId: restaurant1._id
});

const item2 = await Item.create({
  name: "Chicken Fries",
  price: 5.00,
  restaurantId: restaurant1._id
});

const item3 = await Item.create({
  name: "Large Pizza",
  price: 18.00,
  restaurantId: restaurant2._id
});

const item4 = await Item.create({
  name: "Garlic Bread",
  price: 4.50,
  restaurantId: restaurant2._id
});

console.log(`✅ Created items: ${item1._id}, ${item2._id}, ${item3._id}, ${item4._id}`);

// Create Promos
console.log('🎉 Creating promotions...');
await Promo.insertMany([
  {
    name: "FIRST_ORDER_10",
    type: "FIRST_ORDER",
    discount: 0.10,
    active: true
  },
  {
    name: "BURGER_KING_5",
    type: "RESTAURANT",
    discount: 0.05,
    restaurantId: restaurant1._id,
    active: true
  },
  {
    name: "ZONE_1_FLAT",
    type: "ZONE",
    flat: 2.00,
    zone: "zone_1",
    active: true
  }
]);

console.log('✅ Created promotions');

// Print test data for Postman
console.log('\n📋 ============ TEST DATA FOR POSTMAN ============\n');
console.log('🔹 Customer IDs:');
console.log(`   Customer 1 (Anas - First Order): ${customer1._id}`);
console.log(`   Customer 2 (Sarah - Returning):  ${customer2._id}`);

console.log('\n🔹 Restaurant IDs:');
console.log(`   Burger King: ${restaurant1._id}`);
console.log(`   Pizza Hut:   ${restaurant2._id}`);

console.log('\n🔹 Item IDs:');
console.log(`   Whopper Burger:  ${item1._id} ($${item1.price})`);
console.log(`   Chicken Fries:   ${item2._id} ($${item2.price})`);
console.log(`   Large Pizza:     ${item3._id} ($${item3.price})`);
console.log(`   Garlic Bread:    ${item4._id} ($${item4.price})`);

console.log('\n🔹 Sample Postman Request:');
console.log(JSON.stringify({
  customerId: customer1._id.toString(),
  restaurantId: restaurant1._id.toString(),
  items: [
    { productId: item1._id.toString(), qty: 2 },
    { productId: item2._id.toString(), qty: 1 }
  ],
  placedAt: new Date().toISOString()
}, null, 2));

console.log('\n✨ Seed completed successfully!\n');
process.exit();