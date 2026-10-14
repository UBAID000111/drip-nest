import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  {
    label: 'Kitchen & Home',
    path: '/category/kitchen-and-home-accessories',
  },
  { label: 'Drinkware', path: '/category/drinkware' },
  { label: 'Dining', path: '/category/dining' },
  { label: 'Home Decor', path: '/category/home-decor' },
  { label: 'Accessories', path: '/category/accessories' },
  { label: 'Reviews', path: '/reviews' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalItemCount, openCart } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and search on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F5EF]/95 backdrop-blur-md shadow-xs border-b border-[#EFE6D7]'
            : 'bg-[#F8F5EF] border-b border-transparent'
        }`}
      >
        {/* Top announcement bar */}
        <div className="bg-[#234737] text-[#F8F5EF] text-[11px] tracking-wider uppercase font-medium py-1.5 px-4 text-center">
          <span>
            Handcrafted warmth · Hand-finished in natural woods
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Zone 1: Brand Wordmark & Leaf Mark */}
            <div className="flex items-center">
              <BrandLogo showTagline={true} />
            </div>

            {/* Zone 2: Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6 text-[13px] font-medium tracking-wide text-[#252A24]/80">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors whitespace-nowrap hover:text-[#234737] relative py-1 ${
                      isActive ? 'text-[#234737] font-semibold' : ''
                    }`}
                  >
                    {item.label}

                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#234737]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Search, Cart & Mobile Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#252A24] hover:text-[#234737] hover:bg-[#EFE6D7]/50 rounded-full transition-colors"
                aria-label="Search products"
                aria-expanded={searchOpen}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-[#252A24] hover:text-[#234737] hover:bg-[#EFE6D7]/50 rounded-full transition-colors flex items-center gap-1.5"
                aria-label={`Shopping cart with ${totalItemCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />

                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-[#234737] text-[#F8F5EF] text-[11px] font-semibold flex items-center justify-center px-1 shadow-xs">
                    {totalItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2 text-[#252A24] hover:text-[#234737] hover:bg-[#EFE6D7]/50 rounded-md transition-colors"
                aria-label="Open mobile navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Search Drawer */}
        {searchOpen && (
          <div className="border-t border-[#EFE6D7] bg-[#F8F5EF] px-4 py-3 shadow-inner">
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <Search className="absolute left-3.5 w-4 h-4 text-[#684631]" />

                <input
                  type="text"
                  placeholder="Search handcrafted homeware, bowls, drinkware, trays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#EFE6D7] rounded-md text-sm text-[#252A24] placeholder-[#252A24]/40 focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                />

                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-[#234737] text-white text-xs font-medium rounded hover:bg-[#1A3529] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-[#F8F5EF] h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D7]">
              <BrandLogo />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#252A24] hover:bg-[#EFE6D7]/60 rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="py-6 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EFE6D7] text-[#234737] font-semibold'
                        : 'text-[#252A24] hover:bg-[#EFE6D7]/40'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                );
              })}
            </div>

            {/* Admin Portal Button */}
            <div className="py-3 px-1 border-t border-[#EFE6D7]/80">
              <Link
                to={
                  currentUser && isAdmin
                    ? '/admin'
                    : '/admin/login'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-md bg-[#234737] text-[#F8F5EF] text-xs font-semibold uppercase tracking-wider hover:bg-[#1A3529] active:scale-[0.99] transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#A7B59A]" />

                  <span>
                    {currentUser && isAdmin
                      ? 'Admin Dashboard'
                      : 'Admin Portal'}
                  </span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </Link>

              {currentUser?.email && (
                <div className="mt-2 px-1 text-[11px] text-[#252A24]/60 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                  <span>{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-auto pt-6 border-t border-[#EFE6D7] text-xs text-[#252A24]/70 space-y-2">
              <p className="font-serif italic text-sm text-[#234737]">
                “Bring Nature Home.”
              </p>

              <p>
                Inquiries:{' '}
                <a
                  href="mailto:ubaidji07@gmail.com"
                  className="text-[#234737] underline"
                >
                  ubaidji07@gmail.com
                </a>
              </p>

              <p>
                Call:{' '}
                <a
                  href="tel:8218167743"
                  className="text-[#234737] underline"
                >
                  8218167743
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};