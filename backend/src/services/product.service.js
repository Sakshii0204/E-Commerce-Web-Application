import { productRepository } from '../repositories/product.repository.js';
import { parseProductQuery } from '../utils/productQuery.js';
import { AppError } from '../utils/AppError.js';

class ProductService {
  async getProducts(queryParams, { includeInactive = false } = {}) {
    const { filter, sort, page, limit, skip } = parseProductQuery(queryParams, { includeInactive });

    const [products, totalProducts] = await Promise.all([
      productRepository.findAll({ filter, sort, skip, limit }),
      productRepository.count(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    return {
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getProductById(id, { includeInactive = false } = {}) {
    const product = await productRepository.findById(id, { includeInactive });
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async getFilterMetadata() {
    return productRepository.getFilterMetadata();
  }

  async createProduct(productData) {
    return productRepository.create(productData);
  }

  async updateProduct(id, updateData) {
    // Prevent updating sensitive internal fields
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const product = await productRepository.updateById(id, updateData);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.softDeleteById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }
}

export const productService = new ProductService();
