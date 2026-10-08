const prisma = require('../../config/db');

class CartService {
  async getOrCreateCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          }
        }
      });
    }

    // Calculate totals
    const items = cart.items || [];
    let subtotal = 0;
    let itemCount = 0;

    items.forEach((item) => {
      const price = item.product.price;
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      updatedAt: cart.updatedAt
    };
  }

  async addItem(userId, { productId, quantity }) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      const error = new Error('Product not found');
      error.code = 'PRODUCT_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (product.stockQuantity < quantity) {
      const error = new Error(`Insufficient stock. Only ${product.stockQuantity} available.`);
      error.code = 'INSUFFICIENT_STOCK';
      error.status = 400;
      throw error;
    }

    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        const error = new Error(`Cannot add more. Total in cart exceeds available stock (${product.stockQuantity}).`);
        error.code = 'INSUFFICIENT_STOCK';
        error.status = 400;
        throw error;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: product.price
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price
        }
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateItemQuantity(userId, itemId, quantity) {
    const id = parseInt(itemId, 10);
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: true
      }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      const error = new Error('Cart item not found');
      error.code = 'CART_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (cartItem.product.stockQuantity < quantity) {
      const error = new Error(`Only ${cartItem.product.stockQuantity} items in stock.`);
      error.code = 'INSUFFICIENT_STOCK';
      error.status = 400;
      throw error;
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId, itemId) {
    const id = parseInt(itemId, 10);
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      const error = new Error('Cart item not found');
      error.code = 'CART_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return this.getOrCreateCart(userId);
  }
}

module.exports = new CartService();
