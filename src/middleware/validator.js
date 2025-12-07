import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Validation schemas
export const orderSchemas = {
  createOrder: Joi.object({
    customerId: Joi.string().pattern(objectIdPattern).required()
      .messages({
        'string.pattern.base': 'Invalid customer ID format',
        'any.required': 'Customer ID is required'
      }),
    restaurantId: Joi.string().pattern(objectIdPattern).required()
      .messages({
        'string.pattern.base': 'Invalid restaurant ID format',
        'any.required': 'Restaurant ID is required'
      }),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().pattern(objectIdPattern).required(),
        qty: Joi.number().integer().min(1).max(100).required()
      })
    ).min(1).required()
      .messages({
        'array.min': 'At least one item is required'
      }),
    placedAt: Joi.date().iso().required()
      .messages({
        'date.base': 'Invalid date format',
        'any.required': 'Order placement date is required'
      })
  }),

  getOrder: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required()
      .messages({
        'string.pattern.base': 'Invalid order ID format'
      })
  })
};

// Validation middleware factory
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'params' ? req.params : 
                            source === 'query' ? req.query : 
                            req.body;

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        
        return next(new ValidationError('Validation failed', errors));
      }

      // Replace request data with validated data
      if (source === 'params') {
        req.params = value;
      } else if (source === 'query') {
        req.query = value;
      } else {
        req.body = value;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
