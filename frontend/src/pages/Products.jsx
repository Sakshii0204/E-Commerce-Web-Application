import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';
import { FilterPanel } from '../components/products/FilterPanel';
import { Button } from '../components/common/Button';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products } = useProducts();

  // Search & Filter state derived from searchParams as single source of truth
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';

  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'rating'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique categories and brands
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand)));
  }, [products]);

  const handleSelectCategory = (cat) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat === 'All') next.delete('category');
      else next.set('category', cat);
      return next;
    });
  };

  const handleSelectBrand = (brand) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (brand === 'All') next.delete('brand');
      else next.set('brand', brand);
      return next;
    });
  };

  const handleSearchChange = (query) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!query.trim()) next.delete('search');
      else next.set('search', query);
      return next;
    });
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCategory && !matchDesc) return false;
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
          return false;
        }

        // Price
        if (p.price > maxPrice) {
          return false;
        }

        // In stock
        if (onlyInStock && p.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        // Default 'newest'
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, maxPrice, onlyInStock, sortBy]);

  const handleResetFilters = () => {
    setMaxPrice(1000);
    setOnlyInStock(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-200/80 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> available items
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer text-sm"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <div className="mb-4">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={() => handleSearchChange('')}
            />
          </div>
          <FilterPanel
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedBrand={selectedBrand}
            onSelectBrand={handleSelectBrand}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            onlyInStock={onlyInStock}
            onToggleInStock={setOnlyInStock}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Close
                </Button>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={() => handleSearchChange('')}
              />

              <FilterPanel
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setMobileFilterOpen(false);
                }}
                selectedBrand={selectedBrand}
                onSelectBrand={handleSelectBrand}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                onlyInStock={onlyInStock}
                onToggleInStock={setOnlyInStock}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active filter pills */}
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery || onlyInStock || maxPrice < 1000) && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs font-semibold text-slate-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  {selectedCategory}
                  <button onClick={() => handleSelectCategory('All')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  {selectedBrand}
                  <button onClick={() => handleSelectBrand('All')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  "{searchQuery}"
                  <button onClick={() => handleSearchChange('')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {onlyInStock && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                  In Stock Only
                  <button onClick={() => setOnlyInStock(false)} className="hover:text-emerald-900 ml-1">×</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          <ProductGrid
            products={filteredProducts}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
};
