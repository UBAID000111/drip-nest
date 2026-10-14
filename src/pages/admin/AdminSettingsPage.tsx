import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  LogOut,
  Upload,
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { getStoreSettings, updateStoreSettings, DEFAULT_SETTINGS } from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';

type TabKey =
  | 'general'
  | 'homepage'
  | 'product'
  | 'review'
  | 'contact'
  | 'seo'
  | 'legal'
  | 'admin';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, resetPassword, logout } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const s = await getStoreSettings();
        setSettings(s);
      } catch (e: any) {
        setError('Failed to fetch settings from Firestore.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateStoreSettings(settings);
      setNotice('Store settings saved successfully to Firestore.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      setNotice(`Password reset email dispatched to ${currentUser.email}.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Password reset error.');
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'homepage', label: 'Homepage' },
    { key: 'product', label: 'Product' },
    { key: 'review', label: 'Reviews' },
    { key: 'contact', label: 'Contact' },
    { key: 'seo', label: 'SEO' },
    { key: 'legal', label: 'Legal Policies' },
    { key: 'admin', label: 'Admin Account' },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#252A24]/60">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE6D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Store Architecture
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#234737]">
            Store Settings
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            Configure DripNest business parameters, policies, and editorial defaults
          </p>
        </div>

        {activeTab !== 'admin' && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        )}
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

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#EFE6D7] no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#234737] text-white shadow-xs'
                : 'text-[#252A24]/70 hover:text-[#234737] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 sm:p-8 shadow-xs">
        {/* 1. General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              General Brand Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.general.storeName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, storeName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.general.tagline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Brand Description
              </label>
              <textarea
                rows={3}
                value={settings.general.brandDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, brandDescription: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.general.defaultCurrency}
                  className="w-full px-3.5 py-2.5 bg-[#EFE6D7]/40 border border-[#EFE6D7] rounded-md text-sm font-mono text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value={settings.general.defaultCountry}
                  className="w-full px-3.5 py-2.5 bg-[#EFE6D7]/40 border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Business GSTIN
                </label>
                <input
                  type="text"
                  value={settings.general.businessGstin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, businessGstin: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm font-mono text-[#252A24]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Homepage Settings */}
        {activeTab === 'homepage' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Homepage Editorial Content
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={settings.homepage.heroHeadline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage: { ...settings.homepage, heroHeadline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Hero Subtitle
              </label>
              <textarea
                rows={2}
                value={settings.homepage.heroSubtitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage: { ...settings.homepage, heroSubtitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            {/* Hero Image */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Hero Lifestyle Image URL
              </label>
              <input
                type="url"
                value={settings.homepage.heroImageUrl || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage: { ...settings.homepage, heroImageUrl: e.target.value },
                  })
                }
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={settings.homepage.primaryCtaText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={settings.homepage.secondaryCtaText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, secondaryCtaText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Brand Story Heading
              </label>
              <input
                type="text"
                value={settings.homepage.brandStoryHeading}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage: { ...settings.homepage, brandStoryHeading: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Brand Story Content
              </label>
              <textarea
                rows={4}
                value={settings.homepage.brandStoryContent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    homepage: { ...settings.homepage, brandStoryContent: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>
          </div>
        )}

        {/* 3. Product Settings */}
        {activeTab === 'product' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Product & Catalog Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Default Products Per Page
                </label>
                <input
                  type="number"
                  min="4"
                  max="48"
                  value={settings.product.productsPerPage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product: { ...settings.product, productsPerPage: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Related Products Count
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={settings.product.relatedProductCount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product: {
                        ...settings.product,
                        relatedProductCount: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 text-sm text-[#252A24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.product.enableCategoryFilters}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product: { ...settings.product, enableCategoryFilters: e.target.checked },
                    })
                  }
                  className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
                />
                <span>Enable category filtering on storefront</span>
              </label>

              <label className="flex items-center gap-3 text-sm text-[#252A24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.product.enablePriceSorting}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product: { ...settings.product, enablePriceSorting: e.target.checked },
                    })
                  }
                  className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
                />
                <span>Enable price and alphabetical sorting</span>
              </label>

              <label className="flex items-center gap-3 text-sm text-[#252A24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.product.enableStockVisibility}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      product: { ...settings.product, enableStockVisibility: e.target.checked },
                    })
                  }
                  className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
                />
                <span>Display stock availability indicators</span>
              </label>
            </div>
          </div>
        )}

        {/* 4. Review Settings */}
        {activeTab === 'review' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Review Moderation & Rules
            </h2>

            <div className="p-4 bg-[#F8F5EF] rounded-lg border border-[#EFE6D7] text-xs text-[#252A24]/80 space-y-1">
              <p className="font-semibold text-[#234737]">Security Rules Notice:</p>
              <p>
                Firestore security rules enforce that all public review submissions are saved as <code>pending</code>. Only authorized administrators can publish reviews.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-[#252A24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.review.requireApproval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      review: { ...settings.review, requireApproval: e.target.checked },
                    })
                  }
                  className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
                />
                <span>Mandate administrative approval for all customer submissions (Recommended)</span>
              </label>

              <label className="flex items-center gap-3 text-sm text-[#252A24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.review.enablePublicSubmission}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      review: { ...settings.review, enablePublicSubmission: e.target.checked },
                    })
                  }
                  className="rounded border-[#EFE6D7] text-[#234737] focus:ring-[#234737]"
                />
                <span>Enable public review submission modal on storefront</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Maximum Review Character Length
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                value={settings.review.maxReviewLength}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    review: { ...settings.review, maxReviewLength: Number(e.target.value) },
                  })
                }
                className="w-full max-w-xs px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm tabular-nums text-[#252A24]"
              />
            </div>
          </div>
        )}

        {/* 5. Contact Settings */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Customer Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact.contactEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, contactEmail: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.contact.contactPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contact: { ...settings.contact, contactPhone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Support Message
              </label>
              <textarea
                rows={2}
                value={settings.contact.supportMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, supportMessage: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Optional Physical Workshop Address
              </label>
              <input
                type="text"
                value={settings.contact.businessAddress || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, businessAddress: e.target.value },
                  })
                }
                placeholder="Leave blank if operating primarily via online craft desk"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>
          </div>
        )}

        {/* 6. SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Search & Social Media Metadata
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Homepage Title
              </label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, metaTitle: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seo.metaDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, metaDescription: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Canonical Website URL
                </label>
                <input
                  type="url"
                  value={settings.seo.websiteUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, websiteUrl: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Default Image Alt Text
                </label>
                <input
                  type="text"
                  value={settings.seo.defaultImageAltText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, defaultImageAltText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. Legal and Policy Settings */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Policy & Terms Documents
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Privacy Policy Text
              </label>
              <textarea
                rows={6}
                value={settings.legal.privacyPolicy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    legal: { ...settings.legal, privacyPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs font-mono text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Terms and Conditions Text
              </label>
              <textarea
                rows={6}
                value={settings.legal.termsAndConditions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    legal: { ...settings.legal, termsAndConditions: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs font-mono text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Shipping & Delivery Policy Text
              </label>
              <textarea
                rows={4}
                value={settings.legal.shippingPolicy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    legal: { ...settings.legal, shippingPolicy: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs font-mono text-[#252A24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                Returns and Refunds Policy Text
              </label>
              <textarea
                rows={4}
                value={settings.legal.returnsAndRefunds}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    legal: { ...settings.legal, returnsAndRefunds: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-xs font-mono text-[#252A24]"
              />
            </div>
          </div>
        )}

        {/* 8. Admin Account */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#234737] border-b border-[#EFE6D7] pb-3">
              Administrator Security Profile
            </h2>

            <div className="p-5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#234737] text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#684631] font-semibold">
                    Current Authenticated Account
                  </span>
                  <span className="font-semibold text-sm text-[#252A24]">
                    {currentUser?.email || 'ubaidji07@gmail.com'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EFE6D7] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#252A24]/60 block">Firebase User UID:</span>
                  <span className="font-mono text-[11px] text-[#252A24] break-all">
                    {currentUser?.uid || 'Bootstrapped'}
                  </span>
                </div>
                <div>
                  <span className="text-[#252A24]/60 block">Authorization Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authorized Store Administrator</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-5 py-2.5 bg-white border border-[#234737] text-[#234737] hover:bg-[#234737]/5 text-xs font-semibold rounded-md transition-colors"
              >
                Send Password Reset Email
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 text-xs font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
