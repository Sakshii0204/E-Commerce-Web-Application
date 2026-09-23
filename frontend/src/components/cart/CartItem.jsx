import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleDecrease = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const itemSubtotal = item.price * item.quantity;
  const isOutOfStock = item.stock <= 0;
  const isOverStock = item.quantity > item.stock;

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border transition-all ${
        item.isUnavailable || isOutOfStock || isOverStock
          ? 'border-amber-300 bg-amber-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      } gap-4`}
    >
      {/* Product info */}
      <div className="flex items-center gap-4 flex-1">
        <Link to={`/products/${item.id}`} className="shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100"
          />
        </Link>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {item.category || 'Item'}
          </span>
          <Link
            to={`/products/${item.id}`}
            className="text-sm sm:text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <span className="text-sm font-bold text-slate-700 mt-1">
            ${item.price.toFixed(2)}
          </span>

          {/* Availability / Stock Warnings */}
          {item.isUnavailable || isOutOfStock ? (
            <span className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Product is currently unavailable
            </span>
          ) : isOverStock ? (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Only {item.stock} left in stock
            </span>
          ) : null}
        </div>
      </div>

      {/* Quantity and Actions */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
        {/* Quantity selector */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
          <button
            type="button"
            onClick={handleDecrease}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-bold text-slate-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={item.stock !== undefined && item.quantity >= item.stock}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item subtotal */}
        <div className="text-right min-w-[80px]">
          <span className="text-sm sm:text-base font-bold text-slate-900">
            ${itemSubtotal.toFixed(2)}
          </span>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="Remove from Cart"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
