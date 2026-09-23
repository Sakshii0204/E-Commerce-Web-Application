// Escape regex special characters to prevent regex injection or ReDoS
export const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

export const parseProductQuery = (query, { includeInactive = false } = {}) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  // Text search on name, brand, category
  if (query.search && query.search.trim()) {
    const escaped = escapeRegex(query.search.trim());
    const searchRegex = new RegExp(escaped, 'i');
    filter.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
    ];
  }

  // Exact category filter
  if (query.category && query.category.trim()) {
    filter.category = query.category.trim();
  }

  // Exact brand filter
  if (query.brand && query.brand.trim()) {
    filter.brand = query.brand.trim();
  }

  // Price range filters
  const minPrice = query.minPrice !== undefined && query.minPrice !== '' ? Number(query.minPrice) : null;
  const maxPrice = query.maxPrice !== undefined && query.maxPrice !== '' ? Number(query.maxPrice) : null;

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null && !isNaN(minPrice)) {
      filter.price.$gte = Math.max(0, minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      filter.price.$lte = Math.max(0, maxPrice);
    }
  }

  // Stock filter: inStock=true
  if (query.inStock === 'true' || query.inStock === true) {
    filter.stock = { $gt: 0 };
  }

  // Controlled sort mapping
  const sortKey = (query.sort || 'newest').toLowerCase();
  const sort = SORT_MAP[sortKey] || SORT_MAP.newest;

  // Pagination parameters with safe boundaries
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || 12;
  const limit = Math.min(50, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;

  return { filter, sort, page, limit, skip };
};
