import Joi from 'joi';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Configuration schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required(),
  MONGO_URI_TEST: Joi.string().optional(),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  API_URL: Joi.string().default('http://localhost:5000'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
}).unknown();

// Validate environment variables
const { error, value: validatedEnv } = envSchema.validate(process.env);

if (error) {
  logger.error(`Config validation error: ${error.message}`);
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
const config = {
  env: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  mongo: {
    uri: validatedEnv.MONGO_URI,
    testUri: validatedEnv.MONGO_URI_TEST,
  },
  log: {
    level: validatedEnv.LOG_LEVEL,
  },
  cors: {
    allowedOrigins: validatedEnv.ALLOWED_ORIGINS.split(','),
  },
  api: {
    url: validatedEnv.API_URL,
  },
  rateLimit: {
    windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
    max: validatedEnv.RATE_LIMIT_MAX,
  },
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isProduction: validatedEnv.NODE_ENV === 'production',
  isTest: validatedEnv.NODE_ENV === 'test',
};

logger.info(`Configuration loaded for ${config.env} environment`);

export default config;
