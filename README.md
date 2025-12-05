# QuickBite Backend API

A production-grade food delivery platform backend with intelligent dynamic pricing engine built with Node.js, Express, and MongoDB.

## 🎯 Overview

QuickBite is a comprehensive food delivery API that calculates delivery fees dynamically based on multiple factors including distance, delivery zones, peak hours, and applies promotional discounts. The system is designed with enterprise-level patterns including proper error handling, validation, logging, security, and observability.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATION                            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   API Gateway/CORS   │
                    │   Rate Limiter       │
                    └───────────┬──────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         EXPRESS MIDDLEWARE STACK                         │
├──────────────────────────────────────────────────────────────────────────┤
│  [Helmet] → [CORS] → [Rate Limit] → [Sanitize] → [Logger] → [Validator]│
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │    ROUTE HANDLERS    │
                    │   /orders /health    │
                    └───────────┬──────────┘
                                │
                    ┌───────────▼──────────┐
                    │    CONTROLLERS       │
                    │  (Thin Layer)        │
                    └───────────┬──────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐   ┌─────────▼─────────┐   ┌────────▼────────┐
│ ORDER SERVICE  │   │  PROMO SERVICE    │   │ OTHER SERVICES  │
│                │   │                   │   │                 │
│ • Validation   │   │ • First Order     │   │                 │
│ • Orchestrate  │   │ • Restaurant      │   │                 │
│ • Save Order   │   │ • Zone Discounts  │   │                 │
└────────┬───────┘   └─────────┬─────────┘   └─────────────────┘
         │                     │
         │         ┌───────────▼──────────┐
         │         │   PRICING ENGINE     │
         │         │   (Orchestrator)     │
         │         └───────────┬──────────┘
         │                     │
         │         ┌───────────┴───────────┬──────────────────┐
         │         │                       │                  │
         │  ┌──────▼────────┐   ┌─────────▼────────┐  ┌─────▼──────┐
         │  │   DISTANCE    │   │  ZONE PRICING    │  │    PEAK    │
         │  │   SERVICE     │   │    SERVICE       │  │  SERVICE   │
         │  │               │   │                  │  │            │
         │  │  Haversine    │   │  DB Lookup       │  │ Time-based │
         │  │  Formula      │   │  baseFee +       │  │ Multiplier │
         │  │               │   │  perKmRate       │  │            │
         │  └───────────────┘   └──────────────────┘  └────────────┘
         │
         │
┌────────▼─────────────────────────────────────────────────────────────────┐
│                          MONGODB DATABASE                                │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌──────┐  ┌──────────────┐  ┌────────┐    │
│  │Customer │  │Restaurant│  │ Item │  │DeliveryZone  │  │ Promo  │    │
│  └─────────┘  └──────────┘  └──────┘  └──────────────┘  └────────┘    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │                    Order Collection                        │          │
│  │  • Indexes: customerId, restaurantId, placedAt, status   │          │
│  │  • Complete pricing breakdown stored                      │          │
│  └───────────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Order Creation Flow Diagram

```
┌──────────────┐
│ POST /orders │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────┐
│         SECURITY MIDDLEWARE                    │
│  • Rate Limit Check (10 req/15min)            │
│  • Input Sanitization (NoSQL injection)       │
│  • HPP Protection                              │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│         REQUEST VALIDATION                     │
│  • Joi Schema Validation                       │
│    - customerId (ObjectId)                     │
│    - restaurantId (ObjectId)                   │
│    - items[] (productId, qty)                  │
│    - placedAt (ISO Date, not future)           │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│      ORDER SERVICE - Data Fetching             │
│                                                │
│  ┌─────────────────────────────────────┐      │
│  │ Parallel DB Queries:                │      │
│  │  • Customer.findById(customerId)    │      │
│  │  • Restaurant.findById(restaurantId)│      │
│  └─────────────────────────────────────┘      │
│                                                │
│  ┌─────────────────────────────────────┐      │
│  │ Item.find({ _id: { $in: itemIds }}) │      │
│  │ • Validate all items exist          │      │
│  │ • Enrich with current prices        │      │
│  └─────────────────────────────────────┘      │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│       BASE PRICE CALCULATION                   │
│                                                │
│  items.reduce((sum, item) => {                │
│    sum + (item.qty × item.unitPrice)          │
│  })                                            │
│                                                │
│  Example: 2 × $12.50 = $25.00                 │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│         PRICING ENGINE                         │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ 1. Distance Service                  │     │
│  │    Haversine(customer, restaurant)   │     │
│  │    → 5.2 km                          │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ 2. Zone Pricing Service              │     │
│  │    DeliveryZone.findOne({zone})      │     │
│  │    → baseFee: $2.00                  │     │
│  │    → perKmRate: $0.50                │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ 3. Base Delivery Calculation         │     │
│  │    $2.00 + (5.2 × $0.50) = $4.60     │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ 4. Peak Service                      │     │
│  │    Check peakRules.json              │     │
│  │    18:00 (dinner rush)               │     │
│  │    → multiplier: 1.2                 │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ 5. Final Delivery Fee                │     │
│  │    $4.60 × 1.2 = $5.52               │     │
│  └──────────────────────────────────────┘     │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│         PROMO SERVICE                          │
│                                                │
│  Promo.find({ active: true })                 │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ Check FIRST_ORDER                    │     │
│  │  if (!customer.firstOrderCompleted)  │     │
│  │    discount += $25.00 × 10%          │     │
│  │    → $2.50                           │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ Check RESTAURANT                     │     │
│  │  if (promo.restaurantId matches)     │     │
│  │    discount += basePrice × 5%        │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │ Check ZONE                           │     │
│  │  if (promo.zone matches)             │     │
│  │    discount += flat amount           │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  Total Discount: $2.50                        │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│       FINAL TOTAL CALCULATION                  │
│                                                │
│  basePrice:      $25.00                        │
│  + deliveryFee:  $ 5.52                        │
│  - discount:     $ 2.50                        │
│  ─────────────────────                         │
│  FINAL TOTAL:    $28.02                        │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│         SAVE TO DATABASE                       │
│                                                │
│  Order.create({                                │
│    customerId, restaurantId, items,           │
│    basePrice, deliveryFee, promoDiscount,     │
│    finalTotal, breakdown, status, placedAt    │
│  })                                            │
└────────┬───────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│         RESPONSE (201 Created)                 │
│                                                │
│  {                                             │
│    "_id": "507f...",                           │
│    "finalTotal": 28.02,                        │
│    "breakdown": {                              │
│      "distance": 5.2,                          │
│      "zoneBaseFee": 2.00,                      │
│      "perKmRate": 0.50,                        │
│      "peakMultiplier": 1.2,                    │
│      "deliveryFee": 5.52,                      │
│      "appliedPromos": ["FIRST_ORDER_10"]       │
│    }                                           │
│  }                                             │
└────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INCOMING REQUEST                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   HELMET.JS            │
                    │   Security Headers     │
                    │                        │
                    │  • CSP                 │
                    │  • HSTS                │
                    │  • X-Frame-Options     │
                    │  • X-XSS-Protection    │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   CORS                 │
                    │   Origin Validation    │
                    │                        │
                    │  ✓ localhost:3000      │
                    │  ✓ localhost:5173      │
                    │  ✗ other origins       │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   RATE LIMITER         │
                    │   IP-based Tracking    │
                    │                        │
                    │  General: 100/15min    │
                    │  Orders: 10/15min      │
                    │                        │
                    │  [Too many requests]   │
                    │  → 429 Response        │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   MONGO SANITIZE       │
                    │   NoSQL Injection      │
                    │   Prevention           │
                    │                        │
                    │  "$where" → "_where"   │
                    │  "$ne" → "_ne"         │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   HPP                  │
                    │   Parameter Pollution  │
                    │   Prevention           │
                    │                        │
                    │  ?id=1&id=2 → id=1     │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   JOI VALIDATOR        │
                    │   Schema Validation    │
                    │                        │
                    │  • Type checking       │
                    │  • Format validation   │
                    │  • Business rules      │
                    │                        │
                    │  [Invalid] → 400       │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼───────────┐
                    │   BUSINESS LOGIC       │
                    │   ✓ Secure Processing  │
                    └────────────────────────┘
```

## 📦 Service Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORDER CONTROLLER                            │
│                     (Entry Point)                               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ delegates to
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORDER SERVICE                               │
│                 (Orchestration Layer)                           │
└─────┬────────────────┬──────────────────┬───────────────────────┘
      │                │                  │
      │ uses           │ uses             │ uses
      │                │                  │
      ▼                ▼                  ▼
┌──────────┐    ┌──────────────┐   ┌─────────────┐
│ Customer │    │ Restaurant   │   │    Item     │
│  Model   │    │    Model     │   │   Model     │
└──────────┘    └──────────────┘   └─────────────┘
      │                │                  │
      │                │                  │
      └────────────────┴──────────────────┘
                       │
                       │ passes to
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRICING ENGINE                                │
│               (Pricing Orchestrator)                            │
└────┬──────────────────────┬───────────────────────┬────────────┘
     │                      │                       │
     │ uses                 │ uses                  │ uses
     │                      │                       │
     ▼                      ▼                       ▼
┌────────────┐      ┌──────────────┐       ┌──────────────┐
│ Distance   │      │ Zone Pricing │       │  Peak        │
│ Service    │      │ Service      │       │  Service     │
│            │      │              │       │              │
│ Haversine  │      │ DB Lookup    │       │ JSON Config  │
│ Calculation│      │ DeliveryZone │       │ peakRules.js │
└────────────┘      └──────┬───────┘       └──────────────┘
                           │
                           │ queries
                           │
                           ▼
                    ┌──────────────┐
                    │ DeliveryZone │
                    │    Model     │
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PROMO SERVICE                                 │
│               (Discount Calculator)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ queries
                             │
                             ▼
                      ┌──────────────┐
                      │    Promo     │
                      │    Model     │
                      └──────────────┘

            ALL RESULTS FLOW BACK TO ORDER SERVICE
                             │
                             │ creates
                             │
                             ▼
                      ┌──────────────┐
                      │    Order     │
                      │    Model     │
                      └──────────────┘
```

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

## 🔌 API Endpoints

### Orders

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "customerId": "507f1f77bcf86cd799439011",
  "restaurantId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "qty": 2
    }
  ],
  "placedAt": "2025-12-04T10:30:00Z"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "customerId": "507f1f77bcf86cd799439011",
  "restaurantId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "qty": 2,
      "unitPrice": 12.50
    }
  ],
  "basePrice": 25.00,
  "deliveryFee": 5.40,
  "promoDiscount": 2.50,
  "finalTotal": 27.90,
  "breakdown": {
    "distance": 5.2,
    "zoneBaseFee": 2.00,
    "perKmRate": 0.50,
    "peakMultiplier": 1.2,
    "deliveryFee": 5.40,
    "appliedPromos": ["FIRST_ORDER_10"]
  },
  "status": "pending",
  "placedAt": "2025-12-04T10:30:00Z",
  "createdAt": "2025-12-04T10:31:22Z"
}
```

#### Get Order
```http
GET /orders/:id
```

**Response:** Same as create order response

### Health Checks

#### Full Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": {
    "status": "connected"
  }
}
```

#### Readiness Probe (Kubernetes)
```http
GET /health/ready
```

#### Liveness Probe (Kubernetes)
```http
GET /health/live
```

## 🎯 How It Works: Order Flow

### 1. **Request Validation**
- Joi middleware validates request body
- Checks ObjectId formats, required fields, data types
- Validates business rules (qty limits, date constraints)

### 2. **Order Service Orchestration**
```javascript
// Parallel database lookups
const [customer, restaurant] = await Promise.all([
  Customer.findById(customerId),
  Restaurant.findById(restaurantId)
]);

// Fetch menu items with pricing
const items = await Item.find({ _id: { $in: itemIds } });
```

### 3. **Pricing Calculation**

**Distance Service** calculates kilometers:
```javascript
// Haversine formula
distance = 5.2 km  // Between customer and restaurant
```

**Zone Pricing Service** fetches zone rules:
```javascript
{
  baseFee: 2.00,      // Fixed fee for this zone
  perKmRate: 0.50     // Cost per kilometer
}
```

**Peak Service** checks time-based multiplier:
```javascript
// From peakRules.json
if (hour >= 17 && hour < 20) {
  multiplier = 1.2;  // 20% surge during dinner rush
}
```

**Pricing Engine** combines all factors:
```javascript
baseDeliveryFee = baseFee + (distance * perKmRate)
                = 2.00 + (5.2 * 0.50) = 4.60

finalDeliveryFee = baseDeliveryFee * peakMultiplier
                 = 4.60 * 1.2 = 5.52
```

### 4. **Promotion Application**

**Promo Service** checks eligible discounts:
```javascript
// First order: 10% off base price
if (customer.firstOrderCompleted === false) {
  discount += basePrice * 0.10;
}

// Restaurant promo: 5% off
if (promo.restaurantId === restaurantId) {
  discount += basePrice * 0.05;
}

// Zone promo: $2 flat discount
if (promo.zone === customer.zone) {
  discount += 2.00;
}
```

### 5. **Final Calculation**
```javascript
finalTotal = basePrice + deliveryFee - promoDiscount
           = 25.00 + 5.52 - 2.50
           = 28.02
```

### 6. **Database Storage**
- Order saved with complete breakdown
- Indexed for fast retrieval
- Timestamps automatically added

### 7. **Response**
- Returns complete order object
- Includes pricing breakdown
- Applied promotions listed

## 💾 Database Models

### Customer
```javascript
{
  name: String,
  email: String,
  location: { lat: Number, lon: Number },
  zone: String,                    // e.g., "zone_1"
  firstOrderCompleted: Boolean
}
```

### Restaurant
```javascript
{
  name: String,
  location: { lat: Number, lon: Number },
  cuisine: String
}
```

### Item
```javascript
{
  name: String,
  price: Number,
  restaurantId: ObjectId
}
```

### DeliveryZone
```javascript
{
  zone: String,                    // Unique zone identifier
  baseFee: Number,                // Base delivery fee
  perKmRate: Number               // Rate per kilometer
}
```

### Promo
```javascript
{
  name: String,
  type: String,                   // "FIRST_ORDER" | "RESTAURANT" | "ZONE"
  discount: Number,               // Percentage (0.10 = 10%)
  flat: Number,                   // Flat discount amount
  restaurantId: ObjectId,         // For RESTAURANT type
  zone: String,                   // For ZONE type
  active: Boolean
}
```

### Order
```javascript
{
  customerId: ObjectId,
  restaurantId: ObjectId,
  items: [{
    productId: ObjectId,
    qty: Number,
    unitPrice: Number
  }],
  basePrice: Number,
  deliveryFee: Number,
  promoDiscount: Number,
  finalTotal: Number,
  breakdown: Object,              // Complete pricing details
  status: String,                 // "pending" | "confirmed" | etc.
  placedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### HTTP Security Headers (Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Order Creation**: 10 requests per 15 minutes (stricter)
- IP-based tracking
- Standard headers (RateLimit-*)

### Input Sanitization
- MongoDB operator injection prevention (`$where`, `$ne`, etc.)
- Replaces malicious characters with underscores
- Logs sanitization events

### CORS Configuration
```javascript
{
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}
```

## 🚨 Error Handling

### Error Response Format

All errors follow a consistent structure:

```json
{
  "status": "error",              // "error" (5xx) or "fail" (4xx)
  "message": "Error description",
  "errors": [                     // Optional validation errors
    {
      "field": "customerId",
      "message": "Invalid customer ID format"
    }
  ]
}
```

### Custom Error Classes

#### AppError (Base Class)
```javascript
throw new AppError('Something went wrong', 500);
```

#### ValidationError
```javascript
throw new ValidationError('Validation failed', [
  { field: 'qty', message: 'Quantity must be at least 1' }
]);
// Returns 400 status
```

#### NotFoundError
```javascript
throw new NotFoundError('Customer');
// Returns 404 with "Customer not found"
```

#### UnauthorizedError
```javascript
throw new UnauthorizedError('Invalid token');
// Returns 401
```

#### ForbiddenError
```javascript
throw new ForbiddenError('Access denied');
// Returns 403
```

### Automatic Error Translation

**Mongoose Validation Error:**
```javascript
// Automatically converted to 400 with field-level details
ValidationError: Order validation failed
→ { status: "fail", message: "Validation Error", errors: [...] }
```

**Mongoose CastError:**
```javascript
// Invalid ObjectId
CastError: Cast to ObjectId failed
→ { status: "fail", message: "Invalid id: abc123" }
```

**MongoDB Duplicate Key:**
```javascript
// Unique constraint violation
MongoError: E11000 duplicate key error
→ { status: "fail", message: "Duplicate value for email" }
```

## 📊 Logging

### Log Levels

- **Error**: System errors, exceptions, failures
- **Warn**: Warning conditions, deprecated usage
- **Info**: General informational messages
- **Debug**: Detailed debugging information

### Log Transports

#### Console
- Colorized output for development
- All log levels

#### Files
- `logs/combined.log` - All logs (5MB rotation, 5 files)
- `logs/error.log` - Error level only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

### Log Format

```
2025-12-04 15:30:22 [info]: Server running in development mode on port 5000
2025-12-04 15:30:25 [error]: MongoDB connection failed: Connection timeout
```

### HTTP Request Logging

```
POST /orders 201 45.23 ms - 1234
GET /orders/507f1f77bcf86cd799439011 200 12.45 ms - 567
```

## 🐳 Docker Deployment

### Build Production Image

```bash
# Build the image
docker build -t quickbite-api .

# Run the container
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/quickbite \
  -e NODE_ENV=production \
  quickbite-api
```

### Docker Compose

```bash
# Start all services (API + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Docker Features

- **Multi-stage build**: Optimized image size
- **Non-root user**: Security best practice
- **Health checks**: Container health monitoring
- **dumb-init**: Proper signal handling
- **Alpine base**: Minimal image size (~150MB)

## 🧪 Testing

### Test Structure

```
tests/
├── setup.js                    # Global test setup
├── pricing.test.js            # Unit tests for pricing engine
└── order.integration.test.js  # Integration tests for order API
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Thresholds

```javascript
{
  branches: 70%,
  functions: 70%,
  lines: 70%,
  statements: 70%
}
```

### Test Database

- Uses separate test database: `quickbite-test`
- Automatic cleanup after each test
- Isolated test environment

## 🔧 Code Quality

### ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier

```bash
# Format all files
npm run format
```

### Pre-commit Hooks (Optional)

```bash
# Install husky
npm run prepare

# Lint-staged will run on git commit
# - ESLint fix
# - Prettier format
```

### Configuration

- **ESLint**: `.eslintrc.cjs` - Code quality rules
- **Prettier**: `.prettierrc` - Code formatting rules
- **EditorConfig**: Consistent coding styles

## 🚀 Deployment Checklist

### Environment Setup
- [ ] Set `NODE_ENV=production`
- [ ] Configure production `MONGO_URI`
- [ ] Set strong database credentials
- [ ] Configure `ALLOWED_ORIGINS` for your domain
- [ ] Set appropriate `LOG_LEVEL` (warn or error)
- [ ] Update `API_URL` to production domain

### Security
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limits appropriately
- [ ] Set up MongoDB authentication
- [ ] Use environment variable secrets (never commit `.env`)
- [ ] Enable MongoDB replica set for production

### Monitoring
- [ ] Set up log aggregation (ELK, Splunk, CloudWatch)
- [ ] Configure application monitoring (New Relic, DataDog)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure alerts for errors and downtime

### Performance
- [ ] Enable MongoDB indexes (automatically created)
- [ ] Configure connection pooling (already optimized)
- [ ] Enable compression middleware
- [ ] Use CDN for static assets (if any)

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickbite-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: quickbite-api:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🛠️ Tech Stack

### Core
- **Node.js** 18+ - JavaScript runtime
- **Express** 4.19 - Web framework
- **MongoDB** 5+ - NoSQL database
- **Mongoose** 8.1 - ODM for MongoDB

### Security
- **Helmet** 7.1 - Security headers
- **express-rate-limit** 7.1 - Rate limiting
- **express-mongo-sanitize** 2.2 - Input sanitization
- **hpp** 0.2 - HTTP Parameter Pollution prevention
- **cors** 2.8 - Cross-origin resource sharing

### Validation & Documentation
- **Joi** 17.11 - Schema validation
- **swagger-jsdoc** 6.2 - OpenAPI generation
- **swagger-ui-express** 5.0 - API documentation UI

### Logging
- **Winston** 3.11 - Logging library
- **Morgan** 1.10 - HTTP request logger

### Development
- **nodemon** 3.0 - Auto-restart on changes
- **Jest** 29.7 - Testing framework
- **supertest** 6.3 - HTTP testing
- **ESLint** 8.56 - Linting
- **Prettier** 3.1 - Code formatting

## 📈 Performance Optimizations

### Database
- ✅ Connection pooling (5-10 connections)
- ✅ Compound indexes on frequently queried fields
- ✅ Lean queries where appropriate
- ✅ Projection to limit returned fields

### API
- ✅ Async/await for non-blocking operations
- ✅ Parallel database queries with Promise.all
- ✅ Request validation before processing
- ✅ Proper HTTP status codes and caching headers

### Application
- ✅ Graceful shutdown handling
- ✅ Connection retry logic
- ✅ Error handling without blocking
- ✅ Lightweight Alpine Docker image

## 🤝 Contributing

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/quickbite-backend.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm test

# Lint and format
npm run lint:fix
npm run format

# Commit changes
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

## 📝 License

MIT

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@quickbite.com

---

**Built with ❤️ for production-grade food delivery systems**
