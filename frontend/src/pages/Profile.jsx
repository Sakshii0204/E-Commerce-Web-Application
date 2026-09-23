import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Shield, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const Profile = () => {
  const { user, isAdmin } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Recent Member';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Customer Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Authenticated customer identity stored in MongoDB database
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        {/* User Card Top */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-indigo-50">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  isAdmin
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
              <Calendar className="w-3.5 h-3.5" /> Member since {formattedDate}
            </p>
          </div>
        </div>

        {/* Database User Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Full Name
            </span>
            <p className="text-base font-bold text-slate-900">{user?.name}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" /> Registered Email
            </span>
            <p className="text-base font-bold text-slate-900">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" /> Account Role
            </span>
            <p className="text-base font-bold text-slate-900">{user?.role} Access</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Authentication
            </span>
            <p className="text-base font-bold text-emerald-600">HttpOnly JWT Session (Active)</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
          <Link to="/orders">
            <Button variant="secondary" size="md" className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              <span>View Order History</span>
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Admin Management Portal</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
