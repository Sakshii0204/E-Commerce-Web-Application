import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/common/Button';
import { ProductCard } from '../components/products/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products } = useProducts();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        if (isMounted) {
          if (data) {
            setProduct(data);
            setQuantity(1);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load product details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && (p.id || p._id) !== (product.id || product._id))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Large Product Image Showcase */}
        <div className="lg:col-span-6 relative">
          <div className="rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm aspect-square relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Save {discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                NEW ARRIVAL
              </span>
            )}
          </div>
        </div>

        {/* Product Information & Purchase Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-slate-500">{product.brand}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings row */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{product.rating || 4.5}</span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount || 42} verified customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-slate-400 line-through font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {discountPercent && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-sm font-semibold text-slate-700">
              {isOutOfStock ? 'Sold Out' : isLowStock ? `Hurry, only ${product.stock} left in stock!` : `In Stock (${product.stock} units available)`}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity selector & Add to Cart */}
          <div className="pt-4 border-t border-slate-200/80 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 shadow-lg shadow-indigo-200"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 mr-1 text-emerald-300" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-1" />
                    <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </Button>
            </div>

            {added && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
                <span>Item successfully added to your shopping bag.</span>
                <Link to="/cart" className="font-bold underline hover:text-emerald-950">
                  View Cart →
                </Link>
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-slate-700">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-xl bg-slate-50">
              <RotateCcw className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-slate-700">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-slate-700">1-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(product.specs).map(([specKey, specVal]) => (
              <div
                key={specKey}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <span className="font-medium text-slate-500">{specKey}</span>
                <span className="font-semibold text-slate-900">{specVal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id || rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
