import mongoose from 'mongoose';

// Setup runs before all tests
beforeAll(async () => {
  // Use in-memory MongoDB for tests
  process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/quickbite-test';
  process.env.NODE_ENV = 'test';
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});
