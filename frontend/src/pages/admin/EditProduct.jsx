import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Image } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { FormInput } from '../../components/common/FormInput';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [productNotFound, setProductNotFound] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProductById(id);
        if (isMounted) {
          if (res?.data) {
            const p = res.data;
            setFormData({
              name: p.name || '',
              description: p.description || '',
              price: String(p.price !== undefined ? p.price : ''),
              category: p.category || 'Electronics',
              brand: p.brand || '',
              stock: String(p.stock !== undefined ? p.stock : 0),
              image: p.image || '',
            });
          } else {
            setProductNotFound(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setProductNotFound(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Product Not Found</h3>
        <p className="text-sm text-slate-500">The product you are trying to edit does not exist.</p>
        <Link to="/admin/products">
          <Button variant="primary">Return to Product List</Button>
        </Link>
      </div>
    );
  }

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
      newErrors.image = 'Valid image URL is required';
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
      await productApi.updateProduct(id, {
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
      setGeneralError(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
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
          Edit Product: {formData.name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Modify catalog details, pricing, and available stock units
        </p>
      </div>

      {generalError && (
        <ErrorMessage message={generalError} onDismiss={() => setGeneralError('')} />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <FormInput
          label="Product Name"
          name="name"
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
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={errors.price}
            required
          />

          <FormInput
            label="Stock Quantity"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            error={errors.stock}
            required
          />
        </div>

        {/* Image URL & preview */}
        <div className="space-y-2">
          <FormInput
            label="Product Image URL"
            name="image"
            icon={Image}
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            error={errors.image}
            required
          />
          {formData.image && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              <img
                src={formData.image}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg bg-white"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Detailed Description *</label>
          <textarea
            rows="4"
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
            className="shadow-md shadow-indigo-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Product</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
