# QuickBite Backend API

A production-grade food delivery platform backend with intelligent dynamic pricing engine built with Node.js, Express, and MongoDB.

## 🎯 Overview

QuickBite is a comprehensive food delivery API that calculates delivery fees dynamically based on multiple factors including distance, delivery zones, peak hours, and applies promotional discounts. The system is designed with enterprise-level patterns including proper error handling, validation, logging, security, and observability.

## ✨ Key Features

### 🚀 Dynamic Pricing Engine
- **Distance-Based Pricing**: Haversine formula calculates exact distance between restaurant and customer
- **Zone-Based Pricing**: Different delivery zones have customizable base fees and per-km rates
- **Peak-Hour Multipliers**: Surge pricing during high-demand hours (configurable via JSON)
- **Promotional Discounts**: Support for first-order, restaurant-specific, and zone-based promotions

### 🔒 Enterprise Security
- **Helmet.js**: Secure HTTP headers (CSP, HSTS, XSS protection)
- **Rate Limiting**: Configurable request throttling (100 req/15min general, 10 req/15min for orders)
- **Input Sanitization**: MongoDB injection prevention with express-mongo-sanitize
- **HPP Protection**: HTTP Parameter Pollution prevention
- **CORS**: Configurable cross-origin resource sharing

### 📝 Production Logging
- **Winston Logger**: Multi-transport logging with file rotation
- **Morgan Integration**: HTTP request logging with custom formats
- **Log Levels**: Error, warn, info, debug with environment-based filtering
- **Separate Log Files**: `combined.log`, `error.log`, `exceptions.log`, `rejections.log`

### ✅ Request Validation
- **Joi Schemas**: Comprehensive input validation for all endpoints
- **MongoDB ObjectId Validation**: Proper format checking
- **Business Rule Validation**: Quantity limits, date constraints, required fields

### 📚 API Documentation
- **Swagger/OpenAPI 3.0**: Auto-generated interactive documentation
- **Available at**: `/api-docs`
- **Complete Schema Definitions**: Request/response models documented

### 🏥 Health & Observability
- **Health Check**: `/health` - Full system health including database status
- **Readiness Probe**: `/health/ready` - Kubernetes readiness endpoint
- **Liveness Probe**: `/health/live` - Kubernetes liveness endpoint
- **Uptime Metrics**: Process uptime and environment info

### 🧪 Testing Infrastructure
- **Jest Framework**: Unit and integration tests
- **Supertest**: HTTP endpoint testing
- **Code Coverage**: 70% threshold enforcement
- **Test Isolation**: Automatic database cleanup between tests

### 🛡️ Error Handling
- **Custom Error Classes**: AppError, ValidationError, NotFoundError, UnauthorizedError
- **Centralized Handler**: Consistent error responses across all endpoints
- **Environment-Aware**: Stack traces in development, sanitized in production
- **Async Error Wrapper**: Automatic promise rejection handling

### 📊 Database Excellence
- **MongoDB with Mongoose**: Schema validation and relationship management
- **Connection Pooling**: Min 5, Max 10 connections
- **Automatic Retry**: Exponential backoff on connection failures
- **Indexes**: Optimized queries with compound indexes
- **Graceful Shutdown**: Proper connection cleanup

## 🏗️ Architecture & Services

### Core Services

#### 1. **Order Service** (`src/services/orderService.js`)
Orchestrates the complete order creation and retrieval flow:
- Validates customer and restaurant existence
- Fetches menu items with current prices
- Coordinates pricing engine and promotion service
- Creates order with complete breakdown

#### 2. **Promo Service** (`src/services/promoService.js`)
Handles promotional discount logic:
- **First Order Discount**: Percentage off for new customers
- **Restaurant Promotions**: Specific restaurant deals
- **Zone Promotions**: Flat discounts for delivery zones
- Returns total discount and applied promo names

### Pricing Engine Components

#### 3. **Pricing Engine** (`src/pricing/pricingEngine.js`)
Central pricing calculator that combines:
- Distance calculation (via Distance Service)
- Zone pricing lookup (via Zone Pricing Service)
- Peak hour multiplier (via Peak Service)
- Returns complete delivery fee breakdown

#### 4. **Distance Service** (`src/pricing/distanceService.js`)
Calculates geographic distance:
- **Haversine Formula**: Accurate Earth-surface distance calculation
- Input: Two coordinates (lat/lon)
- Output: Distance in kilometers

#### 5. **Zone Pricing Service** (`src/pricing/zonePricing.js`)
Retrieves zone-specific pricing rules:
- Fetches base fee and per-km rate from database
- Each delivery zone has customizable pricing

#### 6. **Peak Service** (`src/pricing/peakService.js`)
Applies time-based multipliers:
- Reads peak hour rules from JSON configuration
- Returns multiplier based on order timestamp
- Default 1.0x (no surge) outside peak hours

### Middleware Stack

#### 7. **Error Handler** (`src/middleware/errorHandler.js`)
- Custom error classes with HTTP status codes
- Automatic Mongoose error translation
- Development vs production error responses
- 404 route handler

#### 8. **Request Validator** (`src/middleware/validator.js`)
- Joi schema validation for body/params/query
- Automatic data sanitization and type coercion
- Detailed validation error messages

#### 9. **Security Middleware** (`src/middleware/security.js`)
- Helmet configuration with CSP
- Rate limiter factory functions
- MongoDB query sanitization
- HPP prevention
- CORS configuration

#### 10. **Request Logger** (`src/middleware/requestLogger.js`)
- Morgan integration with Winston
- Custom response time tracking
- Health check log filtering

### Configuration Layer

#### 11. **Config Service** (`src/config/config.js`)
Environment configuration with validation:
- Joi-based environment variable validation
- Type coercion and defaults
- Centralized configuration object
- Environment detection helpers

#### 12. **Database Config** (`src/config/db.js`)
MongoDB connection management:
- Connection pooling configuration
- Retry logic with exponential backoff
- Connection event handlers
- Graceful disconnect

#### 13. **Swagger Config** (`src/config/swagger.js`)
API documentation setup:
- OpenAPI 3.0 specification
- Schema definitions
- Server configuration
- JSDoc integration

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **npm** or **yarn**

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd quickbite-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your MongoDB URI and other settings
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Environment
NODE_ENV=development                    # development | production | test

# Server
PORT=5000                              # API server port

# Database
MONGO_URI=mongodb://localhost:27017/quickbite   # MongoDB connection string
MONGO_URI_TEST=mongodb://localhost:27017/quickbite-test  # Test database

# Logging
LOG_LEVEL=info                         # error | warn | info | debug

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173  # Comma-separated

# API
API_URL=http://localhost:5000          # Base URL for Swagger docs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000           # 15 minutes in milliseconds
RATE_LIMIT_MAX=100                     # Max requests per window
```

## 🚀 Running the Application

```bash
# Development mode with hot reload (nodemon)
npm run dev

# Production mode
npm start

# Seed database with sample data
npm run seed
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📖 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **API Root**: http://localhost:5000

## 📁 Project Structure

```
quickbite-backend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── config.js             # Environment configuration with validation
│   │   ├── db.js                 # MongoDB connection & retry logic
│   │   ├── swagger.js            # OpenAPI/Swagger configuration
│   │   └── peakRules.json        # Peak hour multiplier rules
│   │
│   ├── controllers/               # Request handlers (thin layer)
│   │   └── orderController.js    # Order endpoint controllers
│   │
│   ├── middleware/                # Express middleware
│   │   ├── errorHandler.js       # Centralized error handling & custom errors
│   │   ├── validator.js          # Joi schema validation middleware
│   │   ├── security.js           # Security middleware (helmet, rate limit, etc)
│   │   └── requestLogger.js      # Morgan + Winston HTTP logging
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── Customer.js           # Customer schema with location & zone
│   │   ├── DeliveryZone.js       # Zone pricing configuration
│   │   ├── Item.js               # Menu item schema
│   │   ├── Order.js              # Order schema with indexes
│   │   ├── Promo.js              # Promotion schema
│   │   └── Restaurant.js         # Restaurant schema with location
│   │
│   ├── pricing/                   # Pricing engine services
│   │   ├── pricingEngine.js      # Main pricing orchestrator
│   │   ├── distanceService.js    # Haversine distance calculation
│   │   ├── zonePricing.js        # Zone-based pricing lookup
│   │   └── peakService.js        # Peak hour multiplier calculation
│   │
│   ├── routes/                    # API route definitions
│   │   ├── orderRoutes.js        # Order endpoints with OpenAPI docs
│   │   └── healthRoutes.js       # Health check endpoints
│   │
│   ├── services/                  # Business logic layer
│   │   ├── orderService.js       # Order creation & retrieval logic
│   │   └── promoService.js       # Promotional discount application
│   │
│   ├── utils/                     # Utility functions
│   │   └── logger.js             # Winston logger configuration
│   │
│   ├── seed/                      # Database seeding
│   │   └── seedData.js           # Sample data for testing
│   │
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server startup & graceful shutdown
│
├── tests/                         # Test files
│   ├── setup.js                  # Jest test setup
│   ├── pricing.test.js           # Pricing engine unit tests
│   └── order.integration.test.js # Order API integration tests
│
├── logs/                          # Log files (auto-generated)
│   ├── combined.log              # All logs
│   ├── error.log                 # Error logs only
│   ├── exceptions.log            # Uncaught exceptions
│   └── rejections.log            # Unhandled promise rejections
│
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── .eslintrc.cjs                  # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .dockerignore                  # Docker ignore rules
├── Dockerfile                     # Production Docker image
├── docker-compose.yml             # Docker Compose configuration
├── jest.config.js                 # Jest test configuration
├── package.json                   # Dependencies & scripts
└── README.md                      # This file
```

## API Endpoints

### Orders
- `POST /orders` - Create a new order
- `GET /orders/:id` - Get order by ID

### Health
- `GET /health` - Full health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error|fail",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message"
    }
  ]
}
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes (configurable)
- **Input Sanitization**: MongoDB injection prevention
- **HPP**: HTTP Parameter Pollution prevention
- **CORS**: Configurable cross-origin requests
- **Validation**: Joi schema validation on all inputs

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

## Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

## Deployment

The application includes:
- Graceful shutdown handling
- Database connection retry logic
- Health check endpoints for K8s
- Environment-based configuration
- Comprehensive error logging

## License

MIT
