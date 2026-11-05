import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Weight,
  Layers,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { SafeImage } from '../components/SafeImage';

export const VendorInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 150.0,
    stock: 50,
    weight_kg: 0.5,
    category_id: 1,
    image_url: '',
    is_available: true,
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 150.0,
      stock: 50,
      weight_kg: 0.5,
      category_id: categories[0]?.id || 1,
      image_url: '/images/food/avocado_panini.jpg',
      is_available: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      stock: prod.stock,
      weight_kg: prod.weight_kg,
      category_id: prod.category_id,
      image_url: prod.image_url || '',
      is_available: prod.is_available,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/vendor" className="text-xs text-campus-accent hover:underline flex items-center space-x-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Vendor Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-campus-text">Catalog & Inventory Management</h1>
          <p className="text-xs text-campus-muted mt-0.5">Add, edit stock, price, and payload weights for campus products.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-campus-card border border-campus-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-campus-border bg-campus-elevated/60 text-campus-muted uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Payload Weight</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-border/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-campus-elevated/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <SafeImage
                        src={p.image_url}
                        alt={p.name}
                        fallbackSrc="/images/food/avocado_panini.jpg"
                        containerClassName="w-10 h-10 rounded-lg shrink-0"
                        className="w-10 h-10 rounded-lg object-cover bg-campus-elevated"
                      />
                      <div>
                        <div className="font-bold text-campus-text">{p.name}</div>
                        <div className="text-[10px] text-campus-muted line-clamp-1">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-campus-muted">
                    {p.category?.name || 'General'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-campus-text">
                    ₹{p.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-campus-accent">
                    {p.weight_kg} kg
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {p.stock}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.is_available && p.stock > 0
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950/80 text-red-400 border border-red-800'
                    }`}>
                      {p.is_available && p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-campus-elevated border border-campus-border text-campus-muted hover:text-campus-accent transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-campus-elevated border border-campus-border text-campus-muted hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-campus-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-campus-card border border-campus-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-campus-border">
              <h2 className="font-extrabold text-base text-campus-text">
                {editingProduct ? 'Edit Product Item' : 'Add New Campus Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-campus-muted hover:text-campus-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-campus-muted font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cold Brew Oat Latte"
                  className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                />
              </div>

              <div>
                <label className="block text-campus-muted font-semibold mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-campus-muted font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                  />
                </div>
                <div>
                  <label className="block text-campus-muted font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                  />
                </div>
                <div>
                  <label className="block text-campus-muted font-semibold mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-campus-muted font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients or technical specifications..."
                  className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                />
              </div>

              <div>
                <label className="block text-campus-muted font-semibold mb-1">Image Path / URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/food/avocado_panini.jpg"
                  className="w-full px-3 py-2 bg-campus-bg border border-campus-border rounded-xl text-campus-text focus:outline-none focus:border-campus-accent"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-campus-border text-campus-accent"
                />
                <label htmlFor="avail" className="text-campus-text font-semibold">
                  Product is active and available for ordering
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-campus-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-campus-elevated text-campus-muted hover:text-campus-text text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
