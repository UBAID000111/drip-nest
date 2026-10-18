import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trees, Sparkles, Feather } from 'lucide-react';
import { SafeImage } from '../components/common/SafeImage';

import { Seo } from '../components/common/Seo';

// HomePage
<Seo
  title="DripNest Decor | Wooden Handicrafts & Home Decor"
  description="Shop handcrafted wooden home decor, wooden roti boxes, serving trays and kitchen essentials at DripNest Decor. Handmade in India."
  path="/"
/>

// ShopPage
<Seo
  title="Shop Wooden Handicraft Items Online | DripNest Decor"
  description="Browse handcrafted wooden items, wooden home decor and kitchen essentials. Order online with delivery across India."
  path="/shop"
/>


export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-20 py-10 sm:py-16">
      {/* Editorial Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block">
            Our Craft Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#234737] leading-tight">
            Everyday Objects. Natural Character.
          </h1>
          <p className="text-base sm:text-lg text-[#252A24]/80 leading-relaxed max-w-2xl mx-auto">
            At DripNest, we believe that objects held every day should carry the quiet grounding of nature into modern living spaces.
          </p>
        </div>
      </section>

      {/* Visual & Story Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE6D7] border border-[#EFE6D7] shadow-lg">
              <SafeImage
                alt="Sculpted wood textures and fine artisanal tableware"
                fallbackText="DripNest Natural Wood Grain"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4 text-base text-[#252A24]/85 leading-relaxed">
              <p>
                Wood is unlike any other interior material. It breathes, retains warmth, softens with age, and carries the organic memory of the tree from which it came. Every grain contour, subtle knot, and gentle shift in hue speaks of time and organic growth.
              </p>
              <p>
                Our collections focus on homeware, dining accessories, drinkware, and functional accents designed not merely to sit on shelves, but to be held, passed across dining tables, and cherished as part of daily living routines.
              </p>
              <p>
                Each piece is shaped with care and finished with food-safe natural treatments that protect the fiber while allowing the tactile softness of raw hardwood to shine through.
              </p>
            </div>

            <div className="pt-4 border-t border-[#EFE6D7] flex items-center gap-8 text-xs text-[#252A24]/80">
              <div>
                <span className="font-serif text-xl font-bold text-[#234737] block">Solid Wood</span>
                <span>Authentic Hardwoods</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-[#234737] block">Food-Safe</span>
                <span>Natural Protective Oils</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-[#234737] block">Timeless</span>
                <span>Designed for Generations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="bg-[#EFE6D7]/40 border-y border-[#EFE6D7] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-2">
              Values & Craft
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#234737]">
              The DripNest Commitment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-[#EFE6D7] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
                <Trees className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#252A24]">
                Living Hardwoods
              </h3>
              <p className="text-sm text-[#252A24]/75 leading-relaxed">
                We select hardwoods celebrated for dense fiber, tactile resilience, and rich organic grain patterns that mature gracefully over years of use.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[#EFE6D7] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
                <Feather className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#252A24]">
                Tactile Proportion
              </h3>
              <p className="text-sm text-[#252A24]/75 leading-relaxed">
                From the curvature of a tumbler rim to the bevel on a serving platter, every edge is smoothed to feel balanced and natural in human hands.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[#EFE6D7] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#252A24]">
                Honest Utility
              </h3>
              <p className="text-sm text-[#252A24]/75 leading-relaxed">
                Our objects celebrate everyday function—simple to clean, pleasant to handle, and effortlessly harmonizing with contemporary interior aesthetics.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#234737] text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
