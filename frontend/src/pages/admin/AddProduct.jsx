import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { FormInput } from '../../components/common/FormInput';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    brand: '',
    stock: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Electronics', 'Fashion', 'Footwear', 'Accessories', 'Fitness'];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required (min 2 characters)';
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      newErrors.description = 'Description is required (min 5 characters)';
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Enter a valid positive price';
    }
    if (!formData.brand.trim()) newErrors.brand = 'Brand name is required';
    if (
      formData.stock === '' ||
      isNaN(formData.stock) ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock = 'Enter a valid non-negative integer stock';
    }
    if (!formData.image.trim() || !formData.image.startsWith('http')) {
      newErrors.image = 'Valid image URL is required (http/https)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        stock: Number(formData.stock),
        image: formData.image.trim(),
      });
      navigate('/admin/products');
    } catch (err) {
      setGeneralError(err.message || 'Failed to create product in backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset sample image helper
  const handleSetSampleImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products Inventory</span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Add New Product
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Create a new database catalog item with pricing, images, and inventory stock
        </p>
      </div>

      {generalError && (
        <ErrorMessage message={generalError} onDismiss={() => setGeneralError('')} />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <FormInput
          label="Product Name"
          name="name"
          placeholder="e.g. Sony Wireless Noise Canceling Headphones"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <FormInput
            label="Brand"
            name="brand"
            placeholder="e.g. Sony, Apple, Nike"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            error={errors.brand}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            placeholder="199.99"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={errors.price}
            required
          />

          <FormInput
            label="Stock Quantity"
            name="stock"
            type="number"
            placeholder="25"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            error={errors.stock}
            required
          />
        </div>

        {/* Image URL & preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Product Image URL *</label>
            <button
              type="button"
              onClick={handleSetSampleImage}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Auto-fill Sample Image
            </button>
          </div>
          <FormInput
            name="image"
            placeholder="https://images.unsplash.com/photo-..."
            icon={Image}
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            error={errors.image}
            required
          />
          {formData.image && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Image Preview:</p>
              <img
                src={formData.image}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg bg-white"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Description textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Detailed Description *</label>
          <textarea
            rows="4"
            placeholder="Describe product highlights, materials, warranty, and key features..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full rounded-xl border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 ${errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'}`}
          />
          {errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/admin/products">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="shadow-md shadow-indigo-200"
          >
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
};
