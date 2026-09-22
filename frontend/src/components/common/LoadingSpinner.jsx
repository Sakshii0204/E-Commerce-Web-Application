import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 gap-3 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-indigo-600`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};
