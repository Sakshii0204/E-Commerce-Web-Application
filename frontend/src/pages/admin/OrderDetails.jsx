import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, MapPin, CreditCard, User, Mail, Phone } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { Button } from '../../components/common/Button';

export const AdminOrderDetails = () => {
  const { id } = useParams();
  const { getOrderById, updateOrderStatus } = useOrders();

  const order = getOrderById(id);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Placed');
  const [updatedNotice, setUpdatedNotice] = useState(false);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Order Not Found</h3>
        <p className="text-sm text-slate-500">The requested order was not found in the system.</p>
        <Link to="/admin/orders">
          <Button variant="primary">Return to Orders List</Button>
        </Link>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    updateOrderStatus(order.id, selectedStatus);
    setUpdatedNotice(true);
    setTimeout(() => setUpdatedNotice(false), 2500);
  };

  const statusOptions = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              Order {order.id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Placed on {order.date} by {order.customer?.name}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {updatedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Order fulfillment status updated to <strong>{selectedStatus}</strong> in mock state!</span>
        </div>
      )}

      {/* Main Grid: Status Control + Customer Info + Ordered Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ordered Items & Billing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Purchased Items ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        ${item.price.toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {order.pricing.shipping === 0 ? 'FREE' : `$${order.pricing.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold text-slate-900">${order.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600 font-black">${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater & Customer Address */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Change Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Fulfillment Status
            </h3>

            <div className="space-y-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleStatusUpdate}
                className="flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Status (Mock)</span>
              </Button>
            </div>
          </div>

          {/* Customer & Shipping Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Customer Details
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-900">{order.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{order.customer?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{order.customer?.phone}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              Shipping Destination
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </span>
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              Payment Method
            </h4>
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>{order.paymentMethod}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
