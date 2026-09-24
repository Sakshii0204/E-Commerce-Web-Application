import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Eye,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { orderApi } from '../../api/orderApi';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Dashboard = () => {
  const { products } = useProducts();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        orderApi.getDashboardStats(),
        orderApi.getAdminOrders({ page: 1, limit: 5, sort: 'newest' }),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }
      if (ordersRes?.data) {
        setRecentOrders(ordersRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalProducts = stats?.products?.total ?? products.length;
  const lowStockCount = stats?.products?.lowStock ?? products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalOrders = stats?.orders?.total ?? 0;
  const pendingOrders =
    (stats?.orders?.byStatus?.PLACED || 0) + (stats?.orders?.byStatus?.PROCESSING || 0);
  const deliveredOrders = stats?.orders?.byStatus?.DELIVERED || 0;
  const deliveredRevenue = stats?.orders?.deliveredRevenue || 0;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            Phase 5 Final Phase — Operations Central
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Store Operations Control Center
          </h2>
          <p className="text-sm text-slate-300">
            Real-time fulfillment metrics, MongoDB inventory surveillance, and verified revenue analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboardData}
            className="text-white hover:bg-white/10 flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Link to="/admin/products/new">
            <Button variant="primary" size="md" className="flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="ghost" size="md" className="text-white hover:bg-white/10 flex items-center gap-2">
              <span>View All Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-semibold text-slate-500">Aggregating live store metrics...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="text-xs">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <AdminStatCard
              title="Delivered Revenue"
              value={`$${Number(deliveredRevenue).toFixed(2)}`}
              icon={DollarSign}
              color="indigo"
              change="Verified Sales"
              changeType="positive"
            />
            <AdminStatCard
              title="Total Products"
              value={totalProducts}
              icon={Package}
              color="blue"
              change="In Catalog"
              changeType="positive"
            />
            <AdminStatCard
              title="Total Orders"
              value={totalOrders}
              icon={ShoppingCart}
              color="indigo"
              change="All Time"
              changeType="positive"
            />
            <AdminStatCard
              title="Pending Orders"
              value={pendingOrders}
              icon={Clock}
              color="amber"
              change={pendingOrders > 0 ? 'Requires Action' : 'All Clear'}
              changeType={pendingOrders > 0 ? 'negative' : 'positive'}
            />
            <AdminStatCard
              title="Delivered"
              value={deliveredOrders}
              icon={CheckCircle2}
              color="emerald"
              change="Fulfilled"
              changeType="positive"
            />
            <AdminStatCard
              title="Low Stock"
              value={lowStockCount}
              icon={AlertTriangle}
              color="rose"
              change={lowStockCount > 0 ? 'Reorder Soon' : 'Healthy'}
              changeType={lowStockCount > 0 ? 'negative' : 'positive'}
            />
          </div>

          {/* Recent Orders & Low Stock split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Recent Orders Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
                  <p className="text-xs text-slate-500">Live order stream from database</p>
                </div>
                <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No customer orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/70 border-y border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Order Number</th>
                        <th className="py-2.5 px-3 font-semibold">Customer</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Total</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => {
                        const orderId = order.id || order._id;
                        const customerName =
                          order.user?.name || order.shippingAddress?.fullName || 'Customer';
                        const formattedDate = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';

                        return (
                          <tr key={orderId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-xs text-indigo-600">
                              {order.orderNumber || orderId}
                            </td>
                            <td className="py-3 px-3 text-slate-900 font-medium text-xs">
                              {customerName}
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-xs">{formattedDate}</td>
                            <td className="py-3 px-3 font-bold text-slate-900 text-xs">
                              ${Number(order.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-3">
                              <OrderStatusBadge status={order.orderStatus || 'PLACED'} />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link to={`/admin/orders/${orderId}`}>
                                <Button variant="ghost" size="sm" className="p-1.5">
                                  <Eye className="w-4 h-4 text-slate-500 hover:text-indigo-600" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Low Stock Watchlist */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stock Inventory Watch</h3>
                  <p className="text-xs text-slate-500">Products with 5 or fewer items</p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  {lowStockProducts.length} Items
                </span>
              </div>

              <div className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">All items have healthy inventory levels.</p>
                ) : (
                  lowStockProducts.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id || prod._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                        }}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-slate-500">
                          ${Number(prod.price).toFixed(2)} • {prod.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                          {prod.stock} left
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <Link to="/admin/products">
                  <Button variant="outline" size="sm" fullWidth className="text-xs">
                    Manage Full Inventory
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
