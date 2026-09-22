import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';

export const CartSummary = ({ showCheckoutBtn = true }) => {
  const { cartCount, subtotal, shipping, tax, total } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Items ({cartCount})</span>
          <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Estimated Shipping</span>
            {shipping === 0 && subtotal > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                FREE
              </span>
            )}
          </div>
          <span className="font-medium text-slate-900">
            {shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Estimated Sales Tax (5%)</span>
          <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
        </div>

        {subtotal < 100 && subtotal > 0 && (
          <p className="text-xs text-indigo-600 bg-indigo-50 p-2.5 rounded-xl">
            Add ${(100 - subtotal).toFixed(2)} more to qualify for <strong>FREE Shipping</strong>!
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-2xl font-black text-indigo-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {showCheckoutBtn && (
        <Link to="/checkout" className="block">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={cartCount === 0}
            className="group"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}

      {/* Trust guarantees */}
      <div className="pt-2 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Cash on Delivery & Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Dispatched within 24-48 business hours</span>
        </div>
      </div>
    </div>
  );
};
