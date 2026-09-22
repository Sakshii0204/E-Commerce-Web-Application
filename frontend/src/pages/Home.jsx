import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { mockCategories } from '../data/mockCategories';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/common/Button';

export const Home = () => {
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  const valueProps = [
    {
      icon: Award,
      title: "Premium Quality",
      desc: "Authentic materials and craftsmanship certified for longevity."
    },
    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      desc: "Safe Cash on Delivery and encrypted customer privacy standard."
    },
    {
      icon: Truck,
      title: "Fast Global Delivery",
      desc: "Complimentary priority shipping on qualifying orders over $100."
    },
    {
      icon: RotateCcw,
      title: "30-Day Easy Returns",
      desc: "No questions asked doorstep pickups for effortless exchanges."
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-indigo-50/60 via-white to-slate-50 pt-8 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Gen Curated Collection • Phase 1 Live</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Elevate Everyday Living with <span className="text-indigo-600">Pure Craft.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover modern electronics, tailored minimalist apparel, and artisan leather accessories engineered for timeless style and performance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/products">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                    <span>Explore Catalog</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/products?category=Electronics">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Tech Essentials
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-slate-900">12k+</p>
                  <p className="text-xs text-slate-500 font-medium">Happy Shoppers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">4.9/5</p>
                  <p className="text-xs text-slate-500 font-medium">Customer Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Original Gear</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />

                {/* Primary Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Sony WH-1000XM5 Premium Audio"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="p-6 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Featured Innovation</span>
                      <h3 className="text-lg font-bold text-slate-900">Sony WH-1000XM5</h3>
                      <p className="text-sm font-semibold text-slate-600">$349.99</p>
                    </div>
                    <Link to="/products/prod-1">
                      <Button variant="secondary" size="sm">
                        View Item
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Verified Authentic</p>
                    <p className="text-[11px] text-slate-500">Fast Express Shipping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-colors"
              >
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{prop.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Browse By Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated collections selected for everyday lifestyle & work
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  {category.itemCount} Items
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-200 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-1 opacity-90">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Picks
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Tasteful Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl p-8 sm:p-12 lg:p-16">
          {/* Background image overlay */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-luminosity bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/90 to-transparent" />

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold tracking-wider uppercase">
              Limited Edition Release
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Apple Watch Ultra 2 in Natural Titanium.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Engineered with extreme precision, dual-frequency GPS, and up to 72 hours of battery in low power mode. In stock for immediate dispatch.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/products/prod-2">
                <Button variant="primary" size="md">
                  Shop Now — $799
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
                  Explore More Offers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fresh Arrivals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Newly added items to our rotating catalog
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            <span>See Everything</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
