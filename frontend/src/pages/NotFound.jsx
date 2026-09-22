import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ShoppingBag } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-md shadow-indigo-100 ring-8 ring-indigo-50/50">
        <HelpCircle className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm sm:text-base max-w-md mb-8">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/">
          <Button variant="primary" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
