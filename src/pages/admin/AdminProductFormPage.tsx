import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  createProduct,
  updateProduct,
  getProductById,
  checkSlugExists,
} from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { SafeImage } from '../../components/common/SafeImage';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { sanitizeProductImages } from '../../services/imageUploadService';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [compareAtPrice, setCompareAtPrice] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Load categories and initial product if edit mode
  useEffect(() => {
    async function init() {
      try {
        const cats = await getCategories(false);
        setCategories(cats);

        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
          setCategoryName(cats[0].name);
        }

        if (isEditMode && id) {
          const prod = await getProductById(id);
          if (prod) {
            setName(prod.name);
            setSlug(prod.slug);
            setSlugEditedManually(true);
            setDescription(prod.description || '');
            setCategoryId(prod.categoryId || '');
            setCategoryName(prod.categoryName || '');
            setPrice(String(prod.price || ''));
            setCompareAtPrice(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
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
        setError('Failed to initialize form.');
      } finally {
        setLoadingInitial(false);
      }
    }

    init();
  }, [id, isEditMode]);

  // Auto generate slug from name
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

  // Category change handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (cat) {
      setCategoryName(cat.name);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name.trim()) {
      setError('Please provide a product title.');
      return;
    }

    if (!slug.trim()) {
      setError('Please provide a unique URL slug.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please specify a valid positive selling price in INR.');
      return;
    }

    let numCompare: number | null = null;
    if (compareAtPrice.trim()) {
      numCompare = Number(compareAtPrice);
      if (isNaN(numCompare) || numCompare < numPrice) {
        setError('Original price must be equal to or higher than the selling price.');
        return;
      }
    }

    const numStock = parseInt(stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError('Stock quantity must be a non-negative whole number.');
      return;
    }

    setSubmitting(true);

    try {
      const slugExists = await checkSlugExists(slug.trim(), isEditMode ? id : undefined);
      if (slugExists) {
        setError(`The slug "${slug}" is already in use by another product. Please choose a unique slug.`);
        setSubmitting(false);
        return;
      }

      // Automatically optimize all images to keep product document well below Firestore's 1MB limit
      const optimizedImages = await sanitizeProductImages(images);

      const productPayload: Omit<Product, 'id'> = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categoryId,
        categoryName,
        price: numPrice,
        compareAtPrice: numCompare,
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
      if (msg.includes('exceeds the maximum allowed size') || msg.includes('1,048,576')) {
        setError('Product document size exceeded 1MB. Please use fewer images or smaller photos.');
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

      {/* Form sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Details */}
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
                onChange={(e) => setStatus(e.target.value as any)}
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
              placeholder="Describe the tactile wood grain, proportions, and artisanal inspiration..."
              className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
            />
          </div>
        </div>

        {/* Card 2: Pricing & Inventory */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[#234737]">
            Pricing & Inventory (INR)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                placeholder="1490"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24] focus:outline-none focus:border-[#234737]"
              />
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
                placeholder="1990"
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
        </div>

        {/* Card 3: Images (Direct File Upload & Firebase Storage) */}
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

        {/* Card 4: Materials & Specifications */}
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
                placeholder="e.g. 100% Solid Sheesham / Teakwood"
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
                placeholder="e.g. 28 cm (L) x 16 cm (W) x 4 cm (H)"
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
              placeholder="e.g. Wipe clean with a soft damp cloth. Never submerge in water or place in dishwasher. Periodically rub with food-grade walnut or mineral oil."
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
            className="px-6 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
