const prisma = require('../../config/db');

class OrderService {
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

    const now = new Date();

    return orders.map((order) => {
      const orderDate = new Date(order.createdAt);
      const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

      const isCancellable =
        ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) &&
        hoursDiff <= 48;

      return {
        ...order,
        orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
        isCancellable,
        hoursRemainingForCancellation: Math.max(0, Math.floor(48 - hoursDiff))
      };
    });
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

    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

    const isCancellable =
      ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) &&
      hoursDiff <= 48;

    return {
      ...order,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      isCancellable,
      hoursRemainingForCancellation: Math.max(0, Math.floor(48 - hoursDiff))
    };
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
    const eligibleStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!eligibleStatuses.includes(order.status)) {
      const error = new Error(`Order cannot be cancelled in status: ${order.status}`);
      error.code = 'FORBIDDEN';
      error.status = 400;
      throw error;
    }

    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

    if (hoursDiff > 48) {
      const error = new Error('Order cancellation window (48 hours) has expired');
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
      message: 'Order cancelled successfully',
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
