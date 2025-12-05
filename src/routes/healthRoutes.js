import express from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.database.error = error.message;
    logger.error('Health check failed:', error);
    res.status(503).json(healthcheck);
  }
});


router.get('/health/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not ready');
    }

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});


router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;
