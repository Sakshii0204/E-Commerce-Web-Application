import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockOrders } from '../data/mockOrders';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('novamart_orders');
      return saved ? JSON.parse(saved) : mockOrders;
    } catch {
      return mockOrders;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('novamart_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }, [orders]);

  const placeOrder = ({ items, shippingAddress, customer, pricing, paymentMethod = 'Cash on Delivery' }) => {
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderNumber,
      date: new Date().toISOString().split('T')[0],
      customer: customer || {
        name: shippingAddress.fullName || "Valued Customer",
        email: shippingAddress.email || "customer@example.com",
        phone: shippingAddress.phone || "+91 98765 00000"
      },
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode
      },
      paymentMethod,
      paymentStatus: "Pending",
      status: "Placed",
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total
      }
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getOrderById = (id) => {
    return orders.find(o => String(o.id) === String(id));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
