import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize with local state (persist to localStorage for smooth UX)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novamart_cart');
      return saved ? JSON.parse(saved) : [
        {
          id: "prod-1",
          name: "Sony WH-1000XM5 Wireless Headphones",
          price: 349.99,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
          stock: 24,
          category: "Electronics"
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('novamart_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const prodId = product.id || product._id;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === prodId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock !== undefined ? product.stock : 99);
        return prev.map(item =>
          item.id === prodId ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, {
        id: prodId,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: Math.min(quantity, product.stock !== undefined ? product.stock : 99)
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 15) : 0;
  const tax = subtotal * 0.05; // 5% mock tax
  const total = subtotal + shipping + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shipping,
        tax,
        total
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
