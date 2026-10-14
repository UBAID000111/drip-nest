import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ShieldCheck, Download } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EFE6D7] text-[#234737] border-t border-[#DED3C1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Column 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo />
            <p className="font-serif italic text-lg text-[#234737] font-medium">
              “Bring Nature Home.”
            </p>
            <p className="text-sm text-[#252A24]/80 leading-relaxed max-w-sm">
              Handcrafted warmth. Timeless living. Thoughtfully made wooden homeware, dining accessories, drinkware, and home decor that celebrate authentic hardwoods and purposeful craftsmanship.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#252A24]/90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#684631] shrink-0" />
                <a
                  href="mailto:ubaidji07@gmail.com"
                  className="hover:text-[#234737] hover:underline font-medium"
                >
                  ubaidji07@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#684631] shrink-0" />
                <a
                  href="tel:8218167743"
                  className="hover:text-[#234737] hover:underline font-medium"
                >
                  8218167743
                </a>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#684631] font-mono">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>GSTIN: 07AMVPU8369D1Z5</span>
              </div>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#684631]">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-[#252A24]/80">
              <li>
                <Link to="/shop" className="hover:text-[#234737] hover:underline">
                  All Homeware
                </Link>
              </li>
              <li>
                <Link
                  to="/category/kitchen-and-home-accessories"
                  className="hover:text-[#234737] hover:underline"
                >
                  Kitchen & Home
                </Link>
              </li>
              <li>
                <Link to="/category/drinkware" className="hover:text-[#234737] hover:underline">
                  Drinkware
                </Link>
              </li>
              <li>
                <Link to="/category/dining" className="hover:text-[#234737] hover:underline">
                  Dining
                </Link>
              </li>
              <li>
                <Link to="/category/home-decor" className="hover:text-[#234737] hover:underline">
                  Home Decor
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-[#234737] hover:underline">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Brand */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#684631]">
              DripNest
            </h4>
            <ul className="space-y-2 text-sm text-[#252A24]/80">
              <li>
                <Link to="/about" className="hover:text-[#234737] hover:underline">
                  About Our Craft
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-[#234737] hover:underline">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#234737] hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#234737] hover:underline">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#684631]">
              Policies
            </h4>
            <ul className="space-y-2 text-sm text-[#252A24]/80">
              <li>
                <Link to="/shipping-policy" className="hover:text-[#234737] hover:underline">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-and-refunds" className="hover:text-[#234737] hover:underline">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#234737] hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#234737] hover:underline">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#DED3C1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#252A24]/70">
          <p>© {currentYear} DripNest. All rights reserved. Handcrafted wooden homeware.</p>
          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <span>GSTIN: 07AMVPU8369D1Z5</span>
            <span aria-hidden="true">·</span>
            <Link to="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms-and-conditions" className="hover:underline">
              Terms
            </Link>
            <span aria-hidden="true">·</span>
          
          </div>
        </div>
      </div>
    </footer>
  );
};
