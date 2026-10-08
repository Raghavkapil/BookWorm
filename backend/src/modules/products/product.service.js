const prisma = require('../../config/db');

class ProductService {
  async listProducts({
    page = 1,
    limit = 20,
    search = '',
    categorySlug,
    categoryId,
    brandId,
    language,
    format,
    minPrice,
    maxPrice,
    section,
    sortBy = 'created_at',
    order = 'desc'
  }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) {
        where.categoryId = cat.id;
      }
    } else if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }

    if (brandId) {
      where.brandId = parseInt(brandId, 10);
    }

    if (language && language !== 'all' && language !== 'All') {
      where.language = { contains: language };
    }

    if (format && format !== 'all' && format !== 'All') {
      where.format = { contains: format };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.price = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'rating') {
      orderBy.rating = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'title') {
      orderBy.title = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = order === 'asc' ? 'asc' : 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getProductById(id) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      const error = new Error('Invalid product ID');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true
      }
    });

    if (!product) {
      const error = new Error('Product not found');
      error.code = 'PRODUCT_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return product;
  }

  async getRelatedProducts(id) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      const error = new Error('Invalid product ID');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const sourceProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!sourceProduct) {
      const error = new Error('Product not found');
      error.code = 'PRODUCT_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    const explicitRelations = await prisma.productRelation.findMany({
      where: { productId },
      include: {
        relatedProduct: {
          include: { category: true, brand: true }
        }
      }
    });

    let related = explicitRelations.map(r => r.relatedProduct);

    if (related.length < 4) {
      const existingIds = [productId, ...related.map(p => p.id)];
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          OR: [
            { categoryId: sourceProduct.categoryId },
            { brandId: sourceProduct.brandId }
          ],
          stockQuantity: { gt: 0 }
        },
        take: 4 - related.length,
        include: { category: true, brand: true }
      });

      related = [...related, ...fallbackProducts];
    }

    return related;
  }
}

module.exports = new ProductService();
