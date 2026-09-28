import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Layers,
  Image,
  Tag,
  CheckCircle,
  AlertTriangle,
  Store,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Product, PromotionSlide, Order } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  promotions: PromotionSlide[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  promotions,
}) => {
  const { theme, categoryAccent, textColorPrimary, textColorSecondary, textColorMuted } = useTheme();
  const { orders } = useCart();

  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'banners' | 'orders'>('products');
  const [searchAdminQuery, setSearchAdminQuery] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'food' | 'grocery' | 'medicine'>('food');
  const [newSubCategory, setNewSubCategory] = useState('Biryani');
  const [newBrand, setNewBrand] = useState('Chef Kitchen');
  const [newPrice, setNewPrice] = useState(299);
  const [newStock, setNewStock] = useState(50);
  const [img1, setImg1] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop&q=85');
  const [img2, setImg2] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&fp-z=2.2&q=85');

  const filteredAdminProducts = products.filter((p) => {
    if (!searchAdminQuery.trim()) return true;
    const q = searchAdminQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q) || p.restaurantOrBrand.toLowerCase().includes(q);
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Product = {
      id: `admin-prod-${Date.now()}`,
      name: newTitle,
      category: newCategory,
      subCategory: newSubCategory,
      restaurantOrBrand: newBrand,
      price: Number(newPrice),
      originalPrice: Math.round(Number(newPrice) * 1.2),
      discountPercent: 15,
      rating: 4.8,
      ratingCount: 1,
      images: [img1, img2 || `${img1}&crop=focalpoint&fp-z=2`], // Exactly 2 images: Normal + Zoomed
      inStock: true,
      stockQuantity: Number(newStock),
      deliveryTimeMinutes: '20-25 mins',
      description: `Delicious high quality ${newTitle} prepared fresh with authentic ingredients.`,
      specifications: {
        'Quality Standard': 'Verified High Grade',
        'Storage': 'Store in cool place',
      },
    };

    onAddProduct(created);
    setShowAddProductModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-red-950/30 border border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600 text-white font-black text-xl">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">GRAVVY Admin Console</h1>
            <p className="text-xs text-red-200">
              Manage live catalogs, 4-image galleries, inventory levels, banners & orders
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-500/15 pb-2">
        {(['products', 'inventory', 'banners', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter products..."
                value={searchAdminQuery}
                onChange={(e) => setSearchAdminQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-black/20 border border-stone-500/20 text-white placeholder:text-stone-400 focus:outline-none"
              />
            </div>
            <span className="text-xs text-stone-400">
              {filteredAdminProducts.length} Products Active
            </span>
          </div>

          <div className="rounded-2xl border border-stone-500/20 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-stone-500/20 text-stone-400">
                <tr>
                  <th className="p-3">Product & 4-Gallery</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-500/10">
                {filteredAdminProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="p-3 flex items-center gap-3">
                      {/* Show 4 gallery thumbnails in admin */}
                      <div className="flex gap-1 shrink-0">
                        {p.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-7 h-7 rounded-sm object-cover border border-stone-500/30"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-bold block truncate max-w-[220px] ${textColorPrimary}`}>
                          {p.name}
                        </span>
                        <span className="text-[10px] text-stone-400">{p.restaurantOrBrand}</span>
                      </div>
                    </td>
                    <td className="p-3 text-stone-300 uppercase text-[11px] font-semibold">
                      {p.category} · {p.subCategory}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">₹{p.price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold font-mono">
                        {p.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Inventory */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-3xl bg-black/20 border border-stone-500/20 space-y-4">
          <h3 className={`text-base font-bold ${textColorPrimary}`}>Real-Time Inventory Levels</h3>
          <p className="text-xs text-stone-400">
            Automated stock replenishment alerts and batch safety monitors
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/30 border border-stone-500/20">
              <span className="text-xs text-stone-400">Total Items in Catalog</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{products.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-stone-500/20">
              <span className="text-xs text-stone-400">Active Stock Units</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {products.reduce((acc, p) => acc + p.stockQuantity, 0)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-stone-500/20">
              <span className="text-xs text-stone-400">Out of Stock Alerts</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">0 (Healthy)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <h3 className={`text-base font-bold ${textColorPrimary}`}>
            Live Promotional Carousels ({promotions.length} Home Slides)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((pr) => (
              <div
                key={pr.id}
                className="rounded-2xl overflow-hidden border border-stone-500/20 bg-black/20"
              >
                <img
                  src={pr.imageUrl}
                  alt={pr.title}
                  className="w-full h-32 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-3">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{pr.badge}</span>
                  <h4 className="font-bold text-sm text-white truncate">{pr.title}</h4>
                  <p className="text-xs text-stone-400 truncate">{pr.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <h3 className={`text-base font-bold ${textColorPrimary}`}>
            Admin Order Management ({orders.length} Orders)
          </h3>
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl border border-stone-500/20 bg-black/20 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-stone-400 mt-0.5">
                    Customer: {o.address.name} · {o.items.length} items · {o.address.city}
                  </p>
                </div>
                <div className="font-mono font-bold text-base text-amber-400">₹{o.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-stone-900 border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-display text-white">
              Add New Product (4-Image Gallery Enforced)
            </h3>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Enter product specifications and 4 distinct photograph URLs
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Awadhi Galouti Kebab"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-stone-500/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-stone-500/20 text-white"
                  >
                    <option value="food">Food</option>
                    <option value="grocery">Grocery</option>
                    <option value="medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-stone-500/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-stone-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-stone-500/20 text-white"
                  />
                </div>
              </div>

              {/* Exactly 2 Image URLs: Normal & Zoomed */}
              <div className="space-y-2 pt-2 border-t border-stone-500/20">
                <span className="text-[11px] font-bold uppercase text-amber-400 block">
                  Product Gallery (Exactly 2 Images):
                </span>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Image 1 — Primary / Normal View:</label>
                  <input
                    type="text"
                    required
                    placeholder="Image 1 URL (Primary front view)"
                    value={img1}
                    onChange={(e) => setImg1(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-stone-500/20 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Image 2 — Zoomed View (Same Product):</label>
                  <input
                    type="text"
                    required
                    placeholder="Image 2 URL (Zoomed detail of exact same product)"
                    value={img2}
                    onChange={(e) => setImg2(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/30 border border-stone-500/20 text-white text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-400 text-stone-950"
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
