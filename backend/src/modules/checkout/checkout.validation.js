const { z } = require('zod');

const applyPointsSchema = z.object({
  body: z.object({
    points: z.number().int().min(0, 'Points must be 0 or greater')
  })
});

const createOrderSchema = z.object({
  body: z.object({
    addressId: z.number().int().positive('Address ID is required'),
    pointsUsed: z.number().int().min(0).default(0)
  })
});

module.exports = {
  applyPointsSchema,
  createOrderSchema
};
