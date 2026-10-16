
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  createProduct,
  updateProduct,
  getProductById,
  checkSlugExists,
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { sanitizeProductImages } from '../../services/imageUploadService';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);

  // Core fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // Pricing and inventory
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minimumWholesaleQuantity, setMinimumWholesaleQuantity] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');

  // Product details
  const [images, setImages] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const cats = await getCategories(false);
        if (cancelled) return;

        setCategories(cats);

        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
          setCategoryName(cats[0].name);
        }

        if (isEditMode && id) {
          const prod = await getProductById(id);
          if (cancelled) return;

          if (prod) {
            setName(prod.name || '');
            setSlug(prod.slug || '');
            setSlugEditedManually(true);
            setDescription(prod.description || '');
            setCategoryId(prod.categoryId || '');
            setCategoryName(prod.categoryName || '');
            setPrice(String(prod.price ?? ''));
            setCompareAtPrice(
              prod.compareAtPrice != null
                ? String(prod.compareAtPrice)
                : ''
            );
            setWholesalePrice(
              prod.wholesalePrice != null
                ? String(prod.wholesalePrice)
                : ''
            );
            setMinimumWholesaleQuantity(
              prod.minimumWholesaleQuantity != null
                ? String(prod.minimumWholesaleQuantity)
                : ''
            );
            setImages(prod.images || []);
            setMaterial(prod.material || '');
            setDimensions(prod.dimensions || '');
            setCareInstructions(prod.careInstructions || '');
            setStockQuantity(String(prod.stockQuantity ?? 0));
            setStatus(prod.status || 'active');
          } else {
            setError('Product not found.');
          }
        }
      } catch (err: any) {
        console.error('Form initialization error:', err);
        if (!cancelled) {
          setError('Failed to initialize form.');
        }
      } finally {
        if (!cancelled) {
          setLoadingInitial(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
    // Initial form data is loaded when the product ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Auto-generate slug from product name until manually edited
  const handleNameChange = (val: string) => {
    setName(val);

    if (!slugEditedManually) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      setSlug(generatedSlug);
    }
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);

    const cat = categories.find((c) => c.id === selectedId);
    setCategoryName(cat?.name || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!name.trim()) {
      setError('Please provide a product title.');
      return;
    }

    if (!slug.trim()) {
      setError('Please provide a unique URL slug.');
      return;
    }

    const numPrice = Number(price);

    if (!price.trim() || !Number.isFinite(numPrice) || numPrice <= 0) {
      setError('Please specify a valid positive selling price in INR.');
      return;
    }

    let numCompare: number | null = null;

    if (compareAtPrice.trim()) {
      numCompare = Number(compareAtPrice);

      if (
        !Number.isFinite(numCompare) ||
        numCompare <= 0 ||
        numCompare < numPrice
      ) {
        setError(
          'Original price must be a positive amount equal to or higher than the selling price.'
        );
        return;
      }
    }

    let numWholesalePrice: number | null = null;

    if (wholesalePrice.trim()) {
      numWholesalePrice = Number(wholesalePrice);

      if (
        !Number.isFinite(numWholesalePrice) ||
        numWholesalePrice <= 0
      ) {
        setError('Wholesale price must be a valid positive amount.');
        return;
      }

      if (numWholesalePrice >= numPrice) {
        setError(
          'Wholesale price should be lower than the retail selling price.'
        );
        return;
      }
    }

    let numMinimumWholesaleQuantity: number | null = null;

    if (minimumWholesaleQuantity.trim()) {
      numMinimumWholesaleQuantity = Number(minimumWholesaleQuantity);

      if (
        !Number.isInteger(numMinimumWholesaleQuantity) ||
        numMinimumWholesaleQuantity < 1
      ) {
        setError(
          'Minimum wholesale quantity must be a whole number greater than 0.'
        );
        return;
      }
    }

    if (
      numMinimumWholesaleQuantity !== null &&
      numWholesalePrice === null
    ) {
      setError(
        'Please enter a wholesale price when setting a minimum wholesale quantity.'
      );
      return;
    }

    const numStock = Number(stockQuantity);

    if (!stockQuantity.trim() || !Number.isInteger(numStock) || numStock < 0) {
      setError('Stock quantity must be a non-negative whole number.');
      return;
    }

    if (!categoryId) {
      setError('Please select a product category.');
      return;
    }

    setSubmitting(true);

    try {
      const normalizedSlug = slug.trim();
      const slugExists = await checkSlugExists(
        normalizedSlug,
        isEditMode ? id : undefined
      );

      if (slugExists) {
        setError(
          `The slug "${normalizedSlug}" is already in use by another product. Please choose a unique slug.`
        );
        return;
      }

      const optimizedImages = await sanitizeProductImages(images);

      const productPayload: Omit<Product, 'id'> = {
        name: name.trim(),
        slug: normalizedSlug,
        description: description.trim(),
        categoryId,
        categoryName,
        price: numPrice,
        compareAtPrice: numCompare,
        wholesalePrice: numWholesalePrice,
        minimumWholesaleQuantity: numMinimumWholesaleQuantity,
        images: optimizedImages,
        material: material.trim(),
        dimensions: dimensions.trim(),
        careInstructions: careInstructions.trim(),
        stockQuantity: numStock,
        status,
      };

      if (isEditMode && id) {
        await updateProduct(id, productPayload);
        setSuccessNotice('Product updated successfully.');
      } else {
        await createProduct(productPayload);
        setSuccessNotice('New handcrafted product created successfully.');
      }

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err: any) {
      console.error('Error saving product:', err);

      const msg = err?.message || '';

      if (
        msg.includes('exceeds the maximum allowed size') ||
        msg.includes('1,048,576')
      ) {
        setError(
          'Product document size exceeded 1MB. Please use fewer images or smaller photos.'
        );
      } else {
        setError(msg || 'Failed to save product in Firestore.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 text-center text-xs text-[#252A24]/60">
        Loading product data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EFE6D7] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-1.5 text-[#252A24]/70 hover:text-[#234737] rounded hover:bg-[#EFE6D7] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#684631]">
              Catalog Editor
            </span>
            <h1 className="font-serif text-2xl font-semibold text-[#234737]">
              {isEditMode ? `Edit: ${name}` : 'Add Handcrafted Product'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Information */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[#234737]">
            Core Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Sculpted Teakwood Tumbler"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEditedManually(true);
                }}
                placeholder="sculpted-teakwood-tumbler"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm font-mono text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'active' | 'inactive')
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="inactive">Inactive (Hidden Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, materials, and craftsmanship..."
              className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
            />
          </div>
        </div>

        {/* Pricing and Inventory */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs space-y-5">
          <h2 className="font-serif text-lg font-semibold text-[#234737]">
            Pricing & Inventory (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="499"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
              <p className="text-xs text-[#252A24]/60 mt-1">
                Regular customer price.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Original Price (₹ Optional)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="699"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="12"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>
          </div>

          <div className="border-t border-[#EFE6D7] pt-5 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#234737]">
                Wholesale Pricing
              </h3>
              <p className="text-xs text-[#252A24]/60 mt-1">
                Optional. Leave these fields empty if wholesale pricing is not available for this product.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Wholesale Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  placeholder="299"
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
                />
                <p className="text-xs text-[#252A24]/60 mt-1">
                  Price per piece for bulk buyers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Minimum Wholesale Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={minimumWholesaleQuantity}
                  onChange={(e) =>
                    setMinimumWholesaleQuantity(e.target.value)
                  }
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
                />
                <p className="text-xs text-[#252A24]/60 mt-1">
                  Example: buyers must order at least 10 pieces.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs">
          <ImageUploader
            images={images}
            onChange={setImages}
            folder="products"
            multiple={true}
            label="Product Photography"
            helperText="Upload JPG, JPEG, or PNG photos. Files are uploaded directly to Firebase Storage and download links are stored with the product."
          />
        </div>

        {/* Craft Specifications */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[#234737]">
            Craft Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Solid Sheesham Wood"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 28 cm x 16 cm x 4 cm"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
              Care Instructions
            </label>
            <textarea
              rows={3}
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              placeholder="Explain how to clean and maintain this product."
              className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 border border-[#EFE6D7] text-[#252A24] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Product'
                : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
