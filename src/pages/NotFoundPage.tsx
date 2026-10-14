import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block">
          Page Not Found · 404
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#234737]">
          Off the Beaten Path
        </h1>

        <p className="text-sm text-[#252A24]/75 leading-relaxed">
          The page or handcrafted piece you are searching for does not exist or may have been relocated.
        </p>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#234737] text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to DripNest Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
