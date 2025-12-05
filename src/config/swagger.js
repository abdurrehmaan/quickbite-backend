import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuickBite API',
      version: '1.0.0',
      description: 'Food delivery platform API with dynamic pricing',
      contact: {
        name: 'API Support',
        email: 'support@quickbite.com'
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            customerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            restaurantId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  qty: { type: 'integer', minimum: 1 },
                  unitPrice: { type: 'number' }
                }
              }
            },
            basePrice: { type: 'number', example: 25.50 },
            deliveryFee: { type: 'number', example: 5.00 },
            promoDiscount: { type: 'number', example: 2.50 },
            finalTotal: { type: 'number', example: 28.00 },
            breakdown: { type: 'object' },
            placedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['customerId', 'restaurantId', 'items', 'placedAt'],
          properties: {
            customerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            restaurantId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'qty'],
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  qty: { type: 'integer', minimum: 1, maximum: 100, example: 2 }
                }
              }
            },
            placedAt: { type: 'string', format: 'date-time', example: '2025-12-04T10:30:00Z' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to route files
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
