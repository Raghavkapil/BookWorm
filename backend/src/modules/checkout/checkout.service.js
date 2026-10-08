const prisma = require('../../config/db');

class CheckoutService {
  async validateCheckout(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      const error = new Error('Shopping cart is empty');
      error.code = 'CART_EMPTY';
      error.status = 400;
      throw error;
    }

    const issues = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        issues.push({
          productId: item.productId,
          title: item.product.title,
          requested: item.quantity,
          available: item.product.stockQuantity,
          issue: 'INSUFFICIENT_STOCK'
        });
      }
      subtotal += item.product.price * item.quantity;
    }

    if (issues.length > 0) {
      const error = new Error('Some items in your cart are no longer available in the requested quantity');
      error.code = 'INSUFFICIENT_STOCK';
      error.status = 400;
      error.errors = issues;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { giftPointsBalance: true }
    });

    return {
      isValid: true,
      items: cart.items,
      subtotal: Math.round(subtotal * 100) / 100,
      userGiftPointsBalance: user.giftPointsBalance
    };
  }

  async applyPoints(userId, requestedPoints) {
    const validation = await this.validateCheckout(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { giftPointsBalance: true }
    });

    if (requestedPoints > user.giftPointsBalance) {
      const error = new Error(`Requested points (${requestedPoints}) exceeds available balance (${user.giftPointsBalance})`);
      error.code = 'INVALID_GIFT_POINTS';
      error.status = 400;
      throw error;
    }

    // 1 point = 1 currency unit discount (capped at subtotal)
    const discount = Math.min(requestedPoints, Math.floor(validation.subtotal));
    const finalTotal = Math.max(0, validation.subtotal - discount);

    return {
      subtotal: validation.subtotal,
      pointsApplied: discount,
      discountAmount: discount,
      finalTotal: Math.round(finalTotal * 100) / 100,
      remainingPointsBalance: user.giftPointsBalance - discount
    };
  }

  async createPendingOrder(userId, { addressId, pointsUsed = 0 }) {
    const validation = await this.validateCheckout(userId);

    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!address || address.userId !== userId) {
      const error = new Error('Valid delivery address required');
      error.code = 'ADDRESS_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    let effectivePoints = 0;
    if (pointsUsed > 0) {
      if (pointsUsed > user.giftPointsBalance) {
        const error = new Error('Insufficient gift points balance');
        error.code = 'INVALID_GIFT_POINTS';
        error.status = 400;
        throw error;
      }
      effectivePoints = Math.min(pointsUsed, Math.floor(validation.subtotal));
    }

    const finalAmount = Math.max(0, validation.subtotal - effectivePoints);

    // Create Order with OrderItems snapshot in an atomic transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          orderTotal: validation.subtotal,
          discountAmount: effectivePoints,
          giftPointsUsed: effectivePoints,
          finalAmount: Math.round(finalAmount * 100) / 100,
          status: 'PENDING',
          items: {
            create: validation.items.map((item) => ({
              productId: item.productId,
              productTitle: item.product.title,
              unitPrice: item.product.price,
              quantity: item.quantity,
              subtotal: Math.round(item.product.price * item.quantity * 100) / 100,
              coverImage: item.product.coverImage
            }))
          }
        },
        include: {
          items: true,
          address: true
        }
      });

      return createdOrder;
    });

    return {
      orderId: order.id,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      status: order.status,
      orderTotal: order.orderTotal,
      discountAmount: order.discountAmount,
      giftPointsUsed: order.giftPointsUsed,
      finalAmount: order.finalAmount,
      items: order.items,
      address: order.address
    };
  }
}

module.exports = new CheckoutService();
