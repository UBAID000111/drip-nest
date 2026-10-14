import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  showTagline = false,
}) => {
  const isLight = variant === 'light';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Wood grain & leaf-inspired monogram mark */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
          isLight ? 'bg-[#F8F5EF] text-[#234737]' : 'bg-[#234737] text-[#F8F5EF]'
        } shadow-sm`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Stylized organic leaf & wood ring curve */}
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.5 3 8.3 7.2 9.5.3-2.5 1.5-6.8 5.8-9.5 0 0-3 5-1 8 5-.8 8-4.5 8-8 0-5.5-4.5-10-10-10z" />
          <path d="M12 12c-2 2-3 4.5-3 7.5" />
          <path d="M15 9c-1 1-1.5 2.5-1.5 4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif text-2xl tracking-tight leading-none font-semibold ${
            isLight ? 'text-[#F8F5EF]' : 'text-[#234737]'
          }`}
        >
          DripNest
        </span>
        {showTagline && (
          <span
            className={`text-[10px] uppercase tracking-[0.2em] mt-0.5 font-sans ${
              isLight ? 'text-[#A7B59A]' : 'text-[#684631]'
            }`}
          >
            Bring Nature Home
          </span>
        )}
      </div>
    </Link>
  );
};
