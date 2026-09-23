import { productService } from '../services/product.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const isUserAdmin = req.user?.role === 'ADMIN';
    const includeInactive = isUserAdmin && req.query.includeInactive === 'true';

    const result = await productService.getProducts(req.query, { includeInactive });

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const isUserAdmin = req.user?.role === 'ADMIN';
    const product = await productService.getProductById(req.params.id, {
      includeInactive: isUserAdmin,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductFilters = async (req, res, next) => {
  try {
    const filters = await productService.getFilterMetadata();

    res.status(200).json({
      success: true,
      data: filters,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted/archived successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
