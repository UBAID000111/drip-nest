import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Package,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product, Category } from '../../types';
import { updateProduct, deleteProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'stock' | 'name'>('newest');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodsSnap, cats] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getCategories(false),
      ]);

      const prods: Product[] = prodsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Product));

      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      console.error('Error loading products for admin:', err);
      setError('Unable to load products from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await updateProduct(product.id, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      setActionNotice(`Product "${product.name}" marked as ${newStatus}.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setActionNotice(`Deleted "${productToDelete.name}".`);
      setProductToDelete(null);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || p.categoryId === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'stock') return a.stockQuantity - b.stockQuantity;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default newest from Firestore query
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE6D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Inventory & Catalog
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#234737]">
            Product Management
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            {products.length} {products.length === 1 ? 'total product' : 'total products'} in database
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white border border-[#EFE6D7] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or slug..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs text-[#252A24] focus:outline-none focus:border-[#234737]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs text-[#252A24] focus:outline-none focus:border-[#234737]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs text-[#252A24] focus:outline-none focus:border-[#234737]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Visible)</option>
              <option value="inactive">Inactive (Draft)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs text-[#252A24] focus:outline-none focus:border-[#234737]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price">Sort: Price (Low to High)</option>
              <option value="stock">Sort: Stock Quantity</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table / Cards */}
      {loading ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-8 text-center text-xs text-[#252A24]/60">
          Loading catalog from Firestore...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#252A24]">
            No Products Found
          </h3>
          <p className="text-xs text-[#252A24]/70">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No products match the selected criteria.'
              : 'Your store catalog is currently empty. Add your first handcrafted wooden piece.'}
          </p>
          <div className="pt-2">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EFE6D7] rounded-xl overflow-hidden shadow-xs">
          {/* Responsive Table for desktop, card view for mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#EFE6D7]">
              <thead className="bg-[#F8F5EF] text-[#684631] uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D7]">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#F8F5EF] overflow-hidden shrink-0 border border-[#EFE6D7]">
                          <SafeImage
                            src={prod.images?.[0]}
                            alt={prod.name}
                            categoryName={prod.categoryName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-[#252A24] block line-clamp-1">
                            {prod.name}
                          </span>
                          <span className="text-[11px] font-mono text-[#252A24]/60">
                            /{prod.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-[#252A24]">
                      {prod.categoryName || '—'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-bold tabular-nums text-[#234737]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                        <span className="block text-[11px] line-through text-[#252A24]/40 tabular-nums">
                          ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span
                        className={`tabular-nums font-semibold ${
                          prod.stockQuantity <= 0
                            ? 'text-red-700'
                            : prod.stockQuantity < 5
                            ? 'text-amber-700'
                            : 'text-[#234737]'
                        }`}
                      >
                        {prod.stockQuantity} in stock
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          prod.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {prod.status === 'active' ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-stone-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${prod.slug}`}
                          target="_blank"
                          className="p-1 text-[#252A24]/60 hover:text-[#234737]"
                          title="View on storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="p-1 text-[#252A24]/60 hover:text-[#234737]"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(prod)}
                          className="p-1 text-[#252A24]/60 hover:text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-[#EFE6D7]">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded bg-[#F8F5EF] overflow-hidden shrink-0 border border-[#EFE6D7]">
                    <SafeImage
                      src={prod.images?.[0]}
                      alt={prod.name}
                      categoryName={prod.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#684631] font-semibold">
                      {prod.categoryName}
                    </span>
                    <h4 className="font-semibold text-sm text-[#252A24] truncate">
                      {prod.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-bold tabular-nums text-[#234737] text-sm">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#252A24]/70">
                        ({prod.stockQuantity} in stock)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F8F5EF] text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(prod)}
                    className="text-[11px] font-semibold text-[#234737] underline"
                  >
                    Status: {prod.status}
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/product/${prod.slug}`}
                      target="_blank"
                      className="text-[#252A24]/70"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/products/${prod.id}/edit`}
                      className="text-[#234737] font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-[#EFE6D7] shadow-xl">
            <h3 className="font-serif text-xl font-semibold text-[#252A24]">
              Confirm Product Deletion
            </h3>
            <p className="text-xs text-[#252A24]/80 leading-relaxed">
              Are you sure you want to permanently delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#EFE6D7] rounded-md text-xs font-semibold text-[#252A24]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
