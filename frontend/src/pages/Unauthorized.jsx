import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-md shadow-rose-100 ring-8 ring-rose-50/50">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
        Access Restricted
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
        Unauthorized Access
      </h1>
      <p className="text-slate-500 text-sm sm:text-base max-w-md mb-8">
        You do not have the required administrative permissions to access this control section.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Storefront</span>
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="primary" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            <span>Sign in as Admin</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
