import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Nova<span className="text-indigo-400">Mart</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curated premium lifestyle, technology, and fashion essentials engineered for modern aesthetics and uncompromising daily reliability.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                QSkill Engineering Hub, Tech District
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                support@novamart.store
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                +91 (800) 555-NOVA
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Storefront</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="hover:text-white transition-colors">Fashion Apparel</Link>
              </li>
              <li>
                <Link to="/products?category=Footwear" className="hover:text-white transition-colors">Footwear</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">Track Order</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">My Profile</Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Shipping Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Terms & Conditions</span>
              </li>
            </ul>
          </div>

          {/* Internship & Admin Switch */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Project Phase 1
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 text-xs space-y-2">
              <p className="text-indigo-400 font-semibold">QSkill 1-Month Internship</p>
              <p className="text-slate-300">Phase 1: Complete Frontend Foundation</p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Access Admin Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NovaMart Inc. Developed for QSkill MERN Internship. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secure 256-Bit SSL Ready
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Truck className="w-4 h-4 text-indigo-400" />
              Express Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
