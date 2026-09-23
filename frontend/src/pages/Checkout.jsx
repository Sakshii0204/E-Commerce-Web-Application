import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, User, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, shipping, total, fetchCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters)';
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 8) {
      newErrors.phone = 'Enter a valid contact number (at least 8 digits)';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Street address is required (min 5 characters)';
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim() || formData.state.trim().length < 2) {
      newErrors.state = 'State / Region is required';
    }
    if (!formData.postalCode.trim() || formData.postalCode.trim().length < 4) {
      newErrors.postalCode = 'Valid postal code is required (min 4 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (cartItems.length === 0) {
      setGeneralError('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!validate()) return;

    setIsLoading(true);

    try {
      const order = await placeOrder({
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
        },
        paymentMethod: 'COD',
      });

      // Refresh cart to show 0 items
      await fetchCart();

      navigate('/order-success', { state: { order } });
    } catch (err) {
      setGeneralError(err.message || 'Failed to place order. Please review your cart.');
      // Refresh cart in case of stock / availability change
      fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500">You must have items in your shopping bag to proceed to checkout.</p>
        <Link to="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout & Shipping
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your items and enter delivery address details
        </p>
      </div>

      {generalError && (
        <ErrorMessage message={generalError} onDismiss={() => setGeneralError('')} />
      )}

      {/* Checkout Content Form */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-base">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>1. Shipping Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="fullName"
                placeholder="Receiver name"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={errors.fullName}
                required
              />

              <FormInput
                label="Phone Number"
                name="phone"
                placeholder="9876543210"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                required
              />
            </div>

            <FormInput
              label="Street Address / Building"
              name="address"
              placeholder="Flat 401, Skyline Apartments, MG Road"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="City"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={errors.city}
                required
              />

              <FormInput
                label="State / Province"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                error={errors.state}
                required
              />

              <FormInput
                label="Postal Code"
                name="postalCode"
                placeholder="Postal PIN"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                error={errors.postalCode}
                required
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-base">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>2. Payment Method</span>
            </div>

            <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 flex items-start gap-4">
              <input
                type="radio"
                name="payment"
                checked
                readOnly
                className="mt-1 w-4 h-4 text-indigo-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Enabled
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Pay securely with cash or UPI upon doorstep delivery. No advance online payment required.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified server-side inventory reservation and authoritative price calculations.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Review ({cartItems.length} items)
            </h3>

            {/* Items list preview */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-md shadow-indigo-200"
            >
              <span>Place Order (Cash on Delivery)</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
