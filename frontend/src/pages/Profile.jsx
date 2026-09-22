import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, PackageCheck, Edit3, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { FormInput } from '../components/common/FormInput';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Sakshi Sharma",
    email: user?.email || "sakshi@example.com",
    phone: user?.phone || "+91 98765 43210"
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Customer Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, contact information, and preferences
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved locally for Phase 1 demo!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        {/* User Card Top */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
          />

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profileData.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                {user?.role === 'admin' ? 'Admin Access' : 'Verified Member'}
              </span>
            </div>
            <p className="text-sm text-slate-500">{profileData.email}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
              <Calendar className="w-3.5 h-3.5" /> Member since {user?.joinedDate || "January 2025"}
            </p>
          </div>

          <Button
            variant={isEditing ? "ghost" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </Button>
        </div>

        {/* Info or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <FormInput
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
            />
            <FormInput
              label="Contact Phone"
              name="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              required
            />
            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" variant="primary">
                Save Changes (Mock)
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Full Name
              </span>
              <p className="text-base font-bold text-slate-900">{profileData.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email Address
              </span>
              <p className="text-base font-bold text-slate-900">{profileData.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" /> Phone Number
              </span>
              <p className="text-base font-bold text-slate-900">{profileData.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> Security Status
              </span>
              <p className="text-base font-bold text-emerald-600">Standard Account (Phase 1)</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
          <Link to="/orders">
            <Button variant="secondary" size="md" className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              <span>View Order History</span>
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="md" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Admin Management Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
