const { z } = require('zod');

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive('Valid orderId is required'),
    paymentMethod: z.enum(['CARD', 'UPI', 'NET_BANKING', 'WALLET', 'COD'], {
      errorMap: () => ({ message: 'Invalid payment method' })
    })
  })
});

const confirmPaymentSchema = z.object({
  body: z.object({
    paymentReference: z.string().min(1, 'Payment reference is required'),
    simulateFailure: z.boolean().optional().default(false)
  })
});

module.exports = {
  createPaymentSchema,
  confirmPaymentSchema
};
