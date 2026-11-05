import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag, ArrowRight, Utensils, PenTool, BookOpen, FlaskConical, Package } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, Vendor } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const { totalCount, totalPrice, totalWeightKg } = useCart();

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, vends, prods] = await Promise.all([
          api.getCategories(),
          api.getVendors(),
          api.getProducts({
            category_slug: selectedCategory || undefined,
            vendor_id: selectedVendorId,
            search: searchQuery || undefined,
          }),
        ]);
        setCategories(cats);
        setVendors(vends);
        setProducts(prods);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, selectedVendorId, searchQuery]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-campus-accent uppercase tracking-wider mb-1">
            <span>Campus Fulfillment Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-campus-text">Smart Campus Marketplace</h1>
          <p className="text-xs text-campus-muted mt-1">
            Autonomous ground robot & aerial drone delivery for campus essentials.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-campus-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, labware, textbooks..."
            className="w-full pl-9 pr-3 py-2 bg-campus-card border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-campus-accent text-campus-bg shadow-glow-accent'
              : 'bg-campus-card text-campus-muted hover:text-campus-text border border-campus-border'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
              selectedCategory === c.slug
                ? 'bg-campus-accent text-campus-bg shadow-glow-accent'
                : 'bg-campus-card text-campus-muted hover:text-campus-text border border-campus-border'
            }`}
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-campus-card animate-pulse border border-campus-border" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-campus-card border border-campus-border">
          <Package className="w-12 h-12 text-campus-muted mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-sm text-campus-text">No products match your filter</h3>
          <p className="text-xs text-campus-muted mt-1">Try resetting the category or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Floating Cart Checkout Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-campus-card/95 backdrop-blur-md border border-campus-accent shadow-2xl p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-campus-accent text-campus-bg flex items-center justify-center font-extrabold text-sm shadow-glow-accent">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-campus-text">
                {totalCount} item{totalCount > 1 ? 's' : ''} in Cart • ₹{totalPrice.toFixed(2)}
              </div>
              <div className="text-[11px] text-campus-muted">
                Total payload weight: <strong className="text-campus-accent font-mono">{totalWeightKg.toFixed(2)} kg</strong>{' '}
                {totalWeightKg > 4.0 ? '(Dispatches Ground Robot)' : '(Eligible for Drone/Robot)'}
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="px-5 py-2.5 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition flex items-center space-x-1.5"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};

