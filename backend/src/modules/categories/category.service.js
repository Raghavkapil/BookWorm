const prisma = require('../../config/db');

class CategoryService {
  async listCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getCategoryProducts(slug, query = {}) {
    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      const error = new Error('Category not found');
      error.code = 'CATEGORY_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id },
        skip,
        take: limit,
        include: {
          category: true,
          brand: true
        }
      }),
      prisma.product.count({ where: { categoryId: category.id } })
    ]);

    return {
      category,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new CategoryService();
