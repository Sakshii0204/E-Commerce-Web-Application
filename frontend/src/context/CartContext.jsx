import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyCartData = (data) => {
    if (!data) return;
    const items = (data.items || []).map((it) => ({
      id: it.product.id || it.product._id,
      productId: it.product.id || it.product._id,
      name: it.product.name,
      price: it.product.price,
      image: it.product.image,
      category: it.product.category,
      brand: it.product.brand,
      stock: it.product.stock,
      isActive: it.product.isActive,
      isUnavailable: it.product.isUnavailable,
      isStockExceeded: it.product.isStockExceeded,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    }));

    setCartItems(items);
    setCartCount(data.itemCount || 0);
    setSubtotal(data.subtotal || 0);
    setShipping(data.shipping || 0);
    setTax(data.tax || 0);
    setTotal(data.total || 0);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartCount(0);
      setSubtotal(0);
      setShipping(0);
      setTax(0);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await cartApi.getCart();
      if (res?.data) {
        applyCartData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    const prodId = product.id || product._id;
    if (!isAuthenticated) {
      // Return false to indicate unauthenticated (trigger login redirect)
      return { requiresAuth: true };
    }

    setLoading(true);
    try {
      const res = await cartApi.addCartItem(prodId, quantity);
      if (res?.data) {
        applyCartData(res.data);
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    setLoading(true);
    try {
      const res = await cartApi.updateCartItem(productId, quantity);
      if (res?.data) {
        applyCartData(res.data);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const res = await cartApi.removeCartItem(productId);
      if (res?.data) {
        applyCartData(res.data);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.clearCart();
      if (res?.data) {
        applyCartData(res.data);
      } else {
        setCartItems([]);
        setCartCount(0);
        setSubtotal(0);
        setShipping(0);
        setTax(0);
        setTotal(0);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shipping,
        tax,
        total,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
