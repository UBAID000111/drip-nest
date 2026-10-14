import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Sparkles,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { Category } from '../../types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  canDeleteCategory,
  seedInitialCategoriesIfEmpty,
} from '../../services/categoryService';
import { SafeImage } from '../../components/common/SafeImage';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { compressDataUrl } from '../../services/imageUploadService';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal / Drawer state for Add/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('1');
  const [active, setActive] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Deletion modal state
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await getCategories(false);
      setCategories(cats);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load categories from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder(String(categories.length + 1));
    setActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setSortOrder(String(cat.sortOrder ?? 1));
    setActive(cat.active);
    setError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // image URL handled directly via input state

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category title.');
      return;
    }
    if (!slug.trim()) {
      setError('Please provide a category URL slug.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl.trim();
      if (finalImageUrl.startsWith('data:image/')) {
        finalImageUrl = await compressDataUrl(finalImageUrl, 65 * 1024);
      }

      const payload: Omit<Category, 'id'> = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl || undefined,
        sortOrder: Number(sortOrder) || 1,
        active,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setNotice(`Category "${name}" updated.`);
      } else {
        await createCategory(payload);
        setNotice(`New category "${name}" created.`);
      }

      setModalOpen(false);
      await loadCategories();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save category in Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { active: !cat.active });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
      setNotice(`Category "${cat.name}" marked ${!cat.active ? 'active' : 'inactive'}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update category.');
    }
  };

  const promptDelete = async (cat: Category) => {
    setCatToDelete(cat);
    setDeleteWarning(null);
    try {
      const check = await canDeleteCategory(cat.id);
      if (!check.canDelete) {
        setDeleteWarning(
          `Cannot delete "${cat.name}". It still contains ${check.productCount} associated product(s). Please reassign or delete these products first.`
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const confirmDelete = async () => {
    if (!catToDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(catToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id));
      setNotice(`Category "${catToDelete.name}" deleted.`);
      setCatToDelete(null);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedInitialCategoriesIfEmpty();
      await loadCategories();
      setNotice('Seeded standard 5 DripNest categories.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      setError(e?.message || 'Seeding error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE6D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Store Taxonomy
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#234737]">
            Category Management
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            Manage product collections, sort order, and cover imagery
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categories.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#234737] text-[#234737] hover:bg-[#234737]/5 text-xs font-semibold rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#684631]" />
              <span>Seed 5 Official Categories</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-8 text-center text-xs text-[#252A24]/60">
          Loading categories from Firestore...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#252A24]">
            No Categories Configured
          </h3>
          <p className="text-xs text-[#252A24]/70">
            Initialize the standard 5 DripNest taxonomy collections or create custom categories.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#234737] text-white text-xs font-semibold rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Initialize Standard Categories</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#EFE6D7] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#EFE6D7]">
              <thead className="bg-[#F8F5EF] text-[#684631] uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Cover</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D7]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F8F5EF]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold tabular-nums text-[#234737]">
                      #{cat.sortOrder}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-12 h-10 rounded bg-[#F8F5EF] overflow-hidden border border-[#EFE6D7]">
                        <SafeImage
                          src={cat.imageUrl}
                          alt={cat.name}
                          categoryName={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-sm text-[#252A24] block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-[#252A24]/60 line-clamp-1 max-w-sm">
                        {cat.description}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#252A24]/70">
                      /{cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold ${
                          cat.active
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {cat.active ? (
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1 text-[#252A24]/60 hover:text-[#234737]"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete(cat)}
                          className="p-1 text-[#252A24]/60 hover:text-red-600"
                          title="Delete category"
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
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#EFE6D7] shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D7]">
              <h3 className="font-serif text-xl font-semibold text-[#234737]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#252A24]/60 hover:text-[#252A24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dining"
                  className="w-full px-3.5 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
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
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="dining"
                  className="w-full px-3.5 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm font-mono text-[#252A24] focus:outline-none focus:border-[#234737]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short editorial summary for this category..."
                  className="w-full px-3.5 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737]"
                />
              </div>

              {/* Cover Image Upload & Firebase Storage */}
              <div className="pt-1">
                <ImageUploader
                  images={imageUrl ? [imageUrl] : []}
                  onChange={(imgs) => setImageUrl(imgs[0] || '')}
                  folder="categories"
                  multiple={false}
                  label="Category Cover Photo"
                  helperText="Upload JPG, JPEG, or PNG cover photo stored in Firebase."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Visibility
                  </label>
                  <select
                    value={active ? 'active' : 'inactive'}
                    onChange={(e) => setActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EFE6D7]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#EFE6D7] rounded-md text-xs font-semibold text-[#252A24]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-[#234737] text-white rounded-md text-xs uppercase tracking-wider font-semibold hover:bg-[#1A3529] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-[#EFE6D7] shadow-xl">
            <h3 className="font-serif text-xl font-semibold text-[#252A24]">
              Delete Category
            </h3>
            {deleteWarning ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed">
                {deleteWarning}
              </div>
            ) : (
              <p className="text-xs text-[#252A24]/80 leading-relaxed">
                Are you sure you want to permanently delete category <strong>{catToDelete.name}</strong>?
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 border border-[#EFE6D7] rounded-md text-xs font-semibold text-[#252A24]"
              >
                Close
              </button>
              {!deleteWarning && (
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
