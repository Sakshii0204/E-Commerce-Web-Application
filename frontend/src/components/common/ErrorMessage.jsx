import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorMessage = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 ${className}`}>
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-700 p-0.5 rounded-lg focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
