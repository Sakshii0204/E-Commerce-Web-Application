import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 1,
  });
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const loadAdminProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        sort: 'newest',
        includeInactive: 'true',
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const [res, filterRes] = await Promise.all([
        productApi.getProducts(params),
        productApi.getProductFilters(),
      ]);

      if (res?.data) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
      if (filterRes?.data?.categories) {
        setCategories(['All', ...filterRes.data.categories]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdminProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadAdminProducts]);

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    try {
      await productApi.deleteProduct(deletingProductId);
      setDeletingProductId(null);
      setFeedbackNotice('Product archived/deleted successfully.');
      setTimeout(() => setFeedbackNotice(''), 3000);
      loadAdminProducts(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage real database products, stock, and archive status
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button variant="primary" size="md" className="flex items-center gap-2 shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading inventory..." />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 font-medium">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadAdminProducts(1)} className="mt-4">
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Adjust your search query or selected category to view inventory items."
            actionLabel="Reset Search"
            onAction={() => { setSearchQuery(''); setSelectedCategory('All'); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const prodId = p.id || p._id;
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={prodId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${p.price.toFixed(2)}
                      </td>

                      {/* Stock units */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{p.stock} units</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {p.isActive === false ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Archived
                          </span>
                        ) : isOutOfStock ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${prodId}/edit`}>
                            <button
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => setDeletingProductId(prodId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete / Archive product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Admin Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAdminProducts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            <span className="text-xs text-slate-500 font-medium">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalProducts} items)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAdminProducts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingProductId)}
        title="Archive / Delete Product"
        message="Are you sure you want to archive this product? It will immediately be hidden from the public customer storefront while retaining historical integrity."
        confirmText="Archive Product"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProductId(null)}
      />
    </div>
  );
};
