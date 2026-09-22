import React from 'react';
import { Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

export const OrderStatusBadge = ({ status, className = '' }) => {
  const configs = {
    Placed: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'Order Placed'
    },
    Processing: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Package,
      label: 'Processing'
    },
    Shipped: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Truck,
      label: 'Shipped'
    },
    Delivered: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Delivered'
    },
    Cancelled: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const current = configs[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: status
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {current.label}
    </span>
  );
};
