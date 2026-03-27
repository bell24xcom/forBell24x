'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, edit, or remove products from your showcase
            </p>
          </div>
          <Button onClick={handleAddProduct} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-6 mb-8 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
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
          <Card className="p-12 text-center bg-white dark:bg-gray-900">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
              <Card key={product.id} className="p-6 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
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
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {product.description || 'No description'}
                </p>
                {product.price_range && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Price: {product.price_range}
                  </p>
                )}
                {product.moq && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    MOQ: {product.moq} {product.unit}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: product?.id || `product-${Date.now()}`,
      ...formData,
      image_urls: product?.image_urls || [],
    };

    try {
      // TODO: Implement API call to save product
      const response = await fetch(
        product ? `/api/supplier/products/${product.id}` : '/api/supplier/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Name *
        </label>
        <Input
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <Input
            value={formData.price_range}
            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
            placeholder="e.g. ₹100 - ₹500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

