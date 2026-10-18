import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { ProductGrid } from '../components/shop/ProductGrid';
import { FilterBar } from '../components/shop/FilterBar';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { Seo } from '../components/common/Seo';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters state initialized from searchParams
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'name'>('newest');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParam);

  // Synchronize URL search params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('search');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await getCategories(true);
        if (cats.length === 0) {
          setCategories([
            { id: 'kitchen-and-home-accessories', name: 'Kitchen & Home', slug: 'kitchen-and-home-accessories', description: '', sortOrder: 1, active: true },
            { id: 'drinkware', name: 'Drinkware', slug: 'drinkware', description: '', sortOrder: 2, active: true },
            { id: 'dining', name: 'Dining', slug: 'dining', description: '', sortOrder: 3, active: true },
            { id: 'home-decor', name: 'Home Decor', slug: 'home-decor', description: '', sortOrder: 4, active: true },
            { id: 'accessories', name: 'Accessories', slug: 'accessories', description: '', sortOrder: 5, active: true },
          ]);
        } else {
          setCategories(cats);
        }
      } catch (e) {
        console.warn('Categories load note:', e);
      }
    }
    loadCats();
  }, []);

  const fetchProducts = async (isNew = true) => {
    if (isNew) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getProducts({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy,
        limitCount: 12,
        lastVisibleDoc: isNew ? null : lastVisible,
        onlyActive: true,
        searchTerm: searchTerm.trim() || undefined,
      });

      let items = res.products;
      if (onlyInStock) {
        items = items.filter((p) => p.stockQuantity > 0);
      }

      if (isNew) {
        setProducts(items);
      } else {
        setProducts((prev) => [...prev, ...items]);
      }

      setLastVisible(res.lastVisible);
      setHasMore(res.hasMore);
    } catch (err: any) {
      console.error('Shop fetch error:', err);
      setError('Unable to fetch catalog items from database.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, [selectedCategory, sortBy, onlyInStock, searchTerm]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchParams.set('search', term.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Seo
        title="Shop Wooden Handicraft Items & Home Decor Online | DripNest Decor"
        description="Browse handcrafted wooden items, wooden home decor, serving trays, roti boxes and kitchen essentials. Order online with delivery across India."
        path="/shop"
        noindex={Boolean(searchParam.trim())}
      />

      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
          Catalog & Taxonomy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
          Handcrafted Wooden Homeware
        </h1>
        <p className="text-sm text-[#252A24]/75 mt-2 max-w-2xl">
          Discover wooden essentials crafted with natural hardwoods, food-safe seasoning, and timeless proportion.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onlyInStock={onlyInStock}
        onToggleInStock={setOnlyInStock}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={() => fetchProducts(false)}
        error={error}
        onRetry={() => fetchProducts(true)}
        onProductClick={(prod) => setSelectedProduct(prod)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
