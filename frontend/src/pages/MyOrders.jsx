import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const MyOrders = () => {
  const { orders, loading, error, fetchMyOrders } = useOrders();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchMyOrders}>
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="Once you place an order, its real-time shipping status and breakdown will appear here."
          actionLabel="Browse Products"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Check status, view invoices, or track deliveries for past purchases
        </p>
      </div>

      {/* Orders List / Table */}
      <div className="space-y-4">
        {orders.map((order) => {
          const orderId = order.id || order._id || order.orderNumber;
          const orderDate = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : 'Recent';
          const itemsList = order.items || [];
          const totalItems = itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0);
          const totalAmount = order.totalAmount !== undefined ? order.totalAmount : 0;

          return (
            <div
              key={orderId}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              {/* Top metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Order Number</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber || orderId}</p>
                  </div>
                  <span className="text-slate-200 hidden sm:inline">•</span>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Placed On</span>
                    <p className="text-sm font-semibold text-slate-700">{orderDate}</p>
                  </div>
                  <span className="text-slate-200 hidden sm:inline">•</span>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Amount</span>
                    <p className="text-sm font-bold text-indigo-600">${Number(totalAmount).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.orderStatus || 'PLACED'} />
                  <Link to={`/orders/${orderId}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 scrollbar-thin">
                  {itemsList.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0">
                      <img
                        src={item.image}
                        alt={item.productName || 'Product'}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200/60"
                      />
                      <div className="hidden md:block max-w-[140px]">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.productName || 'Product'}
                        </p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {itemsList.length > 3 && (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl shrink-0">
                      +{itemsList.length - 3} more
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 shrink-0">
                  <span>
                    {totalItems} total {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
