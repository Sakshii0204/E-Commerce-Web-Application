import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  PackageCheck,
  Truck,
  Ban,
  Check,
} from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getAdminOrderById(id);
      if (res?.data) {
        setOrder(res.data);
      } else {
        throw new Error('Order details not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusTransition = async (nextStatus) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const res = await orderApi.updateOrderStatus(id, nextStatus);
      if (res?.data) {
        setOrder(res.data);
        setSuccessMessage(`Order status successfully updated to ${nextStatus}.`);
        setShowCancelModal(false);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Retrieving order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Order Not Found</h3>
        <p className="text-sm text-slate-500">{error}</p>
        <Link to="/admin/orders">
          <Button variant="primary">Return to Orders List</Button>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = order.orderStatus || 'PLACED';
  const customerName = order.user?.name || order.shippingAddress?.fullName || 'Customer';
  const customerEmail = order.user?.email || 'N/A';
  const customerPhone = order.shippingAddress?.phone || 'N/A';
  const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                Order #{order.orderNumber || order.id || order._id}
              </h2>
              <OrderStatusBadge status={currentStatus} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed on {formattedDate} by <strong className="text-slate-700">{customerName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Error Notification */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Purchased Items Snapshot & Totals */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Purchased Items Snapshot ({itemsCount} units)</span>
              <span className="text-xs font-semibold text-slate-400">Locked Historical Pricing</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {(order.items || []).map((item, index) => {
                const itemTotal = Number(item.lineTotal || item.price * item.quantity).toFixed(2);
                return (
                  <div key={item.product || index} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                        }}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ${Number(item.price).toFixed(2)} × {item.quantity} unit
                          {item.quantity > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm shrink-0">
                      ${itemTotal}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${Number(order.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span className="font-semibold text-slate-900">
                  {Number(order.shippingCharge || 0) === 0
                    ? 'FREE'
                    : `$${Number(order.shippingCharge).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600 font-black">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Timestamps Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Order Lifecycle Milestones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">Created</span>
                <span className="font-bold text-slate-800">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">Processed</span>
                <span className="font-bold text-slate-800">
                  {order.processedAt ? new Date(order.processedAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">Dispatched</span>
                <span className="font-bold text-slate-800">
                  {order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold">
                  {order.orderStatus === 'CANCELLED' ? 'Cancelled' : 'Delivered'}
                </span>
                <span className="font-bold text-slate-800">
                  {order.cancelledAt
                    ? new Date(order.cancelledAt).toLocaleDateString()
                    : order.deliveredAt
                    ? new Date(order.deliveredAt).toLocaleDateString()
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Controlled Lifecycle Actions & Customer Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Controlled Status Lifecycle Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fulfillment Control
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">State Machine</span>
            </div>

            {/* PLACED Actions */}
            {currentStatus === 'PLACED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Order has been placed by the customer and is waiting for warehouse processing.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('PROCESSING')}
                  className="flex items-center justify-center gap-2 text-xs"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Start Processing Order</span>
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center justify-center gap-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>Cancel Order & Restore Stock</span>
                </Button>
              </div>
            )}

            {/* PROCESSING Actions */}
            {currentStatus === 'PROCESSING' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Order items are being packed. Dispatch to logistics when ready.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('SHIPPED')}
                  className="flex items-center justify-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-700"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark as Shipped</span>
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center justify-center gap-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>Cancel Order & Restore Stock</span>
                </Button>
              </div>
            )}

            {/* SHIPPED Actions */}
            {currentStatus === 'SHIPPED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Package is out for delivery with the logistics courier.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('DELIVERED')}
                  className="flex items-center justify-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark as Delivered (Confirm COD Payment)</span>
                </Button>
                <p className="text-[11px] text-amber-600 font-medium">
                  Note: Marking delivered will record Cash on Delivery payment as settled.
                </p>
              </div>
            )}

            {/* DELIVERED Terminal State */}
            {currentStatus === 'DELIVERED' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order Fully Delivered</span>
                </div>
                <p className="text-xs text-emerald-700">
                  This order has reached its terminal completed state. COD payment of $
                  {Number(order.totalAmount || 0).toFixed(2)} is marked PAID.
                </p>
              </div>
            )}

            {/* CANCELLED Terminal State */}
            {currentStatus === 'CANCELLED' && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-xs text-rose-700">
                  This order was cancelled. Purchased product inventory has been safely restored to stock.
                </p>
              </div>
            )}
          </div>

          {/* Customer & Shipping Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Customer Details
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900">{customerName}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{customerEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{customerPhone}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              Shipping Address
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                  {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              Payment Method & Status
            </h4>
            <div className="text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>{order.paymentMethod || 'Cash on Delivery (COD)'}</span>
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus || 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Confirm Order Cancellation?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cancelling this order will transition its status to <strong>CANCELLED</strong> and
                immediately restore all <strong>{itemsCount} units</strong> back to product inventory stock.
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setShowCancelModal(false)}
                className="text-xs"
              >
                Keep Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleStatusTransition('CANCELLED')}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
