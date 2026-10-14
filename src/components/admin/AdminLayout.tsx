import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

const NAV_ITEMS = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Add Product', path: '/admin/products/new', icon: PlusCircle },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
  { label: 'Store Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#234737] text-[#F8F5EF] p-5">
      {/* Brand */}
      <div className="pb-6 border-b border-[#2E5A47]">
        <BrandLogo variant="light" showTagline={true} />
        <div className="mt-3 text-[11px] text-[#A7B59A] uppercase tracking-wider font-semibold">
          Store Operations
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A3529] text-white font-semibold shadow-xs'
                  : 'text-[#F8F5EF]/80 hover:bg-[#2E5A47] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-[#A7B59A]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User info & actions */}
      <div className="pt-4 border-t border-[#2E5A47] space-y-3">
        <div className="text-xs">
          <p className="text-[10px] uppercase tracking-wider text-[#A7B59A]">Administrator</p>
          <p className="font-mono text-xs truncate mt-0.5 text-white">
            {currentUser?.email || 'ubaidji07@gmail.com'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#F8F5EF]/80 hover:bg-[#2E5A47] rounded-md transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-900/40 rounded-md transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 shadow-lg fixed inset-y-0 left-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full z-10">
            {navContent}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 text-white hover:bg-white/10 rounded-full"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top bar for mobile trigger & breadcrumbs */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#EFE6D7] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#252A24] hover:bg-[#F8F5EF] rounded-md"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-wider text-[#684631] font-bold">
              DripNest Administration
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EFE6D7] rounded-md text-[#252A24] hover:bg-[#F8F5EF] transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
