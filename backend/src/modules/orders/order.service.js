const prisma = require('../../config/db');

// Delivery tracking is derived from the order age (no courier integration yet).
// `afterHours` = hours since the order was placed at which the stage is reached.
// `cancelFeePercent` = share of the order amount deducted if cancelled at that stage.
// Cancellation is free until the order has been packed; fees grow as it moves on.
const DELIVERY_STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', afterHours: 0, cancelFeePercent: 0 },
  { key: 'PACKED', label: 'Packed', afterHours: 4, cancelFeePercent: 0 },
  { key: 'SHIPPED', label: 'Shipped', afterHours: 24, cancelFeePercent: 10 },
  { key: 'AT_HUB', label: 'Reached Nearest Hub', afterHours: 48, cancelFeePercent: 20 },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', afterHours: 72, cancelFeePercent: 30 },
  { key: 'DELIVERED', label: 'Delivered', afterHours: 96, cancelFeePercent: null } // not cancellable
];

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING'];

class OrderService {
  getTracking(order, now = new Date()) {
    const hoursSincePlaced = (now - new Date(order.createdAt)) / (1000 * 60 * 60);

    // Unpaid orders have not entered the delivery pipeline; they can be cancelled for free.
    if (order.status === 'PENDING') {
      return {
        trackingStages: DELIVERY_STAGES.map(({ key, label }) => ({ key, label })),
        currentStageIndex: -1,
        isCancellable: true,
        cancellationFeePercent: 0,
        cancellationFee: 0,
        refundAmount: order.finalAmount
      };
    }

    let currentStageIndex = 0;
    DELIVERY_STAGES.forEach((stage, index) => {
      if (hoursSincePlaced >= stage.afterHours) currentStageIndex = index;
    });

    const stage = DELIVERY_STAGES[currentStageIndex];
    const isCancellable = ACTIVE_STATUSES.includes(order.status) && stage.cancelFeePercent !== null;
    const cancellationFeePercent = isCancellable ? stage.cancelFeePercent : 0;
    const cancellationFee = Math.round(order.finalAmount * cancellationFeePercent) / 100;

    return {
      trackingStages: DELIVERY_STAGES.map(({ key, label }) => ({ key, label })),
      currentStageIndex,
      isCancellable,
      cancellationFeePercent,
      cancellationFee,
      refundAmount: Math.round((order.finalAmount - cancellationFee) * 100) / 100
    };
  }

  decorateOrder(order) {
    return {
      ...order,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      ...this.getTracking(order)
    };
  }

  async listOrders(userId) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        address: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map((order) => this.decorateOrder(order));
  }

  async getOrderById(userId, orderId) {
    const id = parseInt(orderId, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                stockQuantity: true,
                price: true,
                category: true,
                brand: true
              }
            }
          }
        },
        address: true,
        payment: true
      }
    });

    if (!order || order.userId !== userId) {
      const error = new Error('Order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return this.decorateOrder(order);
  }

  async cancelOrder(userId, orderId) {
    const id = parseInt(orderId, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true
      }
    });

    if (!order || order.userId !== userId) {
      const error = new Error('Order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // Cancellation Rules Check
    if (!ACTIVE_STATUSES.includes(order.status)) {
      const error = new Error(`Order cannot be cancelled in status: ${order.status}`);
      error.code = 'FORBIDDEN';
      error.status = 400;
      throw error;
    }

    const tracking = this.getTracking(order);
    if (!tracking.isCancellable) {
      const error = new Error('Delivered orders cannot be cancelled');
      error.code = 'CANCELLATION_WINDOW_EXPIRED';
      error.status = 400;
      throw error;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update Order status
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // 2. Update Payment status to REFUNDED if payment was successful
      if (order.payment && order.payment.status === 'SUCCESSFUL') {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: 'REFUNDED' }
        });
      }

      // 3. Restore Stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity }
          }
        });
      }

      // 4. Refund Gift Points if used
      if (order.giftPointsUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            giftPointsBalance: { increment: order.giftPointsUsed }
          }
        });

        await tx.giftPointsTransaction.create({
          data: {
            userId,
            transactionType: 'CREDIT',
            points: order.giftPointsUsed,
            referenceId: `REFUND_ORDER_${order.id}`
          }
        });
      }

      return updated;
    });

    return {
      message:
        tracking.cancellationFee > 0
          ? `Order cancelled. A cancellation fee of ₹${tracking.cancellationFee} was deducted; ₹${tracking.refundAmount} will be refunded.`
          : 'Order cancelled successfully. Full amount will be refunded.',
      cancellationFee: tracking.cancellationFee,
      refundAmount: tracking.refundAmount,
      order: updatedOrder
    };
  }

  async buyAgain(userId, orderId) {
    const id = parseInt(orderId, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order || order.userId !== userId) {
      const error = new Error('Order not found');
      error.code = 'ORDER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    let userCart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId }
      });
    }

    const addedItems = [];
    const unavailableItems = [];

    for (const item of order.items) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!currentProduct || currentProduct.stockQuantity < 1) {
        unavailableItems.push({
          productId: item.productId,
          title: item.productTitle,
          reason: !currentProduct ? 'Discontinued' : 'Out of stock'
        });
        continue;
      }

      // Check current cart
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: userCart.id,
            productId: item.productId
          }
        }
      });

      const addQty = Math.min(item.quantity, currentProduct.stockQuantity);

      if (existingCartItem) {
        const targetQty = Math.min(existingCartItem.quantity + addQty, currentProduct.stockQuantity);
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: targetQty,
            unitPrice: currentProduct.price // Use CURRENT price
          }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: addQty,
            unitPrice: currentProduct.price // Use CURRENT price
          }
        });
      }

      addedItems.push({
        productId: currentProduct.id,
        title: currentProduct.title,
        quantity: addQty,
        currentPrice: currentProduct.price
      });
    }

    return {
      success: true,
      addedItems,
      unavailableItems,
      message: `${addedItems.length} item(s) added to cart using current prices.`
    };
  }
}

module.exports = new OrderService();
