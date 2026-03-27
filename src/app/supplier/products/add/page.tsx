'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AiSparkle from '@/components/ui/AiSparkle';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    minOrderQuantity: '',
    unit: '',
    specifications: '',
    images: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('category', formData.category);
      productData.append('price', formData.price);
      productData.append('minOrderQuantity', formData.minOrderQuantity);
      productData.append('unit', formData.unit);
      productData.append('specifications', formData.specifications);

      // Add images
      formData.images.forEach((image, index) => {
        productData.append(`image${index}`, image);
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: productData,
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/supplier/dashboard');
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };

  const categories = [
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Food & Beverages',
    'Automotive',
    'Construction',
    'Pharmaceuticals',
    'Agriculture',
    'Others'
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
            <p className="text-slate-300">List your products to connect with buyers</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-400 rounded-md p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                  Description *
                </label>
                <AiSparkle
                  fieldName="Supplier Product Description"
                  currentValue={formData.name}
                  context={formData.category}
                  onSuggestion={(text) => setFormData(prev => ({ ...prev, description: text }))}
                />
              </div>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your product"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minOrderQuantity" className="block text-sm font-medium text-slate-300 mb-2">
                  Minimum Order Quantity *
                </label>
                <input
                  type="number"
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  value={formData.minOrderQuantity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-2">
                  Unit *
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  required
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., pieces, kg, liters"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="specifications" className="block text-sm font-medium text-slate-300 mb-2">
                Specifications
              </label>
              <textarea
                id="specifications"
                name="specifications"
                rows={3}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Technical specifications, dimensions, etc."
                value={formData.specifications}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-slate-300 mb-2">
                Product Images
              </label>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleImageChange}
              />
              <p className="mt-1 text-sm text-slate-400">
                Upload multiple images (JPG, PNG, GIF)
              </p>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-md text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 
