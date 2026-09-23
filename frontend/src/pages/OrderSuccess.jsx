import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '../components/common/Button';

export const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  const orderNumber = order?.orderNumber || order?.id || 'NVM-PENDING';
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();
  const totalAmount = order?.totalAmount !== undefined ? order.totalAmount : 0;
  const targetId = order?.id || order?._id || orderNumber;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
      {/* Animated check circle */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 animate-in zoom-in-75">
          <CheckCircle2 className="w-10 h-10" />
        </div>
      </div>

      {/* Main Headline */}
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          Order Placed Successfully
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
          Your order has been recorded in our database and is being prepared for fulfillment.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-md mx-auto text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-medium uppercase">Order Number</span>
          <span className="font-mono font-bold text-indigo-600 text-sm">{orderNumber}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Order Date</span>
          <span className="font-semibold text-slate-900">{orderDate}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Payment Method</span>
          <span className="font-semibold text-slate-900">Cash on Delivery (COD)</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Amount</span>
          <span className="font-bold text-slate-900">${Number(totalAmount).toFixed(2)}</span>
        </div>

        <div className="p-3 bg-indigo-50/70 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800">
          <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Estimated delivery within 2-4 business days.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/orders/${targetId}`}>
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto flex items-center gap-2 shadow-md shadow-indigo-200"
          >
            <PackageCheck className="w-4 h-4" />
            <span>View Order Details</span>
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" size="md" className="w-full sm:w-auto flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
