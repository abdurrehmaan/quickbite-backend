import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { helmetConfig, generalLimiter, sanitizeData, preventPollution, corsOptions } from './middleware/security.js';
import { specs, swaggerUi } from './config/swagger.js';

const app = express();

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(sanitizeData);
app.use(preventPollution);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health checks
app.use(healthRoutes);

// API routes
app.use('/orders', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'QuickBite API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;