import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Cart = () => {
  const { cartItems, clearCart, cartCount, loading, error, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Sign in to view your bag"
          description="Your cart is securely stored with your account. Sign in or create an account to access your items."
          actionLabel="Sign In"
          onAction={() => (window.location.href = '/login?redirect=/cart')}
        />
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading shopping cart..." />
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchCart}>
          Try Again
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any premium essentials to your bag yet. Explore our curated collections."
          actionLabel="Start Shopping"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <strong className="text-slate-900">{cartCount}</strong>{' '}
            {cartCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/products">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-xs text-slate-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </Button>
        </div>
      </div>

      {/* Cart Items Grid / Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 sticky top-24">
          <CartSummary showCheckoutBtn={true} />
        </div>
      </div>
    </div>
  );
};
