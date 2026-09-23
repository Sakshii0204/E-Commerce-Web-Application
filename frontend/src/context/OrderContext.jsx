import React, { createContext, useContext, useState, useCallback } from 'react';
import { orderApi } from '../api/orderApi';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getMyOrders();
      if (res?.data) {
        setOrders(res.data);
      }
      return res?.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch order history');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getOrderById(id);
      return res?.data || null;
    } catch (err) {
      setError(err.message || 'Failed to load order');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async ({ shippingAddress, paymentMethod = 'COD' }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.createOrder({ shippingAddress, paymentMethod });
      if (res?.data) {
        setOrders((prev) => [res.data, ...prev]);
        return res.data;
      }
      throw new Error(res?.message || 'Failed to place order');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchMyOrders,
        getOrderById,
        placeOrder,
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
