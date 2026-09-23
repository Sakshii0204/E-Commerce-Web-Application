import { Product } from '../models/Product.js';

class ProductRepository {
  async findAll({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 12 } = {}) {
    return Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ toJSON: true });
  }

  async count(filter = {}) {
    return Product.countDocuments(filter);
  }

  async findById(id, { includeInactive = false } = {}) {
    const query = { _id: id };
    if (!includeInactive) {
      query.isActive = true;
    }
    return Product.findOne(query);
  }

  async create(productData) {
    const product = new Product(productData);
    return product.save();
  }

  async updateById(id, updateData) {
    return Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDeleteById(id) {
    return Product.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async getFilterMetadata() {
    const match = { isActive: true };

    const [categories, brands, priceRange] = await Promise.all([
      Product.distinct('category', match),
      Product.distinct('brand', match),
      Product.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' },
          },
        },
      ]),
    ]);

    const minPrice = priceRange.length > 0 && priceRange[0].min !== null ? priceRange[0].min : 0;
    const maxPrice = priceRange.length > 0 && priceRange[0].max !== null ? priceRange[0].max : 0;

    return {
      categories: categories.sort(),
      brands: brands.sort(),
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    };
  }
}

export const productRepository = new ProductRepository();
