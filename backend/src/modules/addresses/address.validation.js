const { z } = require('zod');

const addressSchema = z.object({
  body: z.object({
    recipientName: z.string().min(1, 'Recipient name is required'),
    phoneNumber: z.string().min(10, 'Valid phone number required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(4, 'Postal code is required'),
    country: z.string().default('India'),
    isDefault: z.boolean().optional().default(false)
  })
});

const updateAddressSchema = z.object({
  body: z.object({
    recipientName: z.string().min(1).optional(),
    phoneNumber: z.string().min(10).optional(),
    street: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    postalCode: z.string().min(4).optional(),
    country: z.string().optional(),
    isDefault: z.boolean().optional()
  })
});

module.exports = {
  addressSchema,
  updateAddressSchema
};
