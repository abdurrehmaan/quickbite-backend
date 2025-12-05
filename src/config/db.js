import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// MongoDB connection options
const options = {
  maxPoolSize: 10, // Maximum number of sockets the MongoDB driver will keep open
  minPoolSize: 5,  // Minimum number of sockets
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true,
};

let isConnected = false;

export const connectDB = async (retries = 5) => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  let attempt = 0;
  
  while (attempt < retries) {
    try {
      attempt++;
      logger.info(`Attempting to connect to MongoDB (attempt ${attempt}/${retries})`);
      
      await mongoose.connect(process.env.MONGO_URI, options);
      
      isConnected = true;
      logger.info('MongoDB connected successfully');
      
      // Connection event handlers
      mongoose.connection.on('disconnected', () => {
        isConnected = false;
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('reconnected', () => {
        isConnected = true;
        logger.info('MongoDB reconnected');
      });

      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        logger.error('All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
  } catch (err) {
    logger.error('Error disconnecting from MongoDB:', err);
  }
};