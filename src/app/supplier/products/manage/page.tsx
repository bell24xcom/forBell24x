'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Package, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/supplier/upload-image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Image upload failed');
  }
  return data.url as string;
}

interface Product {
  id: string;
  product_name: string;
  description?: string;
  price_range?: string;
  moq?: string;
  unit?: string;
  image_urls?: string[];
}

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // TODO: Fetch products from API
    setProducts([]);
    setLoading(false);
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      // TODO: Implement API call to delete product
      const response = await fetch(`/api/supplier/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading products...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
          ← Back
        </button>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Manage Products
            </h1>
            <p className="text-slate-300">
              Add, edit, or remove products from your showcase
            </p>
          </div>
          <Button onClick={handleAddProduct} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-6 mb-8 bg-slate-800/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <ProductForm
              product={editingProduct}
              onSave={(product) => {
                if (editingProduct) {
                  setProducts(products.map(p => p.id === product.id ? product : p));
                } else {
                  setProducts([...products, product]);
                }
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
            />
          </Card>
        )}

        {products.length === 0 ? (
          <Card className="p-12 text-center bg-slate-800/50">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No products yet
            </h3>
            <p className="text-slate-300 mb-4">
              Start showcasing your products by adding your first product
            </p>
            <Button onClick={handleAddProduct} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-6 bg-slate-800/50">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {product.product_name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-slate-300 mb-2">
                  {product.description || 'No description'}
                </p>
                {product.price_range && (
                  <p className="text-sm text-slate-200">
                    Price: {product.price_range}
                  </p>
                )}
                {product.moq && (
                  <p className="text-sm text-slate-200">
                    MOQ: {product.moq} {product.unit}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    description: product?.description || '',
    price_range: product?.price_range || '',
    moq: product?.moq || '',
    unit: product?.unit || 'piece',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    product?.image_urls?.[0] || null
  );
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be 5MB or smaller.');
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');

    let imageUrl = product?.image_urls?.[0];

    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadProductImage(imageFile);
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Image upload failed');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const productData: Product = {
      id: product?.id || `product-${Date.now()}`,
      ...formData,
      image_urls: imageUrl ? [imageUrl] : [],
    };

    try {
      const response = await fetch(
        product ? `/api/supplier/products/${product.id}` : '/api/supplier/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...productData, imageUrl }),
        }
      );

      if (response.ok) {
        onSave(productData);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Product Name *
        </label>
        <Input
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Product Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          {imagePreviewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="Product preview"
              className="w-20 h-20 object-cover rounded-md border border-slate-700"
            />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {imagePreviewUrl ? 'Change Image' : 'Upload Image'}
          </Button>
        </div>
        {imageError && <p className="text-sm text-red-400 mt-2">{imageError}</p>}
        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WebP. Max 5MB.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Price Range
          </label>
          <Input
            value={formData.price_range}
            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
            placeholder="e.g. ₹100 - ₹500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            MOQ
          </label>
          <Input
            value={formData.moq}
            onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
            placeholder="Minimum order quantity"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={uploading}>
          {uploading ? 'Uploading Image...' : product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

