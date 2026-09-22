import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel = ({
  categories = [],
  brands = [],
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  onMaxPriceChange,
  onlyInStock,
  onToggleInStock,
  onResetFilters,
  className = ''
}) => {
  return (
    <aside className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Category
        </h4>
        <div className="flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Brand
        </h4>
        <select
          value={selectedBrand}
          onChange={(e) => onSelectBrand(e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
        >
          <option value="All">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Price Slider */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Max Price
          </h4>
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            ${maxPrice}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max="1000"
          step="25"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>$50</span>
          <span>$1000</span>
        </div>
      </div>

      {/* Availability / In Stock */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 rounded-sm"
          />
          <span className="text-sm text-slate-700 font-medium">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
};
