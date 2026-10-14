import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PackageX,
  FolderTree,
  MessageSquare,
  Clock,
  CheckCircle,
  PlusCircle,
  Settings,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Copy,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedInitialCategoriesIfEmpty } from '../../services/categoryService';

interface DashboardMetrics {
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  pendingReviews: number;
  approvedReviews: number;
}

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProducts: 0,
    inactiveProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    pendingReviews: 0,
    approvedReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  const [copiedFirestoreRules, setCopiedFirestoreRules] = useState(false);

  const copyFirestoreRules = () => {
    const rules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && (
          (request.auth.token.email != null && request.auth.token.email.lower() == "ubaidji07@gmail.com")
          ||
          (
            exists(/databases/$(database)/documents/admins/$(request.auth.uid))
            && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == "admin"
          )
        );
    }

    // Products: public can read active products, admin manages products
    match /products/{productId} {
      allow read: if resource.data.status == "active"
                  || isAdmin();

      allow create, update, delete: if isAdmin();
    }

    // Media Files: product and category images stored directly in Firestore
    match /media_files/{mediaId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Categories: public can read active categories
    match /categories/{categoryId} {
      allow read: if resource.data.active == true
                  || isAdmin();

      allow create, update, delete: if isAdmin();
    }

    // Reviews: public can read approved reviews; anyone can submit pending reviews
    match /reviews/{reviewId} {
      allow read: if resource.data.status == "approved"
                  || isAdmin();

      allow create: if request.resource.data.status == "pending";
      allow update, delete: if isAdmin();
    }

    // Admin authorization documents
    match /admins/{uid} {
      allow read: if isAdmin()
                  || (signedIn() && request.auth.uid == uid);

      allow write: if signedIn() && (
        (request.auth.token.email != null && request.auth.token.email.lower() == "ubaidji07@gmail.com")
        || isAdmin()
      );
    }

    // Public store settings
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Deny anything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopiedFirestoreRules(true);
    setTimeout(() => setCopiedFirestoreRules(false), 3000);
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Products
      const prodsSnap = await getDocs(collection(db, 'products'));
      let active = 0;
      let inactive = 0;
      let outOfStock = 0;
      prodsSnap.forEach((doc) => {
        const d = doc.data();
        if (d.status === 'active') active++;
        else inactive++;
        if (Number(d.stockQuantity || 0) <= 0) outOfStock++;
      });

      // Categories
      const catsSnap = await getDocs(collection(db, 'categories'));

      // Reviews
      const revsSnap = await getDocs(collection(db, 'reviews'));
      let pending = 0;
      let approved = 0;
      revsSnap.forEach((doc) => {
        const d = doc.data();
        if (d.status === 'pending') pending++;
        else if (d.status === 'approved') approved++;
      });

      setMetrics({
        activeProducts: active,
        inactiveProducts: inactive,
        outOfStockProducts: outOfStock,
        totalCategories: catsSnap.size,
        pendingReviews: pending,
        approvedReviews: approved,
      });
    } catch (err) {
      console.warn('Metrics loading note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSeedCategories = async () => {
    setSeeding(true);
    try {
      const seeded = await seedInitialCategoriesIfEmpty();
      if (seeded) {
        setSeedNotice('Seeded 5 official categories successfully.');
        await fetchMetrics();
      } else {
        setSeedNotice('Categories collection already contains records.');
      }
    } catch (e: any) {
      setSeedNotice(e.message || 'Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE6D7] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
            Overview
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#234737]">
            DripNest Catalog Operations
          </h1>
          <p className="text-xs text-[#252A24]/70 mt-1">
            Real-time metrics connected to Cloud Firestore (dripnest-2a269)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2 border border-[#EFE6D7] rounded-md text-[#252A24] hover:bg-[#EFE6D7] transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#1A3529] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {seedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center justify-between">
          <span>{seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Real Firebase Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Products */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#234737]">
            <Package className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-emerald-700">Live</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.activeProducts}
          </div>
          <div className="text-xs text-[#252A24]/70">Active Products</div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#684631]">
            <Package className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-[#684631]">Draft</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.inactiveProducts}
          </div>
          <div className="text-xs text-[#252A24]/70">Inactive Products</div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-red-600">
            <PackageX className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-red-600">Inventory</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.outOfStockProducts}
          </div>
          <div className="text-xs text-[#252A24]/70">Out of Stock</div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#234737]">
            <FolderTree className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-[#A7B59A]">Taxonomy</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.totalCategories}
          </div>
          <div className="text-xs text-[#252A24]/70">Total Categories</div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-amber-600">Moderation</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.pendingReviews}
          </div>
          <div className="text-xs text-[#252A24]/70">Pending Reviews</div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white border border-[#EFE6D7] rounded-lg p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#234737]">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px] font-semibold uppercase text-[#234737]">Public</span>
          </div>
          <div className="text-2xl font-bold tabular-nums text-[#252A24]">
            {loading ? '—' : metrics.approvedReviews}
          </div>
          <div className="text-xs text-[#252A24]/70">Approved Reviews</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Products */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#252A24]">
              Product Catalog
            </h3>
            <p className="text-xs text-[#252A24]/70 leading-relaxed">
              Create and manage handcrafted pieces, upload multiple photos to Firebase Storage, adjust stock, and edit pricing.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/admin/products/new"
              className="text-xs font-semibold text-[#234737] hover:underline inline-flex items-center gap-1"
            >
              <span>Add New</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-xs text-[#252A24]/30">·</span>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#684631] hover:underline"
            >
              Manage Catalog
            </Link>
          </div>
        </div>

        {/* Card 2: Reviews Moderation */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-[#252A24]">
                Customer Reviews
              </h3>
              {metrics.pendingReviews > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  {metrics.pendingReviews} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#252A24]/70 leading-relaxed">
              Review customer submissions, view private feedback emails, and approve or hide comments for the public site.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/reviews"
              className="text-xs font-semibold text-[#234737] hover:underline inline-flex items-center gap-1"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Categories & Setup */}
        <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#252A24]">
              Taxonomy & Settings
            </h3>
            <p className="text-xs text-[#252A24]/70 leading-relaxed">
              Configure store details (GSTIN: 07AMVPU8369D1Z5), homepage hero messaging, policies, and category structures.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/categories"
                className="text-xs font-semibold text-[#234737] hover:underline inline-flex items-center gap-1"
              >
                <span>Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs text-[#252A24]/30">·</span>
              <Link
                to="/admin/settings"
                className="text-xs font-semibold text-[#684631] hover:underline"
              >
                Store Settings
              </Link>
            </div>

            {metrics.totalCategories === 0 && (
              <button
                type="button"
                onClick={handleSeedCategories}
                disabled={seeding}
                className="mt-1 text-left text-[11px] text-[#234737] underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#684631]" />
                <span>{seeding ? 'Seeding categories...' : 'Initialize 5 Default Categories'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vercel Deployment & Export Section */}
      <div className="bg-[#234737] text-[#F8F5EF] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded text-[11px] font-semibold uppercase tracking-widest text-[#A7B59A]">
              <span>Production Export</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              Deploy DripNest to Vercel
            </h2>
            <p className="text-xs sm:text-sm text-[#F8F5EF]/80 leading-relaxed">
              Download the complete, production-ready codebase package as a ZIP archive. Pre-configured with SPA client-side routing (`vercel.json`), Firebase SDK connection, and automated Vite build pipeline.
            </p>
            <div className="pt-2 text-xs text-[#A7B59A] space-y-1">
              <p>• <strong>Framework:</strong> Vite / React / TypeScript</p>
              <p>• <strong>Build Command:</strong> <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">npm run build</code> | <strong>Output Directory:</strong> <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">dist</code></p>
              <p>• <strong>Designated Admin:</strong> <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ubaidji07@gmail.com</code></p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <a
              href="/dripnest-source.zip"
              download="dripnest-source.zip"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#F8F5EF] text-[#234737] font-semibold text-xs uppercase tracking-wider rounded-md hover:bg-white active:scale-95 transition-all shadow-md text-center"
            >
              <Download className="w-4 h-4 text-[#234737]" />
              <span>Download ZIP for Vercel</span>
            </a>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#F8F5EF] text-xs font-semibold uppercase tracking-wider rounded-md transition-colors text-center"
            >
              <span>Go to Vercel Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* Firestore Image Storage Reference & Rules Card */}
      <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EFE6D7] text-[#234737] flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-semibold text-[#252A24]">
                  Firestore Database Image Storage
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              </div>
              <p className="text-xs text-[#252A24]/70">
                Product and category photos (JPG, JPEG, PNG, WEBP) are optimized and stored directly in your Firestore database. Zero bucket configuration required!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyFirestoreRules}
            className="px-4 py-2 bg-[#F8F5EF] hover:bg-[#EFE6D7] border border-[#EFE6D7] text-[#234737] text-xs font-semibold rounded-md flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {copiedFirestoreRules ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Rules!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Enhanced Rules</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EFE6D7] rounded-lg p-3 text-xs text-[#252A24]/80 space-y-1.5">
          <p className="font-semibold text-[#234737]">
            Firestore Security Rules Status:
          </p>
          <p className="text-[11px] text-[#252A24]/80">
            • Your product and category images save directly into Firestore under your admin account (<code className="font-mono text-[#684631]">ubaidji07@gmail.com</code>).
          </p>
          <p className="text-[11px] text-[#252A24]/80">
            • If you want to enhance your Firebase Console rules to also record images into the optional <code className="font-mono text-[#684631]">media_files</code> gallery collection, click <strong>"Copy Enhanced Rules"</strong> above, go to <a href="https://console.firebase.google.com/project/dripnest-2a269/firestore/rules" target="_blank" rel="noreferrer" className="text-[#234737] underline font-semibold">Firebase Console &rarr; Firestore Database &rarr; Rules</a>, paste, and click <strong>Publish</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
