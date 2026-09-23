import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';
import { FilterPanel } from '../components/products/FilterPanel';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    loading,
    error,
    pagination,
    filtersMetadata,
    fetchProducts,
  } = useProducts();

  // Read URL query state
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 2000;
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  // Local state for interactive controls
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const debounceTimerRef = useRef(null);

  // Sync searchInput when URL changes externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Request backend products whenever searchParams change
  useEffect(() => {
    const params = {
      page: pageParam,
      limit: 12,
      sort: sortParam,
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedBrand && selectedBrand !== 'All') params.brand = selectedBrand;
    if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
    if (inStockParam) params.inStock = true;

    fetchProducts(params);
  }, [searchParams, fetchProducts]);

  // URL update helper
  const updateUrlParam = useCallback((key, value, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === '' || value === 'All' || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      if (resetPage) {
        next.delete('page');
      }
      return next;
    });
  }, [setSearchParams]);

  // Search input debouncer (~400ms)
  const handleSearchChange = (query) => {
    setSearchInput(query);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateUrlParam('search', query.trim());
    }, 400);
  };

  const handleCategorySelect = (cat) => {
    updateUrlParam('category', cat);
  };

  const handleBrandSelect = (brand) => {
    updateUrlParam('brand', brand);
  };

  const handleMaxPriceChange = (val) => {
    updateUrlParam('maxPrice', val);
  };

  const handleInStockToggle = (val) => {
    updateUrlParam('inStock', val);
  };

  const handleSortChange = (sort) => {
    updateUrlParam('sort', sort, false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
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
            Showing <strong className="text-slate-900">{pagination?.totalProducts ?? products.length}</strong> available items
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
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer text-sm"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
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
              value={searchInput}
              onChange={handleSearchChange}
              onClear={() => handleSearchChange('')}
            />
          </div>
          <FilterPanel
            categories={filtersMetadata.categories}
            brands={filtersMetadata.brands}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            selectedBrand={selectedBrand}
            onSelectBrand={handleBrandSelect}
            maxPrice={maxPriceParam}
            onMaxPriceChange={handleMaxPriceChange}
            priceRange={filtersMetadata.priceRange}
            onlyInStock={inStockParam}
            onToggleInStock={handleInStockToggle}
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
                value={searchInput}
                onChange={handleSearchChange}
                onClear={() => handleSearchChange('')}
              />

              <FilterPanel
                categories={filtersMetadata.categories}
                brands={filtersMetadata.brands}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleCategorySelect(cat);
                  setMobileFilterOpen(false);
                }}
                selectedBrand={selectedBrand}
                onSelectBrand={handleBrandSelect}
                maxPrice={maxPriceParam}
                onMaxPriceChange={handleMaxPriceChange}
                priceRange={filtersMetadata.priceRange}
                onlyInStock={inStockParam}
                onToggleInStock={handleInStockToggle}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active filter pills */}
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery || inStockParam || searchParams.has('maxPrice')) && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs font-semibold text-slate-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  {selectedCategory}
                  <button onClick={() => handleCategorySelect('All')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  {selectedBrand}
                  <button onClick={() => handleBrandSelect('All')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  "{searchQuery}"
                  <button onClick={() => handleSearchChange('')} className="hover:text-indigo-900 ml-1">×</button>
                </span>
              )}
              {inStockParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                  In Stock Only
                  <button onClick={() => handleInStockToggle(false)} className="hover:text-emerald-900 ml-1">×</button>
                </span>
              )}
              {searchParams.has('maxPrice') && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-200">
                  Under ${maxPriceParam}
                  <button onClick={() => updateUrlParam('maxPrice', null)} className="hover:text-indigo-900 ml-1">×</button>
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

          {/* Loading / Error / Grid Display */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" text="Loading catalog..." />
            </div>
          ) : error ? (
            <div className="py-16 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-rose-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProducts()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                onResetFilters={handleResetFilters}
              />

              {/* Server-backed Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-semibold transition-colors cursor-pointer ${
                          pageNum === pagination.page
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
