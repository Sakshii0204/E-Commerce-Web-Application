import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Check, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await addToCart(product, 1);
      if (res?.requiresAuth) {
        navigate(`/login?redirect=/products/${product.id || product._id}`);
        return;
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent && discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            -{discountPercent}%
          </span>
        )}
        {product.isNew && (
          <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            NEW
          </span>
        )}
      </div>

      {/* Stock status badge */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full animate-pulse">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Image Container with hover zoom */}
      <Link
        to={`/products/${product.id || product._id}`}
        className="relative block aspect-square w-full overflow-hidden bg-slate-100"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>

      {/* Details Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-indigo-600">{product.category}</span>
          <span>{product.brand}</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.id || product._id}`}
          className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors mb-2"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-semibold text-slate-700">{product.rating || 4.5}</span>
          <span className="text-slate-400">({product.reviewsCount || 24})</span>
        </div>

        {/* Price and Cart CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {isOutOfStock ? 'Currently unavailable' : 'In Stock & Ready'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`
              p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center
              ${added
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-95'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-xs'
              }
            `}
            title={added ? "Added to Cart!" : "Add to Cart"}
            aria-label="Add to cart"
          >
            {added ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
