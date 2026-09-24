import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = [
    { label: 'All', value: 'ALL' },
    { label: 'Placed', value: 'PLACED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const fetchOrders = useCallback(async (page = 1, status = selectedStatus, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (status && status !== 'ALL') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const res = await orderApi.getAdminOrders(params);
      if (res?.data) {
        setOrders(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve admin orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchOrders(1, selectedStatus, searchQuery);
  }, [fetchOrders, selectedStatus, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
  };

  const handleClearFilters = () => {
    setSelectedStatus('ALL');
    setSearchQuery('');
    setSearchInput('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Orders Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor fulfillment workflows, manage order statuses, and review purchase snapshots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchOrders(pagination.page, selectedStatus, searchQuery)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            Total Orders: <strong className="text-indigo-600">{pagination.total}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search order number or customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs px-3 py-2">
            Search
          </Button>
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {statuses.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => handleStatusChange(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === st.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page, selectedStatus, searchQuery)}
            className="text-xs shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs font-semibold text-slate-500">Loading orders from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="No customer orders match your query or status filter."
            actionLabel="Reset Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order Number</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold">Total Amount</th>
                    <th className="py-3 px-4 font-semibold">Payment</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const orderId = order.id || order._id;
                    const totalUnits = (order.items || []).reduce(
                      (acc, it) => acc + (it.quantity || 1),
                      0
                    );
                    const customerName =
                      order.user?.name || order.shippingAddress?.fullName || 'Customer';
                    const customerEmail = order.user?.email || 'N/A';
                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A';

                    return (
                      <tr key={orderId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-600">
                          {order.orderNumber || orderId}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-sm truncate max-w-[160px]">
                            {customerName}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">
                            {customerEmail}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formattedDate}
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                          {totalUnits} unit{totalUnits > 1 ? 's' : ''}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800">
                              {order.paymentMethod || 'COD'}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                order.paymentStatus === 'PAID'
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {order.paymentStatus || 'PENDING'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.orderStatus || 'PLACED'} />
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link to={`/admin/orders/${orderId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Manage</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span>
                  Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total orders)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchOrders(pagination.page - 1, selectedStatus, searchQuery)}
                    className="text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchOrders(pagination.page + 1, selectedStatus, searchQuery)}
                    className="text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
