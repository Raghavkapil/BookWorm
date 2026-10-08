const { z } = require('zod');

const addItemSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Product ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be greater than zero')
  })
});

const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be greater than zero')
  })
});

module.exports = {
  addItemSchema,
  updateItemSchema
};
