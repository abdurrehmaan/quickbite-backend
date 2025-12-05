import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Customer from '../src/models/Customer.js';
import Restaurant from '../src/models/Restaurant.js';
import Item from '../src/models/Item.js';

describe('Order API Integration Tests', () => {
  let customer, restaurant, item;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Create test data
    customer = await Customer.create({
      name: 'John Doe',
      location: { lat: 40.7128, lon: -74.0060 },
      zone: 'zone_1',
      firstOrderCompleted: false
    });

    restaurant = await Restaurant.create({
      name: 'Test Restaurant',
      location: { lat: 40.7589, lon: -73.9851 }
    });

    item = await Item.create({
      name: 'Test Item',
      price: 10.00,
      restaurantId: restaurant._id
    });
  });

  describe('POST /orders', () => {
    test('should create order with valid data', async () => {
      const orderData = {
        customerId: customer._id.toString(),
        restaurantId: restaurant._id.toString(),
        items: [{ productId: item._id.toString(), qty: 2 }],
        placedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.customerId).toBe(customer._id.toString());
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].qty).toBe(2);
    });

    test('should reject invalid customer ID', async () => {
      const orderData = {
        customerId: 'invalid-id',
        restaurantId: restaurant._id.toString(),
        items: [{ productId: item._id.toString(), qty: 2 }],
        placedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Validation failed');
    });

    test('should reject empty items array', async () => {
      const orderData = {
        customerId: customer._id.toString(),
        restaurantId: restaurant._id.toString(),
        items: [],
        placedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should reject future order date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const orderData = {
        customerId: customer._id.toString(),
        restaurantId: restaurant._id.toString(),
        items: [{ productId: item._id.toString(), qty: 1 }],
        placedAt: futureDate.toISOString()
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /orders/:id', () => {
    test('should get order by ID', async () => {
      // First create an order
      const orderData = {
        customerId: customer._id.toString(),
        restaurantId: restaurant._id.toString(),
        items: [{ productId: item._id.toString(), qty: 1 }],
        placedAt: new Date().toISOString()
      };

      const createResponse = await request(app)
        .post('/orders')
        .send(orderData);

      const orderId = createResponse.body._id;

      // Then get it
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(response.body._id).toBe(orderId);
      expect(response.body.customerId).toBe(customer._id.toString());
    });

    test('should return 400 for invalid order ID', async () => {
      const response = await request(app)
        .get('/orders/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('fail');
    });

    test('should return 500 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/orders/${fakeId}`)
        .expect(500);
    });
  });
});
