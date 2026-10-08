const prisma = require('../../config/db');

class RecommendationService {
  async getPersonalizedRecommendations(userId) {
    let categoryIds = [];
    let brandIds = [];
    let cartProductIds = [];

    if (userId) {
      // 1. Get user cart products to exclude
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });
      if (cart) {
        cartProductIds = cart.items.map((i) => i.productId);
      }

      // 2. Identify categories and brands purchased by user
      const pastOrders = await prisma.order.findMany({
        where: { userId, status: { not: 'CANCELLED' } },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      pastOrders.forEach((o) => {
        o.items.forEach((item) => {
          if (item.product) {
            categoryIds.push(item.product.categoryId);
            brandIds.push(item.product.brandId);
          }
        });
      });
    }

    categoryIds = [...new Set(categoryIds)];
    brandIds = [...new Set(brandIds)];

    let recommendations = [];

    // If user has history, prioritize matching categories & brands
    if (categoryIds.length > 0 || brandIds.length > 0) {
      recommendations = await prisma.product.findMany({
        where: {
          id: { notIn: cartProductIds },
          stockQuantity: { gt: 0 },
          OR: [
            { categoryId: { in: categoryIds } },
            { brandId: { in: brandIds } }
          ]
        },
        orderBy: [
          { rating: 'desc' },
          { stockQuantity: 'desc' }
        ],
        take: 8,
        include: { category: true, brand: true }
      });
    }

    // Fallback/Supplement with top rated and popular products
    if (recommendations.length < 8) {
      const existingIds = [...cartProductIds, ...recommendations.map((r) => r.id)];
      const fallback = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          stockQuantity: { gt: 0 }
        },
        orderBy: [
          { rating: 'desc' },
          { price: 'asc' }
        ],
        take: 8 - recommendations.length,
        include: { category: true, brand: true }
      });

      recommendations = [...recommendations, ...fallback];
    }

    return recommendations;
  }
}

module.exports = new RecommendationService();
