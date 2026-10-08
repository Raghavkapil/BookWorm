const prisma = require('../../config/db');

class PaymentService {
  async createPayment(userId, { orderId, paymentMethod }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true
      }
    });

    if (!order || order.userId !== userId) {
      const error = new Error('Order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (order.status !== 'PENDING') {
      const error = new Error(`Order cannot be paid for in ${order.status} state`);
      error.code = 'INVALID_ORDER_STATE';
      error.status = 400;
      throw error;
    }

    // Check if payment already exists
    if (order.payment) {
      if (order.payment.status === 'SUCCESSFUL') {
        return {
          paymentId: order.payment.id,
          paymentReference: order.payment.paymentReference,
          amount: order.payment.amount,
          paymentMethod: order.payment.paymentMethod,
          status: order.payment.status
        };
      }
      // Update existing pending payment
      const updated = await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          paymentMethod,
          status: 'PENDING'
        }
      });
      return {
        paymentId: updated.id,
        paymentReference: updated.paymentReference,
        amount: updated.amount,
        paymentMethod: updated.paymentMethod,
        status: updated.status
      };
    }

    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        paymentReference,
        amount: order.finalAmount,
        status: 'PENDING'
      }
    });

    return {
      paymentId: payment.id,
      paymentReference: payment.paymentReference,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status
    };
  }

  async confirmPayment(userId, { paymentReference, simulateFailure = false }) {
    const payment = await prisma.payment.findUnique({
      where: { paymentReference },
      include: {
        order: {
          include: {
            items: true,
            user: true
          }
        }
      }
    });

    if (!payment || payment.order.userId !== userId) {
      const error = new Error('Payment transaction not found');
      error.code = 'PAYMENT_FAILED';
      error.status = 404;
      throw error;
    }

    if (simulateFailure) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      const error = new Error('Payment processing failed by bank / gateway');
      error.code = 'PAYMENT_FAILED';
      error.status = 400;
      throw error;
    }

    // Process payment success atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark Payment as Successful
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESSFUL' }
      });

      // 2. Mark Order as Confirmed
      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      });

      // 3. Deduct Gift Points if used
      if (payment.order.giftPointsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            giftPointsBalance: { decrement: payment.order.giftPointsUsed }
          }
        });

        await tx.giftPointsTransaction.create({
          data: {
            userId,
            transactionType: 'DEBIT',
            points: payment.order.giftPointsUsed,
            referenceId: `ORDER_${payment.orderId}`
          }
        });
      }

      // 4. Award 5% Gift Points on paid amount (1 point per ₹20 spent)
      const pointsEarned = Math.floor(payment.amount * 0.05);
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            giftPointsBalance: { increment: pointsEarned }
          }
        });

        await tx.giftPointsTransaction.create({
          data: {
            userId,
            transactionType: 'CREDIT',
            points: pointsEarned,
            referenceId: `REWARD_ORDER_${payment.orderId}`
          }
        });
      }

      // 5. Decrement Stock quantities
      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity }
          }
        });
      }

      // 6. Clear user cart
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
      }

      return {
        payment: updatedPayment,
        order: updatedOrder,
        pointsEarned
      };
    });

    return {
      success: true,
      orderId: result.order.id,
      orderNumber: `ORD-${result.order.id.toString().padStart(6, '0')}`,
      status: result.order.status,
      paymentReference: result.payment.paymentReference,
      amount: result.payment.amount,
      pointsEarned: result.pointsEarned
    };
  }
}

module.exports = new PaymentService();
