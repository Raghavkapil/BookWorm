const prisma = require('../../config/db');

class BrandService {
  async listBrands() {
    return prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getBrandProducts(slug, query = {}) {
    const brand = await prisma.brand.findUnique({
      where: { slug }
    });

    if (!brand) {
      const error = new Error('Brand not found');
      error.code = 'BRAND_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { brandId: brand.id },
        skip,
        take: limit,
        include: {
          category: true,
          brand: true
        }
      }),
      prisma.product.count({ where: { brandId: brand.id } })
    ]);

    return {
      brand,
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

module.exports = new BrandService();
