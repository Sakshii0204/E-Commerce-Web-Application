import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/common/FormInput';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);
    // Simulate frontend validation & mock login response
    setTimeout(() => {
      login(formData.email, formData.password);
      setIsLoading(false);
      setSuccessMessage('Logged in successfully! Redirecting...');
      setTimeout(() => {
        const redirect = location.state?.from || '/';
        navigate(redirect);
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your orders, cart, and account settings
          </p>
        </div>

        {generalError && (
          <ErrorMessage message={generalError} onDismiss={() => setGeneralError('')} />
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 rounded-sm"
              />
              <span className="text-slate-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => alert("Mock password reset link sent to email in Phase 1 demo.")}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="shadow-md shadow-indigo-200 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Demo Credentials hint */}
        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
          <p className="font-bold">Phase 1 Demo Credentials:</p>
          <p className="text-indigo-700">Customer: <code className="font-mono">customer@example.com</code></p>
          <p className="text-indigo-700">Admin: <code className="font-mono">admin@novamart.com</code> (Any pass 6+ chars)</p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
