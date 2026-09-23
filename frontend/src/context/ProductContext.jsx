import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalProducts: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filtersMetadata, setFiltersMetadata] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 2000 },
  });

  const fetchFiltersMetadata = useCallback(async () => {
    try {
      const res = await productApi.getProductFilters();
      if (res?.data) {
        setFiltersMetadata(res.data);
      }
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  }, []);

  const fetchProducts = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getProducts(queryParams);
      if (res?.data) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
      return res;
    } catch (err) {
      setError(err.message || 'Failed to load products');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id) => {
    try {
      const res = await productApi.getProductById(id);
      return res?.data || null;
    } catch (err) {
      console.error('Error fetching product by ID:', err);
      return null;
    }
  }, []);

  const addProduct = useCallback(async (productData) => {
    setLoading(true);
    try {
      const res = await productApi.createProduct(productData);
      await fetchProducts();
      return res?.data;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    try {
      const res = await productApi.updateProduct(id, productData);
      await fetchProducts();
      return res?.data;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    try {
      await productApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load of filter metadata and initial catalog
  useEffect(() => {
    fetchFiltersMetadata();
  }, [fetchFiltersMetadata]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        pagination,
        filtersMetadata,
        fetchProducts,
        fetchFiltersMetadata,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
