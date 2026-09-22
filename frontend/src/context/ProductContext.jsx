import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data/mockProducts';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('novamart_products');
      return saved ? JSON.parse(saved) : mockProducts;
    } catch {
      return mockProducts;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('novamart_products', JSON.stringify(products));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }, [products]);

  const addProduct = (newProduct) => {
    const created = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock, 10) || 0,
      featured: Boolean(newProduct.featured),
      isNew: true
    };
    setProducts(prev => [created, ...prev]);
    return created;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedFields,
            price: parseFloat(updatedFields.price !== undefined ? updatedFields.price : p.price),
            stock: parseInt(updatedFields.stock !== undefined ? updatedFields.stock : p.stock, 10)
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id) => {
    return products.find(p => String(p.id) === String(id));
  };

  const resetProducts = () => {
    setProducts(mockProducts);
    localStorage.removeItem('novamart_products');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        resetProducts
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
