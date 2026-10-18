import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Category, Product } from '../types';
import { getCategoryBySlug } from '../services/categoryService';
import { getProducts } from '../services/productService';
import { ProductGrid } from '../components/shop/ProductGrid';
import { ProductDetailModal } from '../components/shop/ProductDetailModal';
import { SafeImage } from '../components/common/SafeImage';
import { ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategoryAndProducts() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const cat = await getCategoryBySlug(slug);
        setCategory(cat);

        if (cat) {
          const res = await getProducts({
            categoryId: cat.id,
            limitCount: 12,
            onlyActive: true,
          });
          setProducts(res.products);
          setLastVisible(res.lastVisible);
          setHasMore(res.hasMore);
        } else {
          setError('Category not found.');
        }
      } catch (err: any) {
        console.error('Error loading category:', err);
        setError('Failed to load category.');
      } finally {
        setLoading(false);
      }
    }

    loadCategoryAndProducts();
  }, [slug]);

  const loadMore = async () => {
    if (!category || !lastVisible) return;
    setLoadingMore(true);
    try {
      const res = await getProducts({
        categoryId: category.id,
        limitCount: 12,
        lastVisibleDoc: lastVisible,
        onlyActive: true,
      });
      setProducts((prev) => [...prev, ...res.products]);
      setLastVisible(res.lastVisible);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!loading && !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <title>Category Not Found | DripNest Decor</title>
        <meta name="robots" content="noindex, follow" />
        <h2 className="font-serif text-2xl text-[#234737] mb-2">Category Not Found</h2>
        <p className="text-sm text-[#252A24]/70 mb-6">
          The requested homeware category does not exist or has been modified.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Homeware</span>
        </Link>
      </div>
    );
  }

  const categoryUrl = `https://dripnest.site/category/${slug ?? ''}`;
  const categoryDescription = (
    category?.description?.trim() ||
    `Shop handcrafted ${category?.name?.toLowerCase() ?? 'wooden'} from DripNest Decor. Handmade wooden home decor and kitchen essentials, delivered across India.`
  )
    .replace(/\s+/g, ' ')
    .slice(0, 155);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {category && (
        <>
          <title>{`${category.name} Online India | DripNest Decor`}</title>
          <meta name="description" content={categoryDescription} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={categoryUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="DripNest Decor" />
          <meta property="og:title" content={`${category.name} | DripNest Decor`} />
          <meta property="og:description" content={categoryDescription} />
          <meta property="og:url" content={categoryUrl} />
          {category.imageUrl && (
            <meta property="og:image" content={category.imageUrl} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: category.name,
              description: categoryDescription,
              url: categoryUrl,
              isPartOf: { '@type': 'WebSite', name: 'DripNest Decor', url: 'https://dripnest.site' },
            })}
          </script>
        </>
      )}

      {/* Category Hero Banner */}
      <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 sm:p-10 mb-12 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#684631] font-semibold hover:text-[#234737] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
            {category?.name || 'Category'}
          </h1>
          <p className="text-sm sm:text-base text-[#252A24]/80 leading-relaxed max-w-2xl">
            {category?.description || 'Thoughtfully crafted wooden pieces for daily living.'}
          </p>
        </div>

        {category?.imageUrl && (
          <div className="md:col-span-4 aspect-[4/3] rounded-lg overflow-hidden bg-[#F8F5EF] border border-[#EFE6D7]">
            <SafeImage
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
              categoryName={category.name}
            />
          </div>
        )}
      </div>

      {/* Product List */}
      <ProductGrid
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        error={error}
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
