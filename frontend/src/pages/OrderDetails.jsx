import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { Button } from '../components/common/Button';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-slate-500">The requested order number could not be located in your history.</p>
        <Link to="/orders">
          <Button variant="primary">Return to My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Order Summary</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {order.id}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Placed on {order.date}
          </p>
        </div>

        <div className="flex flex-col md:items-end">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Paid</span>
          <span className="text-3xl font-black text-indigo-600">${order.pricing.total.toFixed(2)}</span>
          <span className="text-xs text-emerald-600 font-medium">Payment: {order.paymentMethod}</span>
        </div>
      </div>

      {/* Order Layout Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Ordered Items ({order.items.length})
          </h3>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
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
              <span>Tax (5%)</span>
              <span className="font-semibold text-slate-900">${order.pricing.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900 text-base">
              <span>Total</span>
              <span className="text-indigo-600 font-black">${order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Delivery Address</span>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">{order.customer?.name || "Customer"}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="text-xs text-slate-500 mt-2">Contact: {order.customer?.phone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment Details</span>
            </div>
            <div className="text-sm space-y-1 text-slate-600">
              <p className="font-semibold text-slate-900">{order.paymentMethod}</p>
              <p className="text-xs text-emerald-600 font-medium">Status: {order.paymentStatus || 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
